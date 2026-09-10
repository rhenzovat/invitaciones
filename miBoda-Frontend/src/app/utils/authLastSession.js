/**
 * Último usuario que inició sesión en este navegador (para tarjeta "Continuar como…").
 * No contiene secretos; persiste aunque cierre sesión para mostrar avatar y correo.
 */

const KEY = "lastSessionUser";

export function persistLastSessionUser(user, loginMethod = null) {
  if (!user?.id) return;
  try {
    const payload = {
      id: user.id,
      name: user.name || user.username || "",
      email: user.email || "",
      avatar: user.avatar || null,
      login_method: loginMethod,
      saved_at: Date.now(),
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch (_) {
    /* quota exceeded — omit avatar */
    localStorage.setItem(
      KEY,
      JSON.stringify({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        login_method: loginMethod,
        saved_at: Date.now(),
      })
    );
  }
}

export function getLastSessionUser() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.id ? data : null;
  } catch {
    return null;
  }
}

export function clearLastSessionUser() {
  localStorage.removeItem(KEY);
}
