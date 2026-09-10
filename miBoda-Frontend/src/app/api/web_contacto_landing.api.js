import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_contacto_landing';

export function obtener() {
  return from(apiClient.get(`${URL}/obtener`)).pipe(map((r) => r.data.result)).toPromise();
}
export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(map((r) => r.data.result)).toPromise();
}
