import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { MetodosPorEmailDto } from "./dto/metodos-por-email.dto";
import { JwtAuthGuard, AuthenticatedRequest } from "./jwt-auth.guard";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("auth/metodos-login")
  metodosLogin() {
    return this.authService.metodosLogin();
  }

  @Post("auth/metodos-por-email")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  metodosPorEmail(@Body() dto: MetodosPorEmailDto) {
    return this.authService.metodosPorEmail(dto.email);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.remember ?? true);
  }

  @Post("auth/refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post("auth/logout")
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post("perfil/validar_conexion")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  validarConexion(@Req() req: AuthenticatedRequest) {
    return this.authService.validarConexion(req.userId!);
  }
}
