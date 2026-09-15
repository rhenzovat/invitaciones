import { Body, Controller, Delete, Get, NotFoundException, UseGuards } from "@nestjs/common";
import { IsInt } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

class EliminarSugerenciaDto {
  @IsInt()
  id_sugerencia!: number;
}

@Controller("web_cancion_sugerencias")
@UseGuards(JwtAuthGuard)
export class WebCancionSugerenciasController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("listar")
  async listar() {
    const result = await this.prisma.webCancionSugerencia.findMany({ orderBy: { createdAt: "desc" } });
    return { success: true, message: "Listar registros", result };
  }

  @Delete("eliminar")
  async eliminar(@Body() dto: EliminarSugerenciaDto) {
    const row = await this.prisma.webCancionSugerencia.findUnique({
      where: { id_sugerencia: dto.id_sugerencia },
    });
    if (!row) throw new NotFoundException("El registro no existe.");

    await this.prisma.webCancionSugerencia.delete({ where: { id_sugerencia: dto.id_sugerencia } });
    return { success: true, message: "Sugerencia eliminada correctamente." };
  }
}
