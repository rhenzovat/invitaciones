import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const URL_BASE = '/web_pagina_experiencias';

export function obtener() {
  return from(apiClient.get(URL_BASE)).pipe(map(r => r.data)).toPromise();
}

export function actualizar(datos) {
  return from(apiClient.put(URL_BASE, datos)).pipe(map(r => r.data)).toPromise();
}

export function subirHero(file) {
  const fd = new FormData();
  fd.append('imagen', file);
  return from(apiClient.post(`${URL_BASE}/upload_hero`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).pipe(map(r => r.data)).toPromise();
}
