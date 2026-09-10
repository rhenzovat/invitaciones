import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_pagina_nosotros';

export function obtener() {
  return from(apiClient.get(`${URL}/obtener`)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_pagina(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_pagina`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_quienes(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_quienes`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function crear_beneficio(params) {
  return from(apiClient.post(`${URL}/crear_beneficio`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_beneficio(params) {
  return from(apiClient.post(`${URL}/actualizar_beneficio`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function eliminar_beneficio(params) {
  return from(apiClient.delete(`${URL}/eliminar_beneficio`, { data: params })).pipe(map((r) => r.data)).toPromise();
}

export function crear_contador(params) {
  return from(apiClient.post(`${URL}/crear_contador`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_contador(params) {
  return from(apiClient.post(`${URL}/actualizar_contador`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function eliminar_contador(params) {
  return from(apiClient.delete(`${URL}/eliminar_contador`, { data: params })).pipe(map((r) => r.data)).toPromise();
}

export function actualizar_producto_seccion(params) {
  return from(apiClient.post(`${URL}/actualizar_producto_seccion`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function crear_producto(params) {
  return from(apiFormDataClient.post(`${URL}/crear_producto`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_producto(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_producto`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function eliminar_producto(params) {
  return from(apiClient.delete(`${URL}/eliminar_producto`, { data: params })).pipe(map((r) => r.data)).toPromise();
}
