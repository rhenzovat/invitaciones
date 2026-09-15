import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebInvitadosController } from "./web-invitados.controller";

@Module({
  imports: [AuthModule],
  controllers: [WebInvitadosController],
})
export class WebInvitadosModule {}
