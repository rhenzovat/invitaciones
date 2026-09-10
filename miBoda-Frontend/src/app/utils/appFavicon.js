const FAVICON_VERSION_KEY = 'ig_favicon_version';

/**
 * Actualiza las etiquetas <link rel="icon"> en el documento (evita caché del navegador).
 */
export function applyAppFavicon({ svg, ico, png, version } = {}) {
  if (typeof document === 'undefined') return;

  const v = version || Date.now();
  if (version) {
    try {
      localStorage.setItem(FAVICON_VERSION_KEY, String(v));
    } catch {
      /* ignore */
    }
  }

  const bust = (url) => {
    if (!url) return null;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${v}`;
  };

  const head = document.head;
  [...head.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')].forEach((el) => el.remove());

  const add = (rel, href, type, sizes) => {
    const url = bust(href);
    if (!url) return;
    const link = document.createElement('link');
    link.rel = rel;
    link.href = url;
    if (type) link.type = type;
    if (sizes) link.sizes = sizes;
    head.appendChild(link);
  };

  if (svg) {
    add('icon', svg, 'image/svg+xml');
  }
  if (png) {
    add('icon', png, 'image/png', '96x96');
  }
  if (ico) {
    add('icon', ico, 'image/x-icon');
    add('shortcut icon', ico, 'image/x-icon');
  }
}

export function faviconUrlsFromEnv() {
  const base = import.meta.env.BASE_URL || '/';
  const v = localStorage.getItem(FAVICON_VERSION_KEY) || import.meta.env.VITE_APP_BUILD_ID || '1';
  const q = `?v=${v}`;
  return {
    version: Number(v) || 1,
    svg: `${base}favicon.svg${q}`,
    ico: `${base}favicon.ico${q}`,
    png: `${base}icon/favicon-96x96.png${q}`,
  };
}
