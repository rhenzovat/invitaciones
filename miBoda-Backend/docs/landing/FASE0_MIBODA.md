# FASE 0 — miBoda (temp02)

> Análisis plantilla `public/temp02` (invitación de boda Renzo & Yakelin) vs motor CMS reciclado.
> Fecha: 2026-09-08 · Cliente: miBoda (Renzo & Yakelin) · BD: `bd_miboda`

## Resumen ejecutivo

El clon en `D:\invitacion\miBoda-Backend` **no es un clon limpio**: es el mismo motor que
antes sirvió a **Amour Spa** (y antes a **Royal Sensory Massage**) — ver `FASE0_AMOUR.md`.
Trae migraciones y seeds residuales de spa/masajes (`web_experiencias`, `web_planes`,
`web_pagina_masajes`, `web_masaje_faq`, `AmourPageData`, `base_Amour`, etc.).

**Diferencia clave con Amour/Colegio:** aquellos son sitios institucionales tipo catálogo
(Home / Nosotros / Servicios / Contacto — navegación multipágina). **miBoda es una
invitación de una sola página** (scroll único, sin menú de navegación) más una página
secundaria de galería. El esquema "YS Institucional" (Hero/Slider → Áreas → Quiénes somos
→ Productos → Estadísticas → Equipo → FAQ → Testimonios → Clientes) **no aplica** aquí:
no hay catálogo de productos/servicios, ni "Nosotros", ni "Contacto" institucional.

**Recomendación:** usar como base el prompt genérico `docs/PROMPT_PLANTILLA_HTML_A_CMS.txt`
(v1.0 — analiza y decide Acoplar/Crear por sección, sin vocabulario de catálogo forzado),
no el "PROMPT MAESTRO v5.0 YS Institucional" que trae la exigencia de renombrar todo a
"Productos" — ese concepto no existe en una invitación.

---

## Fase R — Desacople necesario (Amour/Royal → miBoda)

Igual que Amour se desacopló de Royal, aquí hay que desacoplar de Amour:

| Legacy (Amour/Royal, eliminar referencia) | Canónico (miBoda) |
|---|---|
| `AmourPageData` / `RoyalPageData` | `MiBodaPageData` (`App\Support\MiBodaPageData`) |
| `base_Amour` / `pages/amour/*` | `base_miboda` / `pages/miboda/*` |
| Rutas `/nosotros`, `/servicios`, `/contacto` (Amour) | Ruta única `/` + `/galeria` |
| `web_experiencias`, `web_planes`, `web_pagina_masajes`, `web_masaje_faq` | No se reutilizan (dominio distinto); quedan inactivas (`Activo='N'`), no se borran (historial) |
| Labels UI "Amour Spa" / "Royal Sensory Massage" | "Renzo & Yakelin" / "miBoda" |

**No aplica** la mecánica de renombrado 1:1 "capacitaciones→productos" del prompt v5.0,
porque no hay un concepto de catálogo equivalente en una invitación. En su lugar, cada
sección de la invitación es mayormente **Crear** (módulo nuevo), con pocas piezas
**Acopladas** a infraestructura genérica ya existente (SEO, footer, favicon).

---

## Inventario HTML

| Archivo | Ruta Laravel | Blade |
|---|---|---|
| `index.html` | `/` | `pages/miboda/index.blade.php` |
| `galeria.html` | `/galeria` | `pages/miboda/galeria.blade.php` |

Sin navegación multipágina: todo `index.html` es una sola página con scroll y anclas.

---

## Matriz de secciones (index.html + galeria.html)

| # | Sección | Selector temp02 | ¿Existe en motor? | Acción | Tabla propuesta | Admin React |
|---|---------|------------------|--------------------|--------|------------------|-------------|
| 1 | Portada / Sobre animado | `#portada`, `.envelope` | No | **Crear** | `web_portada_sobre` (1 fila: monograma, verso, ref, foto1, foto2, sello) | `/portada/index` |
| 2 | Hero (nombres + fecha) | `.hero` | Parcial (`web_slider`, no calza) | **Crear** | dentro de `web_evento` (maestro, 1 fila) | `/evento/index` |
| 3 | Frase / Versículo (4 apariciones + fotos "momento") | `.section-quote`, `.section-photo` | No | **Crear** | `web_momentos` (repetible: texto_versiculo, referencia, url_imagen, orden) | `/momentos/index` |
| 4 | Familia (padres y padrinos) | `.familia-grid` | No | **Crear** | `web_familia` (repetible: titulo, personas JSON, orden) | `/familia/index` |
| 5 | Cuenta regresiva | `#countdown-section` | No (fecha vive en `web_evento`) | **Crear** | campos en `web_evento` (fecha_boda, countdown_nota) | `/evento/index` |
| 6 | Ubicaciones (ceremonia/recepción) | `#ubicaciones` | No | **Crear** | `web_ubicaciones` (repetible: icono, imagen, tipo, lugar, horario, direccion, maps_url, orden) | `/ubicaciones/index` |
| 7 | Itinerario | `#itinerario` | No | **Crear** | `web_itinerario` (repetible: hora, titulo, imagen, orden) | `/itinerario/index` |
| 8 | Vestimenta | `#vestimenta` | No | **Crear** | `web_vestimenta` (1 fila: tipo, restriccion, colores JSON) | `/vestimenta/index` |
| 9 | Solo adultos | `#solo-adultos` | No | **Crear** (campo simple) | campos en `web_evento` (solo_adultos_activo, solo_adultos_texto) | `/evento/index` |
| 10 | Foto de pareja | `.foto-pareja-frame` | No | **Crear** (campo simple) | campo en `web_evento` (foto_pareja_src) | `/evento/index` |
| 11 | RSVP — configuración | `#rsvp` | No | **Crear** (campos simples) | campos en `web_evento` (rsvp_fecha_limite, rsvp_contacto_nombre, rsvp_contacto_whatsapp) | `/evento/index` |
| 12 | RSVP — respuestas de invitados | modal `#rsvp-modal` | No | **Crear** (bandeja, no editable tipo CMS) | `web_rsvp_respuestas` (nombre, acompanante, asistencia, created_at) | `/rsvp/respuestas` (solo listado) |
| 13 | Mesa de regalos — config | `#regalos` | No | **Crear** (campos simples) | campos en `web_evento` (regalos_sobre_activo, regalos_direccion_fisica) | `/evento/index` |
| 14 | Mesa de regalos — métodos de pago | `.regalo-card` | No | **Crear** | `web_regalos_metodos` (tipo enum transferencia/yape/plin, banco_app, titular, cuenta, cci, numero, orden) | `/regalos/index` |
| 15 | Video de la boda | `#video` | No | **Crear** (campo simple) | campo en `web_evento` (video_src) | `/evento/index` |
| 16 | Galería de fotos (subida de invitados) | `#galeria`, `galeria.html` | No (hoy es Cloudinary+Google Sheets externo) | **Crear** (reemplaza el hack externo) | `web_galeria_fotos` (url_imagen, aprobado S/N, orden, created_at) | `/galeria/index` (moderar: aprobar/eliminar) |
| 17 | Sugerencia de canción | `#cancion` | No (hoy es Google Form externo) | **Crear** (reemplaza el hack externo) | `web_cancion_sugerencias` (nombre_cancion, artista, nombre_invitado, created_at) | `/cancion/sugerencias` (solo listado) |
| 18 | Estacionamiento | (texto suelto) | No | **Crear** (campo simple) | campo en `web_evento` (estacionamiento_texto) | `/evento/index` |
| 19 | Nuestra historia (timeline) | `#historia` | No | **Crear** | `web_historia` (repetible: fecha, titulo, descripcion, icono, imagen, orden) | `/historia/index` |
| 20 | Footer / despedida | `<footer>` | Parcial (`web_footer` es institucional, no calza) | **Crear** (campo simple) | campo en `web_evento` (footer_texto) — reutiliza novio/novia ya definidos | `/evento/index` |
| — | Música de fondo | `#bg-music` | No | **Crear** (campos simples) | campos en `web_evento` (musica_src, musica_volumen) | `/evento/index` |
| — | SEO (título/descripción por página) | `<head>` | **Sí** — `metadatos_paginas` | **Acoplar** | `metadatos_paginas` (claves `web_home`, `web_galeria`) | `/metadatospagina` |
| — | Favicon | `<link rel="icon">` | **Sí** — módulo favicon configurable | **Acoplar** | (el que ya expone el motor) | el existente |

**SKIP** (no aplica / no se reutiliza de Amour): `web_experiencias`, `web_planes`,
`web_pagina_masajes`, `web_masaje_faq`, `web_servicios`, `web_nuestro_equipo`,
`web_testimonios`, `web_preguntas_frecuentes`, `web_carrusel`, `web_header` (sin nav).
Quedan como historial inactivo, no se borran ni se acoplan.

---

## Tabla maestra `web_evento` (1 sola fila — configuración global de la invitación)

Agrupa todos los campos sueltos que hoy viven en `CONFIG` (`js/main.js`) y que no
tienen naturaleza de lista repetible: novio, novia, monograma, fecha_boda,
fecha_boda_texto, hero_subtitulo, countdown_nota_1, countdown_nota_2,
solo_adultos_activo, solo_adultos_texto, foto_pareja_src, rsvp_fecha_limite,
rsvp_contacto_nombre, rsvp_contacto_whatsapp, regalos_sobre_activo,
regalos_direccion_fisica, video_src, estacionamiento_texto, footer_texto,
musica_src, musica_volumen.

Esto es importante para el objetivo de más largo plazo (vender más invitaciones):
si mañana se separa en `web_eventos` (una fila por pareja/cliente) en vez de una
fila fija, el resto del esquema (familia, ubicaciones, itinerario, etc.) solo
necesita agregar una columna `id_evento` para volverse multi-tenant. **No se
implementa ahora** — se deja documentado como ruta de evolución.

---

## Estado — Fase R + Fase A: COMPLETADAS (2026-09-08)

En vez de crear ~12 tablas normalizadas de una vez, para llegar rápido a un
Fase A verificable se optó por una tabla maestra única `web_evento` (columnas
escalares + columnas JSON para las listas repetibles: familia, ubicaciones,
itinerario, historia, vestimenta_colores, regalos_transferencias,
regalos_yape_plin) más 3 tablas "bandeja" para lo que antes iba a Google
Forms/Cloudinary: `web_rsvp_respuestas`, `web_galeria_fotos`,
`web_cancion_sugerencias`. El HTML/CSS/JS de `public/temp02` se mantuvo
intacto: `main.js` sigue usando el mismo objeto `CONFIG` y las mismas
funciones `renderXxx()`, pero ahora `CONFIG` se hidrata desde
`window.__MIBODA_CONFIG__` (inyectado por Blade desde la BD) en vez de estar
hardcodeado — ver `App\Support\MiBodaPageData::buildConfigJson()`.

Archivos creados/editados:
- `database/migrations/2026_09_08_120000_create_web_evento_table.php` (+ seed real)
- `database/migrations/2026_09_08_120001_create_web_rsvp_respuestas_table.php`
- `database/migrations/2026_09_08_120002_create_web_galeria_fotos_table.php`
- `database/migrations/2026_09_08_120003_create_web_cancion_sugerencias_table.php`
- `app/Models/WebEvento.php`, `WebRsvpRespuesta.php`, `WebGaleriaFoto.php`, `WebCancionSugerencia.php`
- `app/Support/MiBodaPageData.php`
- `app/Http/Controllers/Web/MiBodaController.php`
- `resources/views/web/base_miboda.blade.php`
- `resources/views/web/pages/miboda/index.blade.php`
- `resources/views/web/pages/miboda/galeria.blade.php`
- `routes/web.php`: `/` → `MiBodaController@index`, `/galeria` → `MiBodaController@galeria`
  (se quitaron los redirects `/masajes`, `/experiencias`, `/galeria` → `/servicios` de Amour)
- `public/temp02/js/main.js`: `CONFIG` ahora lee `window.__MIBODA_CONFIG__` (con el
  objeto original como respaldo si se abre el archivo de forma estática); se corrigió
  una ruta de imagen hardcodeada (`flor-esquinas - cards.png`) que rompía bajo Laravel
- `public/temp02/js/galeria.js`: ahora usa `window.__MIBODA_GALERIA_FOTOS__` /
  `window.__MIBODA_MUSICA_SRC__` si el backend los inyecta, con fallback a Google Sheets
- Bug de datos corregido: `foto_pareja_src` apuntaba a `pareja.jpeg` (no existe);
  el archivo real es `pareja.jpg` — corregido en el seed y en la fila ya insertada
  (este mismo bug seguía presente en el sitio estático original, no era nuevo)

**Verificado en vivo** (`php artisan serve`, MySQL `bd_miboda`): `/` y `/galeria`
renderizan 100% desde la base de datos — se comparó el texto completo de la página
contra el contenido esperado (familia, ubicaciones, itinerario, vestimenta, RSVP,
los 4 métodos de regalo, los 3 "momento" con sus versículos, historia completa,
footer) y coincide exactamente. Cero errores de JS en consola.

## Estado — Fase B: COMPLETADA (2026-09-08)

**Bandejas (RSVP, Canción, Galería) — reemplazan Google Forms/Cloudinary:**
- `App\Http\Controllers\Api\MiBodaPublicController` (rsvp, cancion, galeriaUpload) —
  rutas públicas en `routes/api.php` (fuera del grupo `auth:api`, con `throttle:10,1`,
  siguiendo el mismo patrón que `web_contacto_mensaje/crear`)
- `App\Http\Controllers\Api\WebRsvpRespuestaController` / `WebCancionSugerenciaController`
  / `WebGaleriaFotoController` — listar/eliminar, protegidos por `auth:api`
- `main.js`/`galeria.js`: ya no dependen de Google Forms ni del widget de Cloudinary;
  postean directo a `/api/miboda/*` y la subida de fotos usa un `<input type="file">`
  nativo con `Storage::disk('public_imagenes')` (carpeta `storage_/galeria_boda/`)
- Frontend: `RsvpRespuestasIndexPage`, `CancionSugerenciasIndexPage`,
  `GaleriaFotosIndexPage` (listar + eliminar, sin editor de creación — son bandejas
  de solo lectura/moderación) + sus `*.api.js`
- **Probado end-to-end con peticiones HTTP reales**: RSVP, sugerencia de canción y
  subida de una foto de prueba, verificados directamente en la base de datos y en
  disco

**Editor grande `web_evento`:**
- `App\Http\Controllers\Api\WebEventoController` (`obtener`/`actualizar`, valida y
  guarda todos los campos escalares + los 7 arreglos JSON de un solo saque)
- `EventoIndexPage.jsx`: un formulario con editores de lista para familia,
  ubicaciones, itinerario, vestimenta (colores), regalos (transferencias y
  yape/plin), momentos (fotos+versículos) e historia, más todos los campos sueltos
  (nombres, fecha, frase, sobre, RSVP, video, estacionamiento, música, footer)
- **Imágenes por ahora son campos de texto** (ruta relativa `assets/img/...`), no
  subida de archivo — se prioric el contenido de texto (lo más editado) sobre el
  upload de imágenes para no extender más esta fase; queda como mejora siguiente
- **Probado end-to-end con petición HTTP real autenticada**: `obtener` trajo los
  datos reales; `actualizar` cambió un campo, se reflejó de inmediato en `/`
  (confirmado leyendo `window.__MIBODA_CONFIG__` en la página pública), y se revirtió

**Sidebar:** se agregaron 4 módulos nuevos (Editar Invitación, RSVP - Confirmaciones,
Sugerencias de Canción, Galería de Fotos), asignados al rol 1.

**Verificación de compilación:** sin poder iniciar sesión real en el panel (no se
tocó la contraseña del administrador), se confirmó que Vite transforma sin errores
los 4 archivos `.jsx` nuevos y los 4 `.api.js`, y que la consola del navegador no
muestra errores al cargar el admin. **Falta un clic-through visual real** por parte
del usuario, con sus propias credenciales.

## Pendiente (siguiente fase, no implementado todavía)

- [ ] Subida de imágenes por archivo (en vez de ruta de texto) en `EventoIndexPage`
- [ ] Acoplar SEO (`metadatos_paginas` claves `web_home`/`web_galeria`)
- [ ] Acoplar favicon al módulo configurable del motor
- [ ] Evaluar si de verdad se necesita multi-tenant (`id_evento` por cliente)
      antes de vender más invitaciones, o si por ahora basta con clonar este
      mismo patrón por cliente (como se hizo históricamente con Amour/Royal)
