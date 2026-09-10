import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/web_porque_elejirnos";

export function obtener() {
  return from(apiClient.get(`${URL}/obtener`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar(formData) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, formData)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
