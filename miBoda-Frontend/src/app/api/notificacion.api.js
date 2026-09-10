import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const URL = '/campus/notificacion';

export function notificacionConfigObtener() {
  return from(apiClient.get(`${URL}/config`)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionConfigGuardar(data) {
  return from(apiClient.put(`${URL}/config`, data)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionEstadosListar() {
  return from(apiClient.get(`${URL}/estados`)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionEstadosGuardar(data) {
  return from(apiClient.post(`${URL}/estados`, data)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionEstadosEliminar(id) {
  return from(apiClient.delete(`${URL}/estados/${id}`)).pipe(map((r) => r.data)).toPromise();
}

export function notificacionSemaforosListar() {
  return from(apiClient.get(`${URL}/semaforos`)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionSemaforosGuardar(data) {
  return from(apiClient.post(`${URL}/semaforos`, data)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionSemaforosEliminar(id) {
  return from(apiClient.delete(`${URL}/semaforos/${id}`)).pipe(map((r) => r.data)).toPromise();
}

export function notificacionAlertasPendientes() {
  return from(apiClient.get(`${URL}/alertas/pendientes`)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionAlertaDescartar(id) {
  return from(apiClient.post(`${URL}/alertas/${id}/descartar`)).pipe(map((r) => r.data)).toPromise();
}

export function notificacionEvaluarManual() {
  return from(apiClient.post(`${URL}/evaluar`)).pipe(map((r) => r.data)).toPromise();
}

export function notificacionPushVapidPublicKey() {
  return from(apiClient.get(`${URL}/push/vapid`)).pipe(map((r) => r.data.result)).toPromise();
}

export function notificacionPushSuscribir(subscription) {
  return from(apiClient.post(`${URL}/push/suscribir`, subscription)).pipe(map((r) => r.data)).toPromise();
}

export function notificacionPushDesuscribir(endpoint) {
  return from(apiClient.post(`${URL}/push/desuscribir`, { endpoint })).pipe(map((r) => r.data)).toPromise();
}
