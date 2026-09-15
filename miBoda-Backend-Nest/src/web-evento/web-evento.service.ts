import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarEventoDto } from "./dto/actualizar-evento.dto";
import { subirACloudinary } from "../common/cloudinary.util";

@Injectable()
export class WebEventoService {
  constructor(private readonly prisma: PrismaService) {}

  async obtener() {
    const evento =
      (await this.prisma.webEvento.findFirst({ where: { Activo: "S" } })) ??
      (await this.prisma.webEvento.findFirst());
    return { success: true, message: "Datos de la invitación", result: evento };
  }

  async actualizar(dto: ActualizarEventoDto) {
    const existing =
      (await this.prisma.webEvento.findFirst({ where: { Activo: "S" } })) ??
      (await this.prisma.webEvento.findFirst());

    const data: Record<string, unknown> = { ...dto };
    if (dto.fecha_boda) data.fecha_boda = new Date(dto.fecha_boda);

    const evento = existing
      ? await this.prisma.webEvento.update({ where: { id_evento: existing.id_evento }, data })
      : await this.prisma.webEvento.create({ data: { ...data, Activo: "S" } });

    return { success: true, message: "Invitación actualizada correctamente.", result: evento };
  }

  async subirImagen(file: Express.Multer.File) {
    const carpeta = process.env.CLOUDINARY_FOLDER_EVENTO || "evento";
    const { secure_url } = await subirACloudinary(file.buffer, carpeta);
    return {
      success: true,
      message: "Imagen subida correctamente.",
      result: { path: secure_url, url: secure_url },
    };
  }
}
