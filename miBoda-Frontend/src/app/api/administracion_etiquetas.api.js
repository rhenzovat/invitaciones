import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const URL = '/administracion_etiquetas';

export function listar(params = {}) {
  return from(apiClient.get(`${URL}/listar`, { params })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function listarOpciones(id_roles) {
  return from(apiClient.get(`${URL}/listar_opciones`, { params: { id_roles } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(apiClient.post(`${URL}/crear`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function actualizar(params) {
  return from(apiClient.put(`${URL}/actualizar`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: params })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}
