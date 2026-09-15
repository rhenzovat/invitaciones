import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

/**
 * Exporta a JSON las tablas que usa este backend (users + web_*) desde la
 * MySQL compartida de la agencia, antes de convertir el schema a Postgres.
 * No toca ni borra nada en MySQL.
 */
async function main() {
  const prisma = new PrismaClient();

  const [users, webEvento, webInvitados, webRsvpRespuestas, webCancionSugerencias, webGaleriaFotos] =
    await Promise.all([
      prisma.user.findMany(),
      prisma.webEvento.findMany(),
      prisma.webInvitado.findMany(),
      prisma.webRsvpRespuesta.findMany(),
      prisma.webCancionSugerencia.findMany(),
      prisma.webGaleriaFoto.findMany(),
    ]);

  const data = { users, webEvento, webInvitados, webRsvpRespuestas, webCancionSugerencias, webGaleriaFotos };

  const outPath = join(__dirname, "mysql-export.json");
  writeFileSync(outPath, JSON.stringify(data, null, 2));

  console.log("Exportado a", outPath);
  console.log({
    users: users.length,
    webEvento: webEvento.length,
    webInvitados: webInvitados.length,
    webRsvpRespuestas: webRsvpRespuestas.length,
    webCancionSugerencias: webCancionSugerencias.length,
    webGaleriaFotos: webGaleriaFotos.length,
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
