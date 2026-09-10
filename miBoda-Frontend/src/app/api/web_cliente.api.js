import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_cliente';

export function obtener_seccion() {
  return from(apiClient.get(`${URL}/obtener_seccion`)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizar_seccion(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_seccion`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function listar_estadisticas() {
  return from(apiClient.get(`${URL}/listar_estadisticas`)).pipe(map((r) => r.data.result)).toPromise();
}
export function crear_estadistica(params) {
  return from(apiClient.post(`${URL}/crear_estadistica`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizar_estadistica(params) {
  return from(apiClient.post(`${URL}/actualizar_estadistica`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function eliminar_estadistica(params) {
  return from(apiClient.delete(`${URL}/eliminar_estadistica`, { data: params })).pipe(map((r) => r.data)).toPromise();
}
export function listar_logos() {
  return from(apiClient.get(`${URL}/listar_logos`)).pipe(map((r) => r.data.result)).toPromise();
}
export function crear_logo(params) {
  return from(apiFormDataClient.post(`${URL}/crear_logo`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizar_logo(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_logo`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function eliminar_logo(params) {
  return from(apiClient.delete(`${URL}/eliminar_logo`, { data: params })).pipe(map((r) => r.data)).toPromise();
}
