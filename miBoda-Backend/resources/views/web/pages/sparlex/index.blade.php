@extends('web.base_sparlex')

@section('title', $metaData->titulo_pagina ?? 'Royal Sensory Experience Massage | Royal Masajes Lima')
@section('meta_description', $metaData->descripcion_pagina ?? 'Royal Sensory Experience Massage en Lima.')

@section('head_page')
<link href="{{ asset('temp02/css/promo-banner.css') }}" rel="stylesheet">
<link href="{{ asset('temp02/css/latest-news.css') }}" rel="stylesheet">
@endsection

@section('content')
@include('web.partials.sparlex.header')
@include('web.pages.sparlex.partials.hero_carousel')
@include('web.pages.sparlex.partials.promo_banner')
@include('web.pages.sparlex.partials.services')
@include('web.pages.sparlex.partials.experiencias_cards')
@include('web.pages.sparlex.partials.about_home')
@include('web.pages.sparlex.partials.appointment')
<!-- include('web.pages.sparlex.partials.galeria_home') -->
@include('web.pages.sparlex.partials.pricing')
@include('web.pages.sparlex.partials.team')
@include('web.pages.sparlex.partials.testimonials')
@include('web.pages.sparlex.partials.news')
@include('web.partials.sparlex.footer')
@endsection
