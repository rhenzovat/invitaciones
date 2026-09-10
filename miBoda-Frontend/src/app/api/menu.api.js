import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { getSidebarCache, setSidebarCache } from '../store/sidebarCache';

const URL = '/menu';

/** Módulo o menú asociado a la ruta de la pestaña activa (por rol). */
export function resolverModuloRuta(path, id_roles) {
  return from(apiClient.get(`${URL}/resolver_modulo_ruta`, { params: { path, id_roles } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Desactiva módulo o menú para el rol (oculta sidebar + inactivos en gestión). */
export function desactivarModuloRol(params) {
  return from(apiClient.post(`${URL}/desactivar_modulo_rol`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Rutas Laravel (web + API) para el buscador de URLs en Gestión de menús */
export function listarRutasSistema() {
  return from(apiClient.get(`${URL}/listar_rutas_sistema`)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Listar menús. id_menu_padre: null = solo raíces, número = solo hijos de ese padre, omitir = todos */
export function listar(id_menu_padre, id_roles) {
  const params = {};
  if (id_menu_padre !== undefined) {
    params.id_menu_padre = id_menu_padre === null ? '' : id_menu_padre;
  }
  if (id_roles != null && id_roles !== '') {
    params.id_roles = id_roles;
  }
  return from(apiClient.get(`${URL}/listar`, { params })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Listar todos los módulos (sistema_modulo) */
export function listarModulos(id_roles) {
  const params = {};
  if (id_roles != null && id_roles !== '') {
    params.id_roles = id_roles;
  }
  return from(apiClient.get(`${URL}/listar_modulos`, { params })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Crear nuevo módulo. Devuelve { id_modulo, nombre, Activo, Icon } */
export function crearModulo(params) {
  return from(apiClient.post(`${URL}/crear_modulo`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Convierte menús sin módulo en un módulo real (sistema_modulo). */
export function convertirSinModulo(params) {
  return from(apiClient.post(`${URL}/convertir_sin_modulo`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Actualizar módulo existente */
export function actualizarModulo(params) {
  return from(apiClient.put(`${URL}/actualizar_modulo`, params)).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Reordenar módulos. items: [ { id_modulo, orden } ] */
export function reordenarModulos(items) {
  return from(apiClient.post(`${URL}/reordenar_modulos`, { items })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Lista plana para lienzo de orden del sidebar por rol. */
export function listarOrdenSidebar(id_roles) {
  return from(apiClient.get(`${URL}/listar_orden_sidebar`, { params: { id_roles } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Guarda orden del sidebar para un rol (administración). */
export function reordenarSidebar(id_roles, items) {
  return from(apiClient.post(`${URL}/reordenar_sidebar`, { id_roles, items })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Orden del sidebar del rol de la sesión (validado en backend). */
export function listarMiOrdenSidebar(id_roles) {
  return from(apiClient.get(`${URL}/mi_orden_sidebar`, { params: { id_roles } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Guarda orden del sidebar para el rol de la sesión. */
export function guardarMiOrdenSidebar(id_roles, items) {
  return from(apiClient.post(`${URL}/guardar_mi_orden_sidebar`, { id_roles, items })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Nombre e ícono del sidebar solo para el rol de la sesión (no modifica el menú global). */
export function guardarMiEtiquetaSidebar(id_roles, params) {
  return from(apiClient.post(`${URL}/guardar_mi_etiqueta_sidebar`, { id_roles, ...params })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Nombre e ícono del sidebar por rol (administración). */
export function guardarEtiquetaSidebar(id_roles, params) {
  return from(apiClient.post(`${URL}/guardar_etiqueta_sidebar`, { id_roles, ...params })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/** Eliminar módulo y sus menús */
export function eliminarModulo(id_modulo) {
  return from(apiClient.delete(`${URL}/eliminar_modulo`, { params: { id_modulo } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

/**
 * Lista el árbol del sidebar. Opcional id_roles para enviar al backend.
 * Limpiar caché con clearSidebarCache() al cambiar de perfil.
 * Tras editar menús, usar refreshAppSidebarMenu() para refrescar el sidebar.
 */
export function listarSidebar(id_roles, options = {}) {
  const { force = false } = options;
  const roleKey = id_roles != null ? Number(id_roles) : null;
  if (!force) {
    const cached = getSidebarCache(roleKey);
    if (cached !== null) {
      return Promise.resolve(cached);
    }
  }
  const params = roleKey != null ? { id_roles: roleKey } : {};
  return from(apiClient.get(`${URL}/listar_sidebar`, { params })).pipe(
    map((r) => {
      const result = r.data.result;
      setSidebarCache(result, roleKey);
      return result;
    })
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

/** items: [ { id_menu, id_menu_padre, orden } ] */
export function reordenar(items) {
  return from(apiClient.post(`${URL}/reordenar`, { items })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { params })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function listarObjetosMenu(id_menu) {
  return from(apiClient.get(`${URL}/listar_objetos_menu`, { params: { id_menu } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function asignarObjeto(id_menu, id_objetos) {
  return from(apiClient.post(`${URL}/asignar_objeto`, { id_menu, id_objetos })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function quitarObjeto(id_menu_objetos) {
  return from(apiClient.delete(`${URL}/quitar_objeto`, { params: { id_menu_objetos } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function listarObjetosModulo(id_modulo) {
  return from(apiClient.get(`${URL}/listar_objetos_modulo`, { params: { id_modulo } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function asignarObjetoModulo(id_modulo, id_objetos) {
  return from(apiClient.post(`${URL}/asignar_objeto_modulo`, { id_modulo, id_objetos })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}

export function quitarObjetoModulo(id_modulo_objetos) {
  return from(apiClient.delete(`${URL}/quitar_objeto_modulo`, { params: { id_modulo_objetos } })).pipe(
    map((r) => r.data.result)
  ).toPromise();
}
