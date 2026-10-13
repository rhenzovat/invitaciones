import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = '/web_mesas';

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(map((r) => r.data.result)).toPromise();
}

export function crearMesas(datos) {
  return from(apiClient.post(`${URL}/crear`, datos)).pipe(map((r) => r.data)).toPromise();
}

export function actualizarMesa(datos) {
  return from(apiClient.post(`${URL}/actualizar`, datos)).pipe(map((r) => r.data)).toPromise();
}

export function moverMesa(id_mesa, x, y) {
  return from(apiClient.post(`${URL}/posicion`, { id_mesa, x, y })).pipe(map((r) => r.data)).toPromise();
}

export function eliminarMesa(id_mesa) {
  return from(apiClient.delete(`${URL}/eliminar`, { data: { id_mesa } })).pipe(map((r) => r.data)).toPromise();
}

export function crearRegla(datos) {
  return from(apiClient.post(`${URL}/reglas/crear`, datos)).pipe(map((r) => r.data)).toPromise();
}

// Rehace las reglas "juntos" de cada grupo (las reglas manuales no se tocan).
export function juntarPorGrupo() {
  return from(apiClient.post(`${URL}/reglas/por_grupo`, {})).pipe(map((r) => r.data)).toPromise();
}

export function eliminarRegla(id_regla) {
  return from(apiClient.delete(`${URL}/reglas/eliminar`, { data: { id_regla } })).pipe(map((r) => r.data)).toPromise();
}

export function asignar(id_invitado, id_mesa) {
  return from(apiClient.post(`${URL}/asignar`, { id_invitado, id_mesa })).pipe(map((r) => r.data)).toPromise();
}

export function limpiar() {
  return from(apiClient.post(`${URL}/limpiar`, {})).pipe(map((r) => r.data)).toPromise();
}

// El optimizador puede estar dormido (plan gratis): la primera llamada tarda hasta ~1 minuto.
export function optimizar(minimizarCambios) {
  return from(apiClient.post(`${URL}/optimizar`, { minimizarCambios }, { timeout: 120000 })).pipe(map((r) => r.data.result)).toPromise();
}

export function aceptar(asignaciones) {
  return from(apiClient.post(`${URL}/aceptar`, { asignaciones })).pipe(map((r) => r.data)).toPromise();
}
