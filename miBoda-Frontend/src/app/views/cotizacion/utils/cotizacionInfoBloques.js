/**
 * Vista previa en vivo de bloques del paso Extras (admin).
 * Sustituye {renovacion_dominio} y {soporte_hora} con la config actual.
 */

export function resolveInfoPlaceholders(text, config = {}) {
  const renovRaw = config.renovacion_dominio ?? 130;
  const soporteRaw = config.soporte_hora ?? 30;
  const renov = parseInt(String(renovRaw), 10);
  const soporte = parseInt(String(soporteRaw), 10);
  const renovStr = Number.isFinite(renov) ? String(renov) : String(renovRaw);
  const soporteStr = Number.isFinite(soporte) ? String(soporte) : String(soporteRaw);

  return String(text ?? '')
    .replace(/\{renovacion_dominio\}/g, renovStr)
    .replace(/\{soporte_hora\}/g, soporteStr);
}

/**
 * @param {object} params
 * @param {Array} params.bloques - info_bloques en bruto (con placeholders)
 * @param {object} params.config - config global (moneda, renovacion_dominio, soporte_hora…)
 * @param {object|null} params.editingBlock - panelData mientras se edita un bloque
 */
export function buildPreviewInfoBloques({ bloques = [], config = {}, editingBlock = null }) {
  let blocks = (bloques || []).map((b) => ({
    ...b,
    items: [...(b.items || [])],
  }));

  if (editingBlock != null && editingBlock._index != null) {
    const idx = editingBlock._index;
    blocks = blocks.map((b, i) => {
      if (i !== idx) return b;
      return {
        ...b,
        titulo: editingBlock.titulo ?? b.titulo,
        icon: editingBlock.icon ?? b.icon,
        variant: editingBlock.variant ?? b.variant,
        id: editingBlock.id ?? b.id,
        items: Array.isArray(editingBlock.items) ? [...editingBlock.items] : b.items,
      };
    });
  }

  return blocks.map((b) => ({
    ...b,
    titulo: resolveInfoPlaceholders(b.titulo, config),
    items: (b.items || []).map((line) => resolveInfoPlaceholders(line, config)),
  }));
}
