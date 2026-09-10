import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/web_nuestro_equipo";

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(formData) {
  return from(apiFormDataClient.post(`${URL}/crear`, formData)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(formData) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, formData)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizarSeccion(params) {
  return from(apiClient.post(`${URL}/actualizar_seccion`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
