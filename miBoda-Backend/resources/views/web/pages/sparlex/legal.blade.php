@extends('web.base_sparlex')
@section('title', $metaData->titulo_pagina ?? ($legalTipo === 'politicas' ? 'Políticas de Privacidad' : 'Términos') . ' | Royal Masajes')
@section('head_page')<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">@endsection
@section('content')
@include('web.partials.sparlex.header')
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg' => asset('temp02/img/inicio/slider_2.jpg'),
    'heroTitle' => $legalTipo === 'politicas' ? 'Políticas de Privacidad' : 'Términos y Condiciones',
    'heroCrumb' => $legalTipo === 'politicas' ? 'Políticas' : 'Términos',
])
<section class="rm-legal-wrap">
    <div class="container">
        <div class="rm-legal-card">
            @forelse($terminosData ?? [] as $doc)
                <div class="mb-4">{!! $doc->contenido ?? $doc->descripcion ?? '' !!}</div>
            @empty
                <p>Configure el documento legal desde el administrador (Footer → documentos).</p>
            @endforelse
        </div>
    </div>
</section>
@include('web.partials.sparlex.footer')
@endsection
