/**
 * Suscripción Web Push para alertas campus (funciona con navegador minimizado).
 */
import { useEffect, useRef, useState } from 'react';
import { notificacionPushVapidPublicKey, notificacionPushSuscribir } from '../api/notificacion.api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function waitForServiceWorker(timeoutMs = 20000) {
  if (!('serviceWorker' in navigator)) return null;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg?.active) return reg;
    try {
      const ready = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]);
      if (ready?.active) return ready;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

async function subscribeWebPush() {
  if (!('PushManager' in window) || !('Notification' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission();

  if (permission !== 'granted') {
    return { ok: false, reason: 'denied' };
  }

  const vapid = await notificacionPushVapidPublicKey();
  if (!vapid?.habilitado || !vapid?.public_key) {
    return { ok: false, reason: 'no-vapid' };
  }

  const registration = await waitForServiceWorker();
  if (!registration) {
    return { ok: false, reason: 'no-sw' };
  }

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid.public_key),
    });
  }

  const json = subscription.toJSON();
  await notificacionPushSuscribir({
    endpoint: json.endpoint,
    keys: json.keys,
  });

  return { ok: true };
}

export default function useCampusWebPush(enabled) {
  const [active, setActive] = useState(false);
  const triesRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const attempt = () => {
      if (cancelled || triesRef.current >= 5) return;
      triesRef.current += 1;

      subscribeWebPush()
        .then((r) => {
          if (cancelled) return;
          if (r.ok) {
            setActive(true);
            return;
          }
          if (r.reason === 'no-sw' || r.reason === 'no-vapid') {
            setTimeout(attempt, 3000);
          }
        })
        .catch(() => {
          if (!cancelled) setTimeout(attempt, 3000);
        });
    };

    attempt();
    return () => { cancelled = true; };
  }, [enabled]);

  return active;
}

export { subscribeWebPush };
