<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @include('web.partials.og_meta')
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Royal Masajes Lima')</title>
    <meta name="description" content="@yield('meta_description', 'Royal Sensory Experience Massage — relajación profunda y tacto consciente en Lima.')">
    <meta name="keywords" content="@yield('meta_keywords', 'masaje sensorial, Royal Masajes, Lima Surco, bienestar')">

    @include('web.partials.favicon')
    <link rel="canonical" href="{{ Helpers::canonicalShareUrl() }}">
    @include('web.partials.sparlex.head')
    @yield('head_page')
</head>
<body>
    @include('web.partials.sparlex.cursor_spinner')
    @yield('content')
    @include('web.partials.sparlex.scripts')
    @stack('scripts')
</body>
</html>
