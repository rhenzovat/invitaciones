import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/web_slider";

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

export function configuracion() {
  return from(apiClient.get(`${URL}/configuracion`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizarConfiguracion(params) {
  return from(apiClient.post(`${URL}/actualizar_configuracion`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
 
export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(apiFormDataClient.post(`${URL}/crear`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
  export function actualizar_breadcrumb(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_breadcrumb`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}