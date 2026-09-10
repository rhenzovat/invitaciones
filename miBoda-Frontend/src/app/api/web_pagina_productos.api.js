import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_pagina_productos';

export function obtener() {
  return from(apiClient.get(`${URL}/obtener`)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_pagina(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_pagina`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_galeria_seccion(params) {
  return from(apiClient.post(`${URL}/actualizar_galeria_seccion`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function crear_galeria(params) {
  return from(apiFormDataClient.post(`${URL}/crear_galeria`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function actualizar_galeria(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_galeria`, params)).pipe(map((r) => r.data.result)).toPromise();
}

export function eliminar_galeria(params) {
  return from(apiClient.delete(`${URL}/eliminar_galeria`, { data: params })).pipe(map((r) => r.data)).toPromise();
}
