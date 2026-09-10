@extends('web.base_sparlex')
@section('title', 'Publicaciones | Royal Masajes Lima')
@section('head_page')
<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">
<style>
/* ══ PUBLICACIONES GRID ══ */
.rm-pub-section { background:#fdf8f5; padding:70px 0 80px; }

.rm-pub-filters {
    display:flex; gap:8px; flex-wrap:wrap; justify-content:center;
    margin-bottom:44px;
}
.rm-pub-filter {
    padding:8px 20px; border-radius:50px;
    border:1.5px solid #e8d5c0; background:#fff;
    font-family:'Open Sans',sans-serif; font-size:12px; font-weight:700;
    color:#7a6020; cursor:pointer; letter-spacing:.4px;
    transition:all .25s ease; white-space:nowrap;
}
.rm-pub-filter:hover, .rm-pub-filter.active {
    background:linear-gradient(135deg,#cc6b8e,#a0455e);
    border-color:transparent; color:#fff;
    box-shadow:0 4px 16px rgba(204,107,142,.3);
}

/* Cards */
.rm-pub-card {
    background:#fff; border-radius:18px; overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,.07);
    transition:transform .3s,box-shadow .3s;
    display:flex; flex-direction:column; height:100%;
}
.rm-pub-card:hover { transform:translateY(-6px); box-shadow:0 16px 44px rgba(0,0,0,.13); }

.rm-pub-card__img {
    position:relative; height:220px; overflow:hidden; flex-shrink:0;
}
.rm-pub-card__img img {
    width:100%; height:100%; object-fit:cover;
    transition:transform .5s ease;
}
.rm-pub-card:hover .rm-pub-card__img img { transform:scale(1.07); }

.rm-pub-card__chip {
    position:absolute; top:14px; left:14px;
    background:linear-gradient(135deg,#cc6b8e,#a0455e);
    color:#fff; font-size:10px; font-weight:700;
    letter-spacing:1.2px; text-transform:uppercase;
    padding:4px 12px; border-radius:50px;
}

.rm-pub-card__body { padding:22px; display:flex; flex-direction:column; flex:1; }
.rm-pub-card__date { font-size:11px; color:#b8860b; font-weight:700; letter-spacing:.5px; margin-bottom:8px; display:flex; align-items:center; gap:5px; }
.rm-pub-card__title { font-family:'PT Serif',Georgia,serif; font-size:1.1rem; color:#2c1a0e; font-weight:700; line-height:1.35; margin-bottom:10px; text-decoration:none; display:block; transition:color .2s; }
.rm-pub-card__title:hover { color:#cc6b8e; }
.rm-pub-card__resumen { font-size:.86rem; color:#777; line-height:1.65; flex:1; margin-bottom:16px; }
.rm-pub-card__footer { display:flex; align-items:center; justify-content:space-between; padding-top:14px; border-top:1px solid #f5e8e8; margin-top:auto; }
.rm-pub-card__autor { font-size:11px; color:#aaa; display:flex; align-items:center; gap:4px; }
.rm-pub-card__link { font-size:12px; font-weight:700; color:#cc6b8e; text-decoration:none; display:flex; align-items:center; gap:4px; transition:gap .2s; }
.rm-pub-card__link:hover { gap:8px; }

/* Card destacada (primera) */
.rm-pub-card--featured {
    grid-column:1 / -1;
    flex-direction:row; height:300px;
}
.rm-pub-card--featured .rm-pub-card__img { width:42%; height:100%; flex-shrink:0; }
.rm-pub-card--featured .rm-pub-card__title { font-size:1.4rem; }
.rm-pub-card--featured .rm-pub-card__resumen { font-size:.92rem; -webkit-line-clamp:4; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden; }

/* Grid */
.rm-pub-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }

/* Paginación */
.rm-pub-pagination { display:flex; justify-content:center; gap:8px; margin-top:48px; flex-wrap:wrap; }
.rm-pub-page-btn {
    width:40px; height:40px; border-radius:50%; border:1.5px solid #e8d5c0;
    background:#fff; font-family:'Open Sans',sans-serif; font-size:13px;
    font-weight:700; color:#7a6020; cursor:pointer; transition:all .2s;
    display:flex; align-items:center; justify-content:center;
}
.rm-pub-page-btn:hover, .rm-pub-page-btn.active {
    background:linear-gradient(135deg,#cc6b8e,#a0455e);
    border-color:transparent; color:#fff;
}
.rm-pub-page-btn:disabled { opacity:.4; cursor:default; }

/* Newsletter CTA */
.rm-pub-newsletter {
    background:linear-gradient(135deg,#2c1a0e,#4a2a15);
    padding:56px 20px; text-align:center;
}
.rm-pub-newsletter h3 { font-family:'PT Serif',serif; color:#fff; font-size:clamp(1.4rem,3vw,2rem); margin-bottom:8px; }
.rm-pub-newsletter p { color:rgba(255,255,255,.7); font-size:.93rem; margin-bottom:24px; }
.rm-pub-newsletter a {
    background:linear-gradient(135deg,#a0654a,#7a4a35); color:#fff;
    font-weight:700; font-size:14px; padding:13px 36px; border-radius:50px;
    text-decoration:none; display:inline-flex; align-items:center; gap:8px;
    box-shadow:0 6px 20px rgba(122,74,53,.35); transition:opacity .2s,transform .2s;
}
.rm-pub-newsletter a:hover { opacity:.9; transform:translateY(-2px); color:#fff; }

/* Responsive */
@media(max-width:991px){ .rm-pub-grid { grid-template-columns:repeat(2,1fr); } }
@media(max-width:575px){
    .rm-pub-grid { grid-template-columns:1fr; }
    .rm-pub-card--featured { flex-direction:column; height:auto; }
    .rm-pub-card--featured .rm-pub-card__img { width:100%; height:220px; }
}
</style>
@endsection

@section('content')
@include('web.partials.sparlex.header')

{{-- ══ HERO BANNER ══ --}}
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg'    => asset('temp02/img/gallery-9.jpg'),
    'heroTag'   => 'Consejos de Bienestar',
    'heroTitle' => 'Publicaciones',
    'heroCrumb' => 'Publicaciones',
])

{{-- ══ PUBLICACIONES ══ --}}
<section class="rm-pub-section">
    <div class="container">

        {{-- Header sección --}}
        <div class="text-center mb-5">
            <div class="rm-section-label justify-content-center">
                <span>Bienestar & Lifestyle</span>
            </div>
            <h2 style="font-family:'PT Serif',serif; color:#2c1a0e; font-size:clamp(1.8rem,4vw,2.6rem); margin-bottom:10px;">
                {!! $seccionTitulo ?? 'Publicaciones <span style="color:#cc6b8e;">Recientes</span>' !!}
            </h2>
            @if(!empty($seccionSub))
            <p style="color:#888; font-size:.93rem; max-width:600px; margin:0 auto;">{{ $seccionSub }}</p>
            @endif
        </div>

        {{-- Filtros por categoría --}}
        @php
            $categorias = $publicaciones->pluck('categoria')->unique()->filter()->values();
        @endphp
        @if($categorias->count() > 1)
        <div class="rm-pub-filters" id="pubFilters">
            <button class="rm-pub-filter active" data-cat="todas">Todas</button>
            @foreach($categorias as $cat)
            <button class="rm-pub-filter" data-cat="{{ Str::slug($cat) }}">{{ $cat }}</button>
            @endforeach
        </div>
        @endif

        {{-- Grid --}}
        <div class="rm-pub-grid" id="pubGrid">
            @forelse($publicaciones as $i => $pub)
            @php
                $imgPub = \App\Support\SparlexPageData::img($pub->url_imagen, 'temp02/img/gallery-1.jpg');
                $url    = $pub->slug ? url('/publicaciones/'.$pub->slug) : ($pub->url_enlace ?: '#');
                $fecha  = $pub->fecha_publicacion ? \Carbon\Carbon::parse($pub->fecha_publicacion)->locale('es')->isoFormat('D [de] MMMM, YYYY') : '';
                $cat    = Str::slug($pub->categoria ?? 'publicacion');
            @endphp
            <div class="rm-pub-card {{ $i === 0 ? 'rm-pub-card--featured' : '' }}" data-cat="{{ $cat }}">
                <div class="rm-pub-card__img">
                    <img src="{{ $imgPub }}" alt="{{ $pub->titulo }}" loading="lazy">
                    <span class="rm-pub-card__chip">{{ $pub->chip ?? ($pub->categoria ?? 'Publicación') }}</span>
                </div>
                <div class="rm-pub-card__body">
                    @if($fecha)
                    <div class="rm-pub-card__date">
                        <i class="far fa-calendar-alt"></i> {{ $fecha }}
                    </div>
                    @endif
                    <a href="{{ $url }}" class="rm-pub-card__title">{{ $pub->titulo }}</a>
                    <p class="rm-pub-card__resumen">{{ $pub->resumen }}</p>
                    <div class="rm-pub-card__footer">
                        <span class="rm-pub-card__autor">
                            <i class="fas fa-user-circle" style="color:#cc6b8e;"></i>
                            {{ $pub->autor ?? 'Royal Masajes' }}
                        </span>
                        <a href="{{ $url }}" class="rm-pub-card__link">
                            Leer más <i class="fas fa-arrow-right" style="font-size:10px;"></i>
                        </a>
                    </div>
                </div>
            </div>
            @empty
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#aaa;">
                <i class="fas fa-newspaper" style="font-size:3rem; opacity:.3; margin-bottom:16px; display:block;"></i>
                <p>Próximamente nuevas publicaciones.</p>
            </div>
            @endforelse
        </div>

        {{-- Paginación --}}
        @php $totalPages = (int) ceil(max(1, $total) / max(1, $porPagina)); @endphp
        @if($totalPages > 1)
        <div class="rm-pub-pagination">
            @for($p = 1; $p <= $totalPages; $p++)
            <a href="{{ url('/publicaciones?page='.$p) }}"
               class="rm-pub-page-btn {{ $p == $pagina ? 'active' : '' }}">
                {{ $p }}
            </a>
            @endfor
        </div>
        @endif

    </div>
</section>

{{-- ══ NEWSLETTER CTA ══ --}}
<section class="rm-pub-newsletter">
    <div class="container">
        <h3>¿Lista para vivir la experiencia?</h3>
        <p>Reserva tu sesión hoy — discreción y calidad garantizadas.</p>
        <a href="{{ $urlWhatsapp }}" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp"></i> Reservar — 982 311 335
        </a>
    </div>
</section>

@include('web.partials.sparlex.footer')

<script>
(function(){
    const filters = document.querySelectorAll('.rm-pub-filter');
    const cards   = document.querySelectorAll('#pubGrid .rm-pub-card');
    if(!filters.length) return;

    filters.forEach(function(btn){
        btn.addEventListener('click', function(){
            const cat = this.dataset.cat;
            filters.forEach(function(b){ b.classList.remove('active'); });
            this.classList.add('active');

            cards.forEach(function(card){
                if(cat === 'todas' || card.dataset.cat === cat){
                    card.style.display = '';
                    card.style.animation = 'fadeUp .4s ease both';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
})();
</script>
@endsection
