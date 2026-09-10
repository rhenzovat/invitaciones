import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_pagina_galeria';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizarSeccion(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_seccion`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function crear(params) {
  return from(apiFormDataClient.post(`${URL}/crear`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function eliminar(id) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: { id_galeria: id } })).pipe(map((r) => r.data)).toPromise();
}
export function crearCategoria(params) {
  return from(apiFormDataClient.post(`${URL}/crear_categoria`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizarCategoria(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_categoria`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function eliminarCategoria(id) {
  return from(apiClient.delete(`${URL}/eliminar_categoria`, { data: { id } })).pipe(map((r) => r.data)).toPromise();
}
