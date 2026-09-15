import sharp from "sharp";

/**
 * Genera una miniatura JPEG (max 640px de ancho, calidad 72, orientacion EXIF
 * corregida) - equivalente a App\Support\ImageThumbnailer del backend Laravel.
 * Devuelve null si sharp no puede decodificar el archivo (ej. algun HEIC sin
 * soporte), igual que el original: la galeria simplemente usa el original.
 */
export async function generarMiniatura(buffer: Buffer): Promise<Buffer | null> {
  try {
    return await sharp(buffer)
      .rotate()
      .resize({ width: 640, withoutEnlargement: true })
      .jpeg({ quality: 72 })
      .toBuffer();
  } catch {
    return null;
  }
}
