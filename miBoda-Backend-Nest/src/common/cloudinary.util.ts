import { v2 as cloudinary } from "cloudinary";

let configurado = false;

function asegurarConfig() {
  if (configurado) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configurado = true;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

/** Sube un buffer a Cloudinary (carpeta indicada) y devuelve la URL publica + public_id. */
export function subirACloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "video" = "image",
): Promise<CloudinaryUploadResult> {
  asegurarConfig();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Cloudinary no devolvio resultado"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export async function eliminarDeCloudinary(publicId: string): Promise<void> {
  asegurarConfig();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    // si ya no existia en Cloudinary no debe romper el flujo de borrado
  }
}

/** URL de miniatura generada al vuelo por Cloudinary (sin subir un segundo archivo). */
export function cloudinaryThumbUrl(publicId: string): string {
  asegurarConfig();
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [{ width: 500, height: 500, crop: "fill", quality: "auto", fetch_format: "auto" }],
  });
}
