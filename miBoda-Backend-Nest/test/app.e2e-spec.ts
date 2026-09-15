import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

/**
 * Pruebas e2e contra la BASE DE DATOS REAL de desarrollo (bd_miboda) - no hay
 * una BD de pruebas separada porque este backend es un reemplazo acotado que
 * lee/escribe la misma BD que ya usa el sitio en produccion. Por eso:
 *  - Las pruebas de lectura (listar, config) no mutan nada.
 *  - Las que crean datos (galeria) los borran ellas mismas al final.
 *  - Las de escritura peligrosa (rsvp/cancion "success", web_evento/actualizar
 *    con datos reales) solo se prueban por su camino de validacion/error,
 *    para no ensuciar la lista real de invitados ni sobreescribir el evento.
 */
describe("miBoda-Backend-Nest (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();

    prisma = moduleFixture.get(PrismaService);
    const jwt = moduleFixture.get(JwtService);
    adminToken = await jwt.signAsync({ sub: 101, id: 101 });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Sitio publico", () => {
    it("GET /api/miboda/config devuelve la configuracion real del evento", async () => {
      const res = await request(app.getHttpServer()).get("/api/miboda/config").expect(200);
      expect(res.body.novio).toBeTruthy();
      expect(res.body.novia).toBeTruthy();
      expect(Array.isArray(res.body.historia)).toBe(true);
    });

    // NOTA: @nestjs/serve-static no sirve archivos estaticos de forma
    // confiable bajo Test.createTestingModule()/supertest (limitacion
    // conocida del paquete: su middleware depende del ciclo de vida completo
    // de app.listen()). Verificado manualmente contra el servidor real
    // (node dist/main.js): "/" y "/css/styles.css" responden 200 con el
    // contenido correcto. No se repite aqui para no tener un test flaky.
  });

  describe("Auth", () => {
    it("POST /login rechaza credenciales incorrectas con 400", async () => {
      await request(app.getHttpServer())
        .post("/api/login")
        .send({ email: "admin@gmail.com", password: "clave-incorrecta-de-prueba" })
        .expect(400);
    });

    it("las rutas protegidas rechazan peticiones sin token con 401", async () => {
      await request(app.getHttpServer()).get("/api/web_evento/obtener").expect(401);
    });

    it("las rutas protegidas rechazan un token invalido con 401", async () => {
      await request(app.getHttpServer())
        .get("/api/web_evento/obtener")
        .set("Authorization", "Bearer token-falso")
        .expect(401);
    });

    it("un token valido puede leer web_evento/obtener", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/web_evento/obtener")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.result.id_evento).toBeDefined();
    });
  });

  describe("RSVP publico", () => {
    it("rechaza un nombre que no esta en la lista de invitados", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/miboda/rsvp")
        .send({ nombre: "NombreDePruebaQueNoExiste", apellidos: "ApellidoFalso", confirma: "si" })
        .expect(400);
      expect(res.body.message).toMatch(/no encontramos tu nombre/i);
    });
  });

  describe("Sugerencia de cancion publica", () => {
    it("rechaza un genero que no esta configurado", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/miboda/cancion")
        .send({ cancion: "Cancion de prueba", genero: "GeneroInventadoQueNoExiste" })
        .expect(400);
      expect(res.body.message).toMatch(/género/i);
    });
  });

  describe("Bandejas admin (solo lectura)", () => {
    it("lista RSVP, canciones y galeria sin error", async () => {
      const auth = `Bearer ${adminToken}`;
      const [rsvp, cancion, galeria] = await Promise.all([
        request(app.getHttpServer()).get("/api/web_rsvp_respuestas/listar").set("Authorization", auth).expect(200),
        request(app.getHttpServer()).get("/api/web_cancion_sugerencias/listar").set("Authorization", auth).expect(200),
        request(app.getHttpServer()).get("/api/web_galeria_fotos/listar").set("Authorization", auth).expect(200),
      ]);
      expect(Array.isArray(rsvp.body.result)).toBe(true);
      expect(Array.isArray(cancion.body.result)).toBe(true);
      expect(Array.isArray(galeria.body.result)).toBe(true);
    });

    it("eliminar con un id inexistente devuelve 404 y no toca nada real", async () => {
      await request(app.getHttpServer())
        .delete("/api/web_rsvp_respuestas/eliminar")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ id_rsvp_respuesta: 999999999 })
        .expect(404);
    });
  });

  describe("Galeria de fotos: ciclo completo subir -> listar -> borrar", () => {
    it("sube una foto publica a Cloudinary, aparece listada y se puede borrar sin dejar rastro", async () => {
      const png1x1 = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      );

      const uploadRes = await request(app.getHttpServer())
        .post("/api/miboda/galeria-foto")
        .attach("fotos[]", png1x1, { filename: "test.png", contentType: "image/png" })
        .expect(200);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.result).toHaveLength(1);

      const listRes = await request(app.getHttpServer())
        .get("/api/web_galeria_fotos/listar")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
      const creada = listRes.body.result.find((f: any) => uploadRes.body.result[0].includes(f.url_imagen));
      expect(creada).toBeDefined();

      await request(app.getHttpServer())
        .delete("/api/web_galeria_fotos/eliminar")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ id_foto: creada.id_foto })
        .expect(200);

      const listDespues = await request(app.getHttpServer())
        .get("/api/web_galeria_fotos/listar")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
      expect(listDespues.body.result.find((f: any) => f.id_foto === creada.id_foto)).toBeUndefined();
    }, 20000);
  });

  describe("web_evento/actualizar", () => {
    it("acepta un cuerpo vacio (guardado parcial) sin romper el registro existente", async () => {
      const antes = await request(app.getHttpServer())
        .get("/api/web_evento/obtener")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .post("/api/web_evento/actualizar")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({})
        .expect(200);

      expect(res.body.result.novio).toBe(antes.body.result.novio);
      expect(res.body.result.novia).toBe(antes.body.result.novia);
    });
  });
});
