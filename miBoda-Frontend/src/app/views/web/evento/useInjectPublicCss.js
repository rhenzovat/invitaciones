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
    const backend = import.meta.env.VITE_AUTHJWT_DOMAIN || "";
    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    // Cache-busting con la hora de carga: el canvas es una vista previa en
    // vivo del diseño real, así que siempre debe reflejar el último CSS
    // (igual que el sitio público, que usa filemtime() para esto mismo).
    link.href = `${backend}/temp02/css/styles.css?v=${Date.now()}`;
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
  const backend = import.meta.env.VITE_AUTHJWT_DOMAIN || "";
  // Fotos subidas desde el admin viven en /storage_/evento/..., no en /temp02/.
  if (path.startsWith("storage_/")) return `${backend}/${path}`;
  return `${backend}/temp02/${path}`;
}
