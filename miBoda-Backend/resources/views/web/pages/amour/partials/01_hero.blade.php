@php
    use App\Support\AmourPageData;
    $videoUrl = $sliderConfig->url_video ?? 'temp02/assets/images/home5-banner.mp4';
    $videoSrc = AmourPageData::img($videoUrl, 'temp02/assets/images/home5-banner.mp4');
    $slides = $sliderData ?? collect();
@endphp
<section class="banner banner-6 overflow-hidden">
    <video muted loop autoplay playsinline>
        <source src="{{ $videoSrc }}">
    </video>
    <div class="container">
        <div class="swiper banner6Swiper">
            <div class="swiper-wrapper">
                @forelse($slides as $slide)
                    <div class="swiper-slide">
                        <div class="row banner-content z-2">
                            <div class="col-md-8 align-items-end">
                                @if($slide->subtitulo)
                                    <h4 class="sub-heading primary">{{ $slide->subtitulo }}</h4>
                                @endif
                                <h2 class="hero-6-text text-uppercase">{!! $slide->titulo !!}</h2>
                            </div>
                            <div class="col-md-4">
                                <div class="d-flex flex-column gap-3 gap-xxl-5 align-items-md-end">
                                    <a href="{{ route('amour.servicios') }}" class="circular-text-big" aria-label="Explorar rituales">
                                        <p class="text" data-text="{{ $slide->slide_tag ?? 'bienestar · dulzura · ritual · ' }}"></p>
                                        <div class="inner">
                                            <button type="button" aria-label="Ver servicios"><i class="ph ph-arrow-up-right"></i></button>
                                        </div>
                                    </a>
                                    @if($slide->descripcion)
                                        <p class="text-lg">{{ $slide->descripcion }}</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="swiper-slide">
                        <div class="row banner-content z-2">
                            <div class="col-md-8">
                                <h4 class="sub-heading primary">El arte del tacto · Miraflores</h4>
                                <h2 class="hero-6-text text-uppercase">Amour Spa &amp; Arte del Cuerpo</h2>
                            </div>
                        </div>
                    </div>
                @endforelse
            </div>
            <div class="hero6-pagination"></div>
        </div>
    </div>
</section>
