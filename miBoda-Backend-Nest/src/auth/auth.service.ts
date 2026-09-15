import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../prisma/prisma.service";
import { buildPerfil, buildUserPayload } from "./perfil-builder.util";

/**
 * Este backend solo soporta login local (email+password) - sin OAuth ni 2FA
 * (decision tomada al acotar el alcance de la migracion). Se expone igual
 * como un "metodo" para no romper la pantalla de login del panel React
 * (compartida con el resto de la plataforma), que primero consulta que
 * metodos de acceso existen antes de mostrar el formulario.
 */
const METODO_LOCAL = {
  codigo: "local",
  nombre: "Correo y contraseña",
  descripcion: "Inicia sesión con tu correo y contraseña",
  is_habilitado: true,
  is_predeterminado: true,
};

function refreshTokenDays(remember: boolean): number {
  const long = Math.max(1, Math.min(730, Number(process.env.AUTH_REFRESH_DAYS ?? 365)));
  const short = Math.max(1, Math.min(90, Number(process.env.AUTH_REFRESH_DAYS_SHORT ?? 30)));
  return remember ? long : short;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async generateTokens(userId: number, remember: boolean) {
    const ttlMinutes = Number(process.env.JWT_TTL_MINUTES ?? 480);
    const tokenExpires = Math.floor(Date.now() / 1000) + ttlMinutes * 60;
    const token = await this.jwt.signAsync(
      { sub: userId, id: userId },
      { expiresIn: `${ttlMinutes}m` },
    );

    const days = refreshTokenDays(remember);
    const refreshTokenExpires = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const refreshToken = uuidv4();
    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt: refreshTokenExpires },
    });

    return {
      token,
      refreshToken,
      tokenExpires,
      refreshTokenExpires: Math.floor(refreshTokenExpires.getTime() / 1000),
    };
  }

  private async buildLoginResponse(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException("Usuario no encontrado");

    const tokens = await this.generateTokens(userId, true);
    const perfil = [buildPerfil(user)];
    const userPayload = buildUserPayload(user, perfil.length);

    return { tokens, user: userPayload, perfil };
  }

  async login(email: string, password: string, remember = true) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.Activo !== "S") {
      throw new BadRequestException(
        "El correo electrónico o la contraseña no son correctos. Verifique sus credenciales e intente de nuevo.",
      );
    }

    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      throw new BadRequestException(
        "El correo electrónico o la contraseña no son correctos. Verifique sus credenciales e intente de nuevo.",
      );
    }

    const tokens = await this.generateTokens(user.id, remember);
    const perfil = [buildPerfil(user)];
    const userPayload = buildUserPayload(user, perfil.length);

    return {
      status: 200,
      token: tokens.token,
      user: userPayload,
      perfil,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshTokenValue: string) {
    const existing = await this.prisma.refreshToken.findFirst({
      where: { token: refreshTokenValue, expiresAt: { gt: new Date() } },
    });
    if (!existing) {
      throw new UnauthorizedException("Refresh token inválido o expirado");
    }

    await this.prisma.refreshToken.delete({ where: { id: existing.id } });

    const { tokens, user, perfil } = await this.buildLoginResponse(existing.userId);

    return {
      status: 200,
      code: 200,
      message: "Token refrescado exitosamente",
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user,
      perfil,
      result: {
        refreshToken: tokens.refreshToken,
        token: tokens.token,
        tokenExpires: tokens.tokenExpires,
        refreshTokenExpires: tokens.refreshTokenExpires,
        success: true,
        user,
        perfil,
      },
    };
  }

  async logout(refreshTokenValue: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshTokenValue } });
    return { code: 200, message: "Sesión cerrada exitosamente", success: true };
  }

  metodosLogin() {
    return { success: true, result: [METODO_LOCAL] };
  }

  async metodosPorEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success: true,
        result: { usuario_existe: false, metodos: [METODO_LOCAL], requiere_2fa: false },
      };
    }

    return {
      success: true,
      result: {
        usuario_existe: true,
        id_usuario: user.id,
        metodos: [METODO_LOCAL],
        requiere_2fa: false,
      },
    };
  }

  async validarConexion(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const perfil = [buildPerfil(user)];
    return {
      status: 200,
      token: null,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, Activo: user.Activo, es_administrador_principal: true },
      perfil,
    };
  }
}
