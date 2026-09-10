@php
    $tabs = \App\Models\WebPaginaGaleria::categoriasTabs();
    $items = $galeriaItems ?? collect();
@endphp
<div class="container-fluid gallery py-5" id="galeria" style="background:#ffffff;">
    <div class="container py-5">
        <div class="text-center mx-auto mb-5" style="max-width:800px;">
            <p class="fs-4 text-uppercase text-primary">{{ $galeriaSeccion->seccion_subtitulo ?? 'Nuestra Galería' }}</p>
            <h1 class="display-4 mb-4">{{ $galeriaSeccion->seccion_titulo ?? 'Ambiente Diseñado Para Tus Sentidos' }}</h1>
        </div>
        <div class="tab-class text-center">
            <ul class="nav nav-pills d-inline-flex justify-content-center mb-5 flex-wrap gap-2">
                @foreach($tabs as $key => $label)
                    <li class="nav-item">
                        <a class="d-flex mx-2 py-2 border border-primary bg-light rounded-pill {{ $loop->first ? 'active' : '' }}" data-bs-toggle="pill" href="#tab-{{ $key }}"><span class="text-dark px-3">{{ $label }}</span></a>
                    </li>
                @endforeach
            </ul>
            <div class="tab-content">
                @foreach($tabs as $key => $label)
                    @php
                        $filtered = $key === 'todas' ? $items : $items->where('categoria', $key);
                    @endphp
                    <div id="tab-{{ $key }}" class="tab-pane fade {{ $loop->first ? 'show active' : '' }} p-0">
                        <div class="row g-2 justify-content-center">
                            @forelse($filtered as $g)
                                @php
                                    $fallback = 'temp02/img/gallery-3.jpg';
                                    $src = \App\Support\SparlexPageData::img($g->url_imagen, $fallback);
                                @endphp
                                <div class="col-md-6 col-lg-4 col-xl-3">
                                    <div class="gallery-img" style="height:280px;">
                                        <img src="{{ $src }}" class="img-fluid w-100 h-100" style="object-fit:cover; border-radius:10px;" alt="{{ $g->alt_imagen }}"
                                             onerror="this.onerror=null;this.src='{{ asset($fallback) }}'">
                                        @php
                                            $overlayTexto = $key === 'todas' ? ($tabs[$g->categoria] ?? $g->titulo_overlay) : $label;
                                        @endphp
                                        <div class="gallery-overlay">
                                            @if($overlayTexto)
                                            <span>{{ $overlayTexto }}</span>
                                            @endif
                                        </div>
                                        <div class="search-icon">
                                            <a href="{{ $src }}" data-lightbox="Gallery-{{ $key }}">
                                                <i class="fas fa-search-plus btn-primary btn-primary-outline-0 rounded-circle p-3"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            @empty
                                <div class="col-12 text-muted">Sin imágenes en esta categoría.</div>
                            @endforelse
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</div>
