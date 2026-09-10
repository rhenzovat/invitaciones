export const WHATSAPP_MAX = 40;

/**
 * Valida WhatsApp antes de enviar al API.
 * @returns {string|null} mensaje de error o null si es válido
 */
export function validateWhatsapp(value, { required = false } = {}) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return required ? 'El número de WhatsApp es obligatorio.' : null;
  }
  if (/^https?:\/\//i.test(raw) || /^www\./i.test(raw)) {
    return 'Ingresa un número de teléfono, no una URL.';
  }
  if (raw.length > WHATSAPP_MAX) {
    return `El WhatsApp no puede superar ${WHATSAPP_MAX} caracteres.`;
  }
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 8) {
    return 'Ingresa un número de WhatsApp válido (mínimo 8 dígitos).';
  }
  return null;
}
