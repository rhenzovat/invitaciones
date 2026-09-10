import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_cancion_sugerencias';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(map((r) => r.data.result)).toPromise();
}

export function eliminar(id_sugerencia) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: { id_sugerencia } })).pipe(map((r) => r.data)).toPromise();
}
