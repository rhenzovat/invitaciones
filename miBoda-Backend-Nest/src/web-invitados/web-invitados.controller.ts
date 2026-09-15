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
      data: { nombre: dto.nombre, pases_asignados: dto.pases_asignados, notas: dto.notas ?? null },
    });
    return { success: true, message: "Invitado agregado correctamente.", result: invitado };
  }

  @Post("actualizar")
  @HttpCode(HttpStatus.OK)
  async actualizar(@Body() dto: ActualizarInvitadoDto) {
    const existe = await this.prisma.webInvitado.findUnique({ where: { id_invitado: dto.id_invitado } });
    if (!existe) throw new NotFoundException("El invitado no existe.");

    const invitado = await this.prisma.webInvitado.update({
      where: { id_invitado: dto.id_invitado },
      data: { nombre: dto.nombre, pases_asignados: dto.pases_asignados, notas: dto.notas ?? null },
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
