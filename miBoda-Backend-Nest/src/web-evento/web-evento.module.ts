import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebEventoController } from "./web-evento.controller";
import { WebEventoService } from "./web-evento.service";

@Module({
  imports: [AuthModule],
  controllers: [WebEventoController],
  providers: [WebEventoService],
})
export class WebEventoModule {}
