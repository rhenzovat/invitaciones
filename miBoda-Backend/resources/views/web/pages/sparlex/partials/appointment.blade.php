@php
    $pc  = $paginaContacto ?? null;
    $c   = $contactoLanding ?? null;
    $wa  = $urlWhatsapp ?? '#';
    $cols = $contactoColumnas ?? collect();

    // Textos del formulario: prioridad → web_pagina_contacto → web_contacto_landing → fallback
    $labelSubtitulo = $pc->form_subtitulo ?? $c->etiqueta   ?? 'CONTÁCTANOS';
    $labelTitulo    = $pc->form_titulo    ?? $c->titulo      ?? 'Un rituel te espera en Miraflores';
    $labelBtn       = $pc->btn_texto      ?? 'RESERVAR POR WHATSAPP';
    $fraseFinal     = $pc->frase_texto    ?? ('Agenda únicamente con reserva previa al WhatsApp ' . str_replace(' ', '', $footerCorp->contacto_telefono ?? '982311335') . '.');

    // Textos del panel derecho
    $panelTitulo = $c->panel_titulo ?? 'Información de Reserva';
@endphp
<div class="container-fluid appointment py-5">
    <div class="container py-5">
        <div class="row g-5 align-items-center">

            {{-- ── IZQUIERDA: Formulario ── --}}
            <div class="col-lg-6">
                <div class="appointment-form p-5">
                    <p class="fs-4 text-uppercase text-primary" style="letter-spacing:2px; font-size:12px!important; font-weight:800;">
                        {{ $labelSubtitulo }}
                    </p>
                    <h1 class="display-4 mb-4 text-white" style="font-family:'PT Serif',serif; line-height:1.15;">
                        {!! $labelTitulo !!}
                    </h1>
                    <form data-rm-reserva-form
                          data-wa-phone="{{ \Helpers::whatsappPhoneDigits($footerCorp ?? null) }}"
                          data-wa-default="{{ e(\Helpers::whatsappDefaultMessage($footerCorp ?? null)) }}">
                        <div class="row gy-3 gx-4">
                            <div class="col-lg-6">
                                <input type="text" class="form-control py-3 border-white bg-transparent text-white" placeholder="Nombre" data-rm-field="nombre">
                            </div>
                            <div class="col-lg-6">
                                <input type="tel" class="form-control py-3 border-white bg-transparent text-white"
                                       placeholder="999888777" maxlength="9" inputmode="numeric"
                                       pattern="[0-9]{9}" autocomplete="tel-national" data-rm-field="whatsapp">
                            </div>
                            <div class="col-lg-6">
                                <select class="form-select py-3 border-white bg-transparent"
                                    style="color: rgba(255,255,255,0.5);"
                                    data-rm-field="experiencia"
                                    onchange="this.style.color='#fff';">
                                    <option selected disabled value="" style="color:#333;">Selecciona tu experiencia</option>
                                    @foreach($experiencias ?? [] as $exp)
                                        <option value="{{ $exp->id_experiencia }}" style="color:#333;">{{ $exp->titulo }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-lg-6">
                                <input type="date" class="form-control py-3 border-white bg-transparent"
                                    style="color: rgba(255,255,255,0.5);"
                                    data-rm-field="fecha"
                                    onchange="this.style.color='#fff';">
                            </div>
                            <div class="col-lg-12">
                                <textarea class="form-control border-white bg-transparent text-white" rows="5"
                                    placeholder="Cuéntanos qué buscas en tu sesión..."
                                    data-rm-field="mensaje"></textarea>
                            </div>
                            <div class="col-lg-12">
                                <a href="#"
                                   data-rm-wa-submit
                                   class="btn btn-primary btn-primary-outline-0 w-100 py-3 px-5"
                                   style="font-weight:800; letter-spacing:1px;">
                                    <i class="fab fa-whatsapp me-2"></i> {{ strtoupper($labelBtn) }}
                                </a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {{-- ── DERECHA: Info card ── --}}
            <div class="col-lg-6">
                <div class="appointment-time p-5">
                    <h1 class="display-5 mb-4" style="font-family:'PT Serif',serif;">
                        {{ $panelTitulo }}
                    </h1>

                    {{-- Columnas dinámicas desde admin --}}
                    @if($cols->isNotEmpty())
                        @foreach($cols as $col)
                        <div class="d-flex justify-content-between py-2" style="border-bottom:1px solid rgba(255,255,255,.15);">
                            <span class="text-white fw-semibold" style="font-size:14px; max-width:45%;">
                                {{ $col->titulo }}
                            </span>
                            <span class="text-white text-end" style="font-size:13px; max-width:52%; opacity:.85;">
                                {{ $col->descripcion }}
                            </span>
                        </div>
                        @endforeach
                    @else
                        {{-- Fallback estático --}}
                        <p class="text-white d-flex justify-content-between"><span>📍 Ubicación:</span><span>Lima, Perú</span></p>
                        <p class="text-white d-flex justify-content-between"><span>💌 Reservas:</span><span>Solo por WhatsApp</span></p>
                        <p class="text-white d-flex justify-content-between"><span>WhatsApp:</span><span>{{ $footerCorp->contacto_telefono ?? '982 311 335' }}</span></p>
                        <p class="text-white d-flex justify-content-between"><span>Confidencialidad:</span><span>100% garantizada</span></p>
                        <p class="text-white d-flex justify-content-between"><span>Años de experiencia:</span><span>+10</span></p>
                        <p class="text-white d-flex justify-content-between"><span>Clientas satisfechas:</span><span>+10.000</span></p>
                    @endif

                    <p class="text-dark mt-4" style="font-size:13px; opacity:.8;">{{ $fraseFinal }}</p>
                </div>
            </div>

        </div>
    </div>
</div>
