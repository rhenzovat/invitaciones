/* =========================================================
   CONFIG — cuando la página se sirve desde el backend Laravel,
   window.__MIBODA_CONFIG__ ya viene inyectado con los datos reales
   de la base de datos (ver resources/views/web/base_miboda.blade.php).
   El objeto de abajo queda solo como respaldo para cuando se abre
   este archivo de forma estática (sin backend), p.ej. con Live Server.
   ========================================================= */
let CONFIG = {
  novio: "Renzo",
  novia: "Yakelin",

  // Iniciales que se muestran en el sello del sobre (independiente de los nombres de arriba)
  monograma: "R & Y",

  // Fecha y hora del evento en formato ISO (usada por el contador regresivo)
  fechaBodaISO: "2026-11-11T16:00:00",
  fechaBodaTexto: "11 de noviembre de 2026",

  // Invitado y número de pases (se pueden sobreescribir con ?invitado=Nombre&pases=2 en la URL)
  invitadoPorDefecto: "",
  pasesPorDefecto: 2,

  frase: {
    texto: "“El amor es paciente, el amor es bondadoso. No es celoso ni presumido ni arrogante.”",
    referencia: "— 1 Corintios 13:4"
  },

  familia: [
    { titulo: "Padres del novio", personas: ["Sr. Eusebio Calixto Vargas Gómez", "Sra. Salomina Tenorio Gómez"] },
    { titulo: "Padres de la novia", personas: ["Sr. Carlos Ramos", "Sra. Rosa Mendo"] },
    { titulo: "Padrinos de Boda", personas: ["Sr. Luis Ramírez", "Sra. Sofía Castañeda"] },
    { titulo: "Testigos", personas: ["Pedro Salinas", "Laura Ibáñez"] }
  ],

  ubicaciones: [
    {
      icono: "📝",
      imagen: "assets/img/ubicaciones/civil.svg",
      tipo: "Ceremonia Civil",
      lugar: "Registro Civil",
      horario: "Miércoles 11 de noviembre • 4:00 P.M.",
      direccion: "Jr. Los Olivos 456, Lima",
      mapsUrl: "https://maps.google.com"
    },
    {
      icono: "🎉",
      imagen: "assets/img/local/recepcion.jpg",
      tipo: "Recepción",
      lugar: "Jardín Las Palmeras",
      horario: "Miércoles 11 de noviembre • 7:00 P.M.",
      direccion: "Av. Las Flores 789, Lima",
      mapsUrl: "https://maps.app.goo.gl/bH2hWb7G8NKzLMxt6?g_st=awb"
    }
  ],

  itinerario: [
    { hora: "4:00 P.M.", titulo: "Ceremonia Civil", imagen: "assets/img/decor/inglesia.png" },
    { hora: "7:00 P.M.", titulo: "Recepción y Cena", imagen: "assets/img/decor/comida.png" },
    { hora: "9:00 P.M.", titulo: "Fiesta", imagen: "assets/img/decor/fiesta.png" }
  ],

  vestimenta: {
    tipo: "Formal",
    restriccion: "Evita el color blanco, reservado para la novia",
    colores: ["#C57B57", "#EDE1C7", "#A16207", "#E8C79A"]
  },

  soloAdultos: {
    activo: true,
    // una frase sutil para indicar que no se permiten niños en la boda
    texto: "Amamos a los niños, sin embargo, en este dia especial deseamos que sea solo para adultos. Agradecemos tu comprensión y cariño."
  },

  rsvp: {
    fechaLimite: "25 de octubre de 2026",
    contactoNombre: "Ana Maria",
    contactoWhatsapp: "51940318235" // solo números, con código de país
  },

  // Conexión opcional con Google Forms para que las confirmaciones de
  // asistencia lleguen directo a una hoja de cálculo. Para activarla:
  //   1. Crea un Google Form con 3 preguntas: "Nombre completo",
  //      "Nombre de acompañante" y "¿Asistirás?" (con las mismas
  //      opciones "Sí, ahí estaré" / "No podré asistir").
  //   2. En los 3 puntos (⋮) de arriba, elige "Obtener enlace para
  //      completar automáticamente".
  //   3. Completa el formulario de prueba y copia el enlace largo que
  //      te da al final; se ve así:
  //      https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?usp=pp_url&entry.111111=x&entry.222222=y&entry.333333=z
  //   4. Copia el código largo entre "/d/e/" y "/viewform" en `formId`.
  //   5. Copia cada número "entry.NUMERO" en el campo que le corresponda.
  // Si dejas `formId` vacío, el formulario sigue funcionando en modo demo
  // (solo guarda la respuesta en el navegador).
  googleForm: {
    formId: "1FAIpQLSfmaKbRn7An0fCRmvqWK_7OUmaxLGjHyDI9qiD3unsyxX9U5w",
    entryNombre: "entry.109166667",
    entryAcompanante: "entry.1444773697",
    entryAsistencia: "entry.1836758661"
  },

  // Igual que arriba, pero para "Sugiere una Canción". Crea otro Google
  // Form con 3 preguntas: "Nombre de la canción", "Artista" y "Tu nombre",
  // consigue el enlace para completar previamente y copia aquí el formId
  // y cada entry.NUMERO (mismos pasos que en googleForm).
  googleFormCancion: {
    formId: "1FAIpQLSfKmRMTQKs1fPJ3E4j6clT7LS8aK9fNBPnE0bjl9M3kDtR2rQ",
    entryCancion: "entry.881067131",
    entryArtista: "entry.2112199985",
    entryDe: "entry.654336312"
  },

  // Galería de fotos con Cloudinary (permite que los invitados suban sus
  // propias fotos y las vean en una galería embebida, sin backend propio).
  // Para activarla:
  //   1. Crea una cuenta gratis en https://cloudinary.com
  //   2. En el Dashboard copia tu "Cloud name" y pégalo en `cloudName`.
  //   3. Ve a Settings (⚙️) → Upload → "Upload presets" → "Add upload preset".
  //      Ponle Signing Mode = "Unsigned", guárdalo y copia su nombre en
  //      `uploadPreset`.
  // Mientras `cloudName` esté vacío, los botones muestran un aviso en vez
  // de abrir los widgets.
  cloudinary: {
    cloudName: "auo6aayd",
    uploadPreset: "boda_galeria",
    folder: "galeria-boda",
    tag: "galeria-boda"
  },

  // Registro propio de las fotos subidas (Cloudinary no nos deja listarlas
  // directamente, así que guardamos cada link en un Google Form/Sheet).
  googleFormGaleria: {
    formId: "1FAIpQLSdz81062n2VgIR6ARoKSkPPTEiyjCgHxmEleemQ5fS2n96aIg",
    entryUrl: "entry.960913072"
  },

  regalos: {
    sobre: true,
    tienda: { nombre: "Tienda de Regalos", url: "" },
    transferencias: [
      { banco: "BCP", titular: "A nombre: Renzo Vargas Tenorio", cuenta: "193-057-93290006", cci: "00219310579329000610" },
      { banco: "BBVA", titular: "A nombre: Yakelin Ramos Meno", cuenta: "0011-0579-0220464139", cci: "011-579-000220464139-09" }
    ],
    yapePlin: [
      { app: "Yape", nombre: "Renzo Vargas Tenorio", numero: "972601910" },
      { app: "Plin", nombre: "Yakelin Ramos Mendo", numero: "982838430" }
    ],
    direccionFisica: "Portada de manchay III MZ E1 LT 09 - Manchay, Pachacamac, Lima"
  },

  estacionamiento: "Para su comodidad, el lugar del evento contará con estacionamiento disponible para los invitados. Les recomendamos llegar con anticipación.",

  historia: [
    { fecha: "Marzo 2017", titulo: "Nuestro cita en el malecon", descripcion: "Una tarde especial en el malecón. Nos tomaron una foto juntos, nos regalaron un llavero a cada uno... y desde ese día, guardamos ese recuerdo en el corazón (y en nuestras llaves).", icono: "💫", imagen: "assets/img/historia/primera-salida.jpeg" },
    { fecha: "Febrero 2019", titulo: "Locura y complicidad", descripcion: "Cada día a tu lado es una aventura. Disfrutando la vida con la persona que me hace reír sin parar.", icono: "😂", imagen: "assets/img/historia/viaje-costa.jpeg" },
    { fecha: "Diciembre 2021", titulo: "Mis raíces, tu hogar", descripcion: "Te llevé a conocer Vilcahuaman, el pueblo de mi papá. Ver mis raíces a través de tus ojos y compartirte mi historia fue el viaje más especial.", icono: "⛰️", imagen: "assets/img/historia/viaje-ayacucho.jpeg" },
    { fecha: "Enero 2024", titulo: "Cosechando logros", descripcion: "Celebrando tus triunfos y acompañándote en cada meta alcanzada. ¡Qué orgullo sentirme parte de tus logros!", icono: "🎓", imagen: "assets/img/historia/graduacion01.jpeg" },    
    { fecha: "Enero 2024", titulo: "El día del 'Sí'", descripcion: "Entre luces, pétalos y lágrimas de felicidad, me pediste que fuera tu compañera de vida. ¡Ese 'sí' lo cambió todo!", icono: "💍", imagen: "assets/img/historia/pedida-de-mano.jpeg" },
    { fecha: "11 de noviembre de 2026", titulo: "¡Nos Casamos!", descripcion: "Después de tantos sueños y aventuras, el día más esperado de nuestras vidas por fin llegó. ¡Te esperamos para celebrarlo juntos!", icono: "💍", imagen: "assets/img/historia/compromiso.jpeg" }
  ],

  musica: {
    src: "assets/audio/musica.mp3",
    volumen: 0.4
  },

  fotoParejaSrc: "assets/img/pareja.jpg"
};

// Prefijo para assets referenciados directamente en este archivo (no vía
// CONFIG). En el backend Laravel viene inyectado como "/temp02/"; si se abre
// este archivo de forma estática (sin backend) queda vacío.
const ASSET_BASE = "";

// Endpoints propios del backend Laravel (RSVP, canción, galería). Si no vienen
// inyectados (p.ej. abriendo el sitio de forma estática, sin backend), se cae
// de vuelta a Google Forms/Cloudinary como hasta ahora.
const ENDPOINTS = {
  rsvp: "/api/miboda/rsvp",
  cancion: "/api/miboda/cancion",
  galeria: "/api/miboda/galeria-foto",
};

/**
 * Trae la configuracion real desde el backend NestJS y la fusiona sobre el
 * CONFIG de respaldo (que solo se usa si el fetch falla, ej. abriendo este
 * archivo sin servidor). Reemplaza al antiguo window.__MIBODA_CONFIG__ que
 * inyectaba Blade en el servidor.
 */
async function cargarConfigDesdeBackend() {
  try {
    const res = await fetch("/api/miboda/config");
    if (!res.ok) return;
    const data = await res.json();
    if (data && Object.keys(data).length > 0) {
      Object.assign(CONFIG, data);
    }
  } catch {
    // sin backend disponible: se mantiene el CONFIG de respaldo de arriba
  }
}

async function enviarAMiBodaBackend(url, datos) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(datos)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json.message || "No se pudo enviar la información.");
  }
  return json;
}

/* =========================================================
   UTILIDADES
   ========================================================= */
function getURLParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(fecha);
}

/* =========================================================
   RENDERIZADO DE CONTENIDO (a partir de CONFIG)
   ========================================================= */
function renderPortada() {
  const invitado = getURLParam("invitado") || CONFIG.invitadoPorDefecto;
  const pases = getURLParam("pases") || CONFIG.pasesPorDefecto;
  const el = document.getElementById("portada-invitado");
  el.textContent = invitado
    ? `Con amor hemos reservado para ti — ${pases} pase${Number(pases) === 1 ? "" : "s"}`
    : "";

  document.getElementById("envelope-monogram").textContent = CONFIG.monograma;
}

function renderHero() {
  document.getElementById("hero-novio").textContent = CONFIG.novio;
  document.getElementById("hero-novia").textContent = CONFIG.novia;
  document.getElementById("hero-fecha").textContent = CONFIG.fechaBodaTexto;
  document.getElementById("footer-novio").textContent = CONFIG.novio;
  document.getElementById("footer-novia").textContent = CONFIG.novia;
}

function renderFrase() {
  document.getElementById("quote-text").textContent = CONFIG.frase.texto;
  document.getElementById("quote-ref").textContent = CONFIG.frase.referencia;
}

function renderFamilia() {
  const grid = document.getElementById("familia-grid");
  grid.innerHTML = CONFIG.familia.map(grupo => `
    <div>
      <h3>${grupo.titulo}</h3>
      ${grupo.personas.map(p => `<p>${p}</p>`).join("")}
    </div>
  `).join("");
}

function renderUbicaciones() {
  const list = document.getElementById("ubicaciones-list");
  list.innerHTML = CONFIG.ubicaciones.map(u => `
    <div class="card">
      <img class="card-img" loading="lazy" src="${u.imagen}" alt="${u.tipo}">
      <div class="card-body">
        <h3>${u.tipo}</h3>
        <p><strong>${u.lugar}</strong></p>
        <p class="card-horario">${u.horario}</p>
        <p>${u.direccion}</p>
        <a class="btn-link" href="${u.mapsUrl}" target="_blank" rel="noopener">Ver Mapa</a>
        <img class="card-flower card-flower-left" loading="lazy" src="${ASSET_BASE}assets/img/decor/flor-esquinas - cards.png" alt="" aria-hidden="true">
        <img class="card-flower card-flower-right" loading="lazy" src="${ASSET_BASE}assets/img/decor/flor-esquinas - cards.png" alt="" aria-hidden="true">
      </div>
    </div>
  `).join("");
}

function renderItinerario() {
  const list = document.getElementById("itinerario-list");
  list.innerHTML = CONFIG.itinerario.map((i, index) => `
    <div class="itinerario-row ${index % 2 === 0 ? "from-left" : "from-right"}">
      <span class="itinerario-node"><img loading="lazy" src="${i.imagen}" alt=""></span>
      <div class="itinerario-content">
        <div class="itinerario-hora">${i.hora}</div>
        <div class="itinerario-titulo">${i.titulo}</div>
      </div>
    </div>
  `).join("");
  drawItinerarioConnectors();
}

/**
 * Dibuja la línea que conecta los íconos del itinerario usando sus
 * posiciones reales (en mobile quedan en zigzag vía CSS), en vez de una
 * línea recta fija, para que siempre pase por el centro de cada ícono
 * sin importar cuánto ocupe el texto de cada fila.
 */
function drawItinerarioConnectors() {
  const timeline = document.getElementById("itinerario-list");
  if (!timeline) return;

  let svg = timeline.querySelector(".itinerario-connector-svg");
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "itinerario-connector-svg");
    timeline.prepend(svg);
  }

  const nodes = [...timeline.querySelectorAll(".itinerario-node")];
  if (nodes.length < 2) {
    svg.innerHTML = "";
    return;
  }

  const tlRect = timeline.getBoundingClientRect();
  svg.setAttribute("width", tlRect.width);
  svg.setAttribute("height", tlRect.height);
  svg.setAttribute("viewBox", `0 0 ${tlRect.width} ${tlRect.height}`);

  const puntos = nodes.map((n) => {
    const r = n.getBoundingClientRect();
    return { x: r.left + r.width / 2 - tlRect.left, y: r.top + r.height / 2 - tlRect.top };
  });
  const d = puntos.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  svg.innerHTML = `<path d="${d}"></path>`;
}

function renderVestimenta() {
  document.getElementById("vestimenta-tipo").textContent = CONFIG.vestimenta.tipo;
  document.getElementById("vestimenta-restriccion").textContent = CONFIG.vestimenta.restriccion;
  const colores = document.getElementById("vestimenta-colores");
  colores.innerHTML = CONFIG.vestimenta.colores
    .map(c => `<span class="color-swatch" style="background:${c}"></span>`)
    .join("");
}

function renderSoloAdultos() {
  const section = document.getElementById("solo-adultos");
  if (!CONFIG.soloAdultos.activo) return;
  section.hidden = false;
  document.getElementById("solo-adultos-texto").textContent = CONFIG.soloAdultos.texto;
}

function renderRSVP() {
  document.getElementById("rsvp-fecha-limite").textContent = CONFIG.rsvp.fechaLimite;
  document.getElementById("rsvp-contacto-nombre").textContent = CONFIG.rsvp.contactoNombre;
  const mensajeRsvp = encodeURIComponent("Hola, quiero confirmar mi asistencia");
  document.getElementById("rsvp-contacto-whatsapp").href = `https://wa.me/${CONFIG.rsvp.contactoWhatsapp}?text=${mensajeRsvp}`;
}

function renderRegalos() {
  const grid = document.getElementById("regalos-grid");
  const g = CONFIG.regalos;
  const cards = [];

  if (g.sobre) {
    cards.push(`
      <div class="regalo-card">
        <h3>Sobre</h3>
        <p>Habrá una caja de sobres en la recepción para tu obsequio.</p>
      </div>
    `);
  }

  if (g.tienda.url) {
    cards.push(`
      <div class="regalo-card">
        <h3>${g.tienda.nombre}</h3>
        <p>Visita nuestra mesa de regalos online.</p>
        <a class="btn-link" href="${g.tienda.url}" target="_blank" rel="noopener">Ver mesa de regalos</a>
      </div>
    `);
  }

  cards.push(`
    <div class="regalo-card">
      <h3>Transferencia</h3>
      ${g.transferencias.map((t, i) => `
        <div class="regalo-banco${i > 0 ? " regalo-banco-separado" : ""}">
          <p><strong>${t.banco}</strong> — ${t.titular}</p>
          ${t.cuenta ? `
          <div class="regalo-dato"><span>Cuenta: <code>${t.cuenta}</code></span>
            <button class="copy-btn" data-copy="${t.cuenta}">Copiar</button></div>` : ""}
          ${t.cci ? `
          <div class="regalo-dato"><span>CCI: <code>${t.cci}</code></span>
            <button class="copy-btn" data-copy="${t.cci}">Copiar</button></div>` : ""}
        </div>
      `).join("")}
    </div>
  `);

  cards.push(`
    <div class="regalo-card">
      <h3>Yape / Plin</h3>
      ${g.yapePlin.map((y, i) => `
        <div class="regalo-banco${i > 0 ? " regalo-banco-separado" : ""}">
          <p><strong>${y.app}</strong> — ${y.nombre}</p>
          <div class="regalo-dato"><span>Número: <code>${y.numero}</code></span>
            <button class="copy-btn" data-copy="${y.numero}">Copiar</button></div>
        </div>
      `).join("")}
    </div>
  `);

  if (g.direccionFisica) {
    cards.push(`
      <div class="regalo-card">
        <h3>Regalos Físicos</h3>
        <p>Puedes enviar tu regalo a:</p>
        <p><strong>${g.direccionFisica}</strong></p>
      </div>
    `);
  }

  grid.innerHTML = cards.join("");

  grid.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "¡Copiado!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copiar"; btn.classList.remove("copied"); }, 1800);
      } catch (err) {
        alert(`No se pudo copiar automáticamente. Dato: ${btn.dataset.copy}`);
      }
    });
  });
}


function renderEstacionamiento() {
  document.getElementById("estacionamiento-texto").textContent = CONFIG.estacionamiento;
}

function isIconImage(v) {
  return !!v && (/^(https?:)?\/\//.test(v) || v.startsWith("storage_/") || /\.(png|jpe?g|gif|svg|webp)$/i.test(v));
}

function renderHistoria() {
  const list = document.getElementById("historia-list");
  list.innerHTML = CONFIG.historia.map(h => `
    <div class="historia-row">
      <span class="historia-node">${isIconImage(h.icono) ? `<img class="historia-node-img" loading="lazy" src="${h.icono}" alt="">` : h.icono}</span>
      <div class="historia-card">
        <div class="historia-photo-wrap">
          <img class="historia-photo" loading="lazy" src="${h.imagen}" alt="${h.titulo}">
          <span class="historia-badge">${h.fecha}</span>
        </div>
        <div class="historia-body">
          <h3>${h.titulo}</h3>
          <p>${h.descripcion}</p>
        </div>
      </div>
    </div>
  `).join("");
}

function renderFotoPareja() {
  document.getElementById("foto-pareja").src = CONFIG.fotoParejaSrc;
  document.getElementById("foto-pareja").alt = `${CONFIG.novio} y ${CONFIG.novia}`;
}

function renderTodo() {
  renderTextosGenerales();
  renderPortada();
  renderHero();
  renderFrase();
  renderFamilia();
  renderUbicaciones();
  renderItinerario();
  renderVestimenta();
  renderSoloAdultos();
  renderRSVP();
  renderRegalos();
  renderEstacionamiento();
  renderHistoria();
  renderFotoPareja();
  renderCalendario();
}

/**
 * Textos/iconos/fotos que en el sitio Blade original se inyectaban directo
 * en el HTML server-side (no via window.__MIBODA_CONFIG__). Al pasar a un
 * backend NestJS que solo sirve JSON + HTML estatico, se pintan aqui mismo
 * a partir de lo que devuelve /api/miboda/config.
 */
function renderTextosGenerales() {
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value != null) el.textContent = value;
  };
  const setSrc = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.src = value;
  };

  setText("hero-subtitulo", CONFIG.heroSubtitulo);
  if (CONFIG.heroFoto) {
    const hero = document.getElementById("hero");
    if (hero) hero.style.backgroundImage = `url('${CONFIG.heroFoto}')`;
  }

  if (CONFIG.envelopeVerseTexto) {
    const verse = document.getElementById("envelope-verse");
    if (verse) {
      verse.innerHTML = `&ldquo;${CONFIG.envelopeVerseTexto}&rdquo;<br>${CONFIG.envelopeVerseReferencia || ""}`;
    }
  }
  setSrc("envelope-foto1", CONFIG.envelopeFoto1);
  setSrc("envelope-foto2", CONFIG.envelopeFoto2);
  setSrc("envelope-seal", CONFIG.envelopeSelloImg);

  setText("countdown-nota-1", CONFIG.countdownNota1);
  setText("countdown-nota-2", CONFIG.countdownNota2);

  setText("momento1-verso-texto", CONFIG.momento1VersoTexto ? `“${CONFIG.momento1VersoTexto}”` : null);
  setText("momento1-verso-referencia", CONFIG.momento1VersoReferencia ? `— ${CONFIG.momento1VersoReferencia}` : null);
  setText("momento2-verso-texto", CONFIG.momento2VersoTexto ? `“${CONFIG.momento2VersoTexto}”` : null);
  setText("momento2-verso-referencia", CONFIG.momento2VersoReferencia ? `— ${CONFIG.momento2VersoReferencia}` : null);
  setSrc("momento1-foto", CONFIG.momento1Foto);
  setSrc("momento2-foto", CONFIG.momento2Foto);
  setSrc("momento3-foto", CONFIG.momento3Foto);

  setSrc("vestimenta-img-novia", CONFIG.vestimentaImgNovia);
  setSrc("vestimenta-img-novio", CONFIG.vestimentaImgNovio);

  setText("video-texto", CONFIG.videoTexto);
  const videoSrcEl = document.getElementById("video-boda-src");
  if (videoSrcEl && CONFIG.videoSrc) {
    videoSrcEl.src = CONFIG.videoSrc;
    const video = document.getElementById("video-boda");
    if (video) video.load();
  }

  setText("galeria-texto", CONFIG.galeriaTexto);
  setText("galeria-upload", CONFIG.galeriaBotonSubir);
  setText("galeria-ver-link", CONFIG.galeriaBotonVer);
  setText("galeria-note", CONFIG.galeriaNota);

  setText("cancion-texto", CONFIG.cancionTexto);
  setText("cancion-label-nombre", CONFIG.cancionLabelNombre ? `${CONFIG.cancionLabelNombre} *` : null);
  setText("cancion-label-genero", CONFIG.cancionLabelGenero ? `${CONFIG.cancionLabelGenero} *` : null);
  setText("cancion-label-de", CONFIG.cancionLabelDe ? `${CONFIG.cancionLabelDe} *` : null);
  setText("cancion-boton", CONFIG.cancionBoton);
  const generoSelect = document.getElementById("cancion-genero");
  if (generoSelect && Array.isArray(CONFIG.cancionGeneros) && CONFIG.cancionGeneros.length > 0) {
    const placeholder = generoSelect.querySelector("option[disabled]");
    generoSelect.innerHTML = "";
    if (placeholder) generoSelect.appendChild(placeholder);
    CONFIG.cancionGeneros.forEach((genero) => {
      const opt = document.createElement("option");
      opt.value = genero;
      opt.textContent = genero;
      generoSelect.appendChild(opt);
    });
  }

  setText("footer-texto", CONFIG.footerTexto);

  setSrc("icono-countdown", CONFIG.iconoCountdown);
  setSrc("icono-ubicaciones", CONFIG.iconoUbicaciones);
  setSrc("icono-itinerario", CONFIG.iconoItinerario);
  setSrc("icono-vestimenta", CONFIG.iconoVestimenta);
  setSrc("icono-rsvp", CONFIG.iconoRsvp);
  setSrc("icono-regalos", CONFIG.iconoRegalos);
  setSrc("icono-video", CONFIG.iconoVideo);
  setSrc("icono-galeria", CONFIG.iconoGaleria);
  setSrc("icono-galeria-camara", CONFIG.iconoGaleria);
  setSrc("icono-cancion", CONFIG.iconoCancion);
  setSrc("icono-historia", CONFIG.iconoHistoria);
}

function renderCalendario() {
  const contenedor = document.getElementById("mini-calendario");
  if (!contenedor) return;

  const fecha = new Date(CONFIG.fechaBodaISO);
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const diaBoda = fecha.getDate();

  const nombresMes = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const diasSemana = ["D", "L", "M", "M", "J", "V", "S"];

  const primerDiaSemana = new Date(anio, mes, 1).getDay();
  const totalDias = new Date(anio, mes + 1, 0).getDate();

  let celdas = diasSemana.map(d => `<span class="mini-calendario-dow">${d}</span>`).join("");

  for (let i = 0; i < primerDiaSemana; i++) {
    celdas += `<span class="mini-calendario-dia"></span>`;
  }
  for (let dia = 1; dia <= totalDias; dia++) {
    const esBoda = dia === diaBoda ? " es-boda" : "";
    celdas += `<span class="mini-calendario-dia${esBoda}">${dia}</span>`;
  }

  // En Android (y desktop) el link de Google Calendar abre directo la
  // pantalla de "agregar evento", sin descargar ningún archivo. En iPhone
  // no existe ese atajo (el invitado puede no tener Gmail), así que ahí se
  // usa el .ics de toda la vida, pero SIN el atributo "download": así Safari
  // lo abre como una vista previa de evento nativa en vez de descargarlo.
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const enlaceCalendario = esIOS ? generarEnlaceICS() : generarEnlaceGoogleCalendar();
  const atributoDescarga = esIOS ? "" : `target="_blank" rel="noopener"`;

  contenedor.innerHTML = `
    <p class="mini-calendario-mes">${nombresMes[mes]} ${anio}</p>
    <div class="mini-calendario-grid">${celdas}</div>
    <a class="mini-calendario-agregar" href="${enlaceCalendario}" ${atributoDescarga} aria-label="Agregar la boda a tu calendario">
      &#128197; Agrega a tu calendario
    </a>
  `;
}

function generarEnlaceGoogleCalendar() {
  const inicio = new Date(CONFIG.fechaBodaISO);
  const fin = new Date(inicio.getTime() + 6 * 60 * 60 * 1000); // 6 horas de duración por defecto

  const formatoUTC = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const recepcion = CONFIG.ubicaciones.find(u => u.tipo.toLowerCase().includes("recepci"));
  const lugar = recepcion ? `${recepcion.lugar}, ${recepcion.direccion}` : "";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Boda de ${CONFIG.novio} y ${CONFIG.novia}`,
    dates: `${formatoUTC(inicio)}/${formatoUTC(fin)}`,
    details: "¡Te esperamos para celebrar juntos!",
    location: lugar,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generarEnlaceICS() {
  const inicio = new Date(CONFIG.fechaBodaISO);
  const fin = new Date(inicio.getTime() + 6 * 60 * 60 * 1000); // 6 horas de duración por defecto

  const formatoICS = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const recepcion = CONFIG.ubicaciones.find(u => u.tipo.toLowerCase().includes("recepci"));
  const lugar = recepcion ? `${recepcion.lugar}, ${recepcion.direccion}` : "";

  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@nuestraboda`,
    `DTSTAMP:${formatoICS(new Date())}`,
    `DTSTART:${formatoICS(inicio)}`,
    `DTEND:${formatoICS(fin)}`,
    `SUMMARY:Boda de ${CONFIG.novio} y ${CONFIG.novia}`,
    `LOCATION:${lugar}`,
    "DESCRIPTION:¡Te esperamos para celebrar juntos!",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return "data:text/calendar;charset=utf8," + encodeURIComponent(lineas);
}

/* =========================================================
   CONTADOR REGRESIVO
   ========================================================= */
function iniciarContador() {
  const fechaObjetivo = new Date(CONFIG.fechaBodaISO).getTime();

  function actualizar() {
    const ahora = Date.now();
    const diff = Math.max(0, fechaObjetivo - ahora);

    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diff / (1000 * 60)) % 60);
    const segundos = Math.floor((diff / 1000) % 60);

    document.getElementById("cd-dias").textContent = String(dias).padStart(2, "0");
    document.getElementById("cd-horas").textContent = String(horas).padStart(2, "0");
    document.getElementById("cd-min").textContent = String(minutos).padStart(2, "0");
    document.getElementById("cd-seg").textContent = String(segundos).padStart(2, "0");
  }

  actualizar();
  setInterval(actualizar, 1000);
}

/* =========================================================
   PRECARGA + DECODE DE LA FOTO DEL HERO
   Un <link rel="preload"> solo adelanta la DESCARGA; el navegador igual
   puede tardar en DECODIFICAR una foto grande justo en el instante en que
   se revela (cuando se cierra el sobre), causando un parpadeo. Aquí se
   descarga Y se decodifica en segundo plano desde el inicio, aprovechando
   los ~8.5s de animación del sobre, para que al abrirse la imagen ya esté
   lista para pintarse al instante.
   ========================================================= */
function precargarHeroImagen() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const bg = getComputedStyle(hero).backgroundImage;
  const match = bg.match(/url\((["']?)(.*?)\1\)/);
  const url = match && match[2];
  if (!url) return;

  const img = new Image();
  img.src = url;
  if (img.decode) img.decode().catch(() => {});
}

/* =========================================================
   SOBRE (PORTADA) + MÚSICA
   Nota: el audio se reproduce dentro del propio handler de click
   del sobre porque los navegadores bloquean el autoplay de audio
   si no viene de una interacción directa del usuario.
   ========================================================= */
function iniciarSobre() {
  const envelope = document.getElementById("envelope");
  const portada = document.getElementById("portada");
  const app = document.getElementById("app");
  const audio = document.getElementById("bg-music");

  audio.src = CONFIG.musica.src;
  audio.volume = CONFIG.musica.volumen;

  // Solo saltamos el sobre si venimos justo de "Volver a la invitación"
  // desde la galería (esta marca se borra apenas se usa una vez, así
  // que cualquier otra carga o recarga de la página sí muestra el sobre).
  const volverA = sessionStorage.getItem("volverASeccion");
  if (volverA) {
    sessionStorage.removeItem("volverASeccion");

    portada.hidden = true;
    app.hidden = false;
    document.querySelectorAll(".fade-in, .itinerario-row").forEach(el => el.classList.add("visible"));
    drawItinerarioConnectors();

    const tiempoGuardado = sessionStorage.getItem("musicaTiempo");
    if (tiempoGuardado !== null) {
      sessionStorage.removeItem("musicaTiempo");
      audio.addEventListener(
        "loadedmetadata",
        () => { audio.currentTime = parseFloat(tiempoGuardado); },
        { once: true }
      );
    }
    audio.play().catch(() => {});
    actualizarIconoMusica(true);

    const destino = document.getElementById(volverA);
    if (destino) destino.scrollIntoView({ behavior: "instant", block: "start" });
    return;
  }

  envelope.addEventListener("click", () => {
    if (envelope.classList.contains("open")) return; // evita doble clic

    // Paso 1: el texto de arriba se desvanece y la solapa del sobre se abre
    // (el sello desaparece). Aquí mismo se dispara la música, porque los
    // navegadores solo permiten el autoplay de audio dentro de un gesto directo.
    portada.classList.add("opening");
    envelope.classList.add("open");

    audio.play().catch(() => {
      // Si el navegador bloquea la reproducción, el usuario podrá
      // iniciarla manualmente con el botón flotante de música.
    });
    actualizarIconoMusica(true);

    // Paso 2: una vez abierta la solapa, recién ahí asoman las fotos.
    setTimeout(() => {
      envelope.classList.add("peeking");
    }, 700);

    // Paso 3: tras mostrar las fotos unos segundos, aparece la invitación completa.
    setTimeout(() => {
      portada.classList.add("closing");
      setTimeout(() => {
        portada.hidden = true;
        app.hidden = false;
        activarFadeIn();
        drawItinerarioConnectors();
      }, 800);
    }, 700 + 7000);
  });
}

function actualizarIconoMusica(reproduciendo) {
  const btn = document.getElementById("music-toggle");
  btn.classList.toggle("paused", !reproduciendo);
  btn.setAttribute("aria-label", reproduciendo ? "Pausar música" : "Reproducir música");
}

function iniciarBotonMusica() {
  const btn = document.getElementById("music-toggle");
  const audio = document.getElementById("bg-music");

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
      actualizarIconoMusica(true);
    } else {
      audio.pause();
      actualizarIconoMusica(false);
    }
  });
}

/* =========================================================
   VIDEO — pausa la música mientras se reproduce el video y la
   retoma al pausarlo o al terminar.
   ========================================================= */
function iniciarVideo() {
  const video = document.getElementById("video-boda");
  const audio = document.getElementById("bg-music");
  if (!video) return;

  let musicaSonabaAntes = false;

  video.addEventListener("play", () => {
    if (!audio.paused) {
      musicaSonabaAntes = true;
      audio.pause();
      actualizarIconoMusica(false);
    }
  });

  const retomarMusica = () => {
    if (musicaSonabaAntes) {
      musicaSonabaAntes = false;
      audio.play().catch(() => {});
      actualizarIconoMusica(true);
    }
  };

  video.addEventListener("pause", retomarMusica);
  video.addEventListener("ended", retomarMusica);
}

/* =========================================================
   FADE-IN AL HACER SCROLL
   ========================================================= */
function activarFadeIn() {
  const elementos = document.querySelectorAll(".fade-in, .itinerario-row");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elementos.forEach(el => observer.observe(el));
}

/* =========================================================
   RSVP (MODAL)
   ========================================================= */
function iniciarRSVP() {
  const btn = document.getElementById("rsvp-btn");
  const modal = document.getElementById("rsvp-modal");
  const closeBtn = document.getElementById("rsvp-modal-close");
  const form = document.getElementById("rsvp-form");
  const thanks = document.getElementById("rsvp-thanks");
  const errorBox = document.getElementById("rsvp-error");

  const resetModal = () => {
    form.hidden = false;
    form.reset();
    thanks.hidden = true;
    errorBox.hidden = true;
    errorBox.textContent = "";
  };

  const mostrarError = (mensaje) => {
    errorBox.textContent = mensaje;
    errorBox.hidden = false;
  };

  btn.addEventListener("click", () => { resetModal(); modal.hidden = false; });
  closeBtn.addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const nombre = document.getElementById("rsvp-nombre").value.trim();
    const apellidos = document.getElementById("rsvp-apellidos").value.trim();
    const nombreCompleto = `${nombre} ${apellidos}`.trim();
    const acompanante = document.getElementById("rsvp-acompanantes").value;
    const confirma = form.querySelector('input[name="rsvp-confirma"]:checked').value;

    if (ENDPOINTS && ENDPOINTS.rsvp) {
      try {
        await enviarAMiBodaBackend(ENDPOINTS.rsvp, { nombre, apellidos, acompanante, confirma });
      } catch (err) {
        mostrarError(err.message || "No se pudo enviar tu confirmación. Por favor intenta de nuevo.");
        return;
      }
    } else {
      // Respaldo local (solo en modo estático, sin backend propio).
      const respuesta = { nombre: nombreCompleto, acompanante, confirma, fecha: new Date().toISOString() };
      const respuestas = JSON.parse(localStorage.getItem("rsvp-respuestas") || "[]");
      respuestas.push(respuesta);
      localStorage.setItem("rsvp-respuestas", JSON.stringify(respuestas));

      // Si configuraste CONFIG.googleForm, esto envía la respuesta a tu Google Form.
      enviarAGoogleForm(respuesta);
    }

    form.hidden = true;
    thanks.hidden = false;

    // Cierra la ventana emergente sola, tras mostrar el mensaje de gracias unos segundos.
    setTimeout(() => { modal.hidden = true; }, 2200);
  });
}

/* =========================================================
   ENVÍO A GOOGLE FORMS (opcional)
   ========================================================= */
function enviarAGoogleForm(respuesta) {
  const gf = CONFIG.googleForm;
  if (!gf || !gf.formId) return; // no configurado todavía: se omite en silencio

  enviarFormularioAGoogle(gf.formId, {
    [gf.entryNombre]: respuesta.nombre,
    [gf.entryAcompanante]: respuesta.acompanante,
    [gf.entryAsistencia]: respuesta.confirma === "si" ? "Sí, ahí estaré" : "No podré asistir"
  });
}

// Función genérica reutilizable para enviar cualquier formulario oculto a
// Google Forms (RSVP, sugerencia de canción, o cualquier otro que agregues).
function enviarFormularioAGoogle(formId, datos) {
  const iframe = document.createElement("iframe");
  iframe.name = "google-form-hidden-iframe-" + Date.now();
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const formGoogle = document.createElement("form");
  formGoogle.action = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
  formGoogle.method = "POST";
  formGoogle.target = iframe.name;

  Object.entries(datos).forEach(([entry, valor]) => {
    if (!entry) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = entry;
    input.value = valor;
    formGoogle.appendChild(input);
  });

  document.body.appendChild(formGoogle);
  formGoogle.submit();

  setTimeout(() => {
    formGoogle.remove();
    iframe.remove();
  }, 2000);
}

/* =========================================================
   SUGERIR CANCIÓN
   ========================================================= */
function iniciarCancion() {
  const form = document.getElementById("cancion-form");
  const thanks = document.getElementById("cancion-thanks");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const sugerencia = {
      cancion: document.getElementById("cancion-nombre").value,
      genero: document.getElementById("cancion-genero").value,
      de: document.getElementById("cancion-tu-nombre").value
    };

    // Respaldo local (siempre se guarda, además de enviarse al backend).
    const sugerencias = JSON.parse(localStorage.getItem("cancion-sugerencias") || "[]");
    sugerencias.push(sugerencia);
    localStorage.setItem("cancion-sugerencias", JSON.stringify(sugerencias));

    if (ENDPOINTS && ENDPOINTS.cancion) {
      try {
        await enviarAMiBodaBackend(ENDPOINTS.cancion, sugerencia);
      } catch (err) {
        alert("No se pudo enviar tu sugerencia. Por favor intenta de nuevo.");
        return;
      }
    } else {
      // Modo estático (sin backend): si configuraste CONFIG.googleFormCancion,
      // esto envía la sugerencia directamente a tu Google Form.
      enviarCancionAGoogleForm(sugerencia);
    }

    form.reset();
    form.hidden = true;
    thanks.hidden = false;
  });
}

function enviarCancionAGoogleForm(sugerencia) {
  const gf = CONFIG.googleFormCancion;
  if (!gf || !gf.formId) return; // no configurado todavía: se omite en silencio

  enviarFormularioAGoogle(gf.formId, {
    [gf.entryCancion]: sugerencia.cancion,
    [gf.entryArtista]: sugerencia.genero,
    [gf.entryDe]: sugerencia.de
  });
}

/* =========================================================
   GALERÍA DE FOTOS (Cloudinary)
   ========================================================= */
function iniciarGaleria() {
  const btnSubir = document.getElementById("galeria-upload");
  const btnCamara = document.getElementById("galeria-camera");
  const linkVer = document.getElementById("galeria-ver-link");
  const nota = document.getElementById("galeria-note");
  const cfg = CONFIG.cloudinary;

  // Al ir a "Ver Galería" recordamos que debemos volver a esta sección
  // (y no al sobre) cuando el invitado presione "Volver a la invitación".
  if (linkVer) {
    linkVer.addEventListener("click", () => {
      sessionStorage.setItem("volverASeccion", "galeria");

      // Guardamos en qué segundo iba la música para retomarla justo ahí
      // (en vez de reiniciarla) cuando vuelva de la galería.
      const audio = document.getElementById("bg-music");
      if (audio && !audio.paused) {
        sessionStorage.setItem("musicaTiempo", String(audio.currentTime));
      }
    });
  }

  const gracias = document.getElementById("galeria-gracias");

  // Backend propio disponible: subida nativa (reemplaza a Cloudinary).
  if (ENDPOINTS && ENDPOINTS.galeria) {
    const subirArchivos = async (files, btn) => {
      if (!files || files.length === 0) return;

      const formData = new FormData();
      Array.from(files).forEach(file => formData.append("fotos[]", file));

      // Botones de solo ícono (ej. cámara) no deben perder su ícono al
      // subir; solo se deshabilitan/atenúan mientras dura la subida.
      const esSoloIcono = !!btn.querySelector("img");
      const textoOriginal = btn.textContent;
      btn.disabled = true;
      if (!esSoloIcono) btn.textContent = "Subiendo...";

      try {
        const res = await fetch(ENDPOINTS.galeria, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: formData
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || "Error al subir");
        if (gracias) gracias.hidden = false;
      } catch (err) {
        alert("No se pudieron subir tus fotos. Por favor intenta de nuevo.");
      } finally {
        btn.disabled = false;
        if (!esSoloIcono) btn.textContent = textoOriginal;
      }
    };

    // "Subir Foto" -> selector normal (galería del celular o archivos).
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.style.display = "none";
    document.body.appendChild(input);

    btnSubir.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      await subirArchivos(input.files, btnSubir);
      input.value = "";
    });

    // "Tomar Foto" -> capture="environment" abre la cámara directamente
    // en navegadores móviles, en vez del selector de archivos/galería.
    if (btnCamara) {
      const inputCamara = document.createElement("input");
      inputCamara.type = "file";
      inputCamara.accept = "image/*";
      inputCamara.capture = "environment";
      inputCamara.style.display = "none";
      document.body.appendChild(inputCamara);

      btnCamara.addEventListener("click", () => inputCamara.click());
      inputCamara.addEventListener("change", async () => {
        await subirArchivos(inputCamara.files, btnCamara);
        inputCamara.value = "";
      });
    }

    return;
  }

  // Modo estático (sin backend): widget de Cloudinary como hasta ahora.
  // El propio widget ya ofrece "local" y "camera" en un solo botón.
  if (btnCamara) btnCamara.hidden = true;

  if (!cfg || !cfg.cloudName) {
    nota.textContent = "Configura CONFIG.cloudinary en main.js para activar la galería.";
    return;
  }

  btnSubir.addEventListener("click", () => {
    const widget = cloudinary.createUploadWidget(
      {
        cloudName: cfg.cloudName,
        uploadPreset: cfg.uploadPreset,
        folder: cfg.folder,
        tags: [cfg.tag],
        multiple: true,
        sources: ["local", "camera"],
        maxFiles: 10
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          if (gracias) gracias.hidden = false;

          // Guardamos el link de la foto en nuestro propio registro
          // (Google Form/Sheet), ya que Cloudinary no nos deja listar
          // las fotos directamente en el plan gratuito.
          const gf = CONFIG.googleFormGaleria;
          if (gf && gf.formId) {
            enviarFormularioAGoogle(gf.formId, {
              [gf.entryUrl]: result.info.secure_url
            });
          }
        }
      }
    );
    widget.open();
  });
}

/* =========================================================
   MENÚ FLOTANTE DE ACCESOS RÁPIDOS
   ========================================================= */
function iniciarMenuFlotante() {
  const btn = document.getElementById("menu-flotante-btn");
  const panel = document.getElementById("menu-flotante-panel");
  if (!btn || !panel) return;

  const cerrar = () => {
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  };
  const abrir = () => {
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
  };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.hidden) abrir(); else cerrar();
  });

  // Cierra el panel si el invitado toca fuera de él.
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) cerrar();
  });

  // "Confirmar Asistencia" -> abre el mismo modal que el botón de la sección RSVP.
  document.getElementById("menu-ir-rsvp")?.addEventListener("click", () => {
    cerrar();
    document.getElementById("rsvp-btn")?.click();
  });

  // "Sugerir Música" -> lleva directo al formulario de canciones.
  document.getElementById("menu-ir-cancion")?.addEventListener("click", () => {
    cerrar();
    document.getElementById("cancion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // "Subir Foto" -> abre el mismo selector de archivos que "Subir Foto" de la galería.
  document.getElementById("menu-ir-galeria")?.addEventListener("click", () => {
    cerrar();
    document.getElementById("galeria-upload")?.click();
  });
}

/* =========================================================
   SORPRESA FINAL: overlay de corazones + nombres (solo 1ª vez)
   ========================================================= */
function crearParticulasCorazon(container, cantidad = 18) {
  const colores = ["#A16207", "#C57B57", "#EDE1C7"];
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement("span");
    p.className = "corazon-overlay-particle";
    p.textContent = "♥";
    p.style.left = `${Math.random() * 100}%`;
    p.style.fontSize = `${1 + Math.random() * 1.6}rem`;
    p.style.color = colores[Math.floor(Math.random() * colores.length)];
    p.style.animationDuration = `${4 + Math.random() * 3}s`;
    p.style.animationDelay = `${Math.random() * 2.5}s`;
    container.appendChild(p);
  }
}

function iniciarSorpresaFinal() {
  const overlay = document.getElementById("corazon-overlay");
  const footer = document.querySelector(".footer");
  if (!overlay || !footer) return;

  const STORAGE_KEY = "miboda-sorpresa-final-vista";
  if (localStorage.getItem(STORAGE_KEY)) return;

  crearParticulasCorazon(document.getElementById("corazon-overlay-hearts"));
  document.getElementById("corazon-overlay-novio").textContent = CONFIG.novio;
  document.getElementById("corazon-overlay-novia").textContent = CONFIG.novia;

  let dismissTimer;
  const cerrar = () => {
    overlay.classList.remove("show");
    clearTimeout(dismissTimer);
    setTimeout(() => { overlay.hidden = true; }, 500);
  };
  overlay.addEventListener("click", cerrar);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        localStorage.setItem(STORAGE_KEY, "1");
        overlay.hidden = false;
        requestAnimationFrame(() => overlay.classList.add("show"));
        dismissTimer = setTimeout(cerrar, 4500);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  observer.observe(footer);
}

/* =========================================================
   INICIALIZACIÓN
   ========================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  await cargarConfigDesdeBackend();

  renderTodo();
  precargarHeroImagen();
  iniciarContador();
  iniciarSobre();
  iniciarBotonMusica();
  iniciarRSVP();
  iniciarCancion();
  iniciarGaleria();
  iniciarVideo();
  iniciarMenuFlotante();
  iniciarSorpresaFinal();

  window.addEventListener("load", drawItinerarioConnectors);
  let itinerarioResizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(itinerarioResizeTimer);
    itinerarioResizeTimer = setTimeout(drawItinerarioConnectors, 150);
  });
});
