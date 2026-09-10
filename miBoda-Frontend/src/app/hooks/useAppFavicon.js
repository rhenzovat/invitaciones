import { useEffect } from 'react';
import { applyAppFavicon, faviconUrlsFromEnv } from 'app/utils/appFavicon';
import { obtenerFavicon } from 'app/api/favicon.api';

/**
 * Carga favicon desde API (producción) o public/ (dev) y fuerza recarga en la pestaña.
 */
export default function useAppFavicon() {
  useEffect(() => {
    let cancelled = false;

    const applyLocal = () => {
      if (!cancelled) applyAppFavicon(faviconUrlsFromEnv());
    };

    obtenerFavicon()
      .then((data) => {
        if (cancelled || !data) {
          applyLocal();
          return;
        }
        applyAppFavicon({
          svg: data.svg,
          ico: data.ico,
          png: data.png,
          version: data.version,
        });
      })
      .catch(applyLocal);

    return () => {
      cancelled = true;
    };
  }, []);
}
