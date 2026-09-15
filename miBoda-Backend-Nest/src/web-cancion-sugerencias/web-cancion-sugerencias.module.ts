import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebCancionSugerenciasController } from "./web-cancion-sugerencias.controller";

@Module({
  imports: [AuthModule],
  controllers: [WebCancionSugerenciasController],
})
export class WebCancionSugerenciasModule {}
