<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>@yield('title', 'Nuestra Boda')</title>

@php
    $ogSiteName = 'Renzo & Yakelin - Nuestra Boda';
    $ogImageDefault = 'temp02/assets/img/hero/hero-principal-wsp.jpeg';
@endphp
@include('web.partials.og_meta')

<link rel="apple-touch-icon" sizes="180x180" href="{{ asset('temp02/assets/img/favicon/apple-touch-icon.png') }}">
<link rel="icon" type="image/png" sizes="32x32" href="{{ asset('temp02/assets/img/favicon/favicon-32x32.png') }}">
<link rel="icon" type="image/png" sizes="16x16" href="{{ asset('temp02/assets/img/favicon/favicon-16x16.png') }}">
<link rel="shortcut icon" href="{{ asset('temp02/assets/img/favicon/favicon.ico') }}">
<link rel="manifest" href="{{ asset('temp02/assets/img/favicon/site.webmanifest') }}">
<meta name="theme-color" content="#A16207">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Lora:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('temp02/css/styles.css') }}?v={{ filemtime(public_path('temp02/css/styles.css')) }}">
@yield('head_page')
</head>
<body>
@yield('content')
@stack('scripts')
</body>
</html>
