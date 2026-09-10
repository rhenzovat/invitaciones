const DEFAULT_LOGO = "assets/logos/amour-logo.png";

/** URL pública del logo del panel (respeta VITE_BASE_PATH / BASE_URL). */
export function appLogoUrl() {
  const base = import.meta.env.BASE_URL || "/";
  const configured = (import.meta.env.VITE_URL_LOGOS || "").trim();
  const fallback = `${base}${DEFAULT_LOGO}`;

  if (!configured) return fallback;
  if (/^https?:\/\//i.test(configured)) return configured;
  if (configured.startsWith("/")) return configured;

  const normalized = configured.replace(/^(\.\.\/)+/, "");
  return `${base}${normalized.replace(/^\//, "")}`;
}
