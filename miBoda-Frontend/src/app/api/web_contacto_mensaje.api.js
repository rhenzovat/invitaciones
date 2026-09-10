import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_contacto_mensaje';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(map((r) => r.data.result)).toPromise();
}
export function obtener(params) {
  return from(apiClient.get(`${URL}/obtener`, { params })).pipe(map((r) => r.data.result)).toPromise();
}
