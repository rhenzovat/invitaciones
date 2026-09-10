/**
 * Normaliza valor del input admin antes de guardar (whatsapp → bi-whatsapp).
 */
export function normalizeCotizacionIconInput(icon) {
  const raw = String(icon ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('bi ') || raw.startsWith('bi-')) return raw;
  if (/^[a-z0-9-]+$/i.test(raw)) return `bi-${raw.replace(/^bi-/, '')}`;
  return raw;
}

/**
 * Normaliza iconos del catálogo cotizador (clase Bootstrap Icons o emoji).
 * @param {string} icon - ej. "bi-rocket-takeoff" o "🚀"
 * @returns {{ kind: 'bi', className: string } | { kind: 'emoji', value: string }}
 */
export function parseCotizacionIcon(icon) {
  const raw = String(icon ?? '').trim();
  if (!raw) {
    return { kind: 'emoji', value: '📄' };
  }

  if (raw.startsWith('bi ') || raw.startsWith('bi-')) {
    const parts = raw.split(/\s+/).filter(Boolean);
    const biToken = parts.find((p) => p.startsWith('bi-')) || parts[parts.length - 1];
    return { kind: 'bi', className: `bi ${biToken}` };
  }

  if (/^bi-[a-z0-9-]+$/i.test(raw)) {
    return { kind: 'bi', className: `bi ${raw}` };
  }

  return { kind: 'emoji', value: raw };
}
