import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/beneficio";

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export async function actualizar(params) {
  try {
    const result = await apiClient.put(`${URL}/actualizar`, params);
    return result.data;
  } catch (error) {
    const mensaje = error?.response?.data?.message || 'Error al actualizar';
    throw new Error(mensaje);
  }
}