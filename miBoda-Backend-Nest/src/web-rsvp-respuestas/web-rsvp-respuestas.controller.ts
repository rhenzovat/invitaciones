import { Body, Controller, Delete, Get, NotFoundException, UseGuards } from "@nestjs/common";
import { IsInt } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

class EliminarRsvpDto {
  @IsInt()
  id_rsvp_respuesta!: number;
}

@Controller("web_rsvp_respuestas")
@UseGuards(JwtAuthGuard)
export class WebRsvpRespuestasController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("listar")
  async listar() {
    const result = await this.prisma.webRsvpRespuesta.findMany({ orderBy: { createdAt: "desc" } });
    return { success: true, message: "Listar registros", result };
  }

  @Delete("eliminar")
  async eliminar(@Body() dto: EliminarRsvpDto) {
    const row = await this.prisma.webRsvpRespuesta.findUnique({
      where: { id_rsvp_respuesta: dto.id_rsvp_respuesta },
    });
    if (!row) throw new NotFoundException("El registro no existe.");

    await this.prisma.webRsvpRespuesta.delete({ where: { id_rsvp_respuesta: dto.id_rsvp_respuesta } });
    return { success: true, message: "Respuesta eliminada correctamente." };
  }
}
