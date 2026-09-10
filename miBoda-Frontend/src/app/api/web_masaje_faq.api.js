import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL_BASE = '/web_masaje_faq';

export function listar() {
  return from(apiClient.get(URL_BASE)).pipe(map((r) => r.data)).toPromise();
}
export function crear(params) {
  return from(apiClient.post(URL_BASE, params)).pipe(map((r) => r.data)).toPromise();
}
export function actualizar(id, params) {
  return from(apiClient.put(`${URL_BASE}/${id}`, params)).pipe(map((r) => r.data)).toPromise();
}
export function eliminar(id) {
  return from(apiClient.delete(`${URL_BASE}/${id}`)).pipe(map((r) => r.data)).toPromise();
}
export function reorder(items) {
  return from(apiClient.post(`${URL_BASE}/reorder`, { items })).pipe(map((r) => r.data)).toPromise();
}
