import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { Throttle } from "@nestjs/throttler";
import { RsvpDto } from "./dto/rsvp.dto";
import { VerificarInvitadoDto } from "./dto/verificar-invitado.dto";
import { CancionDto } from "./dto/cancion.dto";
import { MibodaPublicService } from "./miboda-public.service";

const IMAGE_MIME = /^image\/(jpeg|jpg|png|webp|heic|heif)$/;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB, igual que Laravel
const MAX_FOTOS = 10;

@Controller("miboda")
@Throttle({ default: { limit: 10, ttl: 60_000 } })
export class MibodaPublicController {
  constructor(private readonly service: MibodaPublicService) {}

  @Post("rsvp/verificar")
  @HttpCode(HttpStatus.OK)
  verificarInvitado(@Body() dto: VerificarInvitadoDto) {
    return this.service.verificarInvitado(dto);
  }

  @Post("rsvp")
  @HttpCode(HttpStatus.OK)
  rsvp(@Body() dto: RsvpDto) {
    return this.service.rsvp(dto);
  }

  @Post("cancion")
  @HttpCode(HttpStatus.OK)
  cancion(@Body() dto: CancionDto) {
    return this.service.cancion(dto);
  }

  @Post("galeria-foto")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor("fotos[]", MAX_FOTOS, { limits: { fileSize: MAX_IMAGE_BYTES } }),
  )
  async galeriaUpload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException("Debes enviar al menos una foto.");
    }
    for (const f of files) {
      if (!IMAGE_MIME.test(f.mimetype)) {
        throw new BadRequestException("Cada archivo debe ser una imagen (jpeg, png, webp, heic, heif).");
      }
    }
    return this.service.galeriaUpload(files);
  }
}
