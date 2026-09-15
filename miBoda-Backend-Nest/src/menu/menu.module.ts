import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MenuController } from "./menu.controller";

@Module({
  imports: [AuthModule],
  controllers: [MenuController],
})
export class MenuModule {}
