import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/usuario";

export function obtener(params) {
  return from(apiClient.post(`${URL}/obtener`, params)).pipe(
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
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data)
  ).toPromise();
}

export function obtenerAdminPrincipal() {
  return from(apiClient.get(`${URL}/admin-principal`)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function transferirAdminPrincipal(params) {
  return from(apiClient.post(`${URL}/transferir-admin-principal`, params)).pipe(
    map((r) => r.data)
  ).toPromise();
}

export function listarRepartidores() {
  return from(apiClient.get(`${URL}/listar_repartidores`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
