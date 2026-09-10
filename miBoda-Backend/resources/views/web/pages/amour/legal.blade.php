@extends('web.base_Amour')

@section('head_page')
<link href="{{ asset('temp02/assets/css/subpages.css') }}" rel="stylesheet">
@endsection

@section('content')
@include('web.partials.amour.header')
<section class="pt-120 pb-120">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <h1 class="mb-4">{{ $legalTipo === 'politicas' ? 'Política de Privacidad' : 'Términos y Condiciones' }}</h1>
                @foreach($terminosData ?? [] as $doc)
                    <div class="legal-content mb-4">{!! $doc->contenido ?? $doc->descripcion ?? '' !!}</div>
                @endforeach
            </div>
        </div>
    </div>
</section>
@include('web.partials.amour.footer')
@endsection
