@php
    $a = $webAbout ?? null;
    $wa = $urlWhatsapp ?? '#';
    $img1 = \App\Support\SparlexPageData::img($a->url_imagen ?? null, 'temp02/img/about-1.jpg');
    $img2 = \App\Support\SparlexPageData::img($a->url_imagen_2 ?? null, 'temp02/img/about-2.jpg');
    // Mostrar botón play solo si el admin activó mostrar_video = 1
    $mostrarVideo = ($a->mostrar_video ?? 0) == 1;
    $video = $mostrarVideo ? ($a->url_video ?: null) : null;
@endphp
<div class="container-fluid about py-5" id="nosotros">
    <div class="container py-5">
        <div class="row g-5 align-items-center">
            <div class="col-lg-5">
                <div class="video">
                    <img src="{{ $img1 }}" class="img-fluid rounded" alt="" loading="lazy" decoding="async">
                    <div class="position-absolute rounded border-5 border-top border-start border-white" style="bottom:0;right:0;">
                        <img src="{{ $img2 }}" class="img-fluid rounded idRef5454545" alt="" style="height:13rem;" loading="lazy" decoding="async">
                    </div>
                    @if($video)
                    <button type="button" class="btn btn-play" data-bs-toggle="modal" data-src="{{ $video }}" data-bs-target="#videoModal"><span></span></button>
                    @endif
                </div>
            </div>
            <div class="col-lg-7">
                <p class="fs-4 text-uppercase text-primary">{{ $a->subtitulo ?? 'Sobre Nosotros' }}</p>
                <h1 class="display-4 mb-4">{!! $a->titulo ?? 'Royal Sensory Experience Massage' !!}</h1>
                {{-- Descripción con "Ver más / Ver menos" --}}
                @php
                    $descHome = trim($a->descripcion ?? '');
                    if (preg_match('/<p[\s>]/i', $descHome)) {
                        preg_match_all('/<p[\s>].*?<\/p>/si', $descHome, $mhHome);
                        $bloquesHome   = $mhHome[0];
                        $visibleHome   = $bloquesHome[0] ?? $descHome;
                        $ocultosHome   = count($bloquesHome) > 1 ? implode('', array_slice($bloquesHome, 1)) : '';
                    } else {
                        $partesHome = array_values(array_filter(
                            preg_split('/(\r?\n){2,}/', $descHome),
                            fn($b) => trim($b) !== ''
                        ));
                        $toPHome     = fn($t) => '<p style="margin-bottom:1rem;">' . nl2br(e(trim($t))) . '</p>';
                        $nVisHome    = 4;
                        $visibleHome = implode('', array_map($toPHome, array_slice($partesHome, 0, $nVisHome)));
                        $ocultosHome = count($partesHome) > $nVisHome
                            ? implode('', array_map($toPHome, array_slice($partesHome, $nVisHome)))
                            : '';
                    }
                    $hayOcultoHome = trim(strip_tags($ocultosHome)) !== '';
                @endphp

                <div style="color:#555;line-height:1.85;font-size:1.02rem;margin-bottom:0.5rem;">
                    {!! $visibleHome !!}
                </div>

                @if($hayOcultoHome)
                <div id="rm-home-extendido"
                     style="color:#555;line-height:1.85;font-size:1.02rem;
                            overflow:hidden;max-height:0;opacity:0;
                            transition:max-height .7s ease,opacity .5s ease;">
                    {!! $ocultosHome !!}
                </div>
                <div class="mb-3 mt-1">
                    <button type="button" onclick="rmToggleHome()"
                            style="background:none;border:none;padding:0;
                                   color:#a0455e;font-weight:600;font-size:0.95rem;
                                   cursor:pointer;display:inline-flex;align-items:center;gap:6px;
                                   text-decoration:underline;text-underline-offset:3px;">
                        <span id="rm-home-btn-label">Ver más información</span>
                        <i id="rm-home-btn-icon" class="fas fa-chevron-down"
                           style="font-size:11px;transition:transform .3s;"></i>
                    </button>
                </div>
                <script>
                (function(){
                    var open = false;
                    window.rmToggleHome = function(){
                        var box = document.getElementById('rm-home-extendido');
                        var lbl = document.getElementById('rm-home-btn-label');
                        var ico = document.getElementById('rm-home-btn-icon');
                        open = !open;
                        if(open){
                            box.style.maxHeight = box.scrollHeight + 400 + 'px';
                            box.style.opacity   = '1';
                            lbl.textContent     = 'Ver menos';
                            ico.style.transform = 'rotate(180deg)';
                        } else {
                            box.style.maxHeight = '0';
                            box.style.opacity   = '0';
                            lbl.textContent     = 'Ver más información';
                            ico.style.transform = 'rotate(0deg)';
                        }
                    };
                })();
                </script>
                @else
                <div class="mb-4"></div>
                @endif
                <div class="row g-4">
                    @foreach(($aboutFeatures ?? collect()) as $feat)
                        <div class="col-md-6">
                            <div class="d-flex align-items-center">
                                @if($loop->first)
                                    <i class="fas fa-shield-alt fa-3x text-primary"></i>
                                @else
                                    <i class="fas fa-spa fa-3x text-primary"></i>
                                @endif
                                <div class="ms-4">
                                    <h5 class="mb-2">{{ $feat->titulo }}</h5>
                                    <p class="mb-0">{{ $feat->descripcion }}</p>
                                </div>
                            </div>
                        </div>
                    @endforeach
                </div>
                @if(!empty($a->texto_extendido))<div class="my-4">{!! $a->texto_extendido !!}</div>@endif
                <a href="{{ Helpers::whatsappBtnUrl($a->btn_url ?? $wa, $footerCorp ?? null) }}" class="rm-mc-btn-reserve rm-mc-btn-reserve--lg">{{ $a->btn_texto ?? 'Reserva al WhatsApp' }}</a>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="videoModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog"><div class="modal-content rounded-0">
        <div class="modal-header"><h5 class="modal-title">Royal Masajes</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
        <div class="modal-body"><div class="ratio ratio-16x9"><iframe class="embed-responsive-item" src="about:blank" id="video" title="Video Royal Masajes" allowfullscreen></iframe></div></div>
    </div></div>
</div>
