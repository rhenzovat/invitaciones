import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_pagina_contacto';

export function obtener() {
  return from(apiClient.get(`${URL}/obtener`)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function crear_columna(params) {
  return from(apiClient.post(`${URL}/crear_columna`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_columna(params) {
  return from(apiClient.post(`${URL}/actualizar_columna`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function eliminar_columna(params) {
  return from(apiClient.delete(`${URL}/eliminar_columna`, { data: params })).pipe(map((r) => r.data)).toPromise();
}
