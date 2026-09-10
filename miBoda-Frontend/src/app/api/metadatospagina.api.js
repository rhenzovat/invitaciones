import { apiClient } from "../contexts/JWTAuthContext";

import { from } from "rxjs";
import { map } from "rxjs/operators";

export const URL = "/metadatospagina";

export function obtener(params) {
  return from(apiClient.get(`${URL}/obtener`, { params }))
    .pipe(map((result) => result.data))
    .toPromise();
}

/**
 * @param {{ solo?: 'activos' | 'inactivos' | 'todos' }} [params]
 */
export function listar(params = {}) {
  return from(apiClient.get(`${URL}/listar`, { params }))
    .pipe(map((result) => result.data))
    .toPromise();
}

export function crear(body) {
  return from(apiClient.post(`${URL}/crear`, body))
    .pipe(map((result) => result.data))
    .toPromise();
}

export function actualizar(body) {
  return from(apiClient.put(`${URL}/actualizar`, body))
    .pipe(map((result) => result.data))
    .toPromise();
}

/** “Eliminar” lógico: marca inactivo (no se usa en la web). */
export function desactivar(body) {
  return from(apiClient.put(`${URL}/desactivar`, body))
    .pipe(map((result) => result.data))
    .toPromise();
}

export function restaurar(body) {
  return from(apiClient.put(`${URL}/restaurar`, body))
    .pipe(map((result) => result.data))
    .toPromise();
}
