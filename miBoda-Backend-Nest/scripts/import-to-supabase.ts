import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";

/**
 * Importa a Supabase (Postgres, ya con las tablas creadas via `prisma db
 * push`) el JSON exportado de la MySQL compartida de la agencia. Preserva
 * los IDs originales (necesario por la FK web_rsvp_respuestas.id_invitado)
 * y al final resetea las secuencias de autoincremento de cada tabla.
 */
async function main() {
  const dataPath = process.argv[2];
  if (!dataPath) throw new Error("Uso: import-to-supabase.ts <ruta-al-json-exportado>");

  const data = JSON.parse(readFileSync(dataPath, "utf-8"));
  const prisma = new PrismaClient();

  await prisma.user.createMany({ data: data.users, skipDuplicates: true });
  await prisma.webInvitado.createMany({ data: data.webInvitados, skipDuplicates: true });
  await prisma.webRsvpRespuesta.createMany({ data: data.webRsvpRespuestas, skipDuplicates: true });
  await prisma.webEvento.createMany({ data: data.webEvento, skipDuplicates: true });
  await prisma.webCancionSugerencia.createMany({ data: data.webCancionSugerencias, skipDuplicates: true });
  await prisma.webGaleriaFoto.createMany({ data: data.webGaleriaFotos, skipDuplicates: true });

  console.log("Filas insertadas:", {
    users: data.users.length,
    webInvitados: data.webInvitados.length,
    webRsvpRespuestas: data.webRsvpRespuestas.length,
    webEvento: data.webEvento.length,
    webCancionSugerencias: data.webCancionSugerencias.length,
    webGaleriaFotos: data.webGaleriaFotos.length,
  });

  const sequenceResets: Array<[string, string]> = [
    ["users", "id"],
    ["web_invitados", "id_invitado"],
    ["web_rsvp_respuestas", "id_rsvp_respuesta"],
    ["web_evento", "id_evento"],
    ["web_cancion_sugerencias", "id_sugerencia"],
    ["web_galeria_fotos", "id_foto"],
  ];

  for (const [table, column] of sequenceResets) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('${table}', '${column}'), COALESCE((SELECT MAX(${column}) FROM ${table}), 1))`,
    );
  }
  console.log("Secuencias de autoincremento reseteadas.");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
