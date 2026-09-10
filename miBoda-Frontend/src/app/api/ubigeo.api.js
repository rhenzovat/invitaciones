import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/ubigeo";

export function listar_departamentos() {
  return from(apiClient.get(`${URL}/listar_departamentos`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_provicias(params) {
  return from(apiClient.get(`${URL}/obtener_provicias`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_distritos(params) {
  return from(apiClient.get(`${URL}/obtener_distritos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
