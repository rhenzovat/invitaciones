# PROMPT — Limpieza de rendimiento frontend (genérico)

Copia y pega el bloque de abajo en el agente (modo Agent). Sustituye `«NOMBRE_DEL_PROYECTO»` si quieres.

---

```
Aplica una limpieza de rendimiento en el frontend público de este proyecto Laravel (u otro stack web del repo). El objetivo es acelerar la carga (menos CSS/JS innecesarios, menos render-blocking, lazy-load, caché). NO comprimas ni reemplaces imágenes (eso lo hará el usuario). NO migres a Vite solo para minificar. NO hagas commit/push salvo que lo pidan. NO cambies diseño visual ni rutas.

Detecta el layout principal del sitio público (head + scripts + vistas home/internas) aunque use otro nombre de plantilla (Sparlex, temp01/temp02, Bootslander, custom, etc.). Busca includes de CSS/JS en el <head> y al final del body.

HAZ ESTO:

1) Audita cada <link> y <script> global. Elimina librerías no usadas o casi no usadas (ej. Bootstrap Icons si casi no hay clases bi; animate/WOW si no hay clases wow/animate__; counter-up/waypoints si no hay contadores; lightbox/fancybox/magnific solo en páginas que lo usan).

2) CSS/JS de una sola sección o página: quítalos del layout global y cárgalos solo donde haga falta (@section, @push, @stack o equivalente).

3) Fuentes Google (u otras CDN de fonts): preconnect + carga no bloqueante (preload as="style" + onload que pase a stylesheet, con fallback <noscript>).

4) Scripts JS externos del footer: atributo defer (respetando orden de dependencias, ej. jQuery antes de plugins).

5) Cursores custom o animaciones rAF permanentes: desactívalos en móvil / pointer coarse / prefers-reduced-motion.

6) Imágenes:
   - LCP/hero: fetchpriority="high" + decoding="async" en la primera
   - Resto below-fold: loading="lazy" decoding="async"
   - Logos: width/height razonables si se puede
   - Evita background-image duplicados (hero + fallback que descarguen 2 archivos); usa una sola URL

7) Respuestas HTML públicas: si el controlador fuerza Cache-Control no-store / no-cache / Pragma / Expires=0, cámbialo a algo suave tipo:
   Cache-Control: public, max-age=120, stale-while-revalidate=300
   (no aplicarlo a admin/API autenticada)

8) public/.htaccess (o config equivalente): Expires + Cache-Control ~1 mes para css, js, imágenes, fuentes (woff2, etc.), sin romper las RewriteRule de Laravel.

9) Limpia el JS de “main/init” del tema: quita inits de librerías eliminadas; protege carousels con if (elemento existe); reemplaza iconos de librerías quitadas por las que sí quedan (ej. Font Awesome).

NO HAGAS:
- Comprimir/convertir/reemplazar imágenes pesadas
- Migrar todo a Vite solo por minificar
- Tocar admin/API/auth a menos que rompa el sitio público
- Renombrar rutas o rediseñar UI

Al terminar: lista corta de archivos modificados y checklist de qué probar (home, página con galería/lightbox, menú, carousels, WhatsApp/float si existe).

Proyecto: «NOMBRE_DEL_PROYECTO»
```
