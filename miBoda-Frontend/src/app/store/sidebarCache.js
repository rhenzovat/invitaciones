/**
 * Caché del menú lateral por rol.
 * Preferir refreshAppSidebarMenu() desde app/utils/refreshAppSidebarMenu.js
 *
 * Versionado: al cambiar SIDEBAR_VERSION el caché se invalida automáticamente
 * en el próximo acceso, sin necesidad de hard reload (Ctrl+Shift+R).
 */

// ─── Incrementar este valor cuando cambie la estructura del menú en DB ───────
const SIDEBAR_VERSION = '2026-06-06-v3';
const LS_KEY = 'sidebar_cache_version';

// Variables de caché en memoria (deben declararse ANTES del IIFE)
let sidebarCache = null;
let sidebarCacheRoleId = null;

/** @type {Set<() => void | Promise<void>>} */
const reloadListeners = new Set();

// Invalidar caché si la versión cambió (al cargar el módulo)
(function checkVersion() {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (stored !== SIDEBAR_VERSION) {
      localStorage.setItem(LS_KEY, SIDEBAR_VERSION);
      // Limpiar caché en memoria para forzar recarga desde servidor
      sidebarCache = null;
      sidebarCacheRoleId = null;
    }
  } catch (_) { /* SSR / sin acceso a localStorage */ }
})();

export function getSidebarCache(id_roles) {
  const roleKey = id_roles != null ? Number(id_roles) : null;
  if (sidebarCache !== null && sidebarCacheRoleId === roleKey) {
    return sidebarCache;
  }
  return null;
}

export function setSidebarCache(data, id_roles) {
  sidebarCache = data;
  sidebarCacheRoleId = id_roles != null ? Number(id_roles) : null;
  try {
    localStorage.setItem(LS_KEY, SIDEBAR_VERSION);
  } catch (_) { /* ignorar */ }
}

export function clearSidebarCache() {
  sidebarCache = null;
  sidebarCacheRoleId = null;
}

/** Suscribir recarga del menú lateral (p. ej. Sidenav). El listener puede devolver una Promise. */
export function subscribeSidebarReload(listener) {
  reloadListeners.add(listener);
  return () => reloadListeners.delete(listener);
}

/**
 * Invalida caché y notifica al sidebar para volver a cargar el menú.
 * @returns {Promise<void>}
 */
export function reloadSidebarMenu() {
  clearSidebarCache();
  const tasks = [];
  reloadListeners.forEach((fn) => {
    try {
      const result = fn();
      if (result != null && typeof result.then === 'function') {
        tasks.push(result);
      }
    } catch (err) {
      console.error('[sidebarCache] reload listener error', err);
    }
  });
  return tasks.length > 0 ? Promise.all(tasks).then(() => undefined) : Promise.resolve();
}
