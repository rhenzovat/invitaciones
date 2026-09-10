@php
    $ref = ($noticias ?? collect())->first();
    $wa  = $urlWhatsapp ?? '#';
@endphp

<section class="rm-news" id="publicaciones">
    {{-- ══ CABECERA ══ --}}
    <div class="rm-news__header">
        <span class="rm-news__supertag">Blog & Bienestar</span>
        <h2 class="rm-news__title">
            {!! $ref->seccion_titulo ?? 'Publicaciones <span style="color:#cc6b8e;">Recientes</span>' !!}
        </h2>
        <p class="rm-news__sub">
            {!! $ref->seccion_subtitulo ?? 'Consejos de bienestar, relajación profunda y equilibrio para la mujer profesional y ejecutiva.' !!}
        </p>
        <a href="{{ url('/publicaciones') }}" class="rm-news__ver-mas">
            Ver todas las publicaciones <i class="fas fa-arrow-right" style="font-size:10px;"></i>
        </a>
    </div>

    {{-- ══ GRID DE CARDS ══ --}}
    <div class="rm-news__grid">
        @forelse($noticias ?? [] as $n)
            @php
                $img  = \App\Support\SparlexPageData::img($n->url_imagen, 'temp02/img/gallery-' . ($loop->index + 1) . '.jpg');
                $url  = $n->slug ? url('/publicaciones/' . $n->slug) : ($n->url_enlace ?: '#');
                $fecha = $n->fecha_publicacion
                    ? \Carbon\Carbon::parse($n->fecha_publicacion)->locale('es')->isoFormat('D [de] MMMM, YYYY')
                    : '';
            @endphp
            <article class="rm-news__card" onclick="window.location='{{ $url }}'">
                {{-- Imagen --}}
                <div class="rm-news__img-wrap">
                    <img src="{{ $img }}"
                         onerror="this.onerror=null;this.src='{{ asset('temp02/img/gallery-' . ($loop->index + 1) . '.jpg') }}'"
                         alt="{{ $n->titulo }}"
                         class="rm-news__img"
                         loading="lazy">
                    @if($n->chip)
                    <span class="rm-news__tag">{{ $n->chip }}</span>
                    @endif
                    <div class="rm-news__img-icon">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>

                {{-- Contenido --}}
                <div class="rm-news__body">
                    @if($fecha)
                    <span class="rm-news__date">
                        <i class="far fa-calendar-alt"></i> {{ $fecha }}
                    </span>
                    @endif

                    <h3 class="rm-news__card-title">{{ $n->titulo }}</h3>

                    @if($n->resumen)
                    <p class="rm-news__resumen">{{ $n->resumen }}</p>
                    @endif

                    <a href="{{ $url }}" class="rm-news__link" onclick="event.stopPropagation();">
                        Leer más <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </article>
        @empty
            <div style="grid-column:1/-1; text-align:center; padding:48px 20px; color:#aaa;">
                <i class="fas fa-newspaper" style="font-size:2.5rem; opacity:.3; display:block; margin-bottom:12px;"></i>
                <p style="font-size:.9rem;">Próximamente nuevas publicaciones.</p>
            </div>
        @endforelse
    </div>
</section>
