/**
 * Recomendaciones de imagen de producto (e-commerce).
 * La subida no se bloquea por medidas; solo se informa en modal. Límite duro: peso máximo.
 */

export const PRODUCTO_IMAGEN_RECOMENDACION = {
  /** Tamaño ideal para catálogo */
  recomendadoPx: 1024,
  /** Ejemplo válido más pequeño (p. ej. packs, miniaturas de calidad) */
  minEjemploPx: 512,
  /** Evitar archivos enormes innecesarios en listados */
  maxLadoSugerido: 2000,
  /** Recomendación de peso (no es límite duro en front) */
  pesoSugeridoMb: 5,
  /** Límite duro de subida (front + back) */
  maxBytesUpload: 15 * 1024 * 1024,
  /** Texto para UI */
  formatosTexto: "WebP, JPG, JPEG, PNG, GIF, BMP y la mayoría de formatos de imagen",
};

/**
 * Analiza la imagen para el modal (dimensiones, si es cuadrada). No bloquea la subida.
 * @param {File} file
 * @returns {Promise<{ ok: boolean, error?: string, width?: number|null, height?: number|null, esCuadrada?: boolean|null, esSvg?: boolean }>}
 */
export function analizarImagenProducto(file) {
  const { maxBytesUpload } = PRODUCTO_IMAGEN_RECOMENDACION;

  return new Promise((resolve) => {
    if (!file || !(file instanceof File)) {
      resolve({ ok: false, error: "Archivo no válido." });
      return;
    }
    if (!file.type.startsWith("image/")) {
      resolve({ ok: false, error: "Seleccione un archivo de imagen." });
      return;
    }
    if (file.size > maxBytesUpload) {
      resolve({
        ok: false,
        error: `El archivo supera el máximo permitido (${Math.round(maxBytesUpload / (1024 * 1024))} MB).`,
      });
      return;
    }

    if (file.type === "image/svg+xml") {
      resolve({ ok: true, width: null, height: null, esCuadrada: null, esSvg: true });
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const ratio = w / Math.max(h, 1);
      const esCuadrada = Math.abs(ratio - 1) <= 0.02;
      resolve({ ok: true, width: w, height: h, esCuadrada, esSvg: false });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        ok: false,
        error: "No se pudo leer la imagen. Pruebe con otro formato o archivo.",
      });
    };
    img.src = url;
  });
}

export function formatTamanoArchivo(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Compara dimensiones con la guía de e-commerce. No bloquea la subida.
 * @param {{ ok?: boolean, width?: number|null, height?: number|null, esCuadrada?: boolean|null, esSvg?: boolean }|null|undefined} analysis
 * @returns {{ tipo: 'ok' | 'advertencia' | 'error', mensajes: string[] }}
 */
export function evaluarMedidaVsRecomendacion(analysis) {
  if (!analysis?.ok || analysis.esSvg) {
    return { tipo: "ok", mensajes: [] };
  }
  const w = analysis.width;
  const h = analysis.height;
  if (w == null || h == null) {
    return { tipo: "ok", mensajes: [] };
  }

  const r = PRODUCTO_IMAGEN_RECOMENDACION;
  const minSide = Math.min(w, h);
  const maxSide = Math.max(w, h);
  const mensajesError = [];
  const mensajesAviso = [];

  if (analysis.esCuadrada === false) {
    mensajesError.push(
      "Esta imagen no tiene la proporción recomendada (cuadrada 1:1). En catálogo se verá mejor con la misma anchura y altura."
    );
  }
  if (minSide < r.minEjemploPx) {
    mensajesError.push(
      `El lado menor es ${minSide} px; lo mínimo recomendado es ${r.minEjemploPx}×${r.minEjemploPx} px para buena calidad.`
    );
  }
  if (maxSide > r.maxLadoSugerido) {
    mensajesError.push(
      `Un lado mide ${maxSide} px; se recomienda no superar ~${r.maxLadoSugerido} px por lado (peso y rendimiento).`
    );
  }

  if (mensajesError.length > 0) {
    return { tipo: "error", mensajes: mensajesError };
  }

  /** No avisar “ideal 1024” en tamaños pequeños aceptados (p. ej. 512×512). */
  const ladoIdealAvisoDesdePx = 640;

  if (
    analysis.esCuadrada === true &&
    minSide >= r.minEjemploPx &&
    maxSide <= r.maxLadoSugerido &&
    minSide >= ladoIdealAvisoDesdePx
  ) {
    const ideal = r.recomendadoPx;
    const tolerancia = 0.12;
    const low = ideal * (1 - tolerancia);
    const high = ideal * (1 + tolerancia);
    if (w < low || w > high) {
      mensajesAviso.push(
        `El tamaño ideal recomendado es ${ideal}×${ideal} px. Su imagen es ${w}×${h} px; puede continuar si lo desea.`
      );
    }
  }

  if (mensajesAviso.length > 0) {
    return { tipo: "advertencia", mensajes: mensajesAviso };
  }

  return { tipo: "ok", mensajes: [] };
}
