import { getStoredRefreshToken } from "./authStorage";

/**
 * Renovación de JWT con un solo refresh en vuelo (evita invalidar el refresh token dos veces).
 */
let refreshInFlight = null;

export function isAuthRefreshUrl(url = "") {
  return /\/auth\/(refresh|logout)(\?|$)/.test(url) || /\/login(\?|$)/.test(url);
}

export function requestRefreshToken(apiClient, applyRefreshPayload) {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    return Promise.reject(new Error("No hay refresh token"));
  }

  refreshInFlight = apiClient
    .post("/auth/refresh", { refreshToken }, { skipAuthRefresh: true })
    .then((res) => {
      const token = applyRefreshPayload(res);
      return { token, res };
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}
