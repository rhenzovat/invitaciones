import { apiClient } from '../contexts/JWTAuthContext';
import { authJWTConfig } from '../authJWTConfig';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import axios from 'axios';

const URL = '/auth-proveedor';
const API_BASE = `${(authJWTConfig.domain || '').replace(/\/$/, '')}/api`;
/** Evita spinner infinito si el backend no está levantado. */
const PUBLIC_AUTH_TIMEOUT_MS = 15000;

function authAxiosErrorMessage(error, fallback) {
  if (error?.code === 'ECONNABORTED') {
    return `El servidor no respondió a tiempo. Verifique que el backend esté activo (${authJWTConfig.domain || 'API'}).`;
  }
  if (error?.message === 'Network Error' || !error?.response) {
    return `No se pudo conectar con el servidor. ¿Está corriendo el backend en ${authJWTConfig.domain || 'localhost:8000'}?`;
  }
  return error?.response?.data?.message || error?.message || fallback;
}

/** Métodos de login públicos (sin JWT) */
export function metodosLogin() {
  return axios
    .get(`${API_BASE}/auth/metodos-login`, { timeout: PUBLIC_AUTH_TIMEOUT_MS })
    .then((r) => r.data.result)
    .catch((e) => {
      e.userMessage = authAxiosErrorMessage(e, 'No se pudieron cargar los métodos de acceso.');
      throw e;
    });
}

/** Inicia OAuth: devuelve { authorization_url }. loginHint evita pantalla "elegir cuenta" si ya hay sesión Google. */
export function oauthRedirect(proveedor, loginHint = null) {
  const params = loginHint ? { login_hint: loginHint } : {};
  return axios
    .get(`${API_BASE}/auth/oauth/redirect/${proveedor}`, { params, timeout: PUBLIC_AUTH_TIMEOUT_MS })
    .then((r) => r.data.result)
    .catch((e) => {
      e.userMessage = authAxiosErrorMessage(e, 'No se pudo iniciar sesión con el proveedor.');
      throw e;
    });
}

/** Intercambia código de un solo uso por sesión JWT */
export function oauthExchange(code, trustedDeviceToken = null) {
  const body = { code };
  if (trustedDeviceToken) {
    body.trusted_device_token = trustedDeviceToken;
  }
  return axios.post(`${API_BASE}/auth/oauth/exchange`, body).then((r) => r.data);
}

export function listar() {
  return from(apiClient.get(`${URL}/listar`))
    .pipe(map((r) => r.data.result))
    .toPromise();
}

export function habilitar(params) {
  return from(apiClient.post(`${URL}/habilitar`, params))
    .pipe(map((r) => r.data))
    .toPromise();
}

export function predeterminado(params) {
  return from(apiClient.post(`${URL}/predeterminado`, params))
    .pipe(map((r) => r.data))
    .toPromise();
}

export function actualizarConfig(params) {
  return from(apiClient.post(`${URL}/actualizar-config`, params))
    .pipe(map((r) => r.data))
    .toPromise();
}
