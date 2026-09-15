import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebGaleriaFotosController } from "./web-galeria-fotos.controller";

@Module({
  imports: [AuthModule],
  controllers: [WebGaleriaFotosController],
})
export class WebGaleriaFotosModule {}
