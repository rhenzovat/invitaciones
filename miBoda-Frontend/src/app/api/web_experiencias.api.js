import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_experiencias';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(map((r) => r.data.result)).toPromise();
}
export function crear(params) {
  return from(apiFormDataClient.post(`${URL}/crear`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(map((r) => r.data.result)).toPromise();
}
export function eliminar(id) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: { id_experiencia: id } })).pipe(map((r) => r.data)).toPromise();
}
