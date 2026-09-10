@php $ts = $testimonioSeccion ?? null; @endphp
<div class="container-fluid testimonial py-5" id="testimonios">
    <div class="container py-5">
        <div class="text-center mx-auto mb-5" style="max-width:800px;">
            <p class="fs-4 text-uppercase text-primary">{{ $ts->badge_seccion ?? 'Testimonios' }}</p>
            <h1 class="display-4 mb-4 text-white">{{ $ts->seccion_titulo ?? 'Lo Que Dicen Nuestras Clientas' }}</h1>
        </div>
        <div class="owl-carousel testimonial-carousel">
            @forelse($testimonios ?? [] as $t)
                @php
                    $esCap = ($t->tipo ?? 'texto') === 'captura';
                @endphp

                @if($esCap)
                {{-- ── Tipo captura: muestra sólo la imagen de evidencia ── --}}
                @php
                    $captura = $t->url_captura ? \App\Support\SparlexPageData::img($t->url_captura) : null;
                @endphp
                @if($captura)
                @php $link = trim($t->url_link ?? ''); @endphp
                <div class="testimonial-item rounded p-4 d-flex align-items-center justify-content-center"
                     style="position:relative;@if($link)cursor:pointer;@endif"
                     @if($link) ondblclick="window.open('{{ $link }}','_blank')" title="Doble clic para ver más" @endif>
                    <img src="{{ $captura }}"
                         alt="{{ $t->nombre ?? 'Evidencia WhatsApp' }}"
                         loading="lazy"
                         decoding="async"
                         style="max-width:100%;max-height:340px;border-radius:12px;object-fit:contain;
                                @if($link) cursor:pointer; @endif"
                         @if($link) ondblclick="window.open('{{ $link }}','_blank')" @endif>
                    @if($link)
                    <div style="position:absolute;bottom:12px;right:16px;
                                background:rgba(0,0,0,.55);color:#fff;
                                font-size:10px;padding:3px 8px;border-radius:20px;
                                pointer-events:none;">
                        Doble clic para abrir
                    </div>
                    @endif
                </div>
                @endif

                @else
                {{-- ── Tipo texto: avatar + nombre + testimonio ── --}}
                @php
                    $avatar = $t->url_avatar ? \App\Support\SparlexPageData::img($t->url_avatar) : asset('temp02/img/testimonial-1.jpg');
                    $stars  = (int) round($t->calificacion ?? 5);
                @endphp
                <div class="testimonial-item rounded p-4">
                    <div class="row">
                        <div class="col-4">
                            <div class="d-flex flex-column mx-auto text-center">
                                <div class="rounded-circle mb-4 d-flex align-items-center justify-content-center mx-auto"
                                     style="border:dashed;border-color:var(--bs-white);width:100px;height:100px;overflow:hidden;">
                                    <img src="{{ $avatar }}"
                                         onerror="this.onerror=null;this.src='{{ asset('temp02/img/testimonial-1.jpg') }}'"
                                         class="img-fluid rounded-circle"
                                         loading="lazy"
                                         decoding="async"
                                         style="width:100%;height:100%;object-fit:cover;" alt="">
                                </div>
                                <h4 class="mb-1 text-primary">{{ $t->nombre }}</h4>
                                <p class="m-0 text-white" style="font-size:.85rem;">{{ $t->subtitulo }}</p>
                                @if($stars > 0)
                                <div class="mt-2" style="color:#f97316;font-size:14px;">
                                    @for($s=1;$s<=5;$s++)
                                        {!! $s <= $stars ? '★' : '☆' !!}
                                    @endfor
                                </div>
                                @endif
                            </div>
                        </div>
                        <div class="col-8">
                            <p class="mb-0 text-white">{{ $t->testimonio }}</p>
                        </div>
                    </div>
                </div>
                @endif
            @empty
                <div class="testimonial-item rounded p-4 text-white text-center">Agregue testimonios desde el administrador.</div>
            @endforelse
        </div>
    </div>
</div>
