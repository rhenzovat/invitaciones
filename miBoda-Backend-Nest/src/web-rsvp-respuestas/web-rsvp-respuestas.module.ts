import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebRsvpRespuestasController } from "./web-rsvp-respuestas.controller";

@Module({
  imports: [AuthModule],
  controllers: [WebRsvpRespuestasController],
})
export class WebRsvpRespuestasModule {}
