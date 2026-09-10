import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/campus";

// ─── Proyectos ────────────────────────────────────────────────────────────────

export function proyectosListar(params) {
  return from(apiClient.get(`${URL}/proyectos/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function proyectoObtener(params) {
  return from(apiClient.get(`${URL}/proyectos/ver`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function proyectosCrear(data) {
  return from(apiClient.post(`${URL}/proyectos/crear`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function proyectosActualizar(data) {
  return from(apiClient.put(`${URL}/proyectos/actualizar`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function proyectosEliminar(params) {
  return from(apiClient.delete(`${URL}/proyectos/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

// ─── Archivos ─────────────────────────────────────────────────────────────────

export function archivosListar(params) {
  return from(apiClient.get(`${URL}/archivos/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function archivosSubir(formData) {
  return from(apiFormDataClient.post(`${URL}/archivos/subir`, formData)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function archivosEliminar(params) {
  return from(apiClient.delete(`${URL}/archivos/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function archivosDescargarUrl(params) {
  return `${URL}/archivos/descargar?id_archivo=${params.id_archivo}`;
}

// ─── Enlaces ──────────────────────────────────────────────────────────────────

export function enlacesListar(params) {
  return from(apiClient.get(`${URL}/enlaces/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function enlacesCrear(data) {
  return from(apiClient.post(`${URL}/enlaces/crear`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function enlacesActualizar(data) {
  return from(apiClient.put(`${URL}/enlaces/actualizar`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function enlacesEliminar(params) {
  return from(apiClient.delete(`${URL}/enlaces/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

// ─── Clientes ─────────────────────────────────────────────────────────────────

export function asignarCliente(data) {
  return from(apiClient.post(`${URL}/clientes/asignar`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function desasignarCliente(params) {
  return from(apiClient.delete(`${URL}/clientes/desasignar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function clientesDelProyecto(params) {
  return from(apiClient.get(`${URL}/clientes/del-proyecto`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function usuariosListar() {
  return from(apiClient.get(`${URL}/usuarios/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function usuariosConProyectos(params) {
  return from(apiClient.get(`${URL}/usuarios/con-proyectos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function clientesConProyectos(params) {
  return usuariosConProyectos(params);
}

export function crmClienteCrear(data) {
  return from(apiClient.post(`${URL}/crm/clientes/crear`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crmClienteActualizar(data) {
  return from(apiClient.put(`${URL}/crm/clientes/actualizar`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crmClienteVincularUsuario(data) {
  return from(apiClient.post(`${URL}/crm/clientes/vincular`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crmClienteEliminar(params) {
  return from(apiClient.delete(`${URL}/crm/clientes/eliminar`, { params })).pipe(
    map(result => result.data)
  ).toPromise();
}

export function crmBuscarClientes(params) {
  return from(apiClient.get(`${URL}/crm/clientes/buscar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function usuariosPendientesActivacion(params) {
  return from(apiClient.get(`${URL}/crm/usuarios/pendientes`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function proyectosDelUsuario(params) {
  return from(apiClient.get(`${URL}/proyectos/del-usuario`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function dashboardStats() {
  return from(apiClient.get(`${URL}/dashboard/stats`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actividadListar(params) {
  return from(apiClient.get(`${URL}/actividad/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

// ─── Notas por cliente ────────────────────────────────────────────────────────

export function clienteNotasListar(params) {
  return from(apiClient.get(`${URL}/crm/clientes/notas/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function clienteNotasCrear(data) {
  return from(apiClient.post(`${URL}/crm/clientes/notas/crear`, data)).pipe(
    map((result) => {
      const d = result.data;
      if (!d?.success) {
        throw new Error(d?.message || 'No se pudo crear la nota');
      }
      return d.result;
    })
  ).toPromise();
}

export function clienteNotasActualizar(data) {
  return from(apiClient.put(`${URL}/crm/clientes/notas/actualizar`, data)).pipe(
    map((result) => {
      const d = result.data;
      if (!d?.success) {
        throw new Error(d?.message || 'No se pudo actualizar la nota');
      }
      return d.result;
    })
  ).toPromise();
}

export function clienteNotasEliminar(params) {
  return from(apiClient.delete(`${URL}/crm/clientes/notas/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

// ─── Editor de código por cliente (admin) ─────────────────────────────────────

export function clienteCodigoListar(params) {
  return from(apiClient.get(`${URL}/crm/clientes/codigo/listar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function clienteCodigoCrear(data) {
  return from(apiClient.post(`${URL}/crm/clientes/codigo/crear`, data)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function clienteCodigoActualizar(data) {
  return from(apiClient.put(`${URL}/crm/clientes/codigo/actualizar`, data)).pipe(
    map((result) => {
      const d = result.data;
      if (!d?.success) {
        throw new Error(d?.message || 'No se pudo guardar el archivo');
      }
      return d.result;
    })
  ).toPromise();
}

export function clienteCodigoEliminar(params) {
  return from(apiClient.delete(`${URL}/crm/clientes/codigo/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
