import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/web_about";

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
 
export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
  