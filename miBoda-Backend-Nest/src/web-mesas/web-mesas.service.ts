import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { OptimizadorClient } from "./optimizador.client";
import {
  AceptarDto,
  ActualizarEspacioDto,
  ActualizarMesaDto,
  AsignarDto,
  CrearEspacioDto,
  CrearMesasDto,
  CrearReglaDto,
  EntreGruposDto,
  PorGrupoDto,
  PosicionMesaDto,
} from "./dto/mesas.dto";
import {
  armarProblema,
  humanizar,
  idDe,
  MesaInfo,
  ReglaInfo,
  Severidad,
  TipoRegla,
  paresSeparados,
  reglasJuntosEntreGrupos,
  reglasPorGrupo,
  claveGrupo,
  tamanoDeUnidad,
  UnidadMesa,
  verificarDistribucion,
  ResultadoVerificacion,
} from "./mesas.util";

type Unidad = UnidadMesa & { acompanante: string | null; grupo: string | null };

interface Contexto {
  unidades: Unidad[];
  mesas: (MesaInfo & { pos_x: number | null; pos_y: number | null; forma: string })[];
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
        return { id_invitado: i.id_invitado, nombre: i.nombre, acompanante, grupo: i.grupo ?? null, tamano: tamanoDeUnidad(acompanante) };
      });

    return {
      unidades,
      mesas: mesas.map((m) => ({ id_mesa: m.id_mesa, nombre: m.nombre, capacidad: m.capacidad, pos_x: m.pos_x, pos_y: m.pos_y, forma: m.forma })),
      reglas: reglas.map((r) => ({
        id_regla: r.id_regla,
        tipo: r.tipo as TipoRegla,
        severidad: r.severidad as Severidad,
        peso: r.peso,
        sujetos: Array.isArray(r.sujetos) ? (r.sujetos as unknown[]).map(Number).filter(Number.isInteger) : [],
        id_mesa: r.id_mesa,
        grupo: r.grupo ?? null,
        etiqueta: r.etiqueta ?? null,
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

  /** Las reglas de una misma regla "entre grupos" (muchas filas) se muestran como una sola. */
  private reglasParaMostrar(reglas: ReglaInfo[]): ReglaInfo[] {
    const vistas = new Map<string, ReglaInfo>();
    const salida: ReglaInfo[] = [];
    for (const r of reglas) {
      if (!r.etiqueta) { salida.push(r); continue; }
      const clave = `${r.tipo}|${r.severidad}|${r.etiqueta}`;
      const previa = vistas.get(clave);
      if (previa) previa.sujetos = [...new Set([...previa.sujetos, ...r.sujetos])];
      else {
        const copia = { ...r, sujetos: [...r.sujetos] };
        vistas.set(clave, copia);
        salida.push(copia);
      }
    }
    return salida;
  }

  async listar() {
    const ctx = await this.contexto();
    const vigente = this.asignacionVigente(ctx);
    const persona = (u: Unidad) => ({
      id_invitado: u.id_invitado,
      nombre: u.nombre,
      acompanante: u.acompanante,
      grupo: u.grupo,
      tamano: u.tamano,
    });

    const mesas = ctx.mesas.map((m) => {
      const gente = ctx.unidades.filter((u) => vigente.get(u.id_invitado) === m.id_mesa);
      return {
        id_mesa: m.id_mesa,
        nombre: m.nombre,
        capacidad: m.capacidad,
        pos_x: m.pos_x,
        pos_y: m.pos_y,
        forma: m.forma,
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
        reglas: this.reglasParaMostrar(ctx.reglas).map((r) => ({
          id_regla: r.id_regla,
          tipo: r.tipo,
          severidad: r.severidad,
          peso: r.peso,
          id_mesa: r.id_mesa,
          grupo: r.grupo,
          etiqueta: r.etiqueta,
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
        espacios: await this.prisma.webMesaEspacio.findMany({ orderBy: { id_espacio: "asc" } }),
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
      data: { nombre: dto.nombre, capacidad: dto.capacidad, ...(dto.forma ? { forma: dto.forma } : {}) },
    });
    return { success: true, message: "Mesa actualizada." };
  }

  /** Medidas y nombre de cada tipo de espacio al crearlo (px del plano). */
  private static readonly ESPACIOS: Record<string, { nombre: string; ancho: number; alto: number }> = {
    ESCENARIO: { nombre: "Escenario", ancho: 500, alto: 440 },
    PISTA: { nombre: "Pista de baile", ancho: 360, alto: 260 },
    BAR: { nombre: "Bar", ancho: 240, alto: 560 },
    COCINA: { nombre: "Cocina", ancho: 440, alto: 600 },
    OTRO: { nombre: "Espacio", ancho: 300, alto: 200 },
  };

  async crearEspacio(dto: CrearEspacioDto) {
    if ((await this.prisma.webMesaEspacio.count()) >= 30) throw new BadRequestException("El maximo es de 30 espacios.");
    const base = WebMesasService.ESPACIOS[dto.tipo];
    const creado = await this.prisma.webMesaEspacio.create({
      data: { nombre: dto.nombre || base.nombre, tipo: dto.tipo, pos_x: 100, pos_y: 100, ancho: base.ancho, alto: base.alto },
    });
    return { success: true, message: "Espacio agregado.", result: creado };
  }

  async actualizarEspacio(dto: ActualizarEspacioDto) {
    const existe = await this.prisma.webMesaEspacio.findUnique({ where: { id_espacio: dto.id_espacio } });
    if (!existe) throw new BadRequestException("El espacio no existe.");
    await this.prisma.webMesaEspacio.update({
      where: { id_espacio: dto.id_espacio },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
        ...(dto.x !== undefined ? { pos_x: dto.x } : {}),
        ...(dto.y !== undefined ? { pos_y: dto.y } : {}),
        ...(dto.ancho !== undefined ? { ancho: dto.ancho } : {}),
        ...(dto.alto !== undefined ? { alto: dto.alto } : {}),
      },
    });
    return { success: true, message: "Espacio actualizado." };
  }

  async eliminarEspacio(id_espacio: number) {
    const existe = await this.prisma.webMesaEspacio.findUnique({ where: { id_espacio } });
    if (!existe) throw new BadRequestException("El espacio no existe.");
    await this.prisma.webMesaEspacio.delete({ where: { id_espacio } });
    return { success: true, message: "Espacio eliminado." };
  }

  async moverMesa(dto: PosicionMesaDto) {
    const existe = await this.prisma.webMesa.findUnique({ where: { id_mesa: dto.id_mesa } });
    if (!existe) throw new BadRequestException("La mesa no existe.");
    await this.prisma.webMesa.update({ where: { id_mesa: dto.id_mesa }, data: { pos_x: dto.x, pos_y: dto.y } });
    return { success: true, message: "Posicion guardada." };
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

  /** Rehace las reglas "juntos" de cada grupo. Las reglas hechas a mano no se tocan. */
  async juntarPorGrupo(dto: PorGrupoDto) {
    const ctx = await this.contexto();
    if (ctx.mesas.length === 0) throw new BadRequestException("Primero crea al menos una mesa.");
    const capacidadMaxima = Math.max(...ctx.mesas.map((m) => m.capacidad));
    const nuevas = reglasPorGrupo(ctx.unidades, capacidadMaxima);
    const peso = dto.peso ?? 50;

    const [borradas] = await this.prisma.$transaction([
      this.prisma.webMesaRegla.deleteMany({ where: { grupo: { not: null } } }),
      this.prisma.webMesaRegla.createMany({
        data: nuevas.map((n) => ({ tipo: "SAME_TABLE", severidad: "SOFT", peso, sujetos: n.sujetos, grupo: n.grupo })),
      }),
    ]);

    const grupos = new Set(nuevas.map((n) => n.grupo)).size;
    const sinGrupo = ctx.unidades.filter((u) => !(u.grupo ?? "").trim()).length;
    const mensaje =
      nuevas.length === 0
        ? "No hay grupos con dos o mas invitados confirmados. Asigna un grupo a los invitados."
        : `${nuevas.length} ${nuevas.length === 1 ? "regla creada" : "reglas creadas"} para ${grupos} ${grupos === 1 ? "grupo" : "grupos"}.`;
    return { success: true, message: mensaje, result: { creadas: nuevas.length, grupos, reemplazadas: borradas.count, sinGrupo } };
  }

  /** Regla entre grupos ("Tinco + Vargas" juntos, o "Ramos ≠ Tinco"): une o separa a todos los miembros de los grupos elegidos. */
  async entreGrupos(dto: EntreGruposDto) {
    const ctx = await this.contexto();
    if (ctx.mesas.length === 0) throw new BadRequestException("Primero crea al menos una mesa.");
    const capacidadMaxima = Math.max(...ctx.mesas.map((m) => m.capacidad));

    const nombres: string[] = [];
    const miembros: Unidad[][] = [];
    for (const nombre of dto.grupos) {
      const clave = claveGrupo(nombre);
      if (!clave || nombres.some((n) => claveGrupo(n) === clave)) continue;
      const gente = ctx.unidades.filter((u) => claveGrupo(u.grupo) === clave);
      if (gente.length === 0) throw new BadRequestException(`Nadie confirmado tiene el grupo «${nombre}».`);
      nombres.push(nombre.replace(/s+/g, " ").trim());
      miembros.push(gente);
    }
    if (nombres.length < 2) throw new BadRequestException("Elige al menos dos grupos distintos.");

    const peso = dto.severidad === "SOFT" ? dto.peso ?? 50 : null;
    const etiqueta = nombres.join(dto.tipo === "SAME_TABLE" ? " + " : " ≠ ").slice(0, 130);
    let filas: number[][];
    if (dto.tipo === "SAME_TABLE") {
      filas = reglasJuntosEntreGrupos(miembros, capacidadMaxima);
      const total = miembros.flat().reduce((s, u) => s + u.tamano, 0);
      if (dto.severidad === "HARD" && total > capacidadMaxima) {
        throw new BadRequestException(
          `Entre todos suman ${total} personas y la mesa más grande tiene ${capacidadMaxima} lugares: usa «Preferible» en vez de «Obligatoria».`,
        );
      }
    } else {
      filas = paresSeparados(miembros.map((g) => g.map((u) => u.id_invitado))).map(([a, b]) => [a, b]);
      if (filas.length > 400) throw new BadRequestException("Esos grupos son muy grandes para separarlos todos (más de 400 pares). Elige grupos más chicos.");
    }
    if (filas.length === 0) throw new BadRequestException("Esos grupos no tienen suficientes personas confirmadas para crear la regla.");

    await this.prisma.webMesaRegla.createMany({
      data: filas.map((sujetos) => ({ tipo: dto.tipo, severidad: dto.severidad, peso, sujetos, etiqueta })),
    });
    const personas = new Set(filas.flat()).size;
    return { success: true, message: `Regla creada: ${etiqueta} (${personas} personas).`, result: { filas: filas.length, personas } };
  }

  async eliminarRegla(id_regla: number) {
    const existe = await this.prisma.webMesaRegla.findUnique({ where: { id_regla } });
    if (!existe) throw new BadRequestException("La regla no existe.");
    if (existe.etiqueta) {
      // Una regla entre grupos son varias filas con la misma etiqueta: se borran juntas.
      await this.prisma.webMesaRegla.deleteMany({ where: { etiqueta: existe.etiqueta, tipo: existe.tipo, severidad: existe.severidad } });
      return { success: true, message: "Regla eliminada." };
    }
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
