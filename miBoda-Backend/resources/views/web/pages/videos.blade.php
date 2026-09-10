@extends('web.pages.partials.landing_shell_jh')

@section('title', $metaData->titulo_pagina ?? 'Videos — J&H Importaciones')
@section('meta_description', $metaData->descripcion_pagina ?? 'Galería de videos — J&H Importaciones.')

@section('page_content')
@include('web.pages.partials.page_banner_jh', [
    'bannerTitulo' => $pagina->banner_titulo ?? 'Videos',
    'bannerSubtitulo' => 'J&H Importaciones',
    'bannerImagenUrl' => Helpers::cmsBannerUrl($pagina->banner_url_imagen ?? null),
])
@include('web.pages.videos.partials.videos_galeria_jh')
@include('web.pages.partials.cta_frase_jh', ['fraseTexto' => $pagina->frase_texto ?? null])
@endsection
