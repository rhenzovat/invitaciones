import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/web_testimonios";

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(apiFormDataClient.post(`${URL}/crear`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: params })).pipe(
    map(result => result.data)
  ).toPromise();
}

export async function actualizarSeccion(params) {
  // params puede ser FormData (para incluir la imagen lateral) u objeto plano.
  const client = (typeof FormData !== "undefined" && params instanceof FormData) ? apiFormDataClient : apiClient;
  const result = await client.post(`${URL}/actualizar_seccion`, params);
  return result.data;
}
