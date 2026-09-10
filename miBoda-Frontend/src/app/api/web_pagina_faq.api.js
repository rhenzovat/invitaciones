import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL_BASE = '/web_pagina_faq';

export function obtener() {
  return from(apiClient.get(URL_BASE)).pipe(map((r) => r.data)).toPromise();
}

/** Acepta FormData (intro_label, titulo, subtitulo, imagen opcional). */
export function actualizar(formData) {
  return from(apiFormDataClient.post(URL_BASE, formData)).pipe(map((r) => r.data)).toPromise();
}
