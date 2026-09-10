@php
    use App\Support\AmourPageData;
    $ts = $testimonioSeccion ?? null;
    $sideImg = AmourPageData::img($ts->url_imagen_lateral ?? null, 'temp02/assets/images/inicio/historia.jpg');
@endphp
<section class="testimonial-6 pt-120 pb-120">
    <div class="container">
        <div class="row g-3 gx-lg-4 align-items-center">
            <div class="col-lg-6">
                <div class="title">
                    <h4 class="sub-heading fade_up_anim">{{ $ts->badge_seccion ?? 'Las Voces De Nuestros Invitados' }}</h4>
                    <h2 class="mb-3 fade_up_anim text-uppercase">{{ $ts->seccion_titulo ?? 'Historias de calma en Miraflores' }}</h2>
                    @if($ts && $ts->seccion_descripcion)
                        <p class="fade_up_anim" data-delay=".3">{{ $ts->seccion_descripcion }}</p>
                    @endif
                </div>
                <div class="slider">
                    <div class="swiper testimonialSlider6">
                        <div class="swiper-wrapper">
                            @foreach($testimonios ?? [] as $t)
                                @php
                                    $avatar = $t->url_avatar ? AmourPageData::img($t->url_avatar) : asset('temp02/assets/images/client-' . (($loop->index % 3) + 1) . '.png');
                                    $stars = (int) round($t->calificacion ?? 5);
                                @endphp
                                <div class="swiper-slide">
                                    <div class="testimonial-card-6">
                                        <div class="testimonial-client-img flex-shrink-0 text-center">
                                            <h5 class="mb-1 text-uppercase fw-semibold" style="color:#fff">{{ $t->nombre }}</h5>
                                            @if($t->subtitulo ?? $t->cargo ?? false)<p class="mb-2" style="font-size:.85rem;color:#e8d5cf">{{ $t->subtitulo ?? $t->cargo }}</p>@endif
                                            <img src="{{ $avatar }}" class="rounded-circle" width="90" height="90" alt="">
                                        </div>
                                        <div class="testimonial-client-content">
                                            <div class="text-yellow d-flex gap-2 mb-2 text-xl">
                                                @for($i = 1; $i <= 5; $i++)
                                                    <i class="ph-fill ph-star{{ $i > $stars ? '' : '' }}"></i>
                                                @endfor
                                            </div>
                                            <p class="mb-0">"{{ $t->testimonio }}"</p>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                    <div class="btns">
                        <button class="testi6-prev" aria-label="Anterior"><i class="ph ph-arrow-left"></i></button>
                        <button class="testi6-next" aria-label="Siguiente"><i class="ph ph-arrow-right"></i></button>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="image"><img src="{{ $sideImg }}" class="img-fluid" alt="Amour Spa"></div>
            </div>
        </div>
    </div>
</section>
