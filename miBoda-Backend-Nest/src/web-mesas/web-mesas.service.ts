import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { OptimizadorClient } from "./optimizador.client";
import {
  AceptarDto,
  ActualizarMesaDto,
  AsignarDto,
  CrearMesasDto,
  CrearReglaDto,
} from "./dto/mesas.dto";
import {
  armarProblema,
  humanizar,
  idDe,
  MesaInfo,
  ReglaInfo,
  Severidad,
  TipoRegla,
  tamanoDeUnidad,
  UnidadMesa,
  verificarDistribucion,
  ResultadoVerificacion,
} from "./mesas.util";

type Unidad = UnidadMesa & { acompanante: string | null };

interface Contexto {
  unidades: Unidad[];
  mesas: MesaInfo[];
  reglas: ReglaInfo[];
  asignacion: Map<number, number>;
  nombres: Map<number, string>;
}

const ETIQUETA_TIPO: Record<TipoRegla, string> = {
  SAME_TABLE: "juntos",
  SEPARATE: "separados",
  FIXED_TABLE: "en la mesa fija",
};

@Injectable()
export class WebMesasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly optimizador: OptimizadorClient,
  ) {}

  private async contexto(): Promise<Contexto> {
    const [invitados, respuestas, mesas, asignaciones, reglas] = await Promise.all([
      this.prisma.webInvitado.findMany({ where: { Activo: "S" }, orderBy: { nombre: "asc" } }),
      this.prisma.webRsvpRespuesta.findMany({ where: { id_invitado: { not: null }, asistira: "S" } }),
      this.prisma.webMesa.findMany({ orderBy: { id_mesa: "asc" } }),
      this.prisma.webMesaAsignacion.findMany(),
      this.prisma.webMesaRegla.findMany({ orderBy: { id_regla: "asc" } }),
    ]);

    const respuestaDe = new Map(respuestas.map((r) => [r.id_invitado as number, r]));
    const unidades: Unidad[] = invitados
      .filter((i) => respuestaDe.has(i.id_invitado))
      .map((i) => {
        const acompanante = respuestaDe.get(i.id_invitado)?.acompanante?.trim() || null;
        return { id_invitado: i.id_invitado, nombre: i.nombre, acompanante, tamano: tamanoDeUnidad(acompanante) };
      });

    return {
      unidades,
      mesas: mesas.map((m) => ({ id_mesa: m.id_mesa, nombre: m.nombre, capacidad: m.capacidad })),
      reglas: reglas.map((r) => ({
        id_regla: r.id_regla,
        tipo: r.tipo as TipoRegla,
        severidad: r.severidad as Severidad,
        peso: r.peso,
        sujetos: Array.isArray(r.sujetos) ? (r.sujetos as unknown[]).map(Number).filter(Number.isInteger) : [],
        id_mesa: r.id_mesa,
      })),
      asignacion: new Map(asignaciones.map((a) => [a.id_invitado, a.id_mesa])),
      nombres: new Map(invitados.map((i) => [i.id_invitado, i.nombre])),
    };
  }

  private nombresMesas(ctx: Contexto) {
    return new Map(ctx.mesas.map((m) => [m.id_mesa, m.nombre]));
  }

  /** Solo cuentan las asignaciones de gente que sigue confirmada. */
  private asignacionVigente(ctx: Contexto) {
    const confirmados = new Set(ctx.unidades.map((u) => u.id_invitado));
    const mesas = new Set(ctx.mesas.map((m) => m.id_mesa));
    return new Map([...ctx.asignacion].filter(([inv, mesa]) => confirmados.has(inv) && mesas.has(mesa)));
  }

  private describirViolacion(v: ResultadoVerificacion["violaciones"][number], ctx: Contexto) {
    const quienes = v.id_invitados.map((i) => ctx.nombres.get(i) ?? `#${i}`).join(", ");
    const regla = ctx.reglas.find((r) => r.id_regla === v.id_regla);
    const donde = regla?.id_mesa != null ? ` (${this.nombresMesas(ctx).get(regla.id_mesa) ?? "mesa"})` : "";
    return `${v.severidad === "HARD" ? "Obligatoria" : "Preferible"} sin cumplir: ${quienes} deben ir ${ETIQUETA_TIPO[v.tipo]}${donde}.`;
  }

  private verificar(ctx: Contexto, asignacion: Map<number, number>) {
    return verificarDistribucion(
      new Map(ctx.unidades.map((u) => [u.id_invitado, u.tamano])),
      new Map(ctx.mesas.map((m) => [m.id_mesa, m.capacidad])),
      ctx.reglas,
      asignacion,
    );
  }

  async listar() {
    const ctx = await this.contexto();
    const vigente = this.asignacionVigente(ctx);
    const persona = (u: Unidad) => ({
      id_invitado: u.id_invitado,
      nombre: u.nombre,
      acompanante: u.acompanante,
      tamano: u.tamano,
    });

    const mesas = ctx.mesas.map((m) => {
      const gente = ctx.unidades.filter((u) => vigente.get(u.id_invitado) === m.id_mesa);
      return {
        id_mesa: m.id_mesa,
        nombre: m.nombre,
        capacidad: m.capacidad,
        ocupados: gente.reduce((s, u) => s + u.tamano, 0),
        personas: gente.map(persona),
      };
    });
    const sinMesa = ctx.unidades.filter((u) => !vigente.has(u.id_invitado)).map(persona);
    const confirmados = new Set(ctx.unidades.map((u) => u.id_invitado));
    const nombreMesa = this.nombresMesas(ctx);

    return {
      success: true,
      message: "Listar registros",
      result: {
        mesas,
        sinMesa,
        reglas: ctx.reglas.map((r) => ({
          id_regla: r.id_regla,
          tipo: r.tipo,
          severidad: r.severidad,
          peso: r.peso,
          id_mesa: r.id_mesa,
          mesa_nombre: r.id_mesa != null ? nombreMesa.get(r.id_mesa) ?? null : null,
          sujetos: r.sujetos.map((i) => ({
            id_invitado: i,
            nombre: ctx.nombres.get(i) ?? `#${i}`,
            confirmo: confirmados.has(i),
          })),
        })),
        resumen: {
          confirmados: ctx.unidades.length,
          personas: ctx.unidades.reduce((s, u) => s + u.tamano, 0),
          sentadas: ctx.unidades.filter((u) => vigente.has(u.id_invitado)).reduce((s, u) => s + u.tamano, 0),
          sinMesa: sinMesa.length,
          capacidadTotal: ctx.mesas.reduce((s, m) => s + m.capacidad, 0),
        },
        invitadosConfirmados: ctx.unidades.map(persona),
        optimizadorConfigurado: this.optimizador.configurado(),
      },
    };
  }

  async crearMesas(dto: CrearMesasDto) {
    const existentes = await this.prisma.webMesa.count();
    if (existentes + dto.cantidad > 200) throw new BadRequestException("El maximo es de 200 mesas.");
    await this.prisma.webMesa.createMany({
      data: Array.from({ length: dto.cantidad }, (_, i) => ({
        nombre: `Mesa ${existentes + i + 1}`,
        capacidad: dto.capacidad,
      })),
    });
    return { success: true, message: dto.cantidad === 1 ? "Mesa creada." : `${dto.cantidad} mesas creadas.` };
  }

  async actualizarMesa(dto: ActualizarMesaDto) {
    const ctx = await this.contexto();
    if (!ctx.mesas.some((m) => m.id_mesa === dto.id_mesa)) throw new BadRequestException("La mesa no existe.");
    const vigente = this.asignacionVigente(ctx);
    const ocupados = ctx.unidades
      .filter((u) => vigente.get(u.id_invitado) === dto.id_mesa)
      .reduce((s, u) => s + u.tamano, 0);
    if (dto.capacidad < ocupados) {
      throw new BadRequestException(`La mesa ya tiene ${ocupados} personas sentadas; la capacidad no puede ser menor.`);
    }
    await this.prisma.webMesa.update({
      where: { id_mesa: dto.id_mesa },
      data: { nombre: dto.nombre, capacidad: dto.capacidad },
    });
    return { success: true, message: "Mesa actualizada." };
  }

  async eliminarMesa(id_mesa: number) {
    const existe = await this.prisma.webMesa.findUnique({ where: { id_mesa } });
    if (!existe) throw new BadRequestException("La mesa no existe.");
    await this.prisma.$transaction([
      this.prisma.webMesaRegla.deleteMany({ where: { id_mesa } }),
      this.prisma.webMesa.delete({ where: { id_mesa } }),
    ]);
    return { success: true, message: "Mesa eliminada." };
  }

  async crearRegla(dto: CrearReglaDto) {
    const sujetos = [...new Set(dto.sujetos)];
    if (dto.tipo === "FIXED_TABLE") {
      if (sujetos.length !== 1) throw new BadRequestException("Una regla de mesa fija lleva exactamente un invitado.");
      if (dto.id_mesa == null) throw new BadRequestException("Elige la mesa donde debe sentarse.");
      const mesa = await this.prisma.webMesa.findUnique({ where: { id_mesa: dto.id_mesa } });
      if (!mesa) throw new BadRequestException("La mesa elegida no existe.");
    } else if (sujetos.length < 2) {
      throw new BadRequestException("Elige al menos dos invitados para esta regla.");
    }
    const existentes = await this.prisma.webInvitado.count({ where: { id_invitado: { in: sujetos }, Activo: "S" } });
    if (existentes !== sujetos.length) throw new BadRequestException("Algun invitado elegido ya no esta en la lista.");

    await this.prisma.webMesaRegla.create({
      data: {
        tipo: dto.tipo,
        severidad: dto.severidad,
        peso: dto.severidad === "SOFT" ? dto.peso ?? 50 : null,
        sujetos,
        id_mesa: dto.tipo === "FIXED_TABLE" ? dto.id_mesa ?? null : null,
      },
    });
    return { success: true, message: "Regla agregada." };
  }

  async eliminarRegla(id_regla: number) {
    const existe = await this.prisma.webMesaRegla.findUnique({ where: { id_regla } });
    if (!existe) throw new BadRequestException("La regla no existe.");
    await this.prisma.webMesaRegla.delete({ where: { id_regla } });
    return { success: true, message: "Regla eliminada." };
  }

  async asignar(dto: AsignarDto) {
    const ctx = await this.contexto();
    const unidad = ctx.unidades.find((u) => u.id_invitado === dto.id_invitado);
    if (!unidad) throw new BadRequestException("Solo se puede sentar a invitados que confirmaron asistencia.");

    const vigente = this.asignacionVigente(ctx);
    if (dto.id_mesa == null) {
      await this.prisma.webMesaAsignacion.deleteMany({ where: { id_invitado: dto.id_invitado } });
      vigente.delete(dto.id_invitado);
    } else {
      const mesa = ctx.mesas.find((m) => m.id_mesa === dto.id_mesa);
      if (!mesa) throw new BadRequestException("La mesa no existe.");
      const ocupados = ctx.unidades
        .filter((u) => u.id_invitado !== dto.id_invitado && vigente.get(u.id_invitado) === mesa.id_mesa)
        .reduce((s, u) => s + u.tamano, 0);
      if (ocupados + unidad.tamano > mesa.capacidad) {
        throw new BadRequestException(`${mesa.nombre} no tiene lugar (${ocupados}/${mesa.capacidad} ocupados).`);
      }
      await this.prisma.webMesaAsignacion.upsert({
        where: { id_invitado: dto.id_invitado },
        create: { id_invitado: dto.id_invitado, id_mesa: mesa.id_mesa },
        update: { id_mesa: mesa.id_mesa },
      });
      vigente.set(dto.id_invitado, mesa.id_mesa);
    }

    // El organizador puede dejar una obligatoria rota a mano: se avisa, no se bloquea.
    const advertencias = this.verificar(ctx, vigente)
      .violaciones.filter((v) => v.severidad === "HARD")
      .map((v) => this.describirViolacion(v, ctx));
    return { success: true, message: "Asignacion guardada.", result: { advertencias } };
  }

  async limpiarAsignaciones() {
    await this.prisma.webMesaAsignacion.deleteMany();
    return { success: true, message: "Se quito a todos de sus mesas." };
  }

  async optimizar(minimizarCambios: boolean) {
    const ctx = await this.contexto();
    if (ctx.mesas.length === 0) throw new BadRequestException("Primero crea al menos una mesa.");
    if (ctx.unidades.length === 0) throw new BadRequestException("Todavia no hay invitados confirmados para sentar.");

    const problema = armarProblema({
      problemaId: randomUUID().slice(0, 8),
      unidades: ctx.unidades,
      mesas: ctx.mesas,
      reglas: ctx.reglas,
      asignacionActual: this.asignacionVigente(ctx),
      minimizarCambios,
    });
    const respuesta = await this.optimizador.optimizar(problema);

    const nombreMesa = this.nombresMesas(ctx);
    const texto = (t?: string) => humanizar(t, ctx.nombres, nombreMesa);
    const confirmados = new Set(ctx.unidades.map((u) => u.id_invitado));

    const asignaciones = (respuesta.asignaciones ?? [])
      .map((a) => ({ id_invitado: idDe(a.unidadId), id_mesa: idDe(a.mesaId), explicacion: texto(a.explicacion) }))
      .filter((a) => confirmados.has(a.id_invitado) && nombreMesa.has(a.id_mesa))
      .map((a) => ({ ...a, nombre: ctx.nombres.get(a.id_invitado), mesa: nombreMesa.get(a.id_mesa) }));

    return {
      success: true,
      message: "Propuesta calculada.",
      result: {
        estado: respuesta.estado,
        aceptable: respuesta.estado === "CUMPLE_TODO" && asignaciones.length > 0,
        parcial: !!respuesta.parcial,
        puntaje: respuesta.puntaje ?? null,
        satisfaccion: respuesta.satisfaccion ?? null,
        unidadesMovidas: respuesta.unidadesMovidas ?? null,
        asignaciones,
        sinAsignar: (respuesta.sinAsignar ?? []).map((s) => ({
          id_invitado: idDe(s.unidadId),
          nombre: ctx.nombres.get(idDe(s.unidadId)),
          motivo: s.motivo === "REGLAS" ? "Las reglas lo impiden" : "No hay lugar",
        })),
        violaciones: (respuesta.violaciones ?? []).map((v) => ({
          severidad: v.severidad === "HARD" ? "HARD" : "SOFT",
          mensaje: texto(v.mensaje),
        })),
        conflictos: (respuesta.conflictos ?? []).map((c) => ({
          codigo: c.codigo ?? "",
          mensaje: texto(c.mensaje),
          sugerencia: texto(c.sugerenciaResolucion),
        })),
        metricas: {
          tiempoMs: respuesta.metricas?.tiempoMs ?? null,
          asientosVacios: respuesta.metricas?.asientosVacios ?? null,
        },
      },
    };
  }

  async aceptar(dto: AceptarDto) {
    const ctx = await this.contexto();
    const confirmados = new Set(ctx.unidades.map((u) => u.id_invitado));
    const mesas = new Set(ctx.mesas.map((m) => m.id_mesa));
    const propuesta = new Map<number, number>();

    for (const a of dto.asignaciones) {
      if (!confirmados.has(a.id_invitado)) throw new BadRequestException("La propuesta incluye a alguien que ya no esta confirmado.");
      if (!mesas.has(a.id_mesa)) throw new BadRequestException("La propuesta usa una mesa que ya no existe.");
      if (propuesta.has(a.id_invitado)) throw new BadRequestException("La propuesta repite a un invitado.");
      propuesta.set(a.id_invitado, a.id_mesa);
    }

    // Verificacion propia antes de guardar: no se confia solo en la respuesta del optimizador.
    const { excedidas, violaciones } = this.verificar(ctx, propuesta);
    if (excedidas.length > 0) {
      const nombreMesa = this.nombresMesas(ctx);
      const detalle = excedidas.map((e) => `${nombreMesa.get(e.id_mesa)} (${e.ocupados}/${e.capacidad})`).join(", ");
      throw new BadRequestException(`No se guardo: hay mesas con mas gente que su capacidad: ${detalle}.`);
    }
    const obligatorias = violaciones.filter((v) => v.severidad === "HARD");
    if (obligatorias.length > 0) {
      throw new BadRequestException(
        `No se guardo: ${obligatorias.map((v) => this.describirViolacion(v, ctx)).join(" ")}`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.webMesaAsignacion.deleteMany(),
      this.prisma.webMesaAsignacion.createMany({
        data: [...propuesta].map(([id_invitado, id_mesa]) => ({ id_invitado, id_mesa })),
      }),
    ]);
    return { success: true, message: "Distribucion guardada.", result: { guardadas: propuesta.size } };
  }
}
