import { apiClient } from '../contexts/JWTAuthContext';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export const URL = "/pasarela";

/**
 * Lista todas las pasarelas con sus configuraciones.
 * Los valores secretos vienen enmascarados (••••••••) desde el backend.
 */
export function listar() {
    return from(apiClient.get(`${URL}/listar`))
        .pipe(map(result => result.data.result))
        .toPromise();
}

/**
 * Obtiene la pasarela actualmente activa (código, nombre).
 */
export function obtenerActiva() {
    return from(apiClient.get(`${URL}/activa`))
        .pipe(map(result => result.data.result))
        .toPromise();
}

/**
 * Activa una pasarela y desactiva las demás.
 * @param {{ id_pago_pasarela: number }} params
 */
export function activar(params) {
    return from(apiClient.post(`${URL}/activar`, params))
        .pipe(map(result => result.data))
        .toPromise();
}

/**
 * Actualiza las claves de configuración de una pasarela.
 * @param {{ id_pago_pasarela: number, configs: Array<{clave: string, valor: string}> }} params
 */
export function actualizarConfig(params) {
    return from(apiClient.post(`${URL}/actualizar-config`, params))
        .pipe(map(result => result.data))
        .toPromise();
}

/**
 * Crea un PaymentIntent en Stripe para iniciar el pago.
 * @param {{ amount: number, email: string, codigo_pedido: string }} params
 */
export function stripeCrearPaymentIntent(params) {
    return from(apiClient.post(`${URL}/stripe/payment-intent`, params))
        .pipe(map(result => result.data.result))
        .toPromise();
}

/**
 * Confirma un pago de Stripe ya procesado por Stripe.js en el frontend.
 * @param {{ payment_intent_id: string }} params
 */
export function stripeConfirmarPago(params) {
    return from(apiClient.post(`${URL}/stripe/confirmar`, params))
        .pipe(map(result => result.data.result))
        .toPromise();
}
