/* =========================================================
   GALERÍA — lee las fotos subidas por los invitados desde el
   backend propio (Cloudinary + base de datos).
   ========================================================= */

async function cargarGaleria() {
  const grid = document.getElementById("galeria-grid");
  const estado = document.getElementById("galeria-estado");

  try {
    const res = await fetch("/api/miboda/galeria-fotos");
    if (!res.ok) throw new Error("Respuesta no exitosa");
    const fotos = await res.json();
    pintarFotos(fotos, grid, estado);
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
