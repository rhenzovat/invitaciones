import { promises as fs } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

/** Raiz fisica equivalente al `public/` de Laravel (mismo `public_imagenes` disk). */
export const PUBLIC_ROOT = join(__dirname, "..", "..", "public");

/**
 * Solo las rutas "storage_/..." son archivos realmente subidos y servidos por
 * este backend - a esas SI hay que anteponerles APP_URL. Cualquier otra ruta
 * relativa (ej. "assets/img/...") es un recurso estatico del sitio publico,
 * que ahora vive en un despliegue aparte (Vercel) y no en el backend: debe
 * quedar relativa para que el navegador la resuelva contra el dominio que
 * sirvio la pagina, no contra el backend.
 */
export function assetUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return relativePath ?? null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  if (!relativePath.startsWith("storage_/")) return relativePath;
  const base = process.env.APP_URL ?? "";
  return `${base}/${relativePath}`;
}

/**
 * Guarda un buffer en `public/<subdir>/<nombreGenerado>` (misma convencion de
 * rutas que Laravel: `storage_/evento/...`, `storage_/galeria_boda/...`) y
 * devuelve la ruta relativa a guardar en BD.
 */
export async function guardarArchivo(
  buffer: Buffer,
  subdir: string,
  extension: string,
): Promise<string> {
  const dir = join(PUBLIC_ROOT, subdir);
  await fs.mkdir(dir, { recursive: true });
  const nombre = `${Date.now()}_${randomUUID()}.${extension}`;
  await fs.writeFile(join(dir, nombre), buffer);
  return `${subdir}/${nombre}`.replace(/\\/g, "/");
}

export async function eliminarArchivo(relativePath: string | null | undefined): Promise<void> {
  if (!relativePath) return;
  try {
    await fs.unlink(join(PUBLIC_ROOT, relativePath));
  } catch {
    // ya no existia - no es un error para el flujo de borrado
  }
}

export function extensionDe(originalName: string): string {
  const parts = originalName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}
