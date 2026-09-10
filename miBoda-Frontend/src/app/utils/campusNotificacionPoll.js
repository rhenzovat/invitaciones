/** Dispara refresco inmediato del host de notificaciones campus. */
export function triggerCampusNotificacionPoll() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('campus-notificaciones-poll'));
  }
}
