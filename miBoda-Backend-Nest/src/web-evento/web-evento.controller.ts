import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ActualizarEventoDto } from "./dto/actualizar-evento.dto";
import { WebEventoService } from "./web-evento.service";

const IMAGE_MIME = /^image\/(jpeg|jpg|png|webp|gif|svg\+xml)$/;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB, igual que Laravel

@Controller("web_evento")
@UseGuards(JwtAuthGuard)
export class WebEventoController {
  constructor(private readonly service: WebEventoService) {}

  @Get("obtener")
  obtener() {
    return this.service.obtener();
  }

  @Post("actualizar")
  @HttpCode(HttpStatus.OK)
  actualizar(@Body() dto: ActualizarEventoDto) {
    return this.service.actualizar(dto);
  }

  @Post("subir_imagen")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("imagen", { limits: { fileSize: MAX_IMAGE_BYTES } }))
  subirImagen(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("El campo imagen es requerido.");
    if (!IMAGE_MIME.test(file.mimetype)) {
      throw new BadRequestException("El archivo debe ser una imagen (jpeg, png, webp, gif, svg).");
    }
    return this.service.subirImagen(file);
  }
}
