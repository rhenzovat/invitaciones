@php
    use App\Support\AmourPageData;
    $eq = $equipoSeccion ?? ($equipo[0] ?? null);
    $igDefault = 'https://www.instagram.com/amour.spa.lima/';
@endphp
<section class="experts-3 overflow-x-hidden">
    <div class="container">
        <div class="row align-items-end section-title">
            <div class="col-lg-6">
                <h4 class="sub-heading fade_up_anim">{{ $eq->seccion_badge ?? 'Manos que escuchan' }}</h4>
                <h2 class="fade_up_anim text-uppercase">{{ $eq->seccion_titulo ?? 'Manos especialistas' }}</h2>
            </div>
            <div class="col-lg-6 d-flex justify-content-end">
                <div class="btns">
                    <button class="expert-prev" aria-label="Anterior"><i class="ph ph-arrow-left"></i></button>
                    <button class="expert-next" aria-label="Siguiente"><i class="ph ph-arrow-right"></i></button>
                </div>
            </div>
        </div>
        <div class="swiper expertSwiper3">
            <div class="swiper-wrapper">
                @foreach($equipo ?? [] as $m)
                    @php $img = AmourPageData::img($m->url_imagen, 'temp02/assets/images/inicio/equipo/1.jpg'); @endphp
                    <div class="swiper-slide">
                        <div class="expert-card">
                            <div class="img-box">
                                <img src="{{ $img }}" class="w-100" alt="{{ $m->titulo }}">
                                <div class="social">
                                    <button class="social-btn z-2" aria-label="Redes"><i class="ph ph-plus"></i></button>
                                    <ul class="links mb-0 list-unstyled">
                                        <li><a href="{{ $m->url_facebook ?? $igDefault }}" target="_blank" rel="noopener"><i class="ph ph-instagram-logo"></i></a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="text-center mt-3 px-2 position-relative z-3">
                                <h5 class="fw-medium dmSansFont" style="color:#5f4100">{{ $m->titulo }}</h5>
                                <p class="mb-2">{{ $m->cargo }}</p>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    </div>
</section>
