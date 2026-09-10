@php
    $wa = $urlWhatsapp ?? '#';
    $slides = ($sliderData ?? collect())->isEmpty()
        ? collect([
            (object)['subtitulo'=>'Royal Masajes Lima','titulo'=>'Royal Sensory Experience Massage','descripcion'=>'Reconecta con tu cuerpo y recupera el equilibrio.','texto_boton'=>'Conócenos','url_link'=>route('nosotros'),'texto_boton_2'=>'Reservar','url_link_2'=>$wa,'url_imagen'=>'temp02/img/inicio/slider_1.jpg'],
            (object)['subtitulo'=>'Mujeres Profesionales','titulo'=>'Equilibrio y Discreción','descripcion'=>'Entorno privado para liberar el estrés.','texto_boton'=>'Servicios','url_link'=>route('royal.masajes'),'texto_boton_2'=>'WhatsApp','url_link_2'=>$wa,'url_imagen'=>'temp02/img/inicio/slider_2.jpg'],
            (object)['subtitulo'=>'+10 Años de Experiencia','titulo'=>'Arte Sensorial Único','descripcion'=>'Técnicas tántricas y sensoriales.','texto_boton'=>'Galería','url_link'=>route('royal.galeria'),'texto_boton_2'=>'982 311 335','url_link_2'=>$wa,'url_imagen'=>'temp02/img/inicio/slider_3.jpg'],
        ])
        : $sliderData;
@endphp
<div class="container-fluid carousel-header px-0">
    <div id="carouselId" class="carousel slide" data-bs-ride="carousel" data-bs-interval="{{ $sliderConfig->intervalo_ms ?? 4500 }}" data-bs-wrap="true" data-bs-pause="hover">
        <ol class="carousel-indicators">
            @foreach($slides as $i => $slide)
                <li data-bs-target="#carouselId" data-bs-slide-to="{{ $i }}" class="{{ $i === 0 ? 'active' : '' }}"></li>
            @endforeach
        </ol>
        <div class="carousel-inner">
            @foreach($slides as $i => $slide)
                @php
                    $img = \App\Support\SparlexPageData::img(
                        $slide->url_imagen ?? null,
                        'temp02/img/inicio/slider_' . ($slide->id_slider ?? ($i + 1)) . '.jpg'
                    );
                    $btn1 = Helpers::whatsappBtnUrl($slide->url_link ?? '#', $footerCorp ?? null);
                    $btn2 = Helpers::whatsappBtnUrl($slide->url_link_2 ?? $wa, $footerCorp ?? null);
                @endphp
                <div class="carousel-item {{ $i === 0 ? 'active' : '' }}">
                    <img src="{{ $img }}"
                         class="img-fluid"
                         alt="{{ strip_tags($slide->titulo ?? '') }}"
                         @if($i === 0)
                             fetchpriority="high"
                             decoding="async"
                         @else
                             loading="lazy"
                             decoding="async"
                         @endif>
                    <div class="carousel-caption">
                        <div class="p-3" style="max-width:900px;">
                            <h1 class="display-1 text-capitalize text-white mb-3">{!! $slide->titulo ?? '' !!}</h1>
                            @if(!empty($slide->descripcion))<p class="mx-md-5 fs-4 px-4 mb-5 text-white">{{ $slide->descripcion }}</p>@endif
                            <div class="d-flex align-items-center justify-content-center">
                                @if(!empty($slide->texto_boton))<a class="btn btn-light btn-light-outline-0 rounded-pill py-3 px-5 me-4" href="{{ $btn1 }}">{{ $slide->texto_boton }}</a>@endif
                                @if(!empty($slide->texto_boton_2))<a class="rm-mc-btn-reserve rm-mc-btn-reserve--lg" href="{{ $btn2 }}">{{ $slide->texto_boton_2 }}</a>@endif
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
