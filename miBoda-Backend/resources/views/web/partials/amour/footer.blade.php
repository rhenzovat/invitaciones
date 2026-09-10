@php
    use App\Support\AmourPageData;
    $f = $footerCorp ?? null;
    $wa = $urlWhatsapp ?? Helpers::landingWhatsappUrl($f);
    $logo = $f && !empty($f->logo_footer) ? AmourPageData::img($f->logo_footer) : asset('temp02/assets/images/inicio/logo-principal-blanco.png');
    $desc = $f->descripcion_footer ?? 'Amour Spa es un centro de bienestar en Miraflores especializado en masajes relajantes y terapias corporales.';
    $tel = $f->contacto_telefono ?? '+51 977 807 314';
    $email = $f->contacto_email ?? 'informacion@amourspa.com';
    $dir1 = $f->contacto_direccion ?? 'Av. Ernesto Diez Canseco 204, Miraflores, Lima';
    $dir2 = '15074 Miraflores, Lima, Perú';
    $horarioSem = 'Lunes a Sábado';
    $horarioSemH = '10:00 AM – 09:00 PM';
    $horarioDom = 'Domingo';
    $horarioDomN = 'Con reserva previa';
    if (!empty($f->nuestros_horarios) && str_contains($f->nuestros_horarios, '|')) {
        $partesHorario = array_map('trim', explode('|', $f->nuestros_horarios));
        if (count($partesHorario) >= 4) {
            [$horarioSem, $horarioSemH, $horarioDom, $horarioDomN] = $partesHorario;
        } else {
            $horarioSem  = $partesHorario[0] ?? $horarioSem;
            $horarioDomN = $partesHorario[1] ?? $horarioDomN;
        }
    }
    $ig = collect($redesSociales ?? [])->first(fn ($r) => ($r['tipo'] ?? '') === 'instagram');
    $igUrl = $ig['url'] ?? 'https://www.instagram.com/amour.spa.lima/';
    $qrImg = AmourPageData::img($f->url_qr ?? 'temp02/assets/images/inicio/logo-qr.jpg', 'temp02/assets/images/inicio/logo-qr.jpg');
    $horarioTitulo = $f->footer_horario_titulo ?? 'Horario';

    $navFooter = $f->nav_footer ?? null;
    if (is_string($navFooter)) {
        $decodedNavFooter = json_decode($navFooter, true);
        $navFooter = is_array($decodedNavFooter) ? $decodedNavFooter : [];
    }
    if (!is_array($navFooter)) {
        $navFooter = [];
    }

    $defaultLinks = [
        ['label' => 'Inicio', 'href' => url('/')],
        ['label' => 'Quiénes Somos', 'href' => route('nosotros')],
        ['label' => 'Rituales', 'href' => route('amour.servicios')],
        ['label' => 'FAQ', 'href' => route('contacto.pagina')],
        ['label' => 'Contacto', 'href' => route('contacto.pagina')],
    ];
    $defaultServices = [
        ['label' => 'Relajante', 'href' => route('amour.servicios')],
        ['label' => 'Sensorial', 'href' => route('amour.servicios')],
        ['label' => 'Pierres', 'href' => route('amour.servicios')],
        ['label' => 'Peau', 'href' => route('amour.servicios')],
        ['label' => 'Signature', 'href' => route('amour.servicios')],
    ];

    $navLinks = $navFooter['links']['items'] ?? $navFooter['links'] ?? $defaultLinks;
    $navServices = $navFooter['services']['items'] ?? $navFooter['services'] ?? $defaultServices;
    $linksTitle = $navFooter['links']['title'] ?? 'Links';
    $servicesTitle = $navFooter['services']['title'] ?? 'Servicios';
@endphp
<footer class="footer footer-two white-left position-relative">
    <div class="position-relative overflow-x-hidden">
        <div class="footer-two-inner content">
            <div class="row g-3 g-lg-0">
                <div class="col-md-4 col-xl-3">
                    <div class="footer-card px-2 pe-xxl-5 text-center fade_up_anim" style="min-height:100%; display:flex; flex-direction:column; justify-content:center; padding-top:42px; padding-bottom:42px;">
                        <a href="{{ url('/') }}">
                            <img src="{{ $logo }}" class="img-fluid footer-card__logo" alt="Amour Spa footer" style="max-width:180px; margin:0 auto 10px;">
                        </a>
                        <p class="mb-4 pb-lg-3 text-n500 footer-card__desc" style="max-width:320px; margin-left:auto; margin-right:auto; line-height:1.75;">{{ $desc }}</p>
                        <ul class="social-link two">
                            <li><a href="{{ $igUrl }}" target="_blank" rel="noopener"><i class="ph ph-instagram-logo"></i></a></li>
                            <li><a href="{{ $wa }}" target="_blank" rel="noopener"><i class="ph ph-whatsapp-logo"></i></a></li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-8 col-xl-9">
                    <div class="navigate-part">
                        <div class="top" style="padding-top:18px; padding-bottom:18px;">
                            <div class="row">
                                <div class="col-lg-4">
                                    <div class="d-flex flex-lg-column pt-3 justify-content-lg-center align-items-center gap-2 align-items-lg-start h-100" style="min-height:140px;">
                                        <img src="{{ asset('temp02/assets/images/clock-icon.png') }}" class="img-fluid" alt="">
                                        <h2 class="text-uppercase pt-3 mb-0">{{ $horarioTitulo }}</h2>
                                    </div>
                                </div>
                                <div class="col-lg-8">
                                    <div class="row h-100">
                                        <div class="col-lg-6 d-flex justify-content-lg-center border-left-right">
                                            <div class="ps-2 ps-lg-0">
                                                <p class="mb-2">{{ $horarioSem }}</p>
                                                <p class="time mb-0">{{ $horarioSemH }}</p>
                                            </div>
                                        </div>
                                        <div class="col-lg-6 d-flex align-items-center justify-content-lg-center">
                                            <div>
                                                <p class="mb-2">{{ $horarioDom }}</p>
                                                <p class="time mb-0">{{ $horarioDomN }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row g-3 g-lg-0 bottom">
                            <div class="col-6 col-xl-2 fade_up_anim">
                                <h4 class="mb-4">{{ $linksTitle }}</h4>
                                <ul class="navigation-links">
                                    @foreach($navLinks as $link)
                                        @php
                                            $label = is_array($link) ? ($link['label'] ?? ($link['text'] ?? '')) : (string) $link;
                                            $href = is_array($link) ? ($link['href'] ?? ($link['url'] ?? '#')) : '#';
                                        @endphp
                                        <li><a href="{{ $href }}">{{ $label }}</a></li>
                                    @endforeach
                                </ul>
                            </div>
                            <div class="col-6 col-xl-2 fade_up_anim">
                                <h4 class="mb-4">{{ $servicesTitle }}</h4>
                                <ul class="navigation-links">
                                    @foreach($navServices as $service)
                                        @php
                                            $label = is_array($service) ? ($service['label'] ?? ($service['text'] ?? '')) : (string) $service;
                                            $href = is_array($service) ? ($service['href'] ?? ($service['url'] ?? route('amour.servicios'))) : route('amour.servicios');
                                        @endphp
                                        <li><a href="{{ $href }}">{{ $label }}</a></li>
                                    @endforeach
                                </ul>
                            </div>
                            <div class="col-sm-6 col-xl-3 fade_up_anim" data-delay=".2">
                                <h4 class="pb-3">Contacto</h4>
                                <ul class="contact-two mb-0">
                                    <li class="contact-item">
                                        <div class="contact-icon"><i class="ph ph-phone-call"></i></div>
                                        <div class="d-flex flex-column gap-1">
                                            <a href="tel:{{ preg_replace('/\D/', '', $tel) }}">{{ $tel }}</a>
                                            @if(!empty($f->contacto_telefono_2))
                                            <a href="tel:{{ preg_replace('/\D/', '', $f->contacto_telefono_2) }}">{{ $f->contacto_telefono_2 }}</a>
                                            @endif
                                        </div>
                                    </li>
                                    <li class="contact-item">
                                        <div class="contact-icon"><i class="ph ph-envelope-simple"></i></div>
                                        <div class="d-flex flex-column gap-1">
                                            <a href="mailto:{{ $email }}">{{ $email }}</a>
                                        </div>
                                    </li>
                                    <li class="contact-item">
                                        <div class="contact-icon"><i class="ph ph-map-pin"></i></div>
                                        <div class="d-flex flex-column gap-1">
                                            {!! nl2br(e($f->contacto_direccion ?? 'Av. Ernesto Diez Canseco 204, Miraflores, Lima, Perú')) !!}
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div class="col-sm-6 col-xl-5 fade_up_anim" data-delay=".4">
                                <h4 class="mb-4">Promociones</h4>
                                <p style="max-width:520px; line-height:1.7;">{{ $f->promo_texto ?? 'Escanea el código QR y síguenos en Instagram para novedades, tips de piel y ofertas especiales.' }}</p>
                                <div class="pt-3 text-center" style="display:flex; flex-direction:column; align-items:center;">
                                    <a href="{{ $igUrl }}" target="_blank" rel="noopener">
                                        <img src="{{ $qrImg }}" width="170" height="170" alt="QR Instagram Amour Spa" class="img-fluid" style="max-width:170px;border-radius:10px;background:#fff;padding:6px;box-shadow:0 10px 30px rgba(0,0,0,.15);">
                                    </a>
                                    <p class="mt-2 mb-0 small text-n500">{{ $email }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="copyright-two d-flex flex-wrap gap-3 align-items-center justify-content-center px-3" style="padding-top:8px;">
                <p>Copyright © <a href="{{ url('/') }}" class="text-secondary fw-semibold">Amour Spa</a> <span id="year"></span>. Todos los derechos reservados · Miraflores, Lima.</p>
            </div>
        </div>
    </div>
</footer>
