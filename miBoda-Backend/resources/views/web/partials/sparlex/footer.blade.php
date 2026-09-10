@php
    $f = isset($footerData) && count($footerData) > 0 ? $footerData[0] : null;
    $wa = $urlWhatsapp ?? Helpers::landingWhatsappUrl($f);
    $logoFooter = $f->logo_footer ?? $f->url_logo_footer ?? null;
    $logoFooterUrl = $logoFooter ? \App\Support\SparlexPageData::img($logoFooter) : asset('temp02/img/inicio/logo-footer.png');
    $desc = $f->descripcion_footer ?? $f->sobre_la_empresa ?? 'Royal Sensory Experience Massage: relajación profunda y tacto consciente para mujeres profesionales en Lima.';
    $gitImg = \App\Support\SparlexPageData::img(
        $f->url_imagen_central ?? $f->url_imagen_git ?? null,
        'temp02/img/inicio/footer-central.jpg'
    );

    $redesArr = $redesSociales ?? [];
    $bulletsRaw = $f->footer_bullets ?? null;
    $bulletsArr = is_string($bulletsRaw) && $bulletsRaw !== '' ? (json_decode($bulletsRaw, true) ?: []) : (is_array($bulletsRaw) ? $bulletsRaw : []);
@endphp
<div class="container-fluid footer py-5">
    <div class="container py-5">
        <div class="row g-5">
            <div class="col-md-6 col-lg-6 col-xl-3">
                <div class="footer-item rm-footer-brand">
                    <a href="{{ url('/') }}" class="rm-footer-logo-link">
                        <img src="{{ $logoFooterUrl }}" alt="Royal Masajes" class="rm-footer-logo" loading="lazy" decoding="async" width="160" height="80">
                    </a>
                    <p class="rm-footer-desc">{{ $desc }}</p>
                    @if(!empty($redesArr))
                    <div class="rm-footer-social">
                        @include('web.partials.sparlex.redes_sociales', [
                            'redes' => $redesArr,
                            'wa' => $wa,
                            'variant' => 'inline',
                        ])
                    </div>
                    @endif
                </div>
            </div>
            <div class="col-12 col-xl-9">
                <div class="rm-git">
                    <div class="rm-git__img-wrap">
                        <img src="{{ $gitImg }}" alt="Royal Masajes" class="rm-git__img" loading="lazy" decoding="async">
                    </div>
                    <div class="rm-git__content">
                        <h2 class="rm-git__title">{{ $f->footer_cta_titulo ?? $f->git_titulo ?? 'Reserva tu Experiencia' }}</h2>
                        <p class="rm-git__sub">{{ $f->footer_cta_subtitulo ?? $f->git_subtitulo ?? 'Agenda únicamente con reserva al WhatsApp.' }}</p>
                        <div class="rm-git__phone">
    <p class="rm-git__item" style="font-size: 18px;">
        <a href="{{ $wa }}" style="display: inline-flex; align-items: center; gap: 10px;">
            <i class="fab fa-whatsapp"></i>
            <span>{{ $f->contacto_telefono ?? '982 311 335' }}</span>
        </a>
    </p>
</div>
                        <div class="rm-git__grid">
                            @foreach($bulletsArr as $bi => $bul)
                                <p class="rm-git__item">
                                    <span class="rm-git__bicon">{{ $bul['icon'] ?? '✦' }}</span>
                                    {{ $bul['text'] ?? '' }}
                                </p>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="container-fluid copyright py-4">
    <div class="container">
        <div class="row g-4 align-items-center">
            <div class="col-md-6 text-center text-md-start">
                <span class="text-light"><a href="{{ url('/') }}" class="text-light"><i class="fas fa-copyright text-light me-2"></i>Royal Sensory Experience Massage</a></span>
            </div>
            <div class="col-md-6 text-center text-md-end" style="font-size:12px;">
                <a href="{{ route('royal.terminos') }}" class="text-white me-3">Términos y Condiciones</a>
                <a href="{{ route('royal.politicas') }}" class="text-white">Políticas de Privacidad</a>
            </div>
        </div>
    </div>
</div>
<a href="#" class="btn btn-primary btn-primary-outline-0 btn-md-square rounded-circle back-to-top"><i class="fa fa-arrow-up"></i></a>
