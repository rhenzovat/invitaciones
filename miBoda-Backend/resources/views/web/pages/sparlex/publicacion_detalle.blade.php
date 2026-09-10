@extends('web.base_sparlex')
@section('title', ($publicacion->titulo ?? 'Publicación').' | Royal Masajes Lima')
@section('meta_description', $publicacion->resumen ?? 'Royal Sensory Experience Massage en Lima.')
@if(!empty($publicacion->url_imagen))
@section('og_image', $publicacion->url_imagen)
@endif
@section('head_page')
<link href="{{ asset('temp02/css/pages.css') }}" rel="stylesheet">
<style>
.rm-pub-detail { background:#fdf8f5; padding:60px 0 80px; }
.rm-pub-detail__card { background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 6px 32px rgba(0,0,0,.08); }
.rm-pub-detail__img { width:100%; height:420px; object-fit:cover; display:block; }
.rm-pub-detail__meta { display:flex; align-items:center; gap:16px; flex-wrap:wrap; padding:28px 36px 0; }
.rm-pub-detail__chip { background:linear-gradient(135deg,#cc6b8e,#a0455e); color:#fff; font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; padding:4px 14px; border-radius:50px; }
.rm-pub-detail__date { font-size:12px; color:#b8860b; font-weight:700; display:flex; align-items:center; gap:5px; }
.rm-pub-detail__autor { font-size:12px; color:#aaa; display:flex; align-items:center; gap:4px; }
.rm-pub-detail__title { font-family:'PT Serif',serif; font-size:clamp(1.6rem,3.5vw,2.2rem); color:#2c1a0e; font-weight:700; line-height:1.3; padding:16px 36px 0; margin:0; }
.rm-pub-detail__content { padding:24px 36px 36px; color:#555; line-height:1.85; font-size:.95rem; }
.rm-pub-detail__content h4 { font-family:'PT Serif',serif; color:#2c1a0e; font-size:1.15rem; margin:24px 0 10px; }
.rm-pub-detail__content ul { padding-left:20px; }
.rm-pub-detail__content ul li { margin-bottom:6px; }
.rm-pub-detail__content ul li::marker { color:#cc6b8e; }
.rm-pub-detail__content strong { color:#2c1a0e; }
.rm-pub-detail__divider { border:0; height:1px; background:linear-gradient(to right,transparent,#ead5df,transparent); margin:20px 0; }

/* CTA dentro del detalle */
.rm-pub-detail__cta {
    margin:32px 36px; padding:24px; border-radius:14px;
    background:linear-gradient(135deg,rgba(204,107,142,.08),rgba(245,228,195,.35));
    border-left:4px solid #cc6b8e; display:flex; align-items:center; gap:16px; flex-wrap:wrap;
}
.rm-pub-detail__cta p { margin:0; font-size:.9rem; color:#555; flex:1; }
.rm-pub-detail__cta a {
    background:linear-gradient(135deg,#a0654a,#7a4a35); color:#fff;
    font-weight:700; font-size:13px; padding:10px 22px; border-radius:50px;
    text-decoration:none; white-space:nowrap; display:flex; align-items:center; gap:6px;
    flex-shrink:0; transition:opacity .2s;
}
.rm-pub-detail__cta a:hover { opacity:.9; color:#fff; }

/* Sidebar */
.rm-pub-sidebar-title {
    font-family:'PT Serif',serif; font-size:1.05rem; color:#2c1a0e;
    font-weight:700; margin-bottom:18px; padding-bottom:10px;
    border-bottom:2px solid #ead5df;
}
.rm-pub-recent-card {
    display:flex; gap:12px; align-items:flex-start;
    padding:12px 0; border-bottom:1px solid #f0e8e8;
}
.rm-pub-recent-card:last-child { border-bottom:0; }
.rm-pub-recent-card img { width:70px; height:58px; object-fit:cover; border-radius:10px; flex-shrink:0; }
.rm-pub-recent-card a { font-family:'PT Serif',serif; font-size:.88rem; color:#2c1a0e; font-weight:700; text-decoration:none; line-height:1.35; display:block; transition:color .2s; }
.rm-pub-recent-card a:hover { color:#cc6b8e; }
.rm-pub-recent-card span { font-size:10px; color:#aaa; }

/* Share */
.rm-pub-share { display:flex; align-items:center; gap:10px; flex-wrap:wrap; padding:0 36px 28px; }
.rm-pub-share span { font-size:12px; color:#aaa; font-weight:700; letter-spacing:.5px; }
.rm-pub-share a { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; text-decoration:none; transition:transform .2s,opacity .2s; color:#fff; }
.rm-pub-share a:hover { transform:scale(1.12); }
</style>
@endsection

@section('content')
@include('web.partials.sparlex.header')

{{-- HERO --}}
@include('web.pages.sparlex.partials.page_hero', [
    'heroBg'    => asset($bannerImagenUrl ?? 'temp02/img/gallery-9.jpg'),
    'heroTag'   => $publicacion->categoria ?? 'Publicación',
    'heroTitle' => $bannerTitulo ?? ($publicacion->titulo ?? 'Publicación'),
    'heroCrumb' => 'Publicaciones',
])

<section class="rm-pub-detail">
    <div class="container">
        <div class="row g-5">

            {{-- CONTENIDO PRINCIPAL --}}
            <div class="col-lg-8">
                <div class="rm-pub-detail__card">

                    {{-- Imagen --}}
                    @php
                        $imgDet = \App\Support\SparlexPageData::img($publicacion->url_imagen, 'temp02/img/gallery-1.jpg');
                        $fecha  = $publicacion->fecha_publicacion
                            ? \Carbon\Carbon::parse($publicacion->fecha_publicacion)->locale('es')->isoFormat('D [de] MMMM, YYYY')
                            : '';
                    @endphp
                    <img src="{{ $imgDet }}" alt="{{ $publicacion->titulo }}" class="rm-pub-detail__img">

                    {{-- Meta --}}
                    <div class="rm-pub-detail__meta">
                        @if($publicacion->chip ?? $publicacion->categoria)
                        <span class="rm-pub-detail__chip">{{ $publicacion->chip ?? $publicacion->categoria }}</span>
                        @endif
                        @if($fecha)
                        <span class="rm-pub-detail__date"><i class="far fa-calendar-alt"></i> {{ $fecha }}</span>
                        @endif
                        @if($publicacion->autor)
                        <span class="rm-pub-detail__autor"><i class="fas fa-user-circle" style="color:#cc6b8e;"></i> {{ $publicacion->autor }}</span>
                        @endif
                    </div>

                    {{-- Título --}}
                    <h1 class="rm-pub-detail__title">{{ $publicacion->titulo }}</h1>

                    {{-- Share --}}
                    <div class="rm-pub-share">
                        <span>COMPARTIR:</span>
                        <a href="https://wa.me/?text={{ urlencode($publicacion->titulo . ' — ' . url('/publicaciones/'.$publicacion->slug)) }}"
                           style="background:#25d366;" target="_blank" title="WhatsApp">
                            <i class="fab fa-whatsapp"></i>
                        </a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u={{ urlencode(url('/publicaciones/'.$publicacion->slug)) }}"
                           style="background:#1877f2;" target="_blank" title="Facebook">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://twitter.com/intent/tweet?text={{ urlencode($publicacion->titulo) }}&url={{ urlencode(url('/publicaciones/'.$publicacion->slug)) }}"
                           style="background:#1da1f2;" target="_blank" title="Twitter">
                            <i class="fab fa-twitter"></i>
                        </a>
                    </div>

                    <hr class="rm-pub-detail__divider" style="margin:0 36px;">

                    {{-- Contenido --}}
                    <div class="rm-pub-detail__content">
                        @if($publicacion->resumen)
                        <p style="font-size:1.05rem; color:#555; font-weight:500; line-height:1.75; margin-bottom:20px;">
                            {{ $publicacion->resumen }}
                        </p>
                        <hr class="rm-pub-detail__divider">
                        @endif

                        @if($publicacion->contenido)
                            {!! $publicacion->contenido !!}
                        @endif
                    </div>

                    {{-- CTA reserva --}}
                    <div class="rm-pub-detail__cta">
                        <p>¿Te interesa vivir esta experiencia? Reserva tu sesión en Royal Masajes — atención privada en Lima.</p>
                        <a href="{{ $urlWhatsapp }}" target="_blank">
                            <i class="fab fa-whatsapp"></i> Reservar
                        </a>
                    </div>
                </div>

                {{-- Volver --}}
                <div class="mt-4">
                    <a href="{{ url('/publicaciones') }}" style="font-size:13px; color:#cc6b8e; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                        <i class="fas fa-arrow-left" style="font-size:10px;"></i> Ver todas las publicaciones
                    </a>
                </div>
            </div>

            {{-- SIDEBAR --}}
            <div class="col-lg-4">
                <div style="position:sticky; top:120px; display:flex; flex-direction:column; gap:28px;">

                    {{-- Artículos recientes --}}
                    @if($recientes && $recientes->count() > 0)
                    <div style="background:#fff; border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,.07);">
                        <p class="rm-pub-sidebar-title">Publicaciones Recientes</p>
                        @foreach($recientes as $rec)
                        @php
                            $recImg = \App\Support\SparlexPageData::img($rec->url_imagen, 'temp02/img/gallery-1.jpg');
                            $recUrl = $rec->slug ? url('/publicaciones/'.$rec->slug) : '#';
                            $recFecha = $rec->fecha_publicacion ? \Carbon\Carbon::parse($rec->fecha_publicacion)->locale('es')->isoFormat('D MMM, YYYY') : '';
                        @endphp
                        <div class="rm-pub-recent-card">
                            <img src="{{ $recImg }}" alt="{{ $rec->titulo }}" loading="lazy">
                            <div>
                                <a href="{{ $recUrl }}">{{ $rec->titulo }}</a>
                                @if($recFecha)<span>{{ $recFecha }}</span>@endif
                            </div>
                        </div>
                        @endforeach
                    </div>
                    @endif

                    {{-- CTA Reserva --}}
                    <div style="background:linear-gradient(135deg,#cc6b8e,#a0455e); border-radius:16px; padding:28px; text-align:center;">
                        <i class="fas fa-spa" style="color:rgba(255,255,255,.6); font-size:2rem; margin-bottom:12px; display:block;"></i>
                        <h5 style="font-family:'PT Serif',serif; color:#fff; margin-bottom:8px;">¿Lista para tu Experiencia?</h5>
                        <p style="color:rgba(255,255,255,.8); font-size:.85rem; margin-bottom:18px;">Reserva tu sesión hoy. Discreción y calidad garantizadas.</p>
                        <a href="{{ $urlWhatsapp }}" target="_blank"
                           style="background:#fff; color:#cc6b8e; font-weight:700; font-size:13px; padding:11px 22px; border-radius:50px; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                            <i class="fab fa-whatsapp"></i> WhatsApp 982 311 335
                        </a>
                    </div>

                    {{-- Categorías --}}
                    <div style="background:#fff; border-radius:16px; padding:24px; box-shadow:0 4px 20px rgba(0,0,0,.07);">
                        <p class="rm-pub-sidebar-title">Categorías</p>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            @foreach(['Bienestar','Tántrico','Privacidad','Técnicas','Lifestyle'] as $catItem)
                            <a href="{{ url('/publicaciones') }}"
                               style="padding:6px 14px; border-radius:50px; border:1.5px solid #ead5df; font-size:12px; font-weight:600; color:#7a6020; text-decoration:none; transition:all .2s;"
                               onmouseover="this.style.background='#cc6b8e';this.style.color='#fff';this.style.borderColor='transparent';"
                               onmouseout="this.style.background='';this.style.color='#7a6020';this.style.borderColor='#ead5df';">
                                {{ $catItem }}
                            </a>
                            @endforeach
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
</section>

@include('web.partials.sparlex.footer')
@endsection
