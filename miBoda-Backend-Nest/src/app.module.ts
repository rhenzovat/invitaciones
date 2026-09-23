import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { join } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { MenuModule } from "./menu/menu.module";
import { WebEventoModule } from "./web-evento/web-evento.module";
import { WebRsvpRespuestasModule } from "./web-rsvp-respuestas/web-rsvp-respuestas.module";
import { WebCancionSugerenciasModule } from "./web-cancion-sugerencias/web-cancion-sugerencias.module";
import { WebGaleriaFotosModule } from "./web-galeria-fotos/web-galeria-fotos.module";
import { WebInvitadosModule } from "./web-invitados/web-invitados.module";
import { MibodaPublicModule } from "./miboda-public/miboda-public.module";
import { PublicSiteModule } from "./public-site/public-site.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60_000, limit: 60 }] }),
    ServeStaticModule.forRoot(
      // Sirve el sitio publico (index.html, css, js) en la raiz.
      { rootPath: join(__dirname, "..", "..", "miBoda-Frontend", "public-site"), serveRoot: "/" },
      // El panel React arma las URLs de imagenes con publicAsset() asumiendo
      // "/temp02/..." (asi era en Laravel: public_path('temp02/...') se sirve
      // en esa ruta) - se expone la misma carpeta tambien ahi para que los
      // iconos/fotos del admin (que no son subidas, viven en public-site/assets)
      // no salgan rotos, sin tocar ese helper compartido con el resto de la plataforma.
      { rootPath: join(__dirname, "..", "..", "miBoda-Frontend", "public-site"), serveRoot: "/temp02" },
      { rootPath: join(__dirname, "..", "public", "storage_"), serveRoot: "/storage_" },
    ),
    PrismaModule,
    AuthModule,
    MenuModule,
    WebEventoModule,
    WebRsvpRespuestasModule,
    WebCancionSugerenciasModule,
    WebGaleriaFotosModule,
    WebInvitadosModule,
    MibodaPublicModule,
    PublicSiteModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
