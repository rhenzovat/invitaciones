/**
 * Caché de sistema_objetos. Se carga una vez por sesión.
 * Limpiar con clearObjetosCache() al cerrar sesión.
 */
let objetosCache = null;

export function getObjetosCache() {
  return objetosCache;
}

export function setObjetosCache(data) {
  objetosCache = data;
}

export function clearObjetosCache() {
  objetosCache = null;
}
