function etiquetasMatch(node, q) {
  const tags = node.etiquetas;
  if (!Array.isArray(tags) || tags.length === 0) return false;
  return tags.some((t) => {
    const nombre = (t.nombre || "").toLowerCase();
    const slug = (t.slug || "").toLowerCase();
    return nombre.includes(q) || slug.includes(q);
  });
}

/** Coincide nombre, URL o etiquetas de un módulo/menú con la consulta. */
export function menuTreeNodeMatches(node, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;
  const name = (node.nombre || "").toLowerCase();
  const url = (node.url || "").toLowerCase();
  const qBare = q.replace(/^\/+/, "");
  const urlBare = url.replace(/^\/+/, "").replace(/\/$/, "");
  if (name.includes(q)) return true;
  if (url && (url.includes(q) || urlBare.includes(qBare))) return true;
  if (qBare && urlBare.split("/").some((seg) => seg.includes(qBare))) return true;
  if (etiquetasMatch(node, q)) return true;
  return false;
}

/** Filtra hijos de menú recursivamente; si el padre coincide, conserva todos los hijos. */
function filterMenuChildren(children, query) {
  if (!children?.length) return [];
  return children.reduce((acc, node) => {
    const selfMatch = menuTreeNodeMatches(node, query);
    const filteredKids = filterMenuChildren(node.children, query);
    if (selfMatch) {
      acc.push({ ...node });
    } else if (filteredKids.length) {
      acc.push({ ...node, children: filteredKids });
    }
    return acc;
  }, []);
}

/** Filtra árbol de módulos (buildTreeByModulo) por nombre o URL en cualquier nivel. */
export function filterModuloTree(modules, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q || !modules?.length) return modules || [];

  return modules.reduce((acc, mod) => {
    const modMatch = menuTreeNodeMatches(mod, q);
    const filteredChildren = filterMenuChildren(mod.children, q);
    if (modMatch) {
      acc.push(mod);
    } else if (filteredChildren.length) {
      acc.push({ ...mod, children: filteredChildren });
    }
    return acc;
  }, []);
}

/** Claves expanded (modulo_* / menu_*) para abrir ramas al buscar. */
export function collectMenuTreeExpandKeys(modules) {
  const keys = [];
  (modules || []).forEach((mod) => {
    keys.push(`modulo_${mod.id_modulo}`);
    const walk = (nodes) => {
      (nodes || []).forEach((n) => {
        if (n.id_menu != null) keys.push(`menu_${n.id_menu}`);
        walk(n.children);
      });
    };
    walk(mod.children);
  });
  return keys;
}
