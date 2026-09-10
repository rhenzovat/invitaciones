/**
 * Tokens JWT: localStorage si "Recordarme", sessionStorage si no (se pierde al cerrar la pestaña).
 */

const KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
  user: "IdUsuario",
  trustedDevice: "trusted2faDevice",
};

function clearKeys(storage) {
  storage.removeItem(KEYS.access);
  storage.removeItem(KEYS.refresh);
  storage.removeItem(KEYS.user);
}

export function clearAuthStorage() {
  clearKeys(localStorage);
  clearKeys(sessionStorage);
}

/** Solo quita el JWT caducado; conserva refresh para reintentar sin Google. */
export function clearAccessTokenOnly() {
  localStorage.removeItem(KEYS.access);
  sessionStorage.removeItem(KEYS.access);
}

export function persistRefreshToken(refreshToken) {
  if (refreshToken) {
    localStorage.setItem(KEYS.refresh, refreshToken);
  }
}

/** Token de dispositivo confiable (omitir 2FA en logins posteriores en este navegador). */
export function getStoredTrustedDeviceToken() {
  return localStorage.getItem(KEYS.trustedDevice);
}

export function persistTrustedDeviceToken(token) {
  if (token) {
    localStorage.setItem(KEYS.trustedDevice, token);
  }
}

export function clearTrustedDeviceToken() {
  localStorage.removeItem(KEYS.trustedDevice);
}

export function getStoredAccessToken() {
  return sessionStorage.getItem(KEYS.access) || localStorage.getItem(KEYS.access);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(KEYS.refresh) || sessionStorage.getItem(KEYS.refresh);
}

export function getStoredUserId() {
  return sessionStorage.getItem(KEYS.user) || localStorage.getItem(KEYS.user);
}

/** Dónde están guardados los tokens ahora (para rotación en refresh). */
export function getTokenStorage() {
  if (sessionStorage.getItem(KEYS.access)) return sessionStorage;
  if (localStorage.getItem(KEYS.access)) return localStorage;
  return null;
}

/**
 * @param {object} p
 * @param {string} p.accessToken
 * @param {string|null|undefined} p.refreshToken
 * @param {string|number} p.userId
 * @param {boolean} p.rememberMe - true = localStorage (persiste), false = solo pestaña actual
 */
/** Ruta de login respetando VITE_BASE_PATH (/admin/). */
export function getSignInUrl() {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "") || "";
  return `${base}/session/signin`;
}

/** Limpia flags OAuth en sessionStorage (evitan pantalla en blanco tras cerrar sesión). */
export function clearOAuthExchangeFlags() {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("oauth_exchange_done")) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** Limpieza total al cerrar sesión. */
export function clearSessionCompletely() {
  clearAuthStorage();
  clearTrustedDeviceToken();
  clearOAuthExchangeFlags();
}

export function persistAuthTokens({ accessToken, refreshToken, userId, rememberMe = true }) {
  clearAuthStorage();
  const target = rememberMe ? localStorage : sessionStorage;
  if (accessToken) target.setItem(KEYS.access, accessToken);
  if (userId != null && userId !== "") target.setItem(KEYS.user, String(userId));
  /** Refresh siempre en localStorage: reanudar sesión sin volver a Google/2FA (estilo Gmail). */
  if (refreshToken) {
    localStorage.setItem(KEYS.refresh, refreshToken);
  }
}
