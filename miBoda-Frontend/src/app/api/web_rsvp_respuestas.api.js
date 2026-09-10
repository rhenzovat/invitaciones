import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_rsvp_respuestas';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(map((r) => r.data.result)).toPromise();
}

export function eliminar(id_rsvp_respuesta) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: { id_rsvp_respuesta } })).pipe(map((r) => r.data)).toPromise();
}
