@extends('web.base_miboda')

@section('title', $metaData->titulo_pagina ?? 'Recuerdos que serán para toda la vida')
@section('meta_description', $metaData->descripcion_pagina ?? 'Galería de fotos compartidas por los invitados.')

@php
    $a = fn (string $p) => asset('temp02/'.$p);
@endphp

@section('head_page')
<style>
  .galeria-pagina {
    max-width: 72rem;
    margin: 0 auto;
    padding: 4rem 1.5rem 6rem;
    text-align: center;
  }
  .galeria-volver {
    display: inline-block;
    margin-bottom: 2.5rem;
    color: var(--color-dorado);
    text-decoration: none;
    font-size: 0.85rem;
    border: 1px solid var(--color-dorado);
    padding: 0.5rem 1.2rem;
    border-radius: 999px;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .galeria-volver:hover { background: var(--color-dorado); color: #fff; }
  .galeria-estado { text-align: center; opacity: 0.7; margin-top: 3rem; }
  .galeria-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
    gap: 1rem;
    margin-top: 2.5rem;
    text-align: left;
  }
  .galeria-item {
    display: block;
    aspect-ratio: 1;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }
  .galeria-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }
  .galeria-item:hover img { transform: scale(1.06); }
</style>
@endsection

@section('content')
<div class="galeria-pagina has-flowers">
  <img class="corner-decor top-left" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">
  <img class="corner-decor bottom-right" src="{{ $a('assets/img/decor/flor-esquinas.png') }}" alt="" aria-hidden="true">

  <a class="galeria-volver" href="{{ route('home') }}">&larr; Volver a la invitación</a>

  <p class="divider">&#128247;</p>
  <h1 class="script-title">Recuerdos que serán para toda la vida</h1>
  <p class="section-sub">Gracias por capturar y compartir cada momento de este día con nosotros</p>

  <p class="galeria-estado" id="galeria-estado">Cargando fotos...</p>
  <div class="galeria-grid" id="galeria-grid"></div>
</div>

<audio id="bg-music" loop preload="none"></audio>
<button type="button" class="music-toggle" id="music-toggle" aria-label="Pausar música">
  <span class="music-icon" id="music-icon">&#9835;</span>
</button>

<script>
  window.__MIBODA_GALERIA_FOTOS__ = @json($fotos);
  window.__MIBODA_MUSICA_SRC__ = @json($musicaSrc);
</script>
<script src="{{ asset('temp02/js/galeria.js') }}?v={{ filemtime(public_path('temp02/js/galeria.js')) }}"></script>
@endsection
