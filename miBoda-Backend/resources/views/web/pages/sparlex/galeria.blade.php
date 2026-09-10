@extends('web.base_sparlex')
@section('title', $metaData->titulo_pagina ?? 'Galería | Royal Masajes')
@section('head_page')
<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">
<link href="{{ asset('temp02/lib/lightbox/css/lightbox.min.css') }}" rel="stylesheet">
@endsection
@push('scripts')
<script defer src="{{ asset('temp02/lib/lightbox/js/lightbox.min.js') }}"></script>
@endpush
@section('content')
@include('web.partials.sparlex.header')
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg' => asset('temp02/img/inicio/slider_3.jpg'),
    'heroTag' => 'Ambiente Diseñado para tus Sentidos',
    'heroTitle' => 'Nuestra Galería',
    'heroCrumb' => 'Galería',
])
<section class="py-5 rm-gallery-section" style="background:#ffffff;">
    <div class="container py-5">
        @php $tabs = \App\Models\WebPaginaGaleria::categoriasTabs(); @endphp
        <div class="tab-class text-center">
            <ul class="nav nav-pills d-inline-flex justify-content-center mb-5 flex-wrap gap-2">
                @foreach($tabs as $key => $label)
                    <li class="nav-item"><a class="d-flex px-4 py-2 border border-primary bg-light rounded-pill {{ $loop->first ? 'active' : '' }}" data-bs-toggle="pill" href="#gtab-{{ $key }}"><span class="text-dark">{{ $label }}</span></a></li>
                @endforeach
            </ul>
            <div class="tab-content">
                @foreach($tabs as $key => $label)
                    @php $filtered = $key === 'todas' ? ($galeriaItems ?? collect()) : ($galeriaItems ?? collect())->where('categoria', $key); @endphp
                    <div id="gtab-{{ $key }}" class="tab-pane fade {{ $loop->first ? 'show active' : '' }}">
                        <div class="row g-3">
                            @foreach($filtered as $g)
                                @php
                                    $fallback = 'temp02/img/gallery-3.jpg';
                                    $src = \App\Support\SparlexPageData::img($g->url_imagen, $fallback);
                                @endphp
                                <div class="col-6 col-md-4 col-lg-3">
                                    <div class="rm-gallery-item">
                                        <img src="{{ $src }}" alt="{{ $g->alt_imagen }}"
                                             loading="lazy" decoding="async"
                                             onerror="this.onerror=null;this.src='{{ asset($fallback) }}'">
                                        <div class="rm-gallery-overlay"><div class="rm-gallery-overlay-inner">
                                            <span>{{ $key === 'todas' ? $tabs[$g->categoria] ?? $g->titulo_overlay : $label }}</span>
                                            <a href="{{ $src }}" data-lightbox="gallery-page"><i class="fas fa-search-plus"></i></a>
                                        </div></div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>
<section class="rm-cta-banner"><div class="container"><h2>Reserva tu sesión</h2><a href="{{ $urlWhatsapp }}" class="btn-cta">WhatsApp</a></div></section>
@include('web.partials.sparlex.footer')
@endsection
