@extends('web.base_lucdesoft')

@section('title', $metaData->titulo_pagina ?? 'royalsensorymassage en Lima, Perú')
@section('meta_description', $metaData->descripcion_pagina ?? 'Sistemas web, apps móviles, e-commerce y ERPs a medida en Lima, Perú.')

@section('content')
@php
    $footerCorp = isset($footerData) && count($footerData) > 0 ? $footerData[0] : null;
    $urlWhatsapp = Helpers::landingWhatsappUrl($footerCorp);
@endphp

@include('web.pages.royalsensorymassage.partials.topbar_nav')
@include('web.pages.royalsensorymassage.partials.hero')
@include('web.pages.royalsensorymassage.partials.paquetes_slider')
@include('web.pages.royalsensorymassage.partials.ejemplares')
@include('web.pages.royalsensorymassage.partials.portafolio')
@include('web.pages.royalsensorymassage.partials.hub_static')
@include('web.pages.royalsensorymassage.partials.cta')
@include('web.pages.royalsensorymassage.partials.footer')
@endsection

@push('scripts')

@endpush
