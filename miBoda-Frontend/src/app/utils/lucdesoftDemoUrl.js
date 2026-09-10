/** URL pública de demo royalsensorymassage (misma lógica que Helper::royalsensorymassageDemoUrl en Laravel). */
export function royalsensorymassageDemoUrl(path, absoluteFromApi = null) {
  if (absoluteFromApi) return absoluteFromApi;
  const raw = String(path || "").trim();
  if (!raw || raw === "#") return null;
  if (/^https?:\/\//i.test(raw)) return raw;

  const rel = raw.startsWith("temp02/") ? raw : `temp02/${raw.replace(/^\//, "")}`;
  const base = (import.meta.env.VITE_CMS_PUBLIC_BASE || import.meta.env.VITE_AUTHJWT_DOMAIN || "")
    .replace(/\/$/, "");
  return base ? `${base}/${rel}` : `/${rel}`;
}
