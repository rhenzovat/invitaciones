import { apiClient } from '../contexts/JWTAuthContext';
import { authJWTConfig } from '../authJWTConfig';
import axios from 'axios';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const API_BASE = `${(authJWTConfig.domain || '').replace(/\/$/, '')}/api`;

/** Público: métodos permitidos para un email (antes del login). */
export function metodosPorEmail(email) {
  return axios
    .post(`${API_BASE}/auth/metodos-por-email`, { email })
    .then((r) => r.data.result);
}

export function obtenerAuthConfig(id_usuario) {
  return from(apiClient.post('/usuario/auth-config/obtener', { id_usuario }))
    .pipe(map((r) => r.data.result))
    .toPromise();
}

export function guardarAuthConfig(params) {
  return from(apiClient.post('/usuario/auth-config/guardar', params))
    .pipe(map((r) => r.data))
    .toPromise();
}

export function resetear2faUsuario(id_usuario) {
  return from(apiClient.post('/usuario/auth-config/resetear-2fa', { id_usuario }))
    .pipe(map((r) => r.data))
    .toPromise();
}
