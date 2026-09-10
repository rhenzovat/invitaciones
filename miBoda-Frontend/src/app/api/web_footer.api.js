import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/web_footer";

const DEFAULT_NAV_FOOTER = {
  links: {
    title: "Links",
    items: [
      { label: "Inicio", href: "/" },
      { label: "Quiénes Somos", href: "/#about" },
      { label: "Rituales", href: "/#services" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contacto", href: "/#contact" },
    ],
  },
  services: {
    title: "Servicios",
    items: [
      { label: "Relajante", href: "/#services" },
      { label: "Sensorial", href: "/#services" },
      { label: "Pierres", href: "/#services" },
      { label: "Peau", href: "/#services" },
      { label: "Signature", href: "/#services" },
    ],
  },
};

const normalizeNavItem = (item = {}) => ({
  label: item.label ?? item.text ?? "",
  href: item.href ?? item.url ?? "",
});

const normalizeNavSection = (section = {}, fallback) => ({
  title: section.title ?? fallback.title,
  items: Array.isArray(section.items) && section.items.length > 0
    ? section.items.map(normalizeNavItem)
    : fallback.items.map(normalizeNavItem),
});

export function parseNavFooter(value) {
  if (!value) return DEFAULT_NAV_FOOTER;

  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return DEFAULT_NAV_FOOTER;
    }
  }

  if (Array.isArray(parsed)) {
    return {
      links: normalizeNavSection({ items: parsed }, DEFAULT_NAV_FOOTER.links),
      services: DEFAULT_NAV_FOOTER.services,
    };
  }

  if (parsed && typeof parsed === "object") {
    const linksSection = parsed.links || parsed.link || parsed.nav || {};
    const servicesSection = parsed.services || parsed.servicios || {};

    return {
      links: normalizeNavSection(linksSection, DEFAULT_NAV_FOOTER.links),
      services: normalizeNavSection(servicesSection, DEFAULT_NAV_FOOTER.services),
    };
  }

  return DEFAULT_NAV_FOOTER;
}

const FOOTER_TEXT_FIELDS = [
  "id_footer",
  "nuestros_horarios",
  "sobre_la_empresa",
  "descripcion_footer",
  "titulo_sobre_nosotros",
  "etiqueta_redes",
  "titulo_llamanos",
  "titulo_escribenos",
  "titulo_ubicacion",
  "footer_telefonos",
  "footer_emails",
  "footer_redes",
  "footer_redes_titulo",
  "footer_redes_subtitulo",
  "footer_bullets",
  "texto_copyright",
  "promo_texto",
  "nav_footer",
  "footer_horario_titulo",
  "red_social_facebook",
  "red_social_youtobe",
  "red_social_twitter",
  "red_social_instagram",
  "red_social_linkedin",
  "red_social_tiktok",
  "contacto_direccion",
  "contacto_telefono",
  "contacto_telefono_secundario",
  "contacto_email",
  "url_mapa",
  "url_whatsapp",
  "whatsapp_mensaje",
  "footer_cta_subtitulo",
  "footer_cta_titulo",
  "Activo",
];

export function parseFooterRedes(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseFooterBullets(value) {
  return parseFooterRedes(value);
}

export function buildFooterTextPayload(data) {
  const payload = { id_footer: data.id_footer ?? 1, Activo: data.Activo ?? "S" };
  FOOTER_TEXT_FIELDS.forEach((key) => {
    if (key === "id_footer" || key === "Activo") return;
    if ((key === "footer_redes" || key === "footer_bullets" || key === "nav_footer") && data[key] !== undefined && data[key] !== null) {
      payload[key] = JSON.stringify(data[key]);
      return;
    }
    if (data[key] === undefined || data[key] === null) return;
    payload[key] = data[key];
  });
  return payload;
}

export function obtener(params) {
  return from(apiClient.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(apiClient.post(`${URL}/crear`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(apiClient.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

/** Logos vía multipart (axios debe poner el boundary solo; no fijar Content-Type). */
export function actualizarLogos(formData) {
  return from(apiFormDataClient.post(`${URL}/actualizar_logos`, formData)).pipe(
    map((result) => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_document(params) {
  return from(apiClient.get(`${URL}/obtener_document`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar_document(params) {
  return from(apiClient.post(`${URL}/actualizar_document`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
