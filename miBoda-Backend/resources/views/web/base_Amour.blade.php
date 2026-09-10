<!doctype html>
<html lang="es" data-bs-theme="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @include('web.partials.og_meta')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', $metaData->titulo_pagina ?? 'Amour Spa Miraflores')</title>
    <meta name="description" content="@yield('meta_description', $metaData->descripcion_pagina ?? 'Amour Spa — masajes y bienestar en Miraflores.')">
    <meta name="theme-color" content="#f30000">
    @include('web.partials.favicon')
    <link rel="canonical" href="{{ Helpers::canonicalShareUrl() }}">
    @include('web.partials.amour.head')
    @yield('head_page')
</head>
<body class="custom-cursor">
    @include('web.partials.amour.custom_cursor')
    @include('web.partials.amour.loader')
    @yield('content')
    @include('web.partials.amour.whatsapp_float')
    @include('web.partials.amour.back_to_top')
    @include('web.partials.amour.scripts')
    @stack('scripts')
</body>
</html>
