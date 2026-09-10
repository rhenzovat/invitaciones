import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_contadores';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(apiClient.post(`${URL}/crear`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(apiClient.post(`${URL}/actualizar`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: params })).pipe(
    map((r) => r.data)
  ).toPromise();
}
