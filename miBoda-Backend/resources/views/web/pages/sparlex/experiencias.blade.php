@extends('web.base_sparlex')
@section('title', $metaData->titulo_pagina ?? 'Experiencias | Royal Sensory Experience Massage')
@section('meta_description', $metaData->descripcion_pagina ?? 'Experiencias sensoriales y masajes exclusivos para mujeres en Lima.')
@section('head_page')
<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">
@endsection
@section('content')
@include('web.partials.sparlex.header')

@php
$wa = $urlWhatsapp ?? '#';
$p  = $pagExp ?? null;   // WebPaginaExperiencias record (can be null)

// Color único para todos los encabezados de categoría (referencia: Bienestar Femenino)
$catHeaderColor = '#a0654a';
$catHeaderGrad  = 'linear-gradient(135deg,#a0654a,#7a4a35)';

$categorias = [
    'todas'    => ['label'=>'Todas las Experiencias', 'icon'=>'fas fa-spa',           'color'=>'#b8860b',  'bg'=>'#fdf8f5', 'count'=>count($experiencias)],
    'tantrico' => ['label'=>($p->cat_tantrico_titulo ?? 'Tántricas & Sensoriales'), 'icon'=>'fas fa-yin-yang', 'color'=>'#cc6b8e', 'bg'=>'#fdf0f5', 'count'=>count($tantrico)],
    'bienestar'=> ['label'=>($p->cat_bienestar_titulo ?? 'Bienestar Femenino'),     'icon'=>'fas fa-heart',    'color'=>'#a0654a', 'bg'=>'#fdf1ec', 'count'=>count($bienestar)],
    'corporal' => ['label'=>($p->cat_corporal_titulo  ?? 'Renovación Corporal'),    'icon'=>'fas fa-dumbbell', 'color'=>'#6b4423', 'bg'=>'#f5ede4', 'count'=>count($corporal)],
    'estetica' => ['label'=>($p->cat_estetica_titulo  ?? 'Modelación & Estética'),  'icon'=>'fas fa-magic',    'color'=>'#8b3a52', 'bg'=>'#fbeef2', 'count'=>count($estetica)],
];

$catHeaders = [
    'tantrico' => [
        'label'   => 'EXPERIENCIAS TÁNTRICAS SENSORIALES',
        'titulo'  => $p->cat_tantrico_titulo ?? 'Tántricas & Sensoriales',
        'desc'    => $p->cat_tantrico_desc   ?? 'Viajes de reconexión interior y despertar sensorial diseñados exclusivamente para mujeres.',
        'icon'    => 'fas fa-yin-yang',
        'color'   => $catHeaderColor,
        'grad'    => $catHeaderGrad,
    ],
    'bienestar'=> [
        'label'   => 'BIENESTAR Y RELAJACIÓN FEMENINA',
        'titulo'  => $p->cat_bienestar_titulo ?? 'Bienestar Femenino',
        'desc'    => $p->cat_bienestar_desc   ?? 'Rituales y masajes que nutren el cuerpo, calman la mente y restauran tu energía vital.',
        'icon'    => 'fas fa-heart',
        'color'   => $catHeaderColor,
        'grad'    => $catHeaderGrad,
    ],
    'corporal' => [
        'label'   => 'RENOVACIÓN CORPORAL PROFUNDA',
        'titulo'  => $p->cat_corporal_titulo ?? 'Renovación Corporal',
        'desc'    => $p->cat_corporal_desc   ?? 'Técnicas avanzadas que trabajan los tejidos más profundos para aliviar dolencias y liberar tensiones.',
        'icon'    => 'fas fa-dumbbell',
        'color'   => $catHeaderColor,
        'grad'    => $catHeaderGrad,
    ],
    'estetica' => [
        'label'   => 'MODELACIÓN Y ESTÉTICA CORPORAL',
        'titulo'  => $p->cat_estetica_titulo ?? 'Modelación & Estética',
        'desc'    => $p->cat_estetica_desc   ?? 'Tratamientos de última generación para moldear, tonificar y embellecer tu figura.',
        'icon'    => 'fas fa-magic',
        'color'   => $catHeaderColor,
        'grad'    => $catHeaderGrad,
    ],
];
@endphp

{{-- ══ HERO ══════════════════════════════════════════════════════════════ --}}
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg'    => \App\Support\SparlexPageData::img($pagExp->hero_url_imagen ?? null, 'temp02/img/inicio/slider_1.jpg'),
    'heroTag'   => $pagExp->hero_tag    ?? 'Royal Sensory Experience Massage',
    'heroTitle' => $pagExp->hero_titulo ?? 'Nuestras Experiencias',
    'heroCrumb' => 'Experiencias',
])

{{-- ══ INTRO STRIP ═══════════════════════════════════════════════════════ --}}
<section style="background:#2c1a0e; padding:32px 0;">
    <div class="container">
        <div class="row g-4 text-center text-white">
            <div class="col-6 col-md-3">
                <div class="rm-exp-stat">
                    <span class="rm-exp-stat-num" style="color:#cc6b8e;">{{ $pagExp->stat1_valor ?? '16' }}</span>
                    <span class="rm-exp-stat-lbl">{{ $pagExp->stat1_label ?? 'Experiencias únicas' }}</span>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="rm-exp-stat">
                    <span class="rm-exp-stat-num" style="color:#b8860b;">{{ $pagExp->stat2_valor ?? '4' }}</span>
                    <span class="rm-exp-stat-lbl">{{ $pagExp->stat2_label ?? 'Categorías' }}</span>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="rm-exp-stat">
                    <span class="rm-exp-stat-num" style="color:#cc6b8e;">{{ $pagExp->stat3_valor ?? '100%' }}</span>
                    <span class="rm-exp-stat-lbl">{{ $pagExp->stat3_label ?? 'Privado & Confidencial' }}</span>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="rm-exp-stat">
                    <span class="rm-exp-stat-num" style="color:#b8860b;">{{ $pagExp->stat4_valor ?? 'Solo' }}</span>
                    <span class="rm-exp-stat-lbl">{{ $pagExp->stat4_label ?? 'Para Mujeres' }}</span>
                </div>
            </div>
        </div>
    </div>
</section>

{{-- ══ FILTROS / TABS ═════════════════════════════════════════════════════ --}}
<section style="background:#fdf8f5; padding:56px 0 0; position:sticky; top:0; z-index:100; box-shadow:0 2px 16px rgba(44,26,14,0.08);">
    <div class="container">
        <div class="text-center mb-4">
            <div class="rm-section-label justify-content-center"><span>{{ $pagExp->intro_label ?? 'Elige tu Experiencia' }}</span></div>
            <h2 style="font-family:'PT Serif',serif; color:#2c1a0e; font-size:2.2rem; line-height:1.2;">
                {{ $pagExp->intro_titulo ?? 'Royal Sensory Experience' }}<br>
                <em style="color:#cc6b8e;">{{ $pagExp->intro_titulo2 ?? 'Diseñado para ti' }}</em>
            </h2>
        </div>

        {{-- Tabs de categoría --}}
        <div class="rm-cat-tabs" id="catTabs">
            @foreach($categorias as $key => $cat)
            <button
                class="rm-cat-tab {{ $key === 'todas' ? 'active' : '' }}"
                data-cat="{{ $key }}"
                style="--tab-color:{{ $cat['color'] }};"
                onclick="filterCat('{{ $key }}', this)"
            >
                <i class="{{ $cat['icon'] }}"></i>
                <span class="rm-cat-tab-label">{{ $cat['label'] }}</span>
                <span class="rm-cat-tab-count">{{ $cat['count'] }}</span>
            </button>
            @endforeach
        </div>
    </div>
</section>

{{-- ══ GRID DE EXPERIENCIAS ════════════════════════════════════════════════ --}}
<section style="background:#fdf8f5; padding:40px 0 80px;" id="experiencias-grid">
    <div class="container">

        @foreach(['tantrico','bienestar','corporal','estetica'] as $catKey)
        @php $ch = $catHeaders[$catKey]; $items = $$catKey; @endphp

        {{-- Encabezado de categoría --}}
        <div class="rm-cat-section" data-section="{{ $catKey }}">
            <div class="rm-cat-header" style="--cat-grad:{{ $ch['grad'] }};">
                <div class="rm-cat-header-icon">
                    <i class="{{ $ch['icon'] }}" style="color:#fff; font-size:22px;"></i>
                </div>
                <div>
                    <p style="font-size:10px; font-weight:700; letter-spacing:3px; color:rgba(255,255,255,0.7); text-transform:uppercase; margin:0;">{{ $ch['label'] }}</p>
                    <h3 style="font-family:'PT Serif',serif; color:#fff; font-size:1.6rem; margin:2px 0 4px;">{{ $ch['titulo'] }}</h3>
                    <p style="color:rgba(255,255,255,0.8); font-size:0.88rem; margin:0;">{{ $ch['desc'] }}</p>
                </div>
                <div class="rm-cat-header-badge">{{ count($items) }} experiencias</div>
            </div>

            {{-- Cards de experiencias --}}
            <div class="row g-4 mt-1 mb-5">
                @foreach($items as $exp)
                @php
                    $imgSrc = \App\Support\SparlexPageData::img($exp->url_imagen, 'temp02/img/inicio/slider_1.jpg');
                    $btnUrl = $exp->btn_url ?: $wa;
                @endphp
                <div class="col-md-6 col-lg-4 rm-exp-card-wrap" data-cat="{{ $exp->categoria }}">
                    <article class="rm-exp-card" style="--cat-color:{{ $ch['color'] }}; --cat-grad:{{ $ch['grad'] }};">

                        {{-- Imagen --}}
                        <div class="rm-exp-card-img">
                            <img src="{{ $imgSrc }}"
                                 onerror="this.onerror=null;this.src='{{ asset('temp02/img/inicio/slider_1.jpg') }}'"
                                 alt="{{ $exp->titulo }}"
                                 loading="lazy">
                            {{-- Overlay con gradiente --}}
                            <div class="rm-exp-card-overlay"></div>
                            {{-- Badge duración --}}
                            <div class="rm-exp-card-duration">
                                <i class="fas fa-clock"></i> {{ $exp->duracion }}
                            </div>
                            {{-- Badge categoría --}}
                            <div class="rm-exp-card-badge">{{ $exp->badge }}</div>
                        </div>

                        {{-- Body --}}
                        <div class="rm-exp-card-body">
                            <h4 class="rm-exp-card-title">{{ $exp->titulo }}</h4>
                            @if($exp->subtitulo)
                            <p class="rm-exp-card-subtitle">{{ $exp->subtitulo }}</p>
                            @endif
                            <p class="rm-exp-card-desc">{{ $exp->descripcion }}</p>

                            {{-- Footer --}}
                            <div class="rm-exp-card-footer">
                                @if($exp->precio_nota)
                                <span class="rm-exp-card-price">
                                    <i class="fas fa-tag"></i> {{ $exp->precio_nota }}
                                </span>
                                @endif
                                <a href="{{ $btnUrl }}" class="rm-exp-card-btn" target="_blank" rel="noopener">
                                    <i class="fab fa-whatsapp"></i>
                                    {{ $exp->btn_texto ?? 'Reservar' }}
                                </a>
                            </div>
                        </div>
                    </article>
                </div>
                @endforeach
            </div>
        </div>
        @endforeach

        {{-- Estado vacío para filtros --}}
        <div id="rm-no-results" style="display:none; text-align:center; padding:80px 0;">
            <i class="fas fa-spa" style="font-size:56px; color:#e8d0db; display:block; margin-bottom:16px;"></i>
            <p style="color:#aaa; font-size:1.1rem;">No hay experiencias en esta categoría</p>
        </div>
    </div>
</section>

{{-- ══ CTA FINAL ══════════════════════════════════════════════════════════ --}}
<section style="
    background:linear-gradient(135deg,#2c1a0e 0%,#4a2a15 50%,#2c1a0e 100%);
    padding:80px 0; position:relative; overflow:hidden;">
    {{-- Decoración fondo --}}
    <div style="position:absolute;top:-60px;right:-60px;width:280px;height:280px;
                border-radius:50%;background:rgba(204,107,142,0.08);pointer-events:none;"></div>
    <div style="position:absolute;bottom:-80px;left:-40px;width:220px;height:220px;
                border-radius:50%;background:rgba(184,134,11,0.07);pointer-events:none;"></div>

    <div class="container text-center" style="position:relative;z-index:2;">
        <div class="rm-section-label justify-content-center mb-3">
            <span style="background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.9);">Reserva Ahora</span>
        </div>
        <h2 style="font-family:'PT Serif',serif; color:#fff; font-size:2.4rem; line-height:1.2; margin-bottom:16px;">
            {!! $pagExp->cta_titulo ?? '¿Lista para tu experiencia <br><em style="color:#cc6b8e;">Royal Sensory?</em>' !!}
        </h2>
        <p style="color:rgba(255,255,255,0.7); font-size:1.05rem; max-width:500px; margin:0 auto 32px;">
            {!! nl2br(e($pagExp->cta_texto ?? "Cada sesión es única, privada y diseñada para ti.\nSolo para mujeres. Solo con reserva previa.")) !!}
        </p>
        <div class="d-flex flex-wrap justify-content-center gap-3">
            <a href="{{ $wa }}"
               class="rm-mc-btn-reserve rm-mc-btn-reserve--lg">
                <i class="fab fa-whatsapp"></i>
                {{ $pagExp->cta_btn ?? 'Reservar por WhatsApp' }}
            </a>
            <a href="/masajes"
               style="display:inline-flex; align-items:center; gap:10px;
                      background:rgba(255,255,255,0.08); border:1.5px solid rgba(255,255,255,0.25);
                      color:#fff; padding:16px 36px; border-radius:50px;
                      text-decoration:none; font-weight:600; font-size:1rem;
                      transition:background .2s,border-color .2s;"
               onmouseover="this.style.background='rgba(255,255,255,0.14)'"
               onmouseout="this.style.background='rgba(255,255,255,0.08)'">
                <i class="fas fa-spa"></i>
                Masajes Tántricos
            </a>
        </div>
    </div>
</section>

@include('web.partials.sparlex.footer')

{{-- ══ ESTILOS ════════════════════════════════════════════════════════════ --}}
<style>
/* ── Stats bar ── */
.rm-exp-stat { display:flex; flex-direction:column; align-items:center; gap:4px; }
.rm-exp-stat-num { font-family:'PT Serif',serif; font-size:2rem; font-weight:700; line-height:1; }
.rm-exp-stat-lbl { font-size:0.78rem; text-transform:uppercase; letter-spacing:1.5px; opacity:.7; }

/* ── Category Tabs ── */
.rm-cat-tabs {
    display:flex; gap:8px; overflow-x:auto; padding-bottom:0;
    scrollbar-width:none; justify-content:center; flex-wrap:wrap;
}
.rm-cat-tabs::-webkit-scrollbar { display:none; }
.rm-cat-tab {
    display:flex; align-items:center; gap:8px;
    border:2px solid rgba(44,26,14,0.12);
    background:#fff; color:#555; border-radius:50px;
    padding:10px 20px; cursor:pointer; font-size:0.88rem; font-weight:600;
    transition:all .25s; white-space:nowrap;
}
.rm-cat-tab:hover { border-color:var(--tab-color); color:var(--tab-color); background:rgba(255,255,255,0.9); }
.rm-cat-tab.active { background:var(--tab-color); border-color:var(--tab-color); color:#fff; box-shadow:0 6px 20px rgba(0,0,0,0.18); }
.rm-cat-tab i { font-size:15px; }
.rm-cat-tab-count {
    background:rgba(255,255,255,0.3); color:inherit;
    border-radius:12px; padding:1px 8px; font-size:11px; font-weight:700;
}
.rm-cat-tab.active .rm-cat-tab-count { background:rgba(255,255,255,0.25); }

/* ── Category section header ── */
.rm-cat-header {
    background:var(--cat-grad); border-radius:20px;
    padding:24px 28px; display:flex; align-items:center; gap:20px;
    margin-bottom:8px; position:relative; overflow:hidden;
}
.rm-cat-header::before {
    content:''; position:absolute; top:-30px; right:-30px;
    width:120px; height:120px; border-radius:50%;
    background:rgba(255,255,255,0.08);
}
.rm-cat-header-icon {
    flex-shrink:0; width:52px; height:52px; border-radius:50%;
    background:rgba(255,255,255,0.2);
    display:flex; align-items:center; justify-content:center;
}
.rm-cat-header-badge {
    margin-left:auto; flex-shrink:0;
    background:rgba(255,255,255,0.2); color:#fff;
    border-radius:20px; padding:6px 16px; font-size:13px; font-weight:700;
}

/* ── Experience Card ── */
.rm-exp-card {
    background:#fff; border-radius:20px; overflow:hidden;
    border:1.5px solid #f0e0e8; height:100%;
    display:flex; flex-direction:column;
    transition:transform .3s, box-shadow .3s, border-color .3s;
}
.rm-exp-card:hover {
    transform:translateY(-8px);
    box-shadow:0 20px 48px rgba(44,26,14,0.16);
    border-color:var(--cat-color);
}
.rm-exp-card-img {
    position:relative; height:220px; overflow:hidden;
}
.rm-exp-card-img img {
    width:100%; height:100%; object-fit:cover;
    transition:transform .5s;
}
.rm-exp-card:hover .rm-exp-card-img img { transform:scale(1.07); }
.rm-exp-card-overlay {
    position:absolute; inset:0;
    background:linear-gradient(to bottom, transparent 40%, rgba(20,10,5,0.65) 100%);
}
.rm-exp-card-duration {
    position:absolute; top:12px; left:12px;
    background:rgba(20,10,5,0.75); color:#fff;
    border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600;
    display:flex; align-items:center; gap:5px; backdrop-filter:blur(4px);
}
.rm-exp-card-badge {
    position:absolute; top:12px; right:12px;
    background:var(--cat-grad); color:#fff;
    border-radius:20px; padding:4px 12px; font-size:10px;
    font-weight:800; letter-spacing:1px; text-transform:uppercase;
}
.rm-exp-card-body {
    padding:20px 22px; display:flex; flex-direction:column; flex:1;
}
.rm-exp-card-title {
    font-family:'PT Serif',serif; color:#2c1a0e;
    font-size:1.1rem; font-weight:700; margin:0 0 4px; line-height:1.3;
}
.rm-exp-card-subtitle {
    color:var(--cat-color); font-size:0.82rem; font-weight:600;
    text-transform:uppercase; letter-spacing:1.5px; margin:0 0 10px;
}
.rm-exp-card-desc {
    color:#666; font-size:0.88rem; line-height:1.7; flex:1; margin:0 0 16px;
}
.rm-exp-card-footer {
    display:flex; align-items:center; justify-content:space-between;
    gap:8px; padding-top:14px; border-top:1px solid #f0e0e8;
}
.rm-exp-card-price {
    font-size:0.8rem; color:#888; display:flex; align-items:center; gap:4px;
}
.rm-exp-card-btn {
    display:inline-flex; align-items:center; gap:6px;
    background:var(--cat-grad); color:#fff;
    border-radius:22px; padding:8px 18px;
    text-decoration:none; font-size:0.82rem; font-weight:700;
    transition:opacity .2s, transform .2s;
    white-space:nowrap; flex-shrink:0;
}
.rm-exp-card-btn:hover { opacity:.88; transform:scale(1.04); color:#fff; }

/* ── Hidden state for filtering ── */
.rm-exp-card-wrap { transition:opacity .3s, transform .3s; }
.rm-exp-card-wrap.hidden { display:none !important; }
.rm-cat-section.hidden { display:none !important; }

/* ── Responsive ── */
@media (max-width:768px) {
    .rm-cat-header { flex-wrap:wrap; }
    .rm-cat-header-badge { margin-left:0; }
    .rm-cat-tab-label { display:none; }
    .rm-cat-tab { padding:10px 14px; }
}
</style>

{{-- ══ SCRIPT DE FILTRADO ════════════════════════════════════════════════ --}}
<script>
function filterCat(cat, btn) {
    // Tabs
    document.querySelectorAll('.rm-cat-tab').forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');

    var sections = document.querySelectorAll('.rm-cat-section');
    var cards    = document.querySelectorAll('.rm-exp-card-wrap');
    var noRes    = document.getElementById('rm-no-results');

    if (cat === 'todas') {
        sections.forEach(function(s) { s.classList.remove('hidden'); });
        cards.forEach(function(c) { c.classList.remove('hidden'); });
        noRes.style.display = 'none';
        return;
    }

    // Mostrar/ocultar secciones completas
    sections.forEach(function(s) {
        s.classList.toggle('hidden', s.dataset.section !== cat);
    });

    // Scroll suave al inicio del grid
    var grid = document.getElementById('experiencias-grid');
    if (grid) {
        setTimeout(function() {
            grid.scrollIntoView({ behavior:'smooth', block:'start' });
        }, 80);
    }

    noRes.style.display = 'none';
}
</script>
@endsection
