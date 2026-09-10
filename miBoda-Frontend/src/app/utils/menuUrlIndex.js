import { ADMIN_SPA_ROUTES, normalizePath } from "./adminRoutesRegistry";

/**
 * Aplana el árbol de menús (recursivo por id_menu_padre) con ruta de nombres.
 */
export function flattenMenuUrlEntries(menus) {
  const list = menus || [];
  const byParent = new Map();
  list.forEach((m) => {
    const p = m.id_menu_padre ?? "__root";
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(m);
  });
  byParent.forEach((arr) => arr.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)));

  const rows = [];
  const walk = (parentKey, parentPath) => {
    (byParent.get(parentKey) || []).forEach((m) => {
      const nombre = m.nombre || `Menú ${m.id_menu}`;
      const path = parentPath ? `${parentPath} › ${nombre}` : nombre;
      const url = normalizePath(m.url);
      const hijos = byParent.get(m.id_menu) || [];
      rows.push({
        id_menu: m.id_menu,
        menuNombre: nombre,
        menuRuta: path,
        modulo: m.modulo_nombre || (m.id_modulo == null ? "Sin módulo" : `Módulo ${m.id_modulo}`),
        menuActivo: m.Activo || "S",
        url,
        esEnlace: !!url,
        esExterno: /^https?:\/\//i.test(url),
        esAncla: url.startsWith("#"),
        tieneHijos: hijos.length > 0,
        soloContenedor: hijos.length > 0 && !url,
      });
      walk(m.id_menu, path);
    });
  };
  walk("__root", "");
  return rows;
}

function rowKey(url, method, idMenu) {
  return `${method || "GET"}|${url || ""}|${idMenu ?? ""}`;
}

/**
 * Combina rutas SPA, rutas Laravel (API) y asignaciones del menú en filas de tabla.
 */
export function buildSistemaUrlsRows({ menus = [], laravelRoutes = [] }) {
  const menuRows = flattenMenuUrlEntries(menus);
  const map = new Map();

  const upsert = (partial) => {
    const url = partial.url ?? "";
    const method = partial.method || "GET";
    const idMenu = partial.id_menu ?? null;
    const key = rowKey(url, method, idMenu);
    const prev = map.get(key);
    if (prev) {
      map.set(key, { ...prev, ...partial, menuNombre: partial.menuNombre || prev.menuNombre, menuRuta: partial.menuRuta || prev.menuRuta });
    } else {
      map.set(key, {
        url,
        method,
        grupo: partial.grupo || "otro",
        origen: partial.origen || "",
        label: partial.label || "",
        nombreRuta: partial.nombreRuta || "",
        menuNombre: partial.menuNombre || "",
        menuRuta: partial.menuRuta || "",
        modulo: partial.modulo || "",
        menuActivo: partial.menuActivo || "",
        id_menu: idMenu,
        enMenu: !!partial.enMenu,
        tieneHijos: partial.tieneHijos || false,
        esExterno: partial.esExterno || false,
        esAncla: partial.esAncla || false,
        soloContenedor: partial.soloContenedor || false,
      });
    }
  };

  ADMIN_SPA_ROUTES.forEach((r) => {
    upsert({
      url: r.path,
      method: "GET",
      grupo: r.grupo || "admin",
      origen: "SPA React",
      label: r.label,
      enMenu: false,
    });
  });

  (laravelRoutes || []).forEach((r) => {
    upsert({
      url: r.url,
      method: r.method || "GET",
      grupo: r.grupo || "web",
      origen: "Laravel",
      nombreRuta: r.nombre_ruta || "",
      enMenu: false,
    });
  });

  menuRows.forEach((m) => {
    if (!m.url && m.soloContenedor) {
      upsert({
        url: "",
        method: "—",
        grupo: "menu",
        origen: "Menú (contenedor)",
        menuNombre: m.menuNombre,
        menuRuta: m.menuRuta,
        modulo: m.modulo,
        menuActivo: m.menuActivo,
        id_menu: m.id_menu,
        enMenu: true,
        tieneHijos: m.tieneHijos,
        soloContenedor: true,
      });
      return;
    }
    if (!m.url) return;

    const matchKey = rowKey(m.url, "GET", null);
    const existing = map.get(matchKey);
    upsert({
      url: m.url,
      method: existing?.method && existing.method !== "GET" ? existing.method : "GET",
      grupo: m.esExterno ? "externo" : m.esAncla ? "ancla" : existing?.grupo || "menu",
      origen: existing?.origen ? `${existing.origen} + Menú` : "Menú",
      menuNombre: m.menuNombre,
      menuRuta: m.menuRuta,
      modulo: m.modulo,
      menuActivo: m.menuActivo,
      id_menu: m.id_menu,
      enMenu: true,
      tieneHijos: m.tieneHijos,
      esExterno: m.esExterno,
      esAncla: m.esAncla,
      label: existing?.label || "",
      nombreRuta: existing?.nombreRuta || "",
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    const ga = `${a.grupo}|${a.url}|${a.menuRuta}`;
    const gb = `${b.grupo}|${b.url}|${b.menuRuta}`;
    return ga.localeCompare(gb, "es");
  });
}

export function filterSistemaUrlsRows(rows, { search = "", grupo = "todos", soloMenu = false, soloSinMenu = false }) {
  const q = search.trim().toLowerCase();
  return (rows || []).filter((r) => {
    if (grupo !== "todos" && r.grupo !== grupo) return false;
    if (soloMenu && !r.enMenu) return false;
    if (soloSinMenu && r.enMenu) return false;
    if (!q) return true;
    const hay = [
      r.url,
      r.method,
      r.grupo,
      r.origen,
      r.label,
      r.nombreRuta,
      r.menuNombre,
      r.menuRuta,
      r.modulo,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
