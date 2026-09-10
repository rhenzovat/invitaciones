@php
    use App\Support\AmourPageData;

    $h = $webHeader ?? null;
    $wa = $urlWhatsapp ?? Helpers::landingWhatsappUrl($footerCorp ?? null);
    if (empty($wa) || $wa === '#') {
        $wa = 'https://wa.me/51977807314';
    }
    $logo = $h && $h->url_logo ? AmourPageData::img($h->url_logo, 'temp02/assets/images/inicio/logo-principal-blanco.png') : asset('temp02/assets/images/inicio/logo-principal-blanco.png');
    $navItems = $h->nav_items ?? null;
    if (is_string($navItems)) {
        $navItems = json_decode($navItems, true);
    }
    if (empty($navItems) || !is_array($navItems)) {
        $navItems = [
            ['label' => 'Inicio', 'url' => url('/'), 'side' => 'left', 'key' => 'home', 'type' => 'link'],
            ['label' => 'Quiénes Somos', 'url' => route('nosotros'), 'side' => 'left', 'key' => 'nosotros', 'type' => 'link'],
            ['label' => 'Servicios', 'url' => route('amour.servicios'), 'side' => 'right', 'key' => 'servicios', 'type' => 'link'],
            ['label' => 'Contáctenos', 'url' => route('contacto.pagina'), 'side' => 'right', 'key' => 'contacto', 'type' => 'link'],
        ];
    }
    $ctaItem = collect($navItems)->first(fn ($i) => ($i['type'] ?? '') === 'cta');
    $ctaUrl = $ctaItem['url'] ?? $wa;
    $ctaLabel = $ctaItem['label'] ?? 'Reservas';
    $linkItems = collect($navItems)->filter(fn ($i) => ($i['type'] ?? 'link') !== 'cta');
    $left = $linkItems->filter(fn ($i) => ($i['side'] ?? 'left') === 'left');
    $right = $linkItems->filter(fn ($i) => ($i['side'] ?? '') === 'right');
    $active = $paginaActiva ?? '';
    $ig = collect($redesSociales ?? [])->first(fn ($r) => ($r['tipo'] ?? '') === 'instagram');
    $igUrl = $ig['url'] ?? 'https://www.instagram.com/amour.spa.lima/';
    $isActive = fn ($key) => $active === $key ? 'active' : '';

    // Topbar: contenido administrable desde /admin/header (Editor de Menú — Canvas)
    $topbarBg = $h->topbar_bgcolor ?? '#311014';
    $topbarMensaje = $h->topbar_mensaje_centro ?? $h->top_ubicacion ?? null;
    $topbarWaNumero = $h->topbar_wa_numero ?? null;
    $topbarWaHref = $h->url_whatsapp_top ?? $wa;
    $redesTopbar = collect($redesSociales ?? [])->sortBy('orden')->values();
    $iconoRed = fn ($tipo) => match ($tipo) {
        'facebook'  => 'ph-facebook-logo',
        'instagram' => 'ph-instagram-logo',
        'whatsapp'  => 'ph-whatsapp-logo',
        'tiktok'    => 'ph-tiktok-logo',
        'twitter', 'x' => 'ph-x-logo',
        'youtube'   => 'ph-youtube-logo',
        'linkedin'  => 'ph-linkedin-logo',
        default     => 'ph-link',
    };
@endphp

<header class="mobile-menu d-lg-none mini-scrollbar">
    <div class="container g-0 g-lg-1">
        <nav id="navbar-menu-mobile" class="px-2 px-lg-0">
            <div class="d-flex justify-content-between align-items-center w-100 mobile-menu__top">
                <a href="{{ url('/') }}" aria-label="Amour Spa — Inicio">
                    <img src="{{ $logo }}" alt="Amour Spa Miraflores" style="height: 5rem">
                </a>
                <i class="ph ph-x text-white fs-2 close-menu"></i>
            </div>
            <ul class="mb-0 menu">
                @foreach($linkItems as $item)
                    @php $key = $item['key'] ?? strtolower($item['label'] ?? ''); @endphp
                    <li>
                        <a class="d-flex align-items-center {{ $isActive($key) }}" href="{{ $item['url'] ?? $item['href'] ?? '#' }}">
                            <span>{{ $item['label'] }}</span>
                        </a>
                    </li>
                @endforeach
            </ul>
            <a href="{{ $ctaUrl }}" class="primary-btn max-w-full w-100 d-flex align-items-center justify-content-center gap-2" target="_blank" rel="noopener">
                <i class="ph ph-calendar-check"></i>{{ $ctaLabel }}
            </a>
            <div class="mobile-menu__social">
                <a href="{{ $igUrl }}" target="_blank" rel="noopener" aria-label="Instagram"><i class="ph ph-instagram-logo"></i></a>
                <a href="{{ $wa }}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="ph ph-whatsapp-logo"></i></a>
            </div>
        </nav>
    </div>
</header>
<div class="mobile-menu-overlay d-lg-none"></div>

<div id="topbar" class="topbar d-none d-md-block" style="background-color: {{ $topbarBg }}">
    <div class="container px-0 px-md-2 topbar-inner">
        <div class="topbar-socials topbar-socials--left">
            @foreach($redesTopbar as $red)
                @continue(empty($red['url']))
                <a href="{{ $red['url'] }}" target="_blank" rel="noopener" aria-label="{{ $red['etiqueta'] ?: ucfirst($red['tipo']) }}">
                    <i class="ph {{ $iconoRed($red['tipo']) }}"></i>
                </a>
            @endforeach
        </div>
        @if(!empty($topbarMensaje))
            <div class="topbar-message d-none d-lg-flex">
                <span>{{ $topbarMensaje }}</span>
            </div>
        @endif
        <div class="topbar-right">
            <button type="button" class="search-popup-btn topbar-item" aria-label="Buscar">
                <i class="ph ph-magnifying-glass"></i>
            </button>
            @if(!empty($topbarWaNumero))
                <a class="topbar-item topbar-phone" href="{{ $topbarWaHref }}" target="_blank" rel="noopener">
                    <i class="ph ph-whatsapp-logo"></i>
                    <span>{{ $topbarWaNumero }}</span>
                </a>
            @endif
        </div>
    </div>
</div>

<header id="header" class="header index-5 mini-scrollbar">
    <div class="container px-0 px-md-2">
        <nav id="navbar-menu" class="amour-navbar">
            <div class="amour-navbar__cluster">
                <ul class="mb-0 menu p-0 align-items-lg-center amour-navbar__links amour-navbar__links--left">
                    @foreach($left as $item)
                        @php $key = $item['key'] ?? strtolower($item['label'] ?? ''); @endphp
                        <li>
                            <a class="d-flex align-items-center {{ $isActive($key) }}" href="{{ $item['url'] ?? $item['href'] ?? '#' }}">{{ $item['label'] }}</a>
                        </li>
                    @endforeach
                </ul>
                <a href="{{ url('/') }}" class="amour-navbar__logo" aria-label="Amour Spa">
                    <img src="{{ $logo }}" alt="Amour Spa — Logo">
                </a>
                <ul class="mb-0 menu p-0 align-items-lg-center amour-navbar__links amour-navbar__links--right">
                    @foreach($right as $item)
                        @php $key = $item['key'] ?? strtolower($item['label'] ?? ''); @endphp
                        <li>
                            <a class="d-flex align-items-center {{ $isActive($key) }}" href="{{ $item['url'] ?? $item['href'] ?? '#' }}">{{ $item['label'] }}</a>
                        </li>
                    @endforeach
                </ul>
            </div>
            <a class="outline-btn primary reservas-btn amour-navbar__cta" href="{{ $ctaUrl }}" target="_blank" rel="noopener">
                <i class="ph ph-calendar-check fs-4"></i>{{ $ctaLabel }}
            </a>
            <div class="toggle-menu"><i class="ph ph-list"></i></div>
        </nav>
    </div>
</header>
