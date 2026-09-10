@extends('web.base_Amour')

@section('head_page')
<link href="{{ asset('temp02/assets/css/subpages.css') }}" rel="stylesheet">
@endsection

@section('title', $metaData->titulo_pagina ?? ($paginaContacto->banner_titulo ?? 'Contáctenos | Amour Spa'))
@section('meta_description', $metaData->descripcion_pagina ?? ($paginaContacto->form_descripcion ?? 'Contacto Amour Spa Miraflores.'))

@section('content')
@include('web.partials.amour.header')
@include('web.partials.amour.page_banner', [
    'bannerImagen' => !empty($paginaContacto->banner_url_imagen) ? asset($paginaContacto->banner_url_imagen) : asset('temp02/assets/images/inicio/historia.jpg'),
    'bannerEyebrow' => $paginaContacto->eyebrow ?? 'Contactez-nous · Estamos aquí',
    'bannerTitulo' => $paginaContacto->banner_titulo ?? $paginaContacto->titulo_pagina ?? 'Contáctenos',
    'breadcrumbs' => [
        ['label' => 'Inicio', 'url' => url('/')],
        ['label' => 'Contacto', 'url' => route('contacto.pagina'), 'active' => true],
    ],
])
<section class="contact-page pt-120 pb-120">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10 col-xl-8">
                <div class="contact-form reveal reveal--top">
                    <div class="contact-title text-center">
                        <h4 class="sub-heading fade_up_anim">{{ $paginaContacto->form_subtitulo ?? 'Écrivez-nous · Escríbenos' }}</h4>
                        <h2 class="fade_up_anim text-uppercase">{{ $paginaContacto->form_titulo ?? 'Cuéntanos qué rituel buscas' }}</h2>
                        <p class="mb-3 pb-lg-3 fade_up_anim" data-delay=".3">{{ $paginaContacto->form_descripcion ?? 'Completa el formulario y te respondemos por WhatsApp.' }}</p>
                    </div>
                    <form id="amour-contact-form">
                        <div class="row g-3 g-lg-4">
                            <div class="col-md-6">
                                <label for="contact-name">Nombre</label>
                                <input class="salonix-input w-100" name="user_name" type="text" id="contact-name" placeholder="Tu nombre..." required>
                            </div>
                            <div class="col-md-6">
                                <label for="contact-email">Correo</label>
                                <input class="salonix-input w-100" name="user_email" type="email" id="contact-email" placeholder="Tu correo..." required>
                            </div>
                            <div class="col-md-6">
                                <label for="contact-phone">Teléfono</label>
                                <input class="salonix-input w-100" name="contact_number" type="tel" id="contact-phone" placeholder="977 807 314" required>
                            </div>
                            <div class="col-md-6">
                                <label for="contact-service">Rituel de interés</label>
                                <select name="service" class="sort w-100" id="contact-service">
                                    <option value="">Elegir rituel</option>
                                    @foreach($experiencias ?? [] as $r)
                                        <option value="{{ $r->subtitulo ?? $r->titulo }}">{{ $r->subtitulo ?? $r->titulo }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-12">
                                <label for="contact-message">Mensaje</label>
                                <textarea class="salonix-input w-100" placeholder="{{ $paginaContacto->productos_placeholder ?? 'Cuéntanos qué buscas...' }}" name="message" id="contact-message" rows="5" required></textarea>
                            </div>
                            <div class="col-12 d-flex flex-column align-items-center pt-lg-3">
                                <button type="submit" class="primary-btn" id="submit-btn">{{ $paginaContacto->btn_texto ?? 'Enviar por WhatsApp' }} <i class="ph ph-whatsapp-logo"></i></button>
                                @if(!empty($paginaContacto->frase_texto))
                                    <p class="text-center mt-3 text-muted small mb-0">{{ $paginaContacto->frase_texto }}</p>
                                @endif
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>
<section class="more-help">
    <div class="container">
        <div class="row justify-content-center text-center">
            <div class="col-lg-8 col-xl-6">
                <h4 class="sub-heading fade_up_anim">{{ $paginaContacto->info_titulo ?? 'Toujours disponibles' }}</h4>
                <h2 class="fade_up_anim text-uppercase">{{ !empty($paginaContacto->info_texto) ? $paginaContacto->info_texto : 'Otras formas de contactarnos' }}</h2>
            </div>
        </div>
        <div class="row justify-content-center g-3 g-xl-4">
            @if(isset($columnas) && count($columnas) > 0)
                @foreach($columnas as $col)
                    <div class="col-md-6 col-lg-4">
                        <div class="help-card fade_up_anim">
                            <i class="{{ !empty($col->icono) ? $col->icono : 'ph ph-map-pin' }}"></i>
                            <h4 class="mb-3">{{ $col->titulo }}</h4>
                            <span>{!! nl2br(e($col->descripcion)) !!}</span>
                        </div>
                    </div>
                @endforeach
            @else
                <div class="col-md-6 col-lg-4">
                    <div class="help-card fade_up_anim">
                        <i class="ph ph-phone-call"></i>
                        <h4 class="mb-3">{{ $paginaContacto->telefono_etiqueta ?? 'Llámanos' }}</h4>
                        @php $tel = !empty($paginaContacto->telefono) ? $paginaContacto->telefono : ($webFooter->contacto_telefono ?? '+51 977 807 314'); @endphp
                        <a href="tel:{{ preg_replace('/[^0-9+]/', '', $tel) }}">{{ $tel }}</a>
                        @if(!empty($paginaContacto->telefonos_texto))
                            <span class="d-block small text-muted mt-1">{!! nl2br(e($paginaContacto->telefonos_texto)) !!}</span>
                        @endif
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="help-card fade_up_anim">
                        <i class="ph ph-whatsapp-logo"></i>
                        <h4 class="mb-3">{{ $paginaContacto->email_etiqueta ?? 'WhatsApp' }}</h4>
                        <a href="{{ $urlWhatsapp }}" target="_blank" rel="noopener">Escríbenos ahora</a>
                        @if(!empty($paginaContacto->emails_texto))
                            <span class="d-block small text-muted mt-1">{!! nl2br(e($paginaContacto->emails_texto)) !!}</span>
                        @endif
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="help-card fade_up_anim">
                        <i class="ph ph-map-pin"></i>
                        <h4 class="mb-3">{{ $paginaContacto->ubicacion_etiqueta ?? 'Ubicación' }}</h4>
                        <span>{{ !empty($paginaContacto->ubicacion) ? $paginaContacto->ubicacion : ($webFooter->contacto_direccion ?? 'Av. Ernesto Diez Canseco 204, Miraflores, Lima, Perú') }}</span>
                    </div>
                </div>
            @endif
        </div>
    </div>
</section>
<section class="contact-map">
    <div class="container">
        <div class="contact-map__frame reveal reveal--top">
            @if(!empty($paginaContacto->mapa_embed_url))
                @if(Str::startsWith(trim($paginaContacto->mapa_embed_url), '<iframe'))
                    {!! $paginaContacto->mapa_embed_url !!}
                @else
                    <iframe src="{{ $paginaContacto->mapa_embed_url }}" width="100%" height="100%" style="border:0" allowfullscreen loading="lazy" title="Ubicación Amour Spa"></iframe>
                @endif
            @else
                <iframe src="https://www.google.com/maps?q=Av.+Ernesto+Diez+Canseco+204,+Miraflores,+Lima,+Peru&output=embed" width="100%" height="100%" style="border:0" allowfullscreen loading="lazy" title="Ubicación Amour Spa"></iframe>
            @endif
        </div>
    </div>
</section>
@include('web.pages.amour.partials.08_booking')
@include('web.partials.amour.footer')
@endsection

@push('page_scripts')
<script src="{{ asset('temp02/assets/js/contact-form.js') }}"></script>
@endpush
