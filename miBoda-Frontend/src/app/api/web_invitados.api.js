import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_invitados';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(map((r) => r.data.result)).toPromise();
}

export function crear(datos) {
  return from(apiClient.post(`${URL}/crear`, datos)).pipe(map((r) => r.data)).toPromise();
}

export function actualizar(datos) {
  return from(apiClient.post(`${URL}/actualizar`, datos)).pipe(map((r) => r.data)).toPromise();
}

export function eliminar(id_invitado) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: { id_invitado } })).pipe(map((r) => r.data)).toPromise();
}
