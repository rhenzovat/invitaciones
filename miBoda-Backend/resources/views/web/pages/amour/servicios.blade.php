@extends('web.base_Amour')

@section('head_page')
<link href="{{ asset('temp02/assets/css/subpages.css') }}" rel="stylesheet">
@endsection

@section('title', $metaData->titulo_pagina ?? 'Rituales & Servicios | Amour Spa')
@section('meta_description', $metaData->descripcion_pagina ?? 'Rituales y tarifas Amour Spa Miraflores.')

@section('content')
@include('web.partials.amour.header')
@include('web.partials.amour.page_banner', [
    'bannerImagen' => $pagServicios->hero_url_imagen ?? 'temp02/assets/images/inicio/servicios/spa-2.webp',
    'bannerEyebrow' => $pagServicios->hero_tag ?? "Nos rituels · L'art du toucher",
    'bannerTitulo' => $pagServicios->hero_titulo ?? 'Rituales & Servicios',
    'breadcrumbs' => [
        ['label' => 'Inicio', 'url' => url('/')],
        ['label' => 'Servicios', 'url' => route('amour.servicios'), 'active' => true],
    ],
])
@include('web.pages.amour.partials.03_rituales_teaser')
@include('web.pages.amour.partials.04_tarifas')
@include('web.partials.amour.footer')
@endsection
