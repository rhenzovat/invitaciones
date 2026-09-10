import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/web_faq";

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export async function crear(params) {
  const result = await apiClient.post(`${URL}/crear`, params);
  return result.data;
}

export async function actualizar(params) {
  const result = await apiClient.post(`${URL}/actualizar`, params);
  return result.data;
}

export async function eliminar(id_pregunta) {
  const result = await apiClient.post(`${URL}/eliminar`, { id_pregunta });
  return result.data;
}

export async function actualizarSeccion(params) {
  const result = await apiClient.post(`${URL}/actualizar_seccion`, params);
  return result.data;
}
