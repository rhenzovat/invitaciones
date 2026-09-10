import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const URL = '/config/favicon';

export function obtenerFavicon() {
  return from(apiClient.get(URL)).pipe(
    map((r) => r.data?.result ?? null)
  ).toPromise();
}

export function actualizarFavicon(file) {
  const form = new FormData();
  form.append('favicon', file);
  return from(apiClient.post(URL, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).pipe(
    map((r) => r.data?.result ?? null)
  ).toPromise();
}
