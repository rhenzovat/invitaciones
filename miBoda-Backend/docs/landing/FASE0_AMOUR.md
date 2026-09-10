# FASE 0 — Amour Spa (temp02)

> Análisis plantilla `public/temp02` vs motor CMS Sparlex/Royal Masajes.  
> Fecha: 2026-07-17 · Cliente: Amour Spa Miraflores

## Resumen ejecutivo

La plantilla **temp02** es un tema spa Salonix (clases `.banner-6`, `.project-card`, `.pricing-section`) — **no** usa esquema YS (`.ys-*`). El motor clonado es **Sparlex/Royal Masajes**, no Training/Yachay Sumaq.

**Fase R ejecutada:** desacople Royal → Amour (`AmourPageData`, `AmourController`, `base_Amour`, `pages/amour/`, migración seeds).

---

## Inventario HTML

| Archivo | Ruta Laravel | Blade |
|---------|--------------|-------|
| index.html | `/` | `pages/amour/index.blade.php` |
| about.html | `/nosotros` | `pages/amour/nosotros.blade.php` |
| services.html | `/servicios` | `pages/amour/servicios.blade.php` |
| contact.html | `/contacto` | `pages/amour/contacto.blade.php` |

Redirecciones 301: `/masajes`, `/experiencias`, `/galeria` → `/servicios`.

---

## Matriz secciones HOME (index.html)

| # | Sección | Selector temp02 | En sistema | Acción | Admin | ¿Crear? |
|---|---------|-----------------|------------|--------|-------|---------|
| 0 | Topbar + Navbar | `#topbar`, `.amour-navbar` | `web_header` | Acoplar | `/header/index` | No |
| 1 | Hero video + Swiper | `.banner.banner-6`, `.banner6Swiper` | `web_slider` + `web_slider_config.url_video` | Acoplar | `/slider/index` | Col `url_video` ✓ |
| 2 | Rituales teaser (4) | `.gallery .project-card` | `web_experiencias` | Acoplar | `/experiencias/index` | No |
| 3 | About intro | `.features-6` | `web_about` + `web_about_caracteristica` | Acoplar | `/about/index` | No |
| 4 | Tarifas (12 ítems) | `.pricing-section .item` | `web_planes` | Acoplar | `/planes/index` | No |
| 5 | Testimonios | `.testimonial-6` | `web_testimonios` | Acoplar | `/testimonios/index` | No |
| 6 | Equipo | `.experts-3` | `web_nuestro_equipo` | Acoplar | `/nuestro_equipo/index` | No |
| 7 | FAQ | `.faq-2.home-5` | `web_masaje_faq` | Acoplar | `/masaje_faq/index` | No |
| 8 | Booking | `.booking-section` | `web_contacto_landing` | Cablear | `/contacto_landing/index` | No |
| 9 | Footer | `.footer-two` | `web_footer` | Acoplar | `/footer/index` | No |
| 10 | WhatsApp float | `.whatsapp-float` | `web_whatsapp_config` | Acoplar | `/whatsapp/index` | No |
| — | Blog | `.recent-news` | `web_publicaciones` | **SKIP** | — | No |
| — | Áreas/Categorías | — | — | **SKIP** | — | No |
| — | Contadores anillos | — | — | **SKIP** | — | No |
| — | Clientes/logos | — | — | **SKIP** | — | No |

---

## Páginas internas

| Sección | about.html | services.html | contact.html |
|---------|------------|---------------|--------------|
| Page banner | ✓ | ✓ | ✓ |
| About features-6 | ✓ | — | — |
| CTA subpage | ✓ | — | — |
| Galería 12 cards | — | ✓ | — |
| Tarifas | — | ✓ | — |
| Formulario WA | — | — | ✓ |
| Help cards | — | — | ✓ |
| Mapa Google | — | — | ✓ |

---

## Léxico técnico (canónico Amour)

| UI | Tabla | Admin |
|----|-------|-------|
| Rituales / galería | `web_experiencias` | `/experiencias/index` |
| Tarifas / precios | `web_planes` | `/planes/index` |
| Página /servicios | `web_pagina_masajes` | `/pagina-masajes/index` |

**NO usar:** `web_productos`, capacitaciones, rutas `/masajes` públicas, partials `.ys-*`.

---

## Migraciones seed (Fase R)

| Archivo | Contenido |
|---------|-----------|
| `2026_07_17_120000_seed_amour_desacople.php` | Desactiva Royal, seeds Amour completos |

Datos insertados: header/nav, WhatsApp, 3 slides, 12 rituales, 12 tarifas, about, 2 características, 3 testimonios, 5 terapeutas, 6 FAQ, footer, SEO.

---

## Partials Blade creados

```
resources/views/web/partials/amour/
  head.blade.php, scripts.blade.php, header.blade.php, footer.blade.php
  page_banner.blade.php, whatsapp_float.blade.php, loader.blade.php, custom_cursor.blade.php

resources/views/web/pages/amour/partials/
  01_hero.blade.php
  02_about_intro.blade.php
  03_rituales_teaser.blade.php
  04_tarifas.blade.php
  05_testimonios.blade.php
  06_equipo.blade.php
  07_faq.blade.php
  08_booking.blade.php
```

---

## Pendiente Fase A / B (requiere OK)

- [ ] Afinar canvas admin React con CSS temp02 (experiencias, planes, slider)
- [ ] Renombrar labels UI admin "Royal/Masajes" → "Amour Spa"
- [ ] `web_contacto_landing` seeds + canvas booking
- [ ] `web_pagina_contacto` campos banner contacto
- [ ] Bullets about (4 checks) — migración opcional `web_about.bullets` JSON
- [ ] Stat "100%" about — campos opcionales en `web_about`
- [ ] `pnpm run build:production` admin
- [ ] Verificación E2E Fase C

---

## Comandos post-despliegue

```bash
cd Amour-Backend
php artisan migrate --path=database/migrations/2026_07_17_120000_seed_amour_desacople.php
php artisan view:clear
php artisan route:clear
```

---

## Verificación R.4

```bash
# Blade activo Amour sin Royal/Sparlex
rg -i "royal masajes|sparlex" resources/views/web/pages/amour resources/views/web/partials/amour

# Rutas públicas
php artisan route:list --path=servicios
```

**Esperar OK del cliente antes de continuar Fase A (seeds imagen storage) y Fase B (canvas admin).**
