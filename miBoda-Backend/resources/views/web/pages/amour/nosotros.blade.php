@extends('web.base_Amour')

@section('head_page')
<link href="{{ asset('temp02/assets/css/subpages.css') }}" rel="stylesheet">
@endsection

@section('title', $metaData->titulo_pagina ?? 'Quiénes Somos | Amour Spa')
@section('meta_description', $metaData->descripcion_pagina ?? 'Conoce Amour Spa en Miraflores.')

@section('content')
@include('web.partials.amour.header')
@include('web.partials.amour.page_banner', [
    'bannerImagen' => $webAbout->banner_url_imagen ?? $webAbout->url_imagen ?? 'temp02/assets/images/inicio/amour-nosotros.jpeg',
    'bannerEyebrow' => $webAbout->banner_subtitulo ?? "L'histoire · Notre maison",
    'bannerTitulo' => $webAbout->banner_titulo ?? 'Quiénes Somos',
    'breadcrumbs' => [
        ['label' => 'Inicio', 'url' => url('/')],
        ['label' => 'Quiénes Somos', 'url' => route('nosotros'), 'active' => true],
    ],
])
@include('web.pages.amour.partials.02_about_intro')
@php
    $ctaBtnUrl = ($webAbout->cta_btn_url ?? null) ?: $urlWhatsapp;
    $ctaExterno = \Illuminate\Support\Str::startsWith($ctaBtnUrl, ['http://', 'https://']);
@endphp
<section class="more-help subpage-cta">
    <div class="container">
        <div class="row justify-content-center text-center">
            <div class="col-lg-8 col-xl-6">
                <h4 class="sub-heading fade_up_anim">{{ $webAbout->cta_eyebrow ?? 'Votre rituel vous attend' }}</h4>
                <h2 class="fade_up_anim text-uppercase">{{ $webAbout->cta_titulo ?? '¿Lista para tu momento de calma?' }}</h2>
                <p class="fade_up_anim mb-4" data-delay=".3">{{ $webAbout->cta_descripcion ?? 'Reserva tu cita y déjate llevar por un ritual pensado para ti.' }}</p>
                <a href="{{ $ctaBtnUrl }}" class="primary-btn mx-auto" @if($ctaExterno) target="_blank" rel="noopener" @endif>{{ $webAbout->cta_btn_texto ?? 'Reservar mi ritual' }} <i class="ph ph-arrow-up-right"></i></a>
            </div>
        </div>
    </div>
</section>
@include('web.partials.amour.footer')
@endsection
