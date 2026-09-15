import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarEventoDto } from "./dto/actualizar-evento.dto";
import { assetUrl, extensionDe, guardarArchivo } from "../common/storage.util";

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
    const ext = extensionDe(file.originalname);
    const relPath = await guardarArchivo(file.buffer, "storage_/evento", ext);
    return {
      success: true,
      message: "Imagen subida correctamente.",
      result: { path: relPath, url: assetUrl(relPath) },
    };
  }
}
