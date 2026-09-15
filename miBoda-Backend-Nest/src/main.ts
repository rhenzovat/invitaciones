import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: true, credentials: true });

  // El panel React (y el sitio publico) siempre llaman a las rutas de la API
  // bajo "/api/..." (asi era en Laravel, con el prefijo automatico de
  // routes/api.php). El sitio estatico (servido por ServeStaticModule) no
  // pasa por el router de Nest, asi que este prefijo no lo afecta.
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`miBoda-Backend-Nest escuchando en http://localhost:${port}`);
}

bootstrap();
