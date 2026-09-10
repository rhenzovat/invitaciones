@extends('web.base_sparlex')
@section('title', $metaData->titulo_pagina ?? 'Nuestros Masajes Tántricos | Royal Masajes')
@section('meta_description', $metaData->descripcion_pagina ?? 'Masajes tántricos y sensoriales exclusivos para mujeres en Lima.')
@section('head_page')
<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">
@endsection

@section('content')
@include('web.partials.sparlex.header')

@php $p = $pagMasajes ?? null; @endphp

{{-- ══ HERO BANNER ══ --}}
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg'    => ($p && $p->hero_url_imagen)
                    ? asset($p->hero_url_imagen)
                    : asset('temp02/img/inicio/slider_2.jpg'),
    'heroTag'   => $p->hero_tag    ?? 'Royal Sensory Experience',
    'heroTitle' => $p->hero_titulo ?? 'Nuestros Masajes Tántricos',
    'heroCrumb' => 'Masajes Tántricos',
])

{{-- ══ SECCIÓN FAQ MASAJE TÁNTRICO ════════════════════════════════════════════ --}}
@if(($masajeFaqs ?? collect())->isNotEmpty())
<section id="masaje-tantrico" style="background: linear-gradient(180deg, #fdf8f5 0%, #fff 50%, #fdf8f5 100%); padding: 90px 0 100px;">
    <div class="container">

        {{-- Encabezado de sección --}}
        <div class="text-center mb-5 pb-3">
            <div class="rm-section-label justify-content-center mb-3">
                <span>{{ $p->intro_label ?? 'Conocimiento & Bienestar' }}</span>
            </div>
            <h2 style="font-family:'PT Serif',serif; color:#2c1a0e; font-size:2.5rem; line-height:1.2; margin-bottom:16px;">
                {{ $p->intro_titulo ?? 'Masaje Tántrico —' }}<br>
                <em style="color:#cc6b8e;">{{ $p->intro_titulo2 ?? 'Todo lo que necesitas saber' }}</em>
            </h2>
            <p style="color:#888; font-size:1.05rem; max-width:560px; margin:0 auto;">
                {{ $p->intro_subtitulo ?? 'Descubre la filosofía, los beneficios y la experiencia del masaje tántrico auténtico para mujeres en Lima.' }}
            </p>
            <div style="width:60px; height:3px; background:linear-gradient(90deg,#cc6b8e,#b8860b); border-radius:2px; margin:24px auto 0;"></div>
        </div>

        {{-- Acordeón FAQ --}}
        <div class="row justify-content-center">
            <div class="col-lg-9 col-xl-8">
                <div class="rm-faq-accordion" id="faqAccordion">
                    @foreach($masajeFaqs as $faq)
                    @php $faqId = 'faq' . $faq->id; $isFirst = $loop->first; @endphp
                    <div class="rm-faq-item {{ $isFirst ? 'open' : '' }}" data-faq="{{ $faqId }}">
                        <button class="rm-faq-trigger" onclick="toggleFaq('{{ $faqId }}', this)" type="button">
                            <span class="rm-faq-icon-wrap">
                                <i class="{{ $faq->icono ?? 'fas fa-spa' }}"></i>
                            </span>
                            <span class="rm-faq-question">{{ $faq->titulo }}</span>
                            <span class="rm-faq-chevron">
                                <i class="fas fa-chevron-down"></i>
                            </span>
                        </button>
                        <div class="rm-faq-body {{ $isFirst ? 'visible' : '' }}" id="{{ $faqId }}">
                            <div class="rm-faq-content">
                                {!! $faq->contenido !!}
                            </div>
                        </div>
                    </div>
                    @endforeach
                </div>

                {{-- CTA debajo del acordeón --}}
                <div class="text-center mt-5 pt-2">
                    <p style="color:#888; font-size:0.95rem; margin-bottom:20px;">
                        {{ $p->cta_texto ?? '¿Tienes más preguntas? Escríbenos directamente' }}
                    </p>
                    <a href="{{ $urlWhatsapp ?? '#' }}"
                       class="rm-mc-btn-reserve rm-mc-btn-reserve--lg">
                        <i class="fab fa-whatsapp"></i>
                        {{ $p->cta_btn ?? 'Reservar mi sesión' }}
                    </a>
                </div>
            </div>
        </div>

    </div>
</section>

<style>
.rm-faq-accordion { display:flex; flex-direction:column; gap:12px; }
.rm-faq-item {
    background:#fff; border-radius:16px;
    border:1.5px solid #f0e0e8; overflow:hidden;
    transition:border-color .25s,box-shadow .25s;
}
.rm-faq-item:hover, .rm-faq-item.open {
    border-color:#cc6b8e;
    box-shadow:0 6px 24px rgba(204,107,142,0.12);
}
.rm-faq-trigger {
    width:100%; background:none; border:none;
    padding:20px 24px; display:flex; align-items:center;
    gap:16px; cursor:pointer; text-align:left;
}
.rm-faq-icon-wrap {
    flex-shrink:0; width:42px; height:42px; border-radius:50%;
    background:linear-gradient(135deg,#fdf0f5,#fce8ef);
    display:flex; align-items:center; justify-content:center;
    transition:background .25s;
}
.rm-faq-item.open .rm-faq-icon-wrap { background:linear-gradient(135deg,#cc6b8e,#a0455e); }
.rm-faq-icon-wrap i { font-size:16px; color:#cc6b8e; transition:color .25s; }
.rm-faq-item.open .rm-faq-icon-wrap i { color:#fff; }
.rm-faq-question {
    flex:1; font-family:'PT Serif',serif;
    font-size:1.05rem; font-weight:700; color:#2c1a0e; line-height:1.4;
}
.rm-faq-chevron {
    flex-shrink:0; width:32px; height:32px; border-radius:50%;
    background:#fdf0f5; display:flex; align-items:center; justify-content:center;
    transition:background .25s,transform .3s;
}
.rm-faq-item.open .rm-faq-chevron { background:#cc6b8e; transform:rotate(180deg); }
.rm-faq-chevron i { font-size:13px; color:#cc6b8e; transition:color .25s; }
.rm-faq-item.open .rm-faq-chevron i { color:#fff; }
.rm-faq-body { max-height:0; overflow:hidden; transition:max-height .4s ease; }
.rm-faq-body.visible { max-height:900px; }
.rm-faq-content {
    padding:0 24px 24px 82px; color:#555;
    font-size:0.97rem; line-height:1.85;
}
.rm-faq-content p { margin-bottom:12px; }
.rm-faq-content p:last-child { margin-bottom:0; }
.rm-faq-content ul { padding-left:0; list-style:none; margin-bottom:12px; }
.rm-faq-content ul li { padding:5px 0 5px 6px; color:#555; font-size:0.95rem; }
.rm-faq-content strong { color:#2c1a0e; }
.rm-faq-content em {
    color:#7a5c4a; font-style:italic; display:block;
    border-left:3px solid #cc6b8e; padding-left:16px; margin:12px 0;
}
@media (max-width:576px) {
    .rm-faq-content { padding:0 16px 20px 16px; }
    .rm-faq-trigger { padding:16px; gap:12px; }
    .rm-faq-question { font-size:.95rem; }
}
</style>

<script>
function toggleFaq(id, btn) {
    var item   = btn.closest('.rm-faq-item');
    var body   = document.getElementById(id);
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.rm-faq-item.open').forEach(function(el) {
        el.classList.remove('open');
        el.querySelector('.rm-faq-body').classList.remove('visible');
    });
    if (!isOpen) { item.classList.add('open'); body.classList.add('visible'); }
}
</script>
@endif

@include('web.partials.sparlex.footer')

@endsection
