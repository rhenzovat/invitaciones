import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OptimizadorClient } from "./optimizador.client";
import { WebMesasController } from "./web-mesas.controller";
import { WebMesasService } from "./web-mesas.service";

@Module({
  imports: [AuthModule],
  controllers: [WebMesasController],
  providers: [WebMesasService, OptimizadorClient],
})
export class WebMesasModule {}
