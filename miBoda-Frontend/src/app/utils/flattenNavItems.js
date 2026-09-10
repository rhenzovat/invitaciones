/** Aplana ítems del sidebar (con children) para buscar por path. */
export function flattenNavItems(items, out = []) {
  (items || []).forEach((item) => {
    if (item?.path) {
      out.push(item);
    }
    if (item?.children?.length) {
      flattenNavItems(item.children, out);
    }
  });
  return out;
}

/** Normaliza ruta del menú/favoritos (sin /admin, sin barra final). */
export function normalizeNavPath(path) {
  if (!path) return "";
  let p = String(path).trim();
  if (!p) return "";
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.startsWith("/admin/")) p = `/${p.slice(6)}`;
  else if (p === "/admin") p = "/";
  p = p.replace(/\/$/, "") || "/";
  return p;
}

/** Comparación flexible: /informe-sistema vs /informe_sistema */
export function pathsMatch(a, b) {
  const pa = normalizeNavPath(a);
  const pb = normalizeNavPath(b);
  if (!pa || !pb) return false;
  if (pa === pb) return true;
  const alt = (x) => x.replace(/-/g, "_");
  return alt(pa) === alt(pb) || alt(pa) === pb || pa === alt(pb);
}

export function findNavItemByPath(items, path) {
  const target = normalizeNavPath(path);
  return flattenNavItems(items).find((it) => pathsMatch(it.path, target)) || null;
}
