@php
    use App\Support\AmourPageData;
    $full = $amourRitualesFull ?? false;
    $items = $experiencias ?? collect();
    $sec = $expSeccion ?? null;
    $eyebrow = $full ? ($sec->intro_label ?? 'Nos Soins · Nuestros Rituales') : ($sec->intro_label ?? 'Nos Soins · Nuestros Rituales');
    $titulo = $full ? ($sec->intro_titulo ?? 'Doce rituales para el cuerpo y la piel') : ($sec->intro_titulo2 ?? $sec->intro_titulo ?? 'La pasión del tacto, el arte de la piel');
    $intro = $sec->intro_subtitulo ?? ($full
        ? 'En Amour Spa, cada sesión recuerda a Hygieia y al culto grecorromano del cuerpo cuidado: manos expertas, aceites nobles y un silencio que restaura. Bienestar físico, alivio del estrés y élégance en cada gesto.'
        : 'En Amour Spa, cada sesión restaura bienestar físico, alivio del estrés y élégance en cada gesto.');
    $tarifasAnchor = '#servicios-tarifas';
@endphp
<section class="gallery n0 pt-120 pb-120">
    <div class="container">
        <div class="section-title">
            <h4 class="sub-heading fade_up_anim">{{ $eyebrow }}</h4>
            <h2 class="mb-2 mb-xl-3 fade_up_anim text-uppercase">{{ $titulo }}</h2>
            <p class="fade_up_anim" data-delay=".3">{{ $intro }}</p>
        </div>

        @if($full)
            <div class="row g-3 g-xl-4">
                @foreach($items as $exp)
                    @php $img = AmourPageData::img($exp->url_imagen, 'temp02/assets/images/inicio/servicios/amour-01.jpg'); @endphp
                    <div class="col-md-6 col-lg-4">
                        <div class="project-card overlay">
                            <img src="{{ $img }}" alt="{{ $exp->titulo }}">
                            <div class="info">
                                <div class="d-flex justify-content-end">
                                    <a href="{{ $tarifasAnchor }}" aria-label="{{ $exp->titulo }}"><i class="ph ph-arrow-up-right"></i></a>
                                </div>
                                <div>
                                    <p class="fw-semibold mb-2">{{ $exp->subtitulo ?? $exp->badge }}</p>
                                    <h4>{{ $exp->titulo }}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="row g-3 g-xl-4">
                @foreach($items->take(4) as $exp)
                    @php $img = AmourPageData::img($exp->url_imagen, 'temp02/assets/images/inicio/servicios/amour-0' . $loop->iteration . '.jpg'); @endphp
                    @if($loop->first)
                        <div class="col-md-5 col-lg-4">
                            <div class="project-card overlay">
                                <img src="{{ $img }}" alt="{{ $exp->titulo }}">
                                <div class="info">
                                    <div class="d-flex justify-content-end"><a href="{{ route('amour.servicios') }}"><i class="ph ph-arrow-up-right"></i></a></div>
                                    <div><p class="fw-semibold mb-2">{{ $exp->subtitulo ?? $exp->badge }}</p><h4>{{ $exp->titulo }}</h4></div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-7 col-lg-8"><div class="row g-3 g-xl-4">
                    @else
                        <div class="{{ $loop->index === 1 ? 'col-12' : 'col-lg-6' }}">
                            <div class="project-card overlay">
                                <img src="{{ $img }}" alt="{{ $exp->titulo }}">
                                <div class="info">
                                    <div class="d-flex justify-content-end"><a href="{{ route('amour.servicios') }}"><i class="ph ph-arrow-up-right"></i></a></div>
                                    <div><p class="fw-semibold mb-2">{{ $exp->subtitulo ?? $exp->badge }}</p><h4>{{ $exp->titulo }}</h4></div>
                                </div>
                            </div>
                        </div>
                    @endif
                @endforeach
                @if($items->isNotEmpty())</div></div>@endif
            </div>
            <div class="d-flex justify-content-center mt-4 pt-xl-3">
                <a href="{{ route('amour.servicios') }}" class="outline-btn secondary">Ver todos los rituales <i class="ph ph-arrow-right"></i></a>
            </div>
        @endif
    </div>
</section>
