@php
    use App\Support\AmourPageData;
    $a = $webAbout ?? null;
    $img = AmourPageData::img($a->url_imagen ?? null, 'temp02/assets/images/inicio/amour-nosotros.jpeg');
    $stat = $a->stat_valor ?? '100%';
    $statLabel = $a->stat_etiqueta ?? 'Soin dédié · Atención con reserva';
@endphp
<section class="features-6 pt-120 pb-120">
    <div class="container">
        <div class="row g-4 align-items-center position-relative">
            <div class="col-lg-5 col-xl-6">
                <div class="exp-img">
                    <div class="d-flex gap-3 align-items-end">
                        <img src="{{ $img }}" class="img-fluid exp-img-single" alt="Ambiente Amour Spa">
                        <div class="exp-info">
                            <h2 class="display-4 mb-1">{{ $stat }}</h2>
                            <p>{{ $statLabel }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-7 col-xl-6">
                <h4 class="sub-heading fade_up_anim">{{ $a->subtitulo ?? '¿Qué es Amour Spa?' }}</h4>
                <h2 class="mb-3 mb-xl-4 fade_up_anim text-uppercase">{!! $a->titulo ?? 'Un santuario donde el cuerpo se escribe con delicadeza' !!}</h2>
                @if($a && $a->descripcion)
                    <p class="mb-4 pb-xl-3 fade_up_anim" data-delay=".3">{{ strip_tags($a->descripcion) }}</p>
                @endif
                <div class="row mb-4 g-3 g-md-4 pb-xl-3 fade_up_anim" data-delay=".4">
                    @foreach(($aboutFeatures ?? collect()) as $feat)
                        <div class="col-md-6 {{ $loop->first ? 'about-info-1' : '' }}">
                            <div class="d-flex gap-3 align-items-start {{ !$loop->first ? 'ps-md-3' : '' }}">
                                @if($feat->url_imagen ?? $feat->url_icono ?? false)
                                    <img src="{{ AmourPageData::img($feat->url_imagen ?? $feat->url_icono) }}" width="40" height="40" alt="">
                                @else
                                    <img src="{{ asset('temp02/assets/images/' . ($loop->first ? 'therapist' : 'holistic') . '.png') }}" width="40" height="40" alt="">
                                @endif
                                <div>
                                    <h5 class="fw-semibold">{{ $feat->titulo }}</h5>
                                    <p>{{ $feat->descripcion }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
                @if($a && !empty($a->bullets))
                    @php $bullets = is_array($a->bullets) ? $a->bullets : json_decode($a->bullets, true); @endphp
                    @if(is_array($bullets))
                        <div class="row fade_up_anim" data-delay=".5">
                            @foreach(array_chunk($bullets, 2) as $colBullets)
                                <div class="col-sm-6">
                                    @foreach($colBullets as $b)
                                        <div class="d-flex align-items-center gap-2 {{ !$loop->last ? 'mb-sm-3' : '' }}">
                                            <i class="ph ph-check-square text-secondary text-xl"></i>
                                            <p>{{ is_string($b) ? $b : ($b['texto'] ?? '') }}</p>
                                        </div>
                                    @endforeach
                                </div>
                            @endforeach
                        </div>
                    @endif
                @endif
            </div>
        </div>
    </div>
</section>
