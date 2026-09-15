import { Body, Controller, Delete, Get, NotFoundException, UseGuards } from "@nestjs/common";
import { IsInt } from "class-validator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { assetUrl, eliminarArchivo } from "../common/storage.util";
import { cloudinaryThumbUrl, eliminarDeCloudinary } from "../common/cloudinary.util";

class EliminarFotoDto {
  @IsInt()
  id_foto!: number;
}

@Controller("web_galeria_fotos")
@UseGuards(JwtAuthGuard)
export class WebGaleriaFotosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("listar")
  async listar() {
    const fotos = await this.prisma.webGaleriaFoto.findMany({ orderBy: { orden: "desc" } });
    const result = fotos.map((f) => ({
      ...f,
      url_imagen_publica: assetUrl(f.url_imagen),
      url_imagen_thumb_publica: f.cloudinary_public_id
        ? cloudinaryThumbUrl(f.cloudinary_public_id)
        : assetUrl(f.url_imagen_thumb ?? f.url_imagen),
    }));
    return { success: true, message: "Listar registros", result };
  }

  @Delete("eliminar")
  async eliminar(@Body() dto: EliminarFotoDto) {
    const foto = await this.prisma.webGaleriaFoto.findUnique({ where: { id_foto: dto.id_foto } });
    if (!foto) throw new NotFoundException("El registro no existe.");

    if (foto.cloudinary_public_id) {
      await eliminarDeCloudinary(foto.cloudinary_public_id);
    } else {
      await eliminarArchivo(foto.url_imagen);
      await eliminarArchivo(foto.url_imagen_thumb);
    }
    await this.prisma.webGaleriaFoto.delete({ where: { id_foto: dto.id_foto } });

    return { success: true, message: "Foto eliminada correctamente." };
  }
}
