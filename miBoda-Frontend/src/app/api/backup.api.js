import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/backup";

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function generar() {
  return from(apiFormDataClient.post(`${URL}/generar`)).pipe(
    map(result => result.data)
  ).toPromise();
}

export function descargar(id) {
  return from(
    apiClient.get(`${URL}/descargar`, {
      params: { id },
      responseType: 'blob'
    })
  ).pipe(
    map(result => result.data)
  ).toPromise();
}
export function eliminar(id) {
  return from(apiClient.delete(`${URL}/eliminar`, { params: { id } })).pipe(
    map(result => result.data)
  ).toPromise();
}
