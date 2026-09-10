/* Web Push — maneja alertas campus con navegador minimizado (service worker) */

self.addEventListener('push', (event) => {
  let payload = { title: 'Campus · Recordatorio', body: '', tag: 'campus-alert', url: '/admin/campus/dashboard' };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/admin/icon/favicon.svg',
    badge: payload.icon || '/admin/icon/favicon.svg',
    tag: payload.tag || 'campus-alert',
    data: { url: payload.url || '/admin/campus/dashboard' },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title || 'Campus', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/admin/campus/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (typeof client.navigate === 'function') {
            return client.navigate(targetUrl);
          }
          return undefined;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});
