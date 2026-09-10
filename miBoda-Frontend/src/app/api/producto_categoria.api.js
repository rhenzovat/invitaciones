import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/producto_categoria";

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

//export function crear(params) {
  //return from(apiClient.post(`${URL}/crear`, params)).pipe(
   // map(result => result.data.result)
  //).toPromise();
//}//

export async function crear(params) {
  try {
    const result = await apiClient.post(`${URL}/crear`, params);
    return result.data.result;
  } catch (error) {
    const mensaje = error?.response?.data?.message || 'Error al crear la categoría';
    throw new Error(mensaje);
  }
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

export function listar_tipo() {
  return from(apiClient.get(`${URL}/listar_tipo`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_sub_categoria(params) {
  return from(apiClient.get(`${URL}/obtener_sub_categoria`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}