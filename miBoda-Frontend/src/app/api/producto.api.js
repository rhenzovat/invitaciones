import { apiClient, apiFormDataClient, } from '../contexts/JWTAuthContext';

import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/producto";

export function obtener(params) {
  return from(apiClient.get(`${URL}/obtener`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function verificarCodigo(params) {
  return from(apiClient.get(`${URL}/verificar_codigo`, { params })).pipe(
    map(result => result.data)
  ).toPromise();
}

export function listar() {
  return from(apiClient.get(`${URL}/listar`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function listar_filtro(params) {
  return from(apiClient.get(`${URL}/listar_filtro`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function crear(params) {
  return from(apiFormDataClient.post(`${URL}/crear`, params)).pipe(
    map(result => result.data)
  ).toPromise();
}

export function actualizar(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar`, params)).pipe(
    map(result => result.data)
  ).toPromise();
}

export function eliminar(params) {
  return from(apiClient.delete(`${URL}/eliminar`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar_imagen(params) {
  return from(apiClient.get(`${URL}/listar_imagen`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}


export function crear_imagen(params) {
  return from(apiFormDataClient.post(`${URL}/crear_imagen`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function eliminar_imagen(params) {
  return from(apiClient.delete(`${URL}/eliminar_imagen`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_imagen(params) {
  return from(apiClient.get(`${URL}/obtener_imagen`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar_imagen_orden(params) {
  return from(apiClient.put(`${URL}/actualizar_imagen_orden`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function actualizar_ficha_tecnica(params) {
  return from(apiClient.post(`${URL}/actualizar_ficha_tecnica`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtener_ficha_tecnica(params) {
  return from(apiClient.get(`${URL}/obtener_ficha_tecnica`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function listar_fotos(params) {
  return from(apiClient.get(`${URL}/listar_fotos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function crear_fotos(params) {
  return from(apiFormDataClient.post(`${URL}/crear_fotos`, params)).pipe(
    map(result => result.data)
  ).toPromise();
}
export function eliminar_fotos(params) {
  return from(apiClient.delete(`${URL}/eliminar_fotos`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function actualizar_foto_orden(params) {
  return from(apiClient.put(`${URL}/actualizar_foto_orden`, params)).pipe(
    map(result => result.data.result)
  ).toPromise();
}
export function actualizar_subproducto(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_subproducto`, params)).pipe(
    map(result => result.data)
  ).toPromise();
}

export function actualizar_imagen_principal(params) {
  return from(apiFormDataClient.post(`${URL}/actualizar_imagen_principal`, params)).pipe(
    map(result => result.data)
  ).toPromise();
}

export function crear_imagen_HtmlEditor(params) {
  return from(apiClient.post(`${URL}/crear_imagen_HtmlEditor`, params)).pipe(
    map(result => result.data)
  ).toPromise();
}
// ==========================CARACTERISTICAS DEL PRODUCTO PARA EL ENVIO =================================
export function obtener_dimension_producto() {
  return from(apiClient.get(`${URL}/obtener_dimension_producto`)).pipe(
    map(result => result.data.result)
  ).toPromise();
}

// ========================== IMPORTAR PRODUCTOS DESDE EXCEL =================================
export function importarProductosExcel(formData) {
  return from(apiFormDataClient.post(`${URL}/importar`, formData)).pipe(
    map(result => result.data)
  ).toPromise();
}

export function importarImagenesZip(formData) {
  return from(apiFormDataClient.post(`${URL}/importar-imagenes`, formData)).pipe(
    map(result => result.data)
  ).toPromise();
}

// ========================== LISTAR Y EXPORTAR POR FECHAS =================================
export function listarProductosPorFechas(params) {
  return from(apiClient.get(`${URL}/listar_por_fechas`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function descargarProductosExcel(params) {
  return from(apiClient.get(`${URL}/exportar`, { params })).pipe(
    map(result => result.data)
  ).toPromise();
}