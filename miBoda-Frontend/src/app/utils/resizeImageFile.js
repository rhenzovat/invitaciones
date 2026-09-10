/**
 * Reduce tamaño de imagen antes de enviarla en base64 (evita 413 y timeouts en /web_footer/actualizar).
 */
export function resizeImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(file);
      return;
    }

    const name = file.name || "";
    const isLikelyImage =
      file.type?.startsWith("image/") ||
      /\.(jpe?g|jfif|png|gif|webp|bmp|svg|heic|heif|avif)$/i.test(name);

    if (!isLikelyImage) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const keepPng = file.type === "image/png" || /\.png$/i.test(name);
      const outType = keepPng ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo procesar la imagen"));
            return;
          }
          const ext = keepPng ? "png" : "jpg";
          const base = name.replace(/\.[^.]+$/, "") || "image";
          resolve(new File([blob], `${base}.${ext}`, { type: outType }));
        },
        outType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Imagen no válida o formato no soportado. Use JPG, PNG o WebP."));
    };

    img.src = url;
  });
}
