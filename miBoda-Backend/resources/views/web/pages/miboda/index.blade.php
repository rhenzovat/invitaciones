@extends('web.base_miboda')

@section('title', $metaData->titulo_pagina ?? 'Nuestra Boda')
@section('meta_description', $metaData->descripcion_pagina ?? '¡Nos casamos! Acompáñanos a celebrar el '.($evento->fecha_boda_texto ?? '').'.')

@php
    $a = fn (string $p) => asset('temp02/'.$p);
@endphp

@section('head_page')
  {{-- Precarga la foto del Hero con prioridad alta: sin esto el navegador
       recién descubre esta imagen de fondo cuando calcula los estilos de la
       sección (tarde), lo que causa un parpadeo negro antes de que cargue. --}}
  <link rel="preload" as="image" href="{{ \App\Support\MiBodaPageData::assetUrl($evento->hero_foto) }}" fetchpriority="high">
@endsection

@section('content')

<!-- ===================== PORTADA / SOBRE ===================== -->
<section id="portada">
  <img class="corner-decor corner-decor-lg top-left" src="{{ $a('assets/img/decor/incio carta/flor-inicio-superior.png') }}" alt="" aria-hidden="true">
  <img class="corner-decor corner-decor-lg bottom-right" src="{{ $a('assets/img/decor/incio carta/flor-inicio-inferior.png') }}" alt="" aria-hidden="true">
  <div class="portada-decor" aria-hidden="true">&#10022;</div>
  <p class="portada-kicker">Te invitamos a</p>
  <h1 class="portada-title">Nuestra Boda</h1>
  <p class="portada-invitado" id="portada-invitado"></p>

  <button type="button" class="envelope" id="envelope" aria-label="Toca para abrir la invitación">
    <div class="envelope-photos" aria-hidden="true">
      <img class="envelope-photo photo-1" src="{{ $envelopeFoto1 }}" alt="">
      <img class="envelope-photo photo-2" src="{{ $envelopeFoto2 }}" alt="">
    </div>
    <span class="envelope-body">
      <span class="envelope-verse">&ldquo;{{ $evento->envelope_verse_texto }}&rdquo;<br>{{ $evento->envelope_verse_referencia }}</span>
      <span class="envelope-monogram" id="envelope-monogram"></span>
    </span>
    <span class="envelope-flap"></span>
    <img class="envelope-seal" id="envelope-seal" src="{{ $envelopeSello }}" alt="">
    <span class="envelope-flower" aria-hidden="true">&#10052;</span>
  </button>

  <p class="portada-hint">Toca para abrir la invitación</p>
</section>

<!-- ===================== CONTENIDO PRINCIPAL ===================== -->
<div id="app" hidden>

  <!-- HERO -->
  <section class="hero" id="hero" style="background-image: url('{{ \App\Support\MiBodaPageData::assetUrl($evento->hero_foto) }}')">
    <div class="hero-overlay"></div>
    <div class="hero-content fade-in">
      <p class="kicker">Nos Casamos...!!!</p>
      <h1 class="hero-names">
        <span id="hero-novio"></span>
        <span class="amp">&amp;</span>
        <span id="hero-novia"></span>
      </h1>
      <p class="hero-date" id="hero-fecha"></p>
      <p class="hero-subtitle">{{ $evento->hero_subtitulo }}</p>
    </div>
  </section>

  <!-- FRASE / VERSÍCULO -->
  <section class="section section-quote fade-in">
    <p class="divider">&#10022;</p>
    <p class="quote-text" id="quote-text"></p>
    <p class="quote-ref" id="quote-ref"></p>
    <p class="divider">&#10022;</p>
  </section>

  <!-- PADRES Y PADRINOS -->
  <section class="section fade-in" id="familia" style="padding-top:10px;">
    <div class="familia-card flores-suaves">
      <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
      <img class="corner-decor top-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
      <h2 class="script-title">Con la bendición de Dios</h2>
      <p class="section-sub">y el amor de nuestras familias</p>
      <div class="familia-grid" id="familia-grid"></div>
    </div>
  </section>

  <!-- CUENTA REGRESIVA -->
  <section class="section section-dark countdown-section fade-in" id="countdown-section">
    <div class="countdown-overlay"></div>
    <div class="countdown-content">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/calendario.png') }}" alt=""></p>
    <h2 class="script-title">Faltan</h2>
    <div class="mini-calendario" id="mini-calendario"></div>
    <div class="countdown" id="countdown">
      <div class="countdown-item"><span class="countdown-number" id="cd-dias">00</span><span class="countdown-label">Días</span></div>
      <div class="countdown-item"><span class="countdown-number" id="cd-horas">00</span><span class="countdown-label">Hrs</span></div>
      <div class="countdown-item"><span class="countdown-number" id="cd-min">00</span><span class="countdown-label">Min</span></div>
      <div class="countdown-item"><span class="countdown-number" id="cd-seg">00</span><span class="countdown-label">Seg</span></div>
    </div>
    <p class="section-sub">para nuestro gran día</p>
    <div class="countdown-nota">
      <p>{{ $evento->countdown_nota_1 }}</p>
      <p>{{ $evento->countdown_nota_2 }}</p>
    </div>
    </div>
  </section>

  <!-- UBICACIONES -->
  <section class="section has-flowers fade-in" id="ubicaciones" style="padding-bottom: 10px;">
    <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor top-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/mapa.png') }}" alt=""></p>
    <h2 class="script-title">¿Dónde Será?</h2>
    <div class="cards-grid" id="ubicaciones-list"></div>
    <p class="closing-phrase">¡Esperamos verte ahí!</p>
  </section>

  <!-- VERSÍCULO -->
  <section class="section section-quote fade-in" style="padding-top: 20px;">
    <p class="divider">&#10022;</p>
    <p class="quote-text">&ldquo;{{ $evento->momento1_verso_texto }}&rdquo;</p>
    <p class="quote-ref">&mdash; {{ $evento->momento1_verso_referencia }}</p>
    <p class="divider">&#10022;</p>
  </section>

  <!-- MOMENTO -->
  <section class="section section-photo fade-in" style="padding-top: 0px; padding-bottom: 0px;">
    <div class="foto-pareja-frame">
      <div class="foto-card">
        <img class="foto-nitida" src="{{ $momento1Foto }}" alt="{{ $evento->novio }} y {{ $evento->novia }}">
      </div>
    </div>
  </section>

  <!-- ITINERARIO -->
  <section class="section fade-in" id="itinerario">
    <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-itinerario-esquina-superior.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor top-right" src="{{ $a('assets/img/decor/flor-itinerario-esquina-superior.png') }}" alt="" aria-hidden="true">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/fecha-limite.png') }}" alt=""></p>
    <h2 class="script-title">Itinerario</h2>
    <p class="divider">&#9670;</p>
    <div class="itinerario-card">
      <div class="itinerario-timeline" id="itinerario-list"></div>
    </div>
    <p class="divider">&#10084;</p>
    <p class="closing-phrase">¡Te esperamos para celebrar juntos!</p>
    <p class="dots">&#10022; &bull; &#10022;</p>
  </section>

  <!-- CÓDIGO DE VESTIMENTA -->
  <section class="section has-flowers fade-in" id="vestimenta">
    <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor bottom-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/camisa.png') }}" alt=""></p>
    <h2 class="script-title">Código de Vestimenta</h2>
    <div class="vestimenta-illustration">
      <img src="{{ \App\Support\MiBodaPageData::assetUrl($evento->vestimenta_img_novia) }}" alt="Vestido de la novia" class="vestimenta-img">
      <img src="{{ \App\Support\MiBodaPageData::assetUrl($evento->vestimenta_img_novio) }}" alt="Traje del novio" class="vestimenta-img">
    </div>
    <p class="vestimenta-label">Vestimenta</p>
    <p class="vestimenta-tipo" id="vestimenta-tipo"></p>
    <p class="vestimenta-restriccion" id="vestimenta-restriccion"></p>
    <p class="vestimenta-colores-titulo">Se recomienda usar estos colores en la boda</p>
    <div class="vestimenta-colores" id="vestimenta-colores"></div>
    <p class="divider">&#10084;</p>
    <p class="closing-phrase">Tu elegancia hará brillar aún más esta celebración</p>
    <p class="dots">&#10022; &bull; &#10022;</p>
  </section>

  <!-- SOLO ADULTOS -->
  <section class="section section-note fade-in" id="solo-adultos" hidden>
    <h2>Solo Adultos</h2>
    <p id="solo-adultos-texto"></p>
  </section>

  <!-- FOTO DE LA PAREJA -->
  <section class="section section-photo fade-in" style="padding-top: 10px; padding-bottom: 10px;">
    <div class="foto-pareja-frame">
      <div class="foto-card">
        <img class="foto-nitida" id="foto-pareja" src="" alt="Foto de los novios">
      </div>
    </div>
  </section>

  <!-- CONFIRMAR ASISTENCIA -->
  <section class="section section-terracota has-flowers fade-in" id="rsvp">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/papiro.png') }}" alt=""></p>
    <h2 class="script-title">Confirma tu Asistencia</h2>
    <p class="rsvp-limite">Por favor, confirma tu asistencia antes del <strong id="rsvp-fecha-limite"></strong></p>
    <button type="button" class="btn-primary" id="rsvp-btn">Confirmar Asistencia</button>
    <p class="rsvp-contacto">Cualquier consulta o duda con<br>
      <strong id="rsvp-contacto-nombre"></strong> &middot;
      <a id="rsvp-contacto-whatsapp" href="#" target="_blank" rel="noopener">WhatsApp</a>
    </p>
  </section>

  <!-- MESA DE REGALOS -->
  <section class="section has-flowers fade-in" id="regalos" style="padding-bottom: 40px;">
    <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor top-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/caja-de-regalo.png') }}" alt=""></p>
    <h2 class="script-title">Mesa de Regalos</h2>
    <p class="section-sub">Nuestro mayor regalo es tu presencia, pero si deseas tener un detalle con nosotros, les dejamos estas opciones:</p>
    <div class="regalos-grid" id="regalos-grid"></div>
    <p class="divider">&#10084;</p>
    <p class="closing-phrase">¡Gracias por tu generosidad!</p>
    <p class="dots">&#10022; &bull; &#10022;</p>
  </section>

  <!-- MOMENTO -->
  <section class="section section-photo fade-in" style="padding-top: 10px; padding-bottom: 10px;">
    <div class="foto-pareja-frame">
      <div class="foto-card">
        <img class="foto-nitida" src="{{ $momento2Foto }}" alt="{{ $evento->novio }} y {{ $evento->novia }}">
      </div>
    </div>
  </section>

  <!-- VERSÍCULO -->
  <section class="section section-quote fade-in">
    <p class="divider">&#10022;</p>
    <p class="quote-text">&ldquo;{{ $evento->momento2_verso_texto }}&rdquo;</p>
    <p class="quote-ref">&mdash; {{ $evento->momento2_verso_referencia }}</p>
    <p class="divider">&#10022;</p>
  </section>

  <!-- VIDEO -->
  <section class="section has-flowers fade-in" id="video">
    <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor bottom-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/silla-de-director.png') }}" alt=""></p>
    <h2 class="script-title">Nuestro Video</h2>
    <p class="section-sub">{{ $evento->video_texto }}</p>
    <div class="video-frame">
      <video id="video-boda" controls playsinline preload="metadata">
        <source src="{{ $videoSrc }}" type="video/mp4">
        Tu navegador no soporta la reproducción de este video.
      </video>
    </div>
  </section>

  <!-- GALERÍA -->
  <section class="section has-flowers fade-in" id="galeria">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/camara-reflex-digital.png') }}" alt=""></p>
    <div class="galeria-title-row">
      <h2 class="script-title">Galería de Fotos</h2>
      <button type="button" class="btn-icon-camera btn-icon-camera-float" id="galeria-camera" aria-label="Tomar foto">
        <img src="{{ $a('assets/img/decor/icon-invitacion/camara-reflex-digital.png') }}" alt="">
      </button>
    </div>
    <p class="section-sub">{{ $evento->galeria_texto }}</p>
    <div class="galeria-actions">
      <button type="button" class="btn-secondary" id="galeria-upload">{{ $evento->galeria_boton_subir }}</button>
      <a class="btn-secondary" id="galeria-ver-link" href="{{ route('galeria') }}">{{ $evento->galeria_boton_ver }}</a>
    </div>
    <p class="galeria-note" id="galeria-note">{{ $evento->galeria_nota }}</p>
    <p class="closing-phrase" id="galeria-gracias" hidden>¡Gracias por compartir con nosotros! &#10084;</p>
  </section>

  <!-- SUGIERE UNA CANCIÓN -->
  <section class="section has-flowers fade-in" id="cancion">
    <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor top-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/guitarra.png') }}" alt=""></p>
    <h2 class="script-title">Sugiere una Canción</h2>
    <p class="section-sub">{{ $evento->cancion_texto }}</p>
    <form id="cancion-form" class="cancion-form">
      <label for="cancion-nombre">{{ $evento->cancion_label_nombre }} *</label>
      <input type="text" id="cancion-nombre" placeholder="Ej: Perfect" required>

      <label for="cancion-genero">{{ $evento->cancion_label_genero }} *</label>
      <select id="cancion-genero" required>
        <option value="" disabled selected>Selecciona un género</option>
        @foreach ($evento->cancion_generos ?? [] as $genero)
          <option value="{{ $genero }}">{{ $genero }}</option>
        @endforeach
      </select>

      <label for="cancion-tu-nombre">{{ $evento->cancion_label_de }} *</label>
      <input type="text" id="cancion-tu-nombre" placeholder="Tu nombre" required>

      <button type="submit" class="btn-primary">{{ $evento->cancion_boton }}</button>
    </form>
    <p class="cancion-thanks" id="cancion-thanks" hidden>¡Gracias por tu sugerencia!</p>
  </section>

  <!-- ESTACIONAMIENTO -->
  <section class="section section-note fade-in">
    <h2>Estacionamiento disponible</h2>
    <p id="estacionamiento-texto"></p>
  </section>

  <!-- NUESTRA HISTORIA -->
  <section class="section has-flowers fade-in" id="historia">
    <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor bottom-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <p class="divider"><img class="divider-icon" src="{{ $a('assets/img/decor/icon-invitacion/amor.png') }}" alt=""></p>
    <h2 class="script-title">Nuestra Historia</h2>
    <p class="section-sub">Los momentos más especiales que nos trajeron hasta aquí</p>
    <div class="historia-timeline" id="historia-list"></div>
    <p class="historia-final">&#10024; Y la historia continúa... &#10024;</p>
  </section>

  <!-- MOMENTO -->
  <section class="section section-photo fade-in" style="padding-top: 5px; padding-bottom: 0px;">
    <div class="foto-pareja-frame">
      <div class="foto-card">
        <img class="foto-nitida" src="{{ $momento3Foto }}" alt="{{ $evento->novio }} y {{ $evento->novia }}">
      </div>
    </div>
  </section>

  <!-- DESPEDIDA -->
  <footer class="footer has-flowers fade-in" style="padding-top: 30px;">
    <img class="corner-decor bottom-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <img class="corner-decor bottom-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
    <h2>{{ $evento->footer_texto }}</h2>
    <p class="footer-names"><span id="footer-novio"></span> &amp; <span id="footer-novia"></span></p>
  </footer>

  <!-- SORPRESA FINAL: corazones + nombres (solo la primera vez que se llega al final) -->
  <div class="corazon-overlay" id="corazon-overlay" hidden aria-hidden="true">
    <div class="corazon-overlay-hearts" id="corazon-overlay-hearts"></div>
    <div class="corazon-overlay-content">
      <div class="corazon-overlay-heart-badge">
        <img src="{{ $a('assets/img/decor/icon-invitacion/amor.png') }}" alt="">
      </div>
      <p class="corazon-overlay-names"><span id="corazon-overlay-novio"></span> &amp; <span id="corazon-overlay-novia"></span></p>
    </div>
  </div>

  <!-- REPRODUCTOR DE MÚSICA FLOTANTE -->
  <button type="button" class="music-toggle" id="music-toggle" aria-label="Pausar música">
    <span class="music-icon" id="music-icon">&#9835;</span>
  </button>

  <!-- MENÚ FLOTANTE DE ACCESOS RÁPIDOS -->
  <div class="menu-flotante">
    <button type="button" class="menu-flotante-btn" id="menu-flotante-btn" aria-label="Abrir menú de accesos rápidos" aria-expanded="false">
      <span class="menu-flotante-icon">&#9776;</span>
    </button>
    <div class="menu-flotante-panel" id="menu-flotante-panel" hidden>
      <button type="button" class="menu-flotante-item" id="menu-ir-rsvp">
        <img class="menu-flotante-item-icon" src="{{ $a('assets/img/decor/icon-invitacion/papiro.png') }}" alt=""> Confirmar Asistencia
      </button>
      <button type="button" class="menu-flotante-item" id="menu-ir-cancion">
        <img class="menu-flotante-item-icon" src="{{ $a('assets/img/decor/icon-invitacion/guitarra.png') }}" alt=""> Sugerir Música
      </button>
      <button type="button" class="menu-flotante-item" id="menu-ir-galeria">
        <img class="menu-flotante-item-icon" src="{{ $a('assets/img/decor/icon-invitacion/camara-reflex-digital.png') }}" alt=""> Subir Foto
      </button>
    </div>
  </div>

  <!-- MODAL DE CONFIRMACIÓN -->
  <div class="modal" id="rsvp-modal" hidden>
    <div class="modal-content">
      <button type="button" class="modal-close" id="rsvp-modal-close" aria-label="Cerrar">&times;</button>
      <h3>Confirmar Asistencia</h3>
      <form id="rsvp-form">
        <p class="rsvp-error" id="rsvp-error" hidden></p>

        <label for="rsvp-nombre">Nombre *</label>
        <input type="text" id="rsvp-nombre" required>

        <label for="rsvp-apellidos">Apellidos *</label>
        <input type="text" id="rsvp-apellidos" required>

        <label for="rsvp-acompanantes">Nombre de acompañante (opcional)</label>
        <input type="text" id="rsvp-acompanantes" placeholder="Si vienes solo(a), deja este campo vacío">

        <fieldset class="rsvp-radio">
          <legend>¿Asistirás?</legend>
          <label><input type="radio" name="rsvp-confirma" value="si" checked> Sí, ahí estaré</label>
          <label><input type="radio" name="rsvp-confirma" value="no"> No podré asistir</label>
        </fieldset>

        <button type="submit" class="btn-primary">Enviar Confirmación</button>
      </form>
      <p class="rsvp-thanks" id="rsvp-thanks" hidden>¡Gracias por confirmar! Te esperamos con mucha ilusión.</p>
      <p class="modal-note">Nota especial: Agradecemos tu puntualidad, para que no te pierdas ningún momento especial.</p>
    </div>
  </div>
</div>

<audio id="bg-music" loop preload="none"></audio>
@endsection

@push('scripts')
<script>
  window.__MIBODA_ASSET_BASE__ = @json(asset('temp02').'/');
  window.__MIBODA_CONFIG__ = @json($configJson ?? []);
  window.__MIBODA_ENDPOINTS__ = {
    rsvp: @json(url('/api/miboda/rsvp')),
    cancion: @json(url('/api/miboda/cancion')),
    galeria: @json(url('/api/miboda/galeria-foto'))
  };
</script>
<script src="{{ $a('js/main.js') }}?v={{ filemtime(public_path('temp02/js/main.js')) }}"></script>
@endpush
