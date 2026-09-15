import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RsvpDto } from "./dto/rsvp.dto";
import { CancionDto } from "./dto/cancion.dto";
import { coincideConInvitado } from "./invitado-matcher.util";
import { subirACloudinary } from "../common/cloudinary.util";

@Injectable()
export class MibodaPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async rsvp(dto: RsvpDto) {
    const nombreCompleto = `${dto.nombre} ${dto.apellidos}`.trim();

    const invitados = await this.prisma.webInvitado.findMany({ where: { Activo: "S" } });
    const invitado = coincideConInvitado(invitados, dto.nombre, dto.apellidos);
    if (!invitado) {
      throw new BadRequestException(
        "No encontramos tu nombre en la lista de invitados. Verifica que lo escribiste igual que en la invitación, o contáctanos por WhatsApp.",
      );
    }

    const yaRespondio = await this.prisma.webRsvpRespuesta.findFirst({
      where: { id_invitado: invitado.id_invitado },
    });
    if (yaRespondio) {
      throw new BadRequestException(
        "Ya registramos tu confirmación anteriormente. Si necesitas corregir algo, contáctanos por WhatsApp.",
      );
    }

    await this.prisma.webRsvpRespuesta.create({
      data: {
        nombre: nombreCompleto,
        acompanante: dto.acompanante ?? null,
        asistira: dto.confirma === "si" ? "S" : "N",
        id_invitado: invitado.id_invitado,
      },
    });

    return { success: true, message: "Confirmación registrada correctamente." };
  }

  async cancion(dto: CancionDto) {
    const evento = await this.prisma.webEvento.findFirst({ where: { Activo: "S" } });
    const generos = (evento?.cancion_generos as string[] | null) ?? [];
    if (!generos.includes(dto.genero)) {
      throw new BadRequestException("El género seleccionado no es válido.");
    }

    await this.prisma.webCancionSugerencia.create({
      data: {
        nombre_cancion: dto.cancion,
        genero: dto.genero,
        nombre_invitado: dto.de ?? null,
      },
    });

    return { success: true, message: "Sugerencia registrada correctamente." };
  }

  async galeriaUpload(files: Express.Multer.File[]) {
    const max = await this.prisma.webGaleriaFoto.aggregate({ _max: { orden: true } });
    let ordenActual = max._max.orden ?? 0;

    const carpeta = process.env.CLOUDINARY_FOLDER_GALERIA || "galeria_boda";
    const guardadas: string[] = [];

    for (const file of files) {
      const { secure_url, public_id } = await subirACloudinary(file.buffer, carpeta);

      ordenActual += 1;
      const foto = await this.prisma.webGaleriaFoto.create({
        data: {
          url_imagen: secure_url,
          url_imagen_thumb: null,
          cloudinary_public_id: public_id,
          orden: ordenActual,
          Activo: "S",
        },
      });

      guardadas.push(foto.url_imagen);
    }

    return {
      success: true,
      message: "Fotos subidas correctamente. ¡Gracias por compartir!",
      result: guardadas,
    };
  }
}
