import { useEffect } from "react";

const LINK_ID = "miboda-public-css";

/**
 * Inyecta el CSS real de la invitación pública (public/temp02/css/styles.css)
 * en el <head> del admin, para que las vistas "canvas" sean una réplica
 * visual exacta de la web (mismas clases, mismo CSS — no una copia a mano).
 */
export default function useInjectPublicCss() {
  useEffect(() => {
    if (document.getElementById(LINK_ID)) return;
    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    // Ruta relativa a la raiz del propio dominio (no al backend de la API):
    // el sitio publico (public-site) y el panel admin se sirven juntos desde
    // el mismo despliegue (Vercel en produccion, el server estatico propio
    // en dev - ver invitacionPublicaPlugin en vite.config.js), asi que el
    // CSS real vive en "/css/styles.css" sin importar donde este la API.
    // Cache-busting con la hora de carga: el canvas es una vista previa en
    // vivo del diseño real, así que siempre debe reflejar el último CSS
    // (igual que el sitio público, que usa filemtime() para esto mismo).
    link.href = `/css/styles.css?v=${Date.now()}`;
    document.head.appendChild(link);

    const fontLink = document.createElement("link");
    fontLink.id = LINK_ID + "-fonts";
    fontLink.rel = "stylesheet";
    fontLink.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,400;0,600;1,400&display=swap";
    if (!document.getElementById(fontLink.id)) document.head.appendChild(fontLink);
  }, []);
}

export function publicAsset(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  // Fotos subidas desde el admin viven en storage_/evento/... y esas SI las
  // sirve el backend (Railway), no el sitio estatico.
  if (path.startsWith("storage_/")) {
    const backend = import.meta.env.VITE_AUTHJWT_DOMAIN || "";
    return `${backend}/${path}`;
  }
  // Cualquier otra ruta (assets/img/...) es un recurso estatico de diseño
  // que vive junto al panel admin en el mismo dominio (ver comentario en
  // useInjectPublicCss de arriba), asi que se resuelve relativa a la raiz.
  return `/${path}`;
}
