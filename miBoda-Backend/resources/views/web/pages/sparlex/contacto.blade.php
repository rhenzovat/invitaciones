@extends('web.base_sparlex')
@section('title', $metaData->titulo_pagina ?? 'Contacto | Royal Masajes')
@section('head_page')
<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">
@endsection
@section('content')
@include('web.partials.sparlex.header')

@php
    $pc = $paginaContacto;
    $mapRaw = $pc?->mapa_embed_url ?? '';
    $mapSrc = $mapRaw;
    if (preg_match('/src=["\']([^"\']+)["\']/', $mapRaw, $m)) {
        $mapSrc = $m[1];
    }
    $heroBg = \App\Support\SparlexPageData::img($pc?->banner_url_imagen ?? null, 'temp02/img/inicio/slider_1.jpg');
    $formBg = \App\Support\SparlexPageData::img($pc?->banner_url_imagen ?? null, 'temp02/img/inicio/slider_1.jpg');
@endphp

{{-- ══ HERO BANNER ══ --}}
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg'    => $heroBg,
    'heroTag'   => 'Estamos para ti',
    'heroTitle' => $pc->banner_titulo ?? 'Contáctanos',
    'heroCrumb' => 'Contacto',
])

{{-- ══ 3 TARJETAS INFO ══ --}}
<section style="background:#fdf8f5; padding:70px 0 40px;">
    <div class="container">
        <div class="text-center mb-5">
            <div class="rm-section-label justify-content-center"><span>Ponte en Contacto</span></div>
            <h2 class="display-5" style="font-family:'PT Serif',serif; color:#2c1a0e;">
                ¿Cómo llegar a<br><em style="color:#cc6b8e;">nosotros?</em>
            </h2>
        </div>

        {{-- Columnas dinámicas desde BD --}}
        @if($columnas && $columnas->count() > 0)
        <div class="row g-4 mb-5">
            @foreach($columnas as $col)
            <div class="col-md-4">
                <div class="rm-contact-info-card">
                    <div class="rm-contact-info-icon">
                        @if($loop->index === 0)<i class="fas fa-map-marker-alt"></i>
                        @elseif($loop->index === 1)<i class="fab fa-whatsapp"></i>
                        @else<i class="fas fa-shield-alt"></i>@endif
                    </div>
                    <div>
                        <h5>{!! $col->titulo !!}</h5>
                        <p style="margin:0; font-size:0.88rem; color:#777;">{!! nl2br(e($col->descripcion)) !!}</p>
                    </div>
                </div>
            </div>
            @endforeach
        </div>
        @else
        {{-- Fallback estático si no hay columnas --}}
        <div class="row g-4 mb-5">
            <div class="col-md-4">
                <div class="rm-contact-info-card">
                    <div class="rm-contact-info-icon"><i class="fas fa-map-marker-alt"></i></div>
                    <div>
                        <h5>Ubicación</h5>
                        <p>📍 {{ $pc?->ubicacion ?? 'Atención privada en Lima, Perú' }}<br>
                           <small>Solo con reserva previa</small></p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="rm-contact-info-card">
                    <div class="rm-contact-info-icon"><i class="fab fa-whatsapp"></i></div>
                    <div>
                        <h5>WhatsApp</h5>
                        <a href="{{ $urlWhatsapp }}">+51 {{ $pc?->telefono ?? '982 311 335' }}</a>
                        <p><small>Reservas únicamente por WhatsApp</small></p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="rm-contact-info-card">
                    <div class="rm-contact-info-icon"><i class="fas fa-shield-alt"></i></div>
                    <div>
                        <h5>Confidencialidad</h5>
                        <p>100% garantizada<br><small>Tu privacidad es nuestra prioridad</small></p>
                    </div>
                </div>
            </div>
        </div>
        @endif
    </div>
</section>

{{-- ══ FORMULARIO + MAPA ══ --}}
<section style="background:#fff; padding:20px 0 70px;">
    <div class="container">
        <div class="row g-5 align-items-start">

            {{-- Formulario --}}
            <div class="col-lg-6">
                <div class="rm-contact-form-card" style="background-image: linear-gradient(rgba(20,10,5,.82), rgba(20,10,5,.82)), url('{{ $formBg }}'); background-size: cover; background-position: center;">
                    <div class="rm-section-label"><span>{{ $pc->form_subtitulo ?? 'CONTÁCTANOS' }}</span></div>
                    <h3 style="font-family:'PT Serif',serif; color:#fff; margin-bottom:24px;">
                        {{ $pc->form_titulo ?? 'Escríbenos' }}
                    </h3>
                    @if($pc->form_descripcion ?? null)
                    <p style="color:rgba(255,255,255,0.75); font-size:0.9rem; margin-bottom:20px;">
                        {{ $pc->form_descripcion }}
                    </p>
                    @endif
                    <form data-rm-reserva-form
                          data-wa-phone="{{ \Helpers::whatsappPhoneDigits($footerCorp ?? null) }}"
                          data-wa-default="{{ e(\Helpers::whatsappDefaultMessage($footerCorp ?? null)) }}">
                        <div class="row g-3">
                            <div class="col-sm-6">
                                <label class="form-label" style="font-size:13px; font-weight:600; color:#555;">Nombre</label>
                                <input type="text" class="form-control" placeholder="Tu nombre" data-rm-field="nombre">
                            </div>
                            <div class="col-sm-6">
                                <label class="form-label" style="font-size:13px; font-weight:600; color:#555;">
                                    {{ $pc->telefono_etiqueta ?? 'WhatsApp' }}
                                </label>
                                <input type="tel" class="form-control" placeholder="999888777"
                                       maxlength="9" inputmode="numeric" pattern="[0-9]{9}"
                                       autocomplete="tel-national" data-rm-field="whatsapp">
                                <small class="text-muted" style="font-size:11px;">9 dígitos, solo números</small>
                            </div>
                            <div class="col-12">
                                <label class="form-label" style="font-size:13px; font-weight:600; color:#555;">Experiencia de interés</label>
                                <select class="form-select" data-rm-field="experiencia">
                                    <option selected disabled value="">Selecciona una experiencia</option>
                                    @if($experiencias && $experiencias->count() > 0)
                                        @foreach($experiencias as $exp)
                                        <option>{{ $exp->titulo }} — {{ $exp->duracion ?? $exp->badge }}</option>
                                        @endforeach
                                    @else
                                        <option>Sabor Simple del Tantra — 90 min</option>
                                        <option>El Toque Sensual del Tantra — 120 min</option>
                                        <option>Masaje Tántrico de Lujo — 150 min</option>
                                        <option>Masaje Tántrico Royal — 180 a 300 min</option>
                                    @endif
                                </select>
                            </div>
                            <div class="col-sm-6">
                                <label class="form-label" style="font-size:13px; font-weight:600; color:#555;">Fecha preferida</label>
                                <input type="date" class="form-control" data-rm-field="fecha">
                            </div>
                            <div class="col-sm-6">
                                <label class="form-label" style="font-size:13px; font-weight:600; color:#555;">Hora preferida</label>
                                <input type="time" class="form-control" data-rm-field="hora">
                            </div>
                            <div class="col-12">
                                <label class="form-label" style="font-size:13px; font-weight:600; color:#555;">Mensaje (opcional)</label>
                                <textarea class="form-control" rows="4" placeholder="Cuéntanos qué buscas en tu sesión..." data-rm-field="mensaje"></textarea>
                            </div>
                            <div class="col-12">
                                <a href="#"
                                   data-rm-wa-submit
                                   class="btn btn-primary btn-primary-outline-0 w-100 rounded-pill py-3"
                                   style="font-weight:700; letter-spacing:0.5px;">
                                    <i class="fab fa-whatsapp me-2"></i> {{ $pc->btn_texto ?? 'Enviar por WhatsApp' }}
                                </a>
                            </div>
                            <div class="col-12 text-center">
                                <small style="color:rgba(255,255,255,0.55); font-size:11px;">
                                    {{ $pc->frase_texto ?? 'Al hacer clic serás redirigida a WhatsApp para confirmar tu reserva' }}
                                </small>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {{-- Mapa + Horarios --}}
            <div class="col-lg-6">
                <div class="rm-section-label"><span>Encuéntranos</span></div>
                <h3 style="font-family:'PT Serif',serif; color:#2c1a0e; margin-bottom:24px;">Lima, Perú</h3>

                @if($mapSrc)
                <div class="rounded-4 overflow-hidden mb-4 shadow-sm">
                    <iframe class="w-100" style="height:320px; border:0; display:block;"
                        src="{{ $mapSrc }}"
                        loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                </div>
                @endif

                {{-- Horarios --}}
                @php
                    $horarioDiasRaw = $pc->horario_dias ?? '';
                    $horarioFilas = [];
                    $decoded = json_decode($horarioDiasRaw, true);
                    if (is_array($decoded) && count($decoded) > 0) {
                        $horarioFilas = $decoded;
                    } elseif (!empty($pc->horario_linea2) && !empty($pc->horario_linea1)) {
                        $horarioFilas[] = [
                            'dia' => $pc->horario_linea2,
                            'hora' => $pc->horario_linea1,
                            'rosa' => false,
                        ];
                    }
                    if (empty($horarioFilas) && is_string($horarioDiasRaw) && str_contains($horarioDiasRaw, ':')) {
                        foreach (preg_split('/\|/', $horarioDiasRaw) as $part) {
                            $part = trim($part);
                            if ($part === '') continue;
                            $pos = strpos($part, ':');
                            if ($pos === false) {
                                $horarioFilas[] = ['dia' => $part, 'hora' => '', 'rosa' => false];
                                continue;
                            }
                            $horarioFilas[] = [
                                'dia' => trim(substr($part, 0, $pos)),
                                'hora' => trim(substr($part, $pos + 1)),
                                'rosa' => stripos($part, 'domingo') !== false,
                            ];
                        }
                    }
                @endphp
                @if(count($horarioFilas) > 0)
                <div style="background:linear-gradient(180deg,#fdf8f5 0%,#fbf2ec 100%); border:1px solid #ead5df; border-radius:16px; padding:28px;">
                    <div class="d-flex align-items-center mb-3" style="gap:12px;">
                        <span class="d-inline-flex align-items-center justify-content-center rounded-circle"
                              style="width:40px;height:40px; background:#2c1a0e; flex:0 0 auto;">
                            <i class="fas fa-clock" style="color:#cc6b8e; font-size:16px;"></i>
                        </span>
                        <h5 class="mb-0" style="font-family:'PT Serif',serif; color:#2c1a0e;">
                            {{ $pc->horario_etiqueta ?? 'Horario de atención' }}
                        </h5>
                    </div>
                    @foreach($horarioFilas as $i => $fila)
                    <div class="d-flex justify-content-between align-items-center py-3"
                         style="{{ $i < count($horarioFilas) - 1 ? 'border-bottom:1px solid #ead5df;' : '' }}">
                        <span style="font-size:15px; color:#2c1a0e; font-weight:500;">{{ $fila['dia'] ?? '' }}</span>
                        @if(!empty($fila['rosa']))
                        <span class="rounded-pill px-3 py-1" style="font-size:13px; font-weight:700; letter-spacing:.3px; color:#fff; background:#cc6b8e;">
                            {{ $fila['hora'] ?? '' }}
                        </span>
                        @else
                        <span style="font-size:15px; font-weight:600; color:#2c1a0e;">
                            {{ $fila['hora'] ?? '' }}
                        </span>
                        @endif
                    </div>
                    @endforeach
                    <div class="mt-4 text-center">
                        <a href="{{ $urlWhatsapp }}"
                           class="rm-mc-btn-reserve rm-mc-btn-reserve--lg rm-mc-btn-reserve--block">
                            <i class="fab fa-whatsapp"></i> Reservar ahora
                        </a>
                    </div>
                </div>
                @endif
            </div>

        </div>
    </div>
</section>

{{-- Franja «Síguenos en Redes» — solo en Contacto, antes del footer --}}
@include('web.partials.sparlex.redes_siguenos_strip')

@include('web.partials.sparlex.footer')
@endsection
