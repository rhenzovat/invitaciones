/* =========================================================
   GALERÍA — lee las fotos subidas desde la Hoja de Google
   conectada al formulario "Galeria Fotos".
   ========================================================= */

// Para activar esta página:
//   1. Abre tu Google Form "Galeria Fotos" → pestaña "Respuestas".
//   2. Haz clic en el ícono verde de Sheets → "Crear hoja de cálculo".
//   3. Abre esa hoja nueva → botón "Compartir" (arriba a la derecha) →
//      cambia el acceso general a "Cualquier persona con el enlace" → "Lector".
//   4. Copia el ID de la hoja: es el texto largo en su URL, entre
//      "/d/" y "/edit", así:
//      https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit
//   5. Pega ese ID abajo en `sheetId`.
const GALERIA = {
  sheetId: "1INvS_TOp7h5jd9YWZtEY6E9FFRptL1IUTgEbGFHYhCE",
  gid: "0" // normalmente no hace falta tocarlo (0 = primera pestaña)
};

async function cargarGaleria() {
  const grid = document.getElementById("galeria-grid");
  const estado = document.getElementById("galeria-estado");

  // Si el backend Laravel ya inyectó las fotos (window.__MIBODA_GALERIA_FOTOS__),
  // las usamos directamente y no consultamos Google Sheets.
  if (Array.isArray(window.__MIBODA_GALERIA_FOTOS__)) {
    pintarFotos(window.__MIBODA_GALERIA_FOTOS__, grid, estado);
    return;
  }

  if (!GALERIA.sheetId) {
    estado.textContent = "Configura GALERIA.sheetId en js/galeria.js para activar esta página.";
    return;
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${GALERIA.sheetId}/gviz/tq?tqx=out:json&gid=${GALERIA.gid}`;
    const res = await fetch(url);
    const texto = await res.text();

    // La respuesta viene envuelta en "google.visualization.Query.setResponse({...})",
    // así que recortamos solo la parte que es JSON válido.
    const json = JSON.parse(texto.substring(texto.indexOf("{"), texto.lastIndexOf("}") + 1));
    const filas = (json.table && json.table.rows) || [];

    // Tomamos cualquier celda que sea un link (así no importa el orden
    // de las columnas de la hoja).
    const urls = filas
      .flatMap(fila => (fila.c || []).map(celda => (celda ? celda.v : "")))
      .filter(valor => typeof valor === "string" && valor.startsWith("http"));

    pintarFotos(urls.slice().reverse(), grid, estado);
  } catch (error) {
    estado.textContent = "No se pudo cargar la galería. Intenta de nuevo más tarde.";
  }
}

function pintarFotos(fotos, grid, estado) {
  if (!fotos || fotos.length === 0) {
    estado.textContent = "Aún no hay fotos. ¡Sé el primero en compartir una desde la invitación!";
    return;
  }

  estado.hidden = true;
  grid.innerHTML = fotos
    .map((foto) => {
      // Compatibilidad: cada foto puede venir como string (URL única, modo
      // demo con Google Sheets) o como {full, thumb} (backend real, con
      // miniatura liviana para no cargar todas las fotos a full resolución).
      const full = typeof foto === "string" ? foto : foto.full;
      const thumb = typeof foto === "string" ? foto : (foto.thumb || foto.full);
      return `
    <a class="galeria-item" href="${full}" target="_blank" rel="noopener">
      <img src="${thumb}" alt="Foto compartida por un invitado" loading="lazy">
    </a>`;
    })
    .join("");
}

/* =========================================================
   MÚSICA — queda en pausa mientras se ve la galería; se retoma justo
   donde iba al volver a la invitación (ver main.js).
   ========================================================= */
function iniciarMusicaGaleria() {
  const audio = document.getElementById("bg-music");
  const btn = document.getElementById("music-toggle");
  audio.src = window.__MIBODA_MUSICA_SRC__ || "assets/audio/musica.mp3";
  audio.volume = 0.4;
  btn.classList.add("paused");
  btn.setAttribute("aria-label", "Reproducir música");

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      btn.classList.remove("paused");
      btn.setAttribute("aria-label", "Pausar música");
    } else {
      audio.pause();
      btn.classList.add("paused");
      btn.setAttribute("aria-label", "Reproducir música");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  cargarGaleria();
  iniciarMusicaGaleria();
});
