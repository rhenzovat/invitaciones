@extends('web.base_sparlex')
@section('title', $metaData->titulo_pagina ?? 'Sobre Nosotros | Royal Masajes')
@section('head_page')
<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">
@endsection
@section('content')
@include('web.partials.sparlex.header')

@php
    $a   = $webAbout ?? null;
    $wa  = $urlWhatsapp ?? '#';
    $img1 = \App\Support\SparlexPageData::img($a->url_imagen   ?? null, 'temp02/img/about-1.jpg');
    $img2 = \App\Support\SparlexPageData::img($a->url_imagen_2 ?? null, null);
    $mostrarVideo = ($a->mostrar_video ?? 0) == 1;
    $video = $mostrarVideo ? ($a->url_video ?: null) : null;
    $btnTexto = $a->btn_texto ?? 'Reservar al WhatsApp';
    $btnUrl   = Helpers::whatsappBtnUrl($a->btn_url ?? $wa, $footerCorp ?? null);
@endphp

{{-- ── Hero banner de la página ── --}}
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg'    => \App\Support\SparlexPageData::img($pagina->banner_url_imagen ?? null, 'temp02/img/about-1.jpg'),
    'heroTag'   => $pagina->banner_subtitulo ?? 'Royal Masajes Lima',
    'heroTitle' => $pagina->banner_titulo    ?? 'Sobre Nosotros',
    'heroCrumb' => 'Sobre Nosotros',
])

{{-- ══ SECCIÓN PRINCIPAL SOBRE NOSOTROS ══════════════════════════════════ --}}
<section class="py-5" style="background:#fdf8f5;">
    <div class="container py-5">
        <div class="row g-5 align-items-center">

            {{-- ── Columna izquierda: imagen(es) ── --}}
            <div class="col-lg-5">
                <div class="video position-relative">
                    <img src="{{ $img1 }}"
                         onerror="this.onerror=null;this.src='{{ asset('temp02/img/about-1.jpg') }}'"
                         class="img-fluid rounded-4 w-100"
                         alt="{{ strip_tags($a->titulo ?? 'Royal Masajes') }}"
                         style="object-fit:cover;height:480px;">

                    {{-- Segunda imagen (esquina inferior derecha) --}}
                    @if($img2)
                    <div class="position-absolute rounded border-5 border-top border-start border-white"
                         style="bottom:0;right:0;">
                        <img src="{{ $img2 }}"
                             class="img-fluid rounded"
                             alt=""
                             style="height:13rem;object-fit:cover;width:auto;">
                    </div>
                    @endif

                    {{-- Botón de video --}}
                    @if($video)
                    <button type="button" class="btn btn-play"
                            data-bs-toggle="modal"
                            data-src="{{ $video }}"
                            data-bs-target="#videoModal">
                        <span></span>
                    </button>
                    @endif
                </div>
            </div>

            {{-- ── Columna derecha: contenido ── --}}
            <div class="col-lg-7">

                {{-- Etiqueta superior (lema_label / subtitulo) --}}
                @if(!empty($a->lema_label))
                    <p class="fs-6 text-uppercase text-primary fw-bold mb-2"
                       style="letter-spacing:3px;font-size:11px!important;">
                        {{ $a->lema_label }}
                    </p>
                @elseif(!empty($a->subtitulo))
                    <p class="fs-6 text-uppercase text-primary fw-bold mb-2"
                       style="letter-spacing:3px;font-size:11px!important;">
                        {{ $a->subtitulo }}
                    </p>
                @endif

                {{-- Título principal --}}
                <h2 class="display-5 mb-4"
                    style="font-family:'PT Serif',serif;color:#2c1a0e;line-height:1.2;">
                    {!! $a->titulo ?? 'Royal Sensory Experience Massage' !!}
                </h2>

                {{-- Descripción con "Ver más" --}}
                @if(!empty($a->descripcion))
                @php
                    $desc = trim($a->descripcion ?? '');

                    // Si ya tiene HTML (<p> tags), extraer párrafos del HTML
                    if(preg_match('/<p[\s>]/i', $desc)){
                        preg_match_all('/<p[\s>].*?<\/p>/si', $desc, $mh);
                        $bloques = $mh[0];
                        $visibleHtml = $bloques[0] ?? $desc;
                        $ocultosHtml = count($bloques) > 1
                            ? implode('', array_slice($bloques, 1))
                            : '';
                    } else {
                        // Texto plano: dividir por doble salto de línea
                        $partes = array_values(array_filter(
                            preg_split('/(\r?\n){2,}/', $desc),
                            fn($b) => trim($b) !== ''
                        ));
                        // Cada bloque → <p>
                        $toP = fn($t) => '<p style="margin-bottom:1rem;">' . nl2br(e(trim($t))) . '</p>';
                        $nVisible = 4; // mostrar los primeros 4 párrafos
                        $visibleHtml = implode('', array_map($toP, array_slice($partes, 0, $nVisible)));
                        $ocultosHtml = count($partes) > $nVisible
                            ? implode('', array_map($toP, array_slice($partes, $nVisible)))
                            : '';
                    }
                    $hayOculto = trim(strip_tags($ocultosHtml)) !== '';
                @endphp

                <div class="rm-desc-visible" style="color:#555;line-height:1.85;font-size:1.05rem;">
                    {!! $visibleHtml !!}
                </div>

                @if($hayOculto)
                <div id="rm-texto-extendido"
                     style="color:#555;line-height:1.85;font-size:1.05rem;
                            overflow:hidden;max-height:0;opacity:0;
                            transition:max-height .7s ease,opacity .5s ease;">
                    {!! $ocultosHtml !!}
                </div>
                <div class="mb-4 mt-0">
                    <button type="button" onclick="rmToggleTexto()"
                            style="background:none;border:none;padding:0;
                                   color:#a0455e;font-weight:600;font-size:0.95rem;
                                   cursor:pointer;display:inline-flex;align-items:center;gap:6px;
                                   text-decoration:underline;text-underline-offset:3px;">
                        <span id="rm-btn-label">Ver más información</span>
                        <i id="rm-btn-icon" class="fas fa-chevron-down"
                           style="font-size:11px;transition:transform .3s;"></i>
                    </button>
                </div>
                <script>
                (function(){
                    var open = false;
                    window.rmToggleTexto = function(){
                        var box = document.getElementById('rm-texto-extendido');
                        var lbl = document.getElementById('rm-btn-label');
                        var ico = document.getElementById('rm-btn-icon');
                        open = !open;
                        if(open){
                            box.style.maxHeight = box.scrollHeight + 400 + 'px';
                            box.style.opacity   = '1';
                            lbl.textContent     = 'Ver menos';
                            ico.style.transform = 'rotate(180deg)';
                        } else {
                            box.style.maxHeight = '0';
                            box.style.opacity   = '0';
                            lbl.textContent     = 'Ver más información';
                            ico.style.transform = 'rotate(0deg)';
                        }
                    };
                })();
                </script>
                @else
                <div class="mb-4"></div>
                @endif
                @endif

                {{-- Texto extendido independiente (campo separado) --}}
                @if(!empty($a->texto_extendido))
                <div class="mb-4" style="color:#555;line-height:1.85;">
                    {!! $a->texto_extendido !!}
                </div>
                @endif

                {{-- Características (web_about_caracteristica) --}}
                @if(($aboutFeatures ?? collect())->isNotEmpty())
                <div class="row g-4 mb-4">
                    @foreach($aboutFeatures as $feat)
                    <div class="col-md-6">
                        <div class="d-flex align-items-start gap-3">
                            <div class="flex-shrink-0"
                                 style="width:42px;height:42px;border-radius:50%;
                                        background:linear-gradient(135deg,#cc6b8e,#a0455e);
                                        display:flex;align-items:center;justify-content:center;">
                                @if($loop->index === 0)
                                    <i class="fas fa-shield-alt" style="color:#fff;font-size:16px;"></i>
                                @elseif($loop->index === 1)
                                    <i class="fas fa-spa" style="color:#fff;font-size:16px;"></i>
                                @else
                                    <i class="fas fa-star" style="color:#fff;font-size:16px;"></i>
                                @endif
                            </div>
                            <div>
                                <h5 class="mb-1" style="color:#2c1a0e;font-size:15px;font-weight:700;">
                                    {{ $feat->titulo }}
                                </h5>
                                <p class="mb-0" style="color:#666;font-size:13.5px;line-height:1.6;">
                                    {{ $feat->descripcion }}
                                </p>
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>
                @endif

                {{-- CTA --}}
                <a href="{{ $btnUrl }}"
                   class="rm-mc-btn-reserve rm-mc-btn-reserve--lg">
                    {{ $btnTexto }}
                </a>
            </div>

        </div>
    </div>
</section>

{{-- Modal de video --}}
@if($video)
<div class="modal fade" id="videoModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content rounded-0">
            <div class="modal-header">
                <h5 class="modal-title">Royal Masajes</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="ratio ratio-16x9">
                    <iframe class="embed-responsive-item" src="about:blank" id="video"
                            title="Video Royal Masajes" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    </div>
</div>
@endif

{{-- ══ ESTADÍSTICAS ════════════════════════════════════════════════════════ --}}
@if(($contadores ?? collect())->isNotEmpty())
<section class="rm-stats-bar">
    <div class="container">
        <div class="row g-4 justify-content-center text-center">
            @foreach($contadores as $st)
            <div class="col-6 col-md-3">
                <div class="rm-stat-item">
                    <div class="rm-stat-number">{{ $st->valor }}{{ $st->sufijo }}</div>
                    <div class="rm-stat-label">{{ $st->etiqueta }}</div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>
@endif

{{-- ══ TESTIMONIOS ════════════════════════════════════════════════════════ --}}
@include('web.pages.sparlex.partials.testimonials')

{{-- ══ CTA FINAL ══════════════════════════════════════════════════════════ --}}
<section class="rm-cta-banner">
    <div class="container">
        <h2>¿Lista para tu Experiencia?</h2>
        <p>Escríbenos por WhatsApp y te guiamos hacia la sesión perfecta.</p>
        <a href="{{ $wa }}" class="rm-mc-btn-reserve rm-mc-btn-reserve--lg">
            Reservar — {{ $footerCorp->contacto_telefono ?? '982 311 335' }}
        </a>
    </div>
</section>

@include('web.partials.sparlex.footer')
@endsection
