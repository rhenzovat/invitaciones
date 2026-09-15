# Prompt para generar la plantilla de invitación de boda ("miBoda-template")

> Este prompt fue redactado a partir del análisis de la estructura y estilos de una invitación digital de referencia (festejabonito.com), **sin copiar su código, textos reales ni assets propietarios**. Usa Google Fonts (libres) y contenido de ejemplo genérico. Pégalo tal cual en una nueva conversación con Claude Code (o cualquier asistente) para que genere el proyecto.

---

## PROMPT (copiar desde aquí)

Quiero que crees una plantilla web de invitación de boda digital, 100% con **HTML + CSS + JavaScript vanilla** (sin frameworks, sin build tools), pensada para ser fácil de personalizar (nombres, fechas, lugares, fotos, música) editando solo unas pocas variables al inicio de los archivos.

### Estructura de archivos
- `index.html`
- `css/styles.css`
- `js/main.js`
- `assets/` (carpeta para imágenes y audio, con placeholders)

### Concepto general y paleta
- Estilo: elegante, romántico, minimalista, con acabado "editorial".
- Paleta de colores (usar como variables CSS `:root`):
  - `--color-crema: #EDE1C7` (texto claro sobre fondo oscuro / fondo principal)
  - `--color-terracota: #C57B57` (acentos, fechas)
  - `--color-dorado: #A16207` (detalles, botones, bordes, iconos)
  - `--color-fondo: #F9FAFB` (fondo general de la página)
  - `--color-texto: #3B3128` (texto oscuro sobre fondo claro)
- Tipografías (Google Fonts, gratuitas):
  - Títulos y nombres de los novios: `"Great Vibes", cursive` (script elegante)
  - Textos, párrafos y etiquetas: `"Lora", serif`
  - Detalles/mayúsculas pequeñas (ej. "NOS CASAMOS"): `Lora` con `letter-spacing: 4px` y `text-transform: uppercase`
- Animaciones suaves con `transition`/`@keyframes`, nada brusco. Uso de `IntersectionObserver` para hacer *fade-in* de cada sección al hacer scroll.
- Totalmente responsive (mobile-first, la mayoría de invitados abrirán desde el celular).

### 1. Pantalla de portada / sobre cerrado (LO MÁS IMPORTANTE)
Esta es la primera pantalla que ve el invitado, **antes** de acceder al contenido:

- Fondo suave (crema/blanco) con decoración discreta (ej. un pequeño ornamento floral o línea decorativa arriba).
- Texto pequeño: "Te invitamos a" / "Nuestra Boda".
- Texto opcional: nombre del invitado y número de pases (ej. "Con amor hemos reservado para ti — 2 pases"), que se pueda personalizar vía una variable JS o parámetro de URL (`?invitado=Nombre&pases=2`).
- Un **sobre de invitación (envelope)** ilustrado en CSS (no depende de una imagen): un rectángulo con una "solapa" triangular superior, un sello/lacre circular en el centro (con las iniciales de los novios, ej. "R & C") y un pequeño detalle floral/línea decorativa cerca del sello.
- Texto debajo: "Toca para abrir la invitación" con un pequeño ícono o animación de "pulso" (`animation: pulse`) para invitar al click.
- **Efecto de apertura al hacer click/tap sobre el sobre**:
  1. El sello se "rompe" (fade-out + pequeño scale).
  2. La solapa superior del sobre gira hacia atrás en 3D (`transform: rotateX(-180deg)` con `transform-origin: top` y `perspective` en el contenedor padre), como si se abriera.
  3. El cuerpo del sobre se desvanece y se desplaza hacia abajo (`opacity: 0` + `translateY`), revelando el contenido.
  4. Toda la pantalla de portada se oculta (`display:none` tras la transición, o se elimina del DOM) y aparece el **Hero principal** con un fade-in.
  5. **En el mismo click** (para cumplir con las políticas de autoplay de los navegadores, que requieren interacción del usuario) se dispara `audio.play()` sobre un elemento `<audio>` oculto con la música de fondo, en loop, a volumen moderado (ej. 0.4).
  6. Debe aparecer un botón flotante circular (esquina inferior derecha, `position: fixed`) con ícono de nota musical/play-pause, que permita silenciar o reanudar la música en cualquier momento (alternando clase `.playing`/`.paused` y el ícono).
- Guardar en `localStorage` si el sobre ya fue abierto en esa sesión, para no repetir la animación si el usuario recarga (opcional, con un pequeño comentario explicando cómo desactivarlo).

### 2. Hero principal (tras abrir el sobre)
- Imagen de fondo a pantalla completa (placeholder) con overlay oscuro semitransparente para que el texto en `--color-crema` resalte.
- "NOS CASAMOS" (pequeño, mayúsculas, `letter-spacing`).
- Nombres de los novios en tipografía script grande, con un `&` decorativo entre medio.
- Fecha de la boda.
- Frase corta de bienvenida.

### 3. Frase / versículo
Sección centrada con una cita corta (bíblica o de otro tipo, configurable) y su referencia.

### 4. Padres y padrinos
Bloques con: Padres del novio, Padres de la novia, Padrinos de boda, Testigos — cada uno como lista simple de nombres, con encabezado en tipografía script.

### 5. Cuenta regresiva ("Faltan...")
Contador en vivo (días / horas / minutos / segundos) hacia la fecha del evento, calculado con JavaScript (`setInterval`, diferencia con `new Date()`), mostrado en 4 tarjetas/columnas.

### 6. Ubicaciones ("¿Dónde Será?")
Tarjetas (una por evento: Ceremonia Religiosa, Ceremonia Civil, Recepción) cada una con:
- Ícono o imagen pequeña.
- Nombre del lugar, día y hora, dirección.
- Botón/link "Ver Mapa" que abra Google Maps en una nueva pestaña (usar variable con la URL).

### 7. Itinerario
Timeline horizontal o vertical con hora + ícono + título por cada momento del día (ceremonia, civil, almuerzo, fiesta, etc.).

### 8. Código de vestimenta
Sección con el tipo de etiqueta (ej. "Formal") y dos columnas (Ellos / Ellas) con un ícono y una breve descripción del atuendo sugerido.

### 9. Aviso "Solo Adultos" (opcional/configurable)
Bloque de texto simple avisando que el evento es solo para adultos.

### 10. Foto de la pareja
Una imagen grande, centrada, con borde/marco decorativo sutil.

### 11. Confirmación de asistencia (RSVP)
- Texto y fecha límite para confirmar.
- Botón "Confirmar Asistencia" que abra un formulario (puede ser un `mailto:`, un link a WhatsApp, o un modal simple con `nombre`, `n° de acompañantes`, `confirma/no confirma` que al enviarse muestre un mensaje de agradecimiento — dejar claro en comentarios cómo conectarlo a un backend real como Google Forms, Formspree, etc.).
- Datos de contacto para dudas (nombre + link de WhatsApp `https://wa.me/<numero>`).

### 12. Mesa de regalos
- Texto introductorio.
- Opciones configurables: sobre en la recepción, link a tienda de regalos externa, datos de transferencia bancaria (cuenta/CCI) con botón "Copiar" (usar `navigator.clipboard.writeText`), datos de Yape/Plin con QR (placeholder de imagen), y dirección para regalos físicos.

### 13. Dónde hospedarse
Tarjetas de hoteles recomendados: nombre, breve descripción, link "Cómo llegar" (Maps) y teléfono (`tel:`).

### 14. Galería de fotos (opcional/placeholder)
Sección con textos "Subir Foto" / "Ver Galería" (pueden quedar como botones deshabilitados o con comentario indicando que requieren backend).

### 15. Sugerir una canción
Formulario simple (Nombre de la canción, Artista, Tu nombre) que al enviarse solo muestre un mensaje de confirmación en pantalla (guardarlo en `localStorage` como demo, o dejar comentado cómo enviarlo a un backend).

### 16. Estacionamiento disponible
Bloque de texto informativo simple.

### 17. Nuestra historia (timeline de la relación)
Lista vertical de hitos (fecha + título + descripción + ícono, ej. corazón, chispas, diamante, iglesia), con línea vertical conectando los puntos y animación de aparición al hacer scroll.

### 18. Despedida / footer
Mensaje de agradecimiento final + nombres de los novios en tipografía script, cierre visual simple.

### Reproductor de música flotante
- Debe estar visible en **todas** las secciones después de abrir el sobre (`position: fixed`, esquina inferior derecha, `z-index` alto).
- Ícono cambia entre "reproduciendo" (ondas o ícono pausa) y "pausado" (ícono play) según el estado.
- Accesible: usar `aria-label="Reproducir música"` / `"Pausar música"` dinámico.

### Requisitos técnicos adicionales
- Todo el contenido personalizable (nombres, fecha, lugares, textos, colores, ruta de la música) debe estar centralizado en un objeto JS `const CONFIG = {...}` al inicio de `main.js`, para editar fácilmente sin tocar el resto del código.
- Sin dependencias externas de pago ni librerías pesadas; si se usa alguna animación compleja, hacerla con CSS puro o JS vanilla.
- Comentarios breves solo donde el comportamiento no sea obvio (ej. por qué el audio se reproduce dentro del handler de click y no antes).
- Accesibilidad básica: contraste adecuado, textos alternativos en imágenes, botones con `aria-label`.
- El archivo de audio debe ir en `assets/audio/musica.mp3` (placeholder) y las imágenes en `assets/img/` con nombres descriptivos (`hero-bg.jpg`, `pareja.jpg`, `evento-iglesia.jpg`, etc.), todas como placeholders a reemplazar por el usuario.

Genera el proyecto completo y funcional con datos de ejemplo (nombres ficticios, fecha futura, direcciones genéricas) para que se pueda previsualizar abriendo `index.html` directamente en el navegador.

---

## Resumen del análisis (para tu referencia)

**Efecto clave a replicar:** pantalla de sobre cerrado → click/tap → animación de apertura (sello se rompe, solapa gira en 3D, sobre se desvanece) → aparece el Hero con fade-in → la música de fondo arranca en el mismo gesto de click (requisito de los navegadores para permitir audio) → botón flotante persistente para controlar la música.

**19 secciones detectadas** (orden real de la página de referencia): Portada/sobre → Hero → Frase/versículo → Padres y padrinos → Cuenta regresiva → Ubicaciones → Itinerario → Código de vestimenta → Solo adultos → Foto de pareja → Confirmar asistencia → Mesa de regalos → Dónde quedarse → Galería de fotos → Sugerir canción → Estacionamiento → Nuestra historia → Despedida → Reproductor de música flotante.

**Estilo visual:** paleta crema/dorado/terracota, tipografía script (Great Vibes) para nombres y encabezados destacados, serif (Lora) para el resto, mucho espacio en blanco, animaciones suaves de aparición al hacer scroll.

> Nota: no se reutilizó código, imágenes, textos reales ni las fuentes propietarias (`Elegante`, `nicken`) del sitio de referencia — solo se documentó su estructura y paleta/tipografías (estas últimas de Google Fonts, de uso libre) para construir una versión propia y original.
