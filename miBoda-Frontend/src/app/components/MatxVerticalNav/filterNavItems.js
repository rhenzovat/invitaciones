/** Coincide nombre o URL de un ítem del sidebar. */
function itemMatchesSearchQuery(item, q) {
  if (item.type === "label" || item.type === "section") return false;
  if (item.name && item.name.toLowerCase().includes(q)) return true;
  const path = (item.path || "").toLowerCase().replace(/\/$/, "");
  if (!path) return false;
  const qNorm = q.replace(/\/$/, "");
  const qBare = qNorm.replace(/^\/+/, "");
  const pathBare = path.replace(/^\/+/, "");
  if (path.includes(qNorm) || pathBare.includes(qBare)) return true;
  if (qBare && pathBare.split("/").some((seg) => seg.includes(qBare))) return true;
  return false;
}

/** Filtra árbol de navegación por nombre o ruta (recursivo). */
export function filterNavItems(items, query) {
  if (!query) return items || [];
  const q = query.trim().toLowerCase();
  if (!q) return items || [];
  return (items || []).reduce((acc, item) => {
    if (itemMatchesSearchQuery(item, q)) {
      acc.push(item);
    } else if (item.children?.length) {
      const filteredChildren = filterNavItems(item.children, q);
      if (filteredChildren.length) acc.push({ ...item, children: filteredChildren });
    }
    return acc;
  }, []);
}
