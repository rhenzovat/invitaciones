import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_evento';

export function obtener() {
  return from(apiClient.get(`${URL}/obtener`)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar(datos) {
  return from(apiClient.post(`${URL}/actualizar`, datos)).pipe(map((r) => r.data)).toPromise();
}

export function subirImagen(file) {
  const fd = new FormData();
  fd.append('imagen', file);
  return from(apiFormDataClient.post(`${URL}/subir_imagen`, fd)).pipe(map((r) => r.data.result)).toPromise();
}

export function subirAudio(file) {
  const fd = new FormData();
  fd.append('audio', file);
  return from(apiFormDataClient.post(`${URL}/subir_audio`, fd)).pipe(map((r) => r.data.result)).toPromise();
}
