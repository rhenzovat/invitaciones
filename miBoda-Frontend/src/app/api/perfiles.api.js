import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/perfiles";

export function obtener(params) {
  return from(apiClient.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(apiClient.post(`${URL}/crear`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(apiClient.put(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

//==========Seleccion multiple =================
export function obtener_asignar(params) {
  return from(apiClient.post(`${URL}/obtener_asignar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_lista(params) {
  return from(apiClient.get(`${URL}/obtener_lista`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_check(params) {
  return from(apiClient.get(`${URL}/obtener_check`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_eliminar(params) {
  return from(apiClient.delete(`${URL}/obtener_eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar_multiple(params) {
  return from(apiClient.delete(`${URL}/eliminar_multiple`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}