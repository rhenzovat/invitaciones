import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { buildSidebarTree } from "./menu-data";

@Controller("menu")
@UseGuards(JwtAuthGuard)
export class MenuController {
  @Get("listar_sidebar")
  listarSidebar() {
    return { success: true, message: "Menu", result: buildSidebarTree() };
  }
}
