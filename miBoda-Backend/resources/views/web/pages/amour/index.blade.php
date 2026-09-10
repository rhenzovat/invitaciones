@extends('web.base_Amour')

@section('title', $metaData->titulo_pagina ?? 'Amour Spa Miraflores')
@section('meta_description', $metaData->descripcion_pagina ?? 'Amour Spa — masajes y bienestar en Miraflores.')

@section('content')
@include('web.partials.amour.header')
@include('web.pages.amour.partials.01_hero')
@include('web.pages.amour.partials.03_rituales_teaser')
@include('web.pages.amour.partials.02_about_intro')
@include('web.pages.amour.partials.04_tarifas')
@include('web.pages.amour.partials.05_testimonios')
@include('web.pages.amour.partials.06_equipo')
@include('web.pages.amour.partials.07_faq')
@include('web.pages.amour.partials.08_booking')
@include('web.partials.amour.footer')
@endsection
