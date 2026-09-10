import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/balance_ventas";

export function obtenerBalanceMensual(params) {
  return from(apiClient.get(`${URL}/mensual`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerBalanceTrimestral(params) {
  return from(apiClient.get(`${URL}/trimestral`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function obtenerBalanceAnual(params) {
  return from(apiClient.get(`${URL}/anual`, { params })).pipe(
    map(result => result.data.result)
  ).toPromise();
}

export function descargarReporteMensual(params) {
  return from(apiClient.get(`${URL}/descargar_mensual`, { 
    params,
    responseType: 'blob'
  })).pipe(
    map(result => result.data)
  ).toPromise();
}

export function descargarReporteTrimestral(params) {
  return from(apiClient.get(`${URL}/descargar_trimestral`, { 
    params,
    responseType: 'blob'
  })).pipe(
    map(result => result.data)
  ).toPromise();
}

export function descargarReporteAnual(params) {
  return from(apiClient.get(`${URL}/descargar_anual`, { 
    params,
    responseType: 'blob'
  })).pipe(
    map(result => result.data)
  ).toPromise();
}
