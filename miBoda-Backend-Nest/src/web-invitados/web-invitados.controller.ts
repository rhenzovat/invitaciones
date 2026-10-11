import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarInvitadoDto, CrearInvitadoDto, EliminarInvitadoDto } from "./dto/invitado.dto";
import { resolverConfirmacion } from "./confirmacion.util";

@Controller("web_invitados")
@UseGuards(JwtAuthGuard)
export class WebInvitadosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("listar")
  async listar() {
    const [invitados, evento, respuestas] = await Promise.all([
      this.prisma.webInvitado.findMany({ where: { Activo: "S" }, orderBy: { nombre: "asc" } }),
      this.prisma.webEvento.findFirst({ where: { Activo: "S" } }),
      this.prisma.webRsvpRespuesta.findMany({
        where: { id_invitado: { not: null } },
        select: { id_invitado: true, asistira: true, acompanante: true, createdAt: true },
      }),
    ]);

    const respuestaPorInvitado = new Map(respuestas.map((r) => [r.id_invitado, r]));

    const invitadosConEstado = invitados.map((inv) => {
      const respuesta = respuestaPorInvitado.get(inv.id_invitado);
      const rsvp_estado = !respuesta ? "pendiente" : respuesta.asistira === "S" ? "confirmado" : "no_asiste";
      return {
        ...inv,
        rsvp_estado,
        rsvp_acompanante: respuesta?.acompanante ?? null,
        rsvp_fecha: respuesta?.createdAt ?? null,
      };
    });

    const pasesTotales = invitados.reduce((sum, i) => sum + i.pases_asignados, 0);

    return {
      success: true,
      message: "Listar registros",
      result: {
        invitados: invitadosConEstado,
        capacidad_maxima: evento?.capacidad_maxima ?? 100,
        pases_totales: pasesTotales,
      },
    };
  }

  @Post("crear")
  @HttpCode(HttpStatus.OK)
  async crear(@Body() dto: CrearInvitadoDto) {
    const invitado = await this.prisma.webInvitado.create({
      data: {
        nombre: dto.nombre,
        pases_asignados: dto.pases_asignados,
        notas: dto.notas ?? null,
        celular: dto.celular || null,
      },
    });
    return { success: true, message: "Invitado agregado correctamente.", result: invitado };
  }

  @Post("actualizar")
  @HttpCode(HttpStatus.OK)
  async actualizar(@Body() dto: ActualizarInvitadoDto) {
    const existe = await this.prisma.webInvitado.findUnique({ where: { id_invitado: dto.id_invitado } });
    if (!existe) throw new NotFoundException("El invitado no existe.");

    const invitado = await this.prisma.$transaction(async (tx) => {
      const actualizado = await tx.webInvitado.update({
        where: { id_invitado: dto.id_invitado },
        data: {
          nombre: dto.nombre,
          pases_asignados: dto.pases_asignados,
          notas: dto.notas ?? null,
          // Solo se toca si viene en la peticion: un panel con la version vieja en cache no debe borrar los celulares.
          ...(dto.celular !== undefined ? { celular: dto.celular || null } : {}),
        },
      });

      // Confirmacion manual (el admin confirmo por llamada): solo si el panel la envia.
      if (dto.rsvp_estado) {
        const confirmacion = resolverConfirmacion(dto.rsvp_estado, actualizado.pases_asignados, dto.rsvp_acompanante);
        const actual = await tx.webRsvpRespuesta.findFirst({ where: { id_invitado: actualizado.id_invitado } });

        if (!confirmacion) {
          if (actual) await tx.webRsvpRespuesta.deleteMany({ where: { id_invitado: actualizado.id_invitado } });
        } else if (actual) {
          await tx.webRsvpRespuesta.update({
            where: { id_rsvp_respuesta: actual.id_rsvp_respuesta },
            data: confirmacion,
          });
        } else {
          await tx.webRsvpRespuesta.create({
            data: { ...confirmacion, nombre: actualizado.nombre, id_invitado: actualizado.id_invitado },
          });
        }
      }

      return actualizado;
    });
    return { success: true, message: "Invitado actualizado correctamente.", result: invitado };
  }

  @Delete("eliminar")
  async eliminar(@Body() dto: EliminarInvitadoDto) {
    const existe = await this.prisma.webInvitado.findUnique({ where: { id_invitado: dto.id_invitado } });
    if (!existe) throw new NotFoundException("El invitado no existe.");

    await this.prisma.webInvitado.delete({ where: { id_invitado: dto.id_invitado } });
    return { success: true, message: "Invitado eliminado correctamente." };
  }
}
