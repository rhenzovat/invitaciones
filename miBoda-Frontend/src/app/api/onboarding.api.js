import { apiClient, apiFormDataClient } from '../contexts/JWTAuthContext';
import axios from 'axios';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const URL_ADMIN  = '/campus/onboarding';
const URL_PUBLIC = '/public/onboarding';

/** Muestra soles enteros (sin decimales). */
export function formatMontoSol(monto) {
  return Math.round(parseFloat(monto) || 0).toLocaleString('es-PE');
}

/** Reparte un monto en N cuotas enteras; mayor monto en la 1.ª (igual que cotización). */
export function dividirCuotas(monto, n) {
  const num = Math.max(1, Math.min(4, parseInt(n, 10) || 1));
  const total = Math.round(parseFloat(monto) || 0);
  if (!total) return Array(num).fill(0);
  const base = Math.floor(total / num);
  const extra = total - base * num;
  return Array.from({ length: num }, (_, i) => base + (i < extra ? 1 : 0));
}

// ─── Admin (autenticado) ──────────────────────────────────────────────────────

export function onboardingListar(params) {
  return from(apiClient.get(`${URL_ADMIN}/listar`, { params })).pipe(
    map(r => r.data.result)
  ).toPromise();
}

export function onboardingCrear(data) {
  return from(apiClient.post(`${URL_ADMIN}/crear`, data)).pipe(
    map(r => r.data.result)
  ).toPromise();
}

export function onboardingActualizar(data) {
  return from(apiClient.put(`${URL_ADMIN}/actualizar`, data)).pipe(
    map(r => r.data.result)
  ).toPromise();
}

export function onboardingEliminar(id) {
  return from(apiClient.delete(`${URL_ADMIN}/eliminar`, { params: { id } })).pipe(
    map(r => r.data)
  ).toPromise();
}

export function onboardingSubirQR(id_onboarding, file) {
  const fd = new FormData();
  fd.append('id_onboarding', id_onboarding);
  fd.append('imagen', file);
  return from(apiFormDataClient.post(`${URL_ADMIN}/qr/subir`, fd)).pipe(
    map(r => r.data.result)
  ).toPromise();
}

export function onboardingSubirPagoImagen(id_onboarding, file, numeroCuota = 1) {
  const fd = new FormData();
  fd.append('id_onboarding', id_onboarding);
  fd.append('imagen', file);
  if (numeroCuota != null) fd.append('numero_cuota', String(numeroCuota));
  return from(apiFormDataClient.post(`${URL_ADMIN}/pago/subir`, fd)).pipe(
    map(r => r.data.result)
  ).toPromise();
}

export function onboardingEliminarPagoImagen({ id_onboarding, filename }) {
  return from(apiClient.delete(`${URL_ADMIN}/pago/eliminar`, {
    params: { id_onboarding, filename },
  })).pipe(
    map(r => r.data.result)
  ).toPromise();
}

// ─── Público (sin autenticación) ──────────────────────────────────────────────

/** Instancia axios sin cabecera JWT — usa el mismo dominio que el resto de la app */
const publicAxios = axios.create({
  baseURL: `${import.meta.env.VITE_AUTHJWT_DOMAIN}/api`,
});

export async function onboardingPublicoObtener(token) {
  const r = await publicAxios.get(`${URL_PUBLIC}/${token}`);
  return r.data;
}

export async function onboardingPublicoGuardar(token, data) {
  const r = await publicAxios.post(`${URL_PUBLIC}/${token}/guardar`, data);
  return r.data;
}

export async function onboardingPublicoSubirPagoImagen(token, file, numeroCuota = 1) {
  const fd = new FormData();
  fd.append('imagen', file);
  if (numeroCuota != null) fd.append('numero_cuota', String(numeroCuota));
  const r = await publicAxios.post(`${URL_PUBLIC}/${token}/pago-imagen`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
}

export async function onboardingPublicoSubirImagen(token, file) {
  const fd = new FormData();
  fd.append('imagen', file);
  const r = await publicAxios.post(`${URL_PUBLIC}/${token}/imagen`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
}

export async function onboardingPublicoEliminarImagen(token) {
  const r = await publicAxios.delete(`${URL_PUBLIC}/${token}/imagen`);
  return r.data;
}

export async function onboardingPublicoEliminarPagoImagen(token, filename) {
  const r = await publicAxios.delete(
    `${URL_PUBLIC}/${token}/pago-imagen/${encodeURIComponent(filename)}`
  );
  return r.data;
}

export async function fetchOnboardingPdf(token, inline = false) {
  const url = `${URL_PUBLIC}/${token}/pdf${inline ? '?inline=1' : ''}`;
  const r = await publicAxios.get(url, {
    responseType: 'blob',
    timeout: 60000,
  });
  if (r.data?.type && r.data.type.includes('application/json')) {
    const text = await r.data.text();
    let message = 'No se pudo generar el PDF.';
    try {
      const json = JSON.parse(text);
      message = json.message || message;
    } catch (_) { /* noop */ }
    throw new Error(message);
  }
  return r.data;
}
