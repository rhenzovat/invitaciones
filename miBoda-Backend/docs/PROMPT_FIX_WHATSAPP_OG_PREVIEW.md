# PROMPT — Corregir vista previa WhatsApp / Facebook (Open Graph)

**Versión:** 1.0  
**Proyecto donde se resolvió:** Royal Masajes (`systemWeb-Backend`)  
**Problema resuelto:** Logo incorrecto (favicon de otro proyecto), descripción vacía o solo dominio, comportamiento distinto con `/` vs sin barra.

---

## Cómo usar este documento

Copia el bloque **「PROMPT PARA LA IA」** al final de este archivo y pégalo en el chat del otro proyecto Laravel.  
Sustituye los valores entre `«»` por los del proyecto destino antes de enviar.

---

## Resumen de lo que se resolvió (Royal Masajes)

| Síntoma | Causa real |
|---------|------------|
| Logo de **otro proyecto** (ej. Impacto Gigante) al compartir `dominio.com/` | Caché de WhatsApp + `favicon.ico` viejo en `public/` |
| Sin imagen ni descripción (solo el dominio repetido) | `robots.txt` con `Disallow: /*?*` bloqueaba `og:image?v=...` |
| `og:url` apuntaba a `localhost` | `APP_URL` mal en servidor; helpers dependían solo de `config('app.url')` |
| Vista previa distinta con `/`, sin `/` o con `//` | WhatsApp cachea **cada URL como clave distinta** |
| Panel admin sobrescribía el favicon del sitio | `AppFaviconService` copiaba a `public/` raíz |
| HTML minificado rompía meta OG | Middleware `MinifyHtml` activo en grupo `web` |
| `Cache-Control: no-store` en páginas públicas | Controlador devolvía headers que impiden caché del crawler |

**La imagen OG no está en la base de datos.**  
En BD (`metadatos_paginas` o similar) solo van **título** y **descripción**.  
La imagen se define en código (`Helper`) y archivos en `public/imagenes/`.

---

## Arquitectura de la solución

```
Usuario pega URL en WhatsApp
        ↓
Crawler (facebookexternalhit / WhatsApp)
        ↓
CanonicalHomeRedirect  → colapsa // a URL canónica
        ↓
SocialSharePreview     → HTML mínimo solo con meta OG (si es bot)
        ↓
og:image               → imagen JPEG 1200×630, sin query string
og:url                 → siempre URL canónica sin barra final
favicon.ico            → logo correcto del proyecto (respaldo del crawler)
```

---

## PROMPT PARA LA IA

```
Eres un desarrollador Laravel senior. Debes corregir la vista previa al compartir
el sitio en WhatsApp y Facebook (Open Graph). Aplica TODOS los puntos siguientes
en el proyecto «NOMBRE_PROYECTO» (backend Laravel en «RUTA_BACKEND»).

## CONTEXTO DEL PROBLEMA
- Al compartir «URL_PRODUCCION» en WhatsApp aparece logo incorrecto, sin descripción,
  o comportamiento distinto según se use barra final (/), sin barra, o doble barra (//).
- Referencia: solución probada en Royal Masajes (royalsensorymassage.com).

## DATOS DEL PROYECTO (completar antes de ejecutar)
- Dominio producción: «URL_PRODUCCION» (ej. https://midominio.com)
- Imagen fuente del logo (mandala/marca): «RUTA_LOGO_PNG» (ej. public/temp02/img/inicio/logo-header.png)
- Nombre marca OG: «NOMBRE_MARCA» (ej. Bibliotecas Rodantes)
- Título OG por defecto: «TITULO_OG_DEFAULT»
- Descripción OG por defecto: «DESCRIPCION_OG_DEFAULT»
- Tabla metadatos (si existe): «metadatos_paginas» — campo slug/pagina «home»
- Layout principal Blade: «web.base_sparlex.blade.php» o equivalente

## FASE 1 — DIAGNÓSTICO (obligatorio, sin asumir)
1. Fetch producción con User-Agent `facebookexternalhit/1.1` y verificar:
   - og:title, og:description, og:image, og:url, canonical
   - Que og:url NO sea localhost
   - Que og:image responda 200 sin query string bloqueado por robots.txt
2. Revisar `public/robots.txt` — eliminar reglas amplias tipo `Disallow: /*?*`
3. Revisar `public/favicon.ico` y `public/apple-touch-icon.png` — no deben ser de otro proyecto
4. Revisar `public/admin/icon/` — iconos del panel no deben copiarse a `public/` raíz
5. Buscar `AppFaviconService` o similar — no debe escribir en `public/` del sitio web
6. Buscar middleware `MinifyHtml` en grupo `web` — desactivar si existe
7. Buscar controladores con `Cache-Control: no-store` en páginas públicas — quitar o usar `public, max-age=3600`

## FASE 2 — HELPERS (app/Helpers/Helper.php o equivalente)

### publicBaseUrl()
Si APP_URL es localhost/127.0.0.1, usar el host real de la petición (request()->getHttpHost()).

### cmsAbsoluteUrl($path)
Si asset() devuelve localhost, reconstruir URL con publicBaseUrl().

### canonicalShareUrl() / sharePageUrl()
- Home siempre sin barra final: https://dominio.com (no https://dominio.com/)
- WhatsApp cachea .com y .com/ como URLs distintas; og:url debe ser UNA sola canónica

### Constante OG_IMAGE
- Ruta: imagenes/«slug»-share-og-v3.jpg (nombre único para invalidar caché vieja)
- SIN query string (?v=...) — robots.txt suele bloquear URLs con ?

### siteOgImageUrl()
Devolver URL absoluta HTTPS de la imagen OG. Candidatos en orden: constante, fallbacks locales.

### siteFaviconUrl($file)
URL absoluta de favicon.ico y apple-touch-icon.png en public/.

## FASE 3 — BLADE OG (resources/views/web/partials/og_meta.blade.php)
Incluir en el <head> del layout principal ANTES de CSS pesado:
- og:type, og:site_name, og:title, og:description, og:url
- og:image, og:image:secure_url, og:image:type, og:image:width (1200), og:image:height (630)
- twitter:card summary_large_image, twitter:title, twitter:description, twitter:image
- link rel="image_src"
- Usar html_entity_decode() en título/descripción para evitar &oacute; en OG

## FASE 4 — FAVICON PÚBLICO (resources/views/web/partials/favicon.blade.php)
- favicon.ico → Helpers::siteFaviconUrl('favicon.ico')
- apple-touch-icon.png → Helpers::siteFaviconUrl('apple-touch-icon.png')
- NO apuntar apple-touch-icon a la imagen OG JPG

## FASE 5 — MIDDLEWARE SocialSharePreview
Crear app/Http/Middleware/SocialSharePreview.php:
- Detectar UA: facebookexternalhit, whatsapp, twitterbot, linkedinbot, telegrambot
- Para GET en rutas públicas (no admin/api): devolver vista mínima web.social_preview
- Cache-Control: public, max-age=86400
- Registrar PRIMERO en grupo web de app/Http/Kernel.php (después de CanonicalHomeRedirect)

## FASE 6 — MIDDLEWARE CanonicalHomeRedirect
Crear app/Http/Middleware/CanonicalHomeRedirect.php:
- Si pathInfo contiene // → redirect 301 a URL canónica sin doble barra
- NO redirigir / simple a sin barra (HTTP siempre es GET / — causaría loop)

## FASE 7 — VISTA social_preview.blade.php
HTML mínimo (~2 KB) con solo meta OG + favicon + apple-touch-icon.
Datos desde SocialSharePreviewData::forRequest() que lee metadatos_paginas (home) si existe.

## FASE 8 — AppFaviconService (panel admin)
- targetDirectories(): SOLO public/admin, public/admin/icon, y frontend/public — NUNCA public/ raíz
- Corregir ruta frontend: systemWeb-Frontend (no impacto-gigante-Frontend u otro proyecto)
- urlsForApi(): asset('admin/favicon.ico'), asset('admin/icon/favicon-96x96.png')

## FASE 9 — GENERAR ASSETS (script PHP con GD)
Crear scripts/generate_brand_icons.php que desde «RUTA_LOGO_PNG» genere:
- public/imagenes/«slug»-share-og-v3.jpg (1200×630, <300 KB)
- public/favicon.ico, public/apple-touch-icon.png (mandala/logo correcto)
- public/imagenes/«slug»-favicon-32.png
- public/admin/icon/* (todos los tamaños PWA)
- Ejecutar: php scripts/generate_brand_icons.php

## FASE 10 — robots.txt
Allow: /imagenes/
Allow: /icon/
Allow: /«archivo»-share-og-v3.jpg
Eliminar: Disallow: /*?*
Sitemap: «URL_PRODUCCION»/sitemap.xml (no localhost)

## FASE 11 — .htaccess
Solo reglas para doble barra (no loop en / simple):
RewriteCond %{REQUEST_URI} ^//+$
RewriteRule .* https://%{HTTP_HOST} [R=301,L]

## FASE 12 — CONTROLADOR PÚBLICO
Quitar headers Cache-Control: no-store, no-cache, private de páginas del sitio web.
Usar: Cache-Control: public, max-age=3600

## FASE 13 — DESPLIEGUE Y VERIFICACIÓN
1. Subir archivos PHP, Blade, imagenes, favicon, robots.txt, .htaccess
2. Limpiar caché Laravel (config:clear, view:clear)
3. Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
   - Scrape «URL_PRODUCCION»
   - Scrape «URL_PRODUCCION»/  (con barra — obligatorio, caché distinta)
4. Verificar con curl -A "facebookexternalhit/1.1" que og:image sea la imagen correcta

## RESTRICCIONES
- No usar query string en og:image si robots.txt bloquea ?
- No copiar favicons del admin al public/ raíz
- No depender solo de config('app.url') si puede ser localhost en producción
- Mantener cambios mínimos; no refactorizar módulos no relacionados
- La imagen OG NO se guarda en BD; solo título/descripción en metadatos_paginas

## ENTREGABLES
Lista de archivos creados/modificados + comando de generación de iconos +
instrucciones de scrape en Facebook Debugger para el usuario.
```

---

## Archivos tocados en Royal Masajes (referencia)

| Archivo | Rol |
|---------|-----|
| `app/Helpers/Helper.php` | publicBaseUrl, cmsAbsoluteUrl, canonicalShareUrl, siteOgImageUrl |
| `app/Http/Middleware/SocialSharePreview.php` | HTML mínimo para crawlers |
| `app/Http/Middleware/CanonicalHomeRedirect.php` | Colapsa `//` |
| `app/Support/SocialSharePreviewData.php` | Título/descripción desde metadatos |
| `app/Services/Branding/AppFaviconService.php` | Favicon solo admin |
| `app/Http/Controllers/Web/RoyalMasajesController.php` | Sin no-store |
| `app/Http/Kernel.php` | Middlewares + sin MinifyHtml |
| `resources/views/web/partials/og_meta.blade.php` | Meta OG/Twitter |
| `resources/views/web/partials/favicon.blade.php` | Favicon público |
| `resources/views/web/social_preview.blade.php` | HTML crawler |
| `resources/views/web/base_sparlex.blade.php` | og_meta al inicio del head |
| `public/imagenes/royal-share-og-v3.jpg` | Imagen OG 1200×630 |
| `public/favicon.ico` | Favicon mandala |
| `public/apple-touch-icon.png` | Apple touch |
| `public/robots.txt` | Sin bloqueo de `?` |
| `public/.htaccess` | Redirect `//` |
| `scripts/generate_royal_brand_icons.php` | Genera todos los iconos |

---

## Checklist post-deploy (usuario final)

- [ ] `curl -I https://DOMINIO/imagenes/SLUG-share-og-v3.jpg` → 200 image/jpeg
- [ ] `curl -I https://DOMINIO/favicon.ico` → 200 (tamaño ~4 KB, no 15 KB viejo)
- [ ] Facebook Debugger → Scrape URL con y sin `/`
- [ ] WhatsApp: pegar enlace en chat nuevo y verificar mandala + descripción
- [ ] Confirmar que subir favicon desde admin NO cambia el logo del sitio público

---

## Variante rápida para Rodantes / otros proyectos

Sustituir en el prompt:

```
«URL_PRODUCCION»     → https://bibliotecasrodantes.com (o el dominio real)
«NOMBRE_MARCA»       → Bibliotecas Rodantes
«RUTA_LOGO_PNG»      → public/temp02/assets/image/logos/bibliotecas-rodante-logo-menu.png
«slug»               → rodantes
Layout               → web.base_landing.blade.php
```

Si el otro proyecto no tiene `SocialSharePreview`, implementar las fases 5–7 completas.  
Si ya tiene `og_meta.blade.php`, aplicar fases 1–4, 9–13 como mínimo.

---

*Documento generado a partir de la sesión de corrección WhatsApp OG — Royal Masajes, 2026.*
