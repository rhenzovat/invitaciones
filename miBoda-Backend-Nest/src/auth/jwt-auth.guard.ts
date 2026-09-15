import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token no proporcionado");
    }

    const token = authHeader.slice("Bearer ".length);
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number; id: number }>(token);
      req.userId = payload.sub ?? payload.id;
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }
}
