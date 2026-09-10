/** Rutas públicas conocidas por clave de metadatos (nombre_pagina). */
export const METADATOS_PUBLIC_URLS = {
  home: "/",
  web_about: "/nosotros",
  web_masajes: "/masajes",
  web_servicios: "/masajes",
  web_experiencias: "/experiencias",
  web_gallery: "/galeria",
  web_contact: "/contacto",
  blogs: "/publicaciones",
  web_terminos_condiciones: "/terminos",
  web_politica_privacidad: "/politicas",
  web_servicio_cliente: "/servicio-cliente",
  web_ubicacion: "/ubicacion",
  web_libro_reclamos: "/libro-reclamos",
};

export function metadatosPublicUrl(slug) {
  if (!slug) return null;
  return METADATOS_PUBLIC_URLS[slug] ?? null;
}
