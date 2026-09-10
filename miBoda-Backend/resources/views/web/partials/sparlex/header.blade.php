@php
    $h = $webHeader ?? null;
    $wa = $h->topbar_wa_href ?? $h->url_whatsapp_top ?? $urlWhatsapp ?? Helpers::landingWhatsappUrl($footerCorp ?? null);
    $promo = $h->topbar_mensaje_centro ?? $h->top_ubicacion ?? $h->topbar_promo ?? 'Atención privada en Lima — Reserva al WhatsApp';
    $tel = $h->topbar_wa_numero ?? $h->telefono_numero ?? $h->top_telefonos ?? ($footerCorp->contacto_telefono ?? '982 311 335');
    $logo = $h->url_logo ? \App\Support\SparlexPageData::img($h->url_logo) : asset('temp02/img/inicio/logo-header.png');
    $navItems = $h->nav_items ?? null;
    if (is_string($navItems)) {
        $navItems = json_decode($navItems, true);
    }
    if (empty($navItems) || !is_array($navItems)) {
        $navItems = [
            ['label' => 'Sobre nosotros', 'url' => route('nosotros'), 'side' => 'left'],
            ['label' => 'Masajes', 'url' => route('royal.masajes'), 'side' => 'left'],
            ['label' => 'Galería', 'url' => route('royal.galeria'), 'side' => 'right'],
            ['label' => 'Contacto', 'url' => route('contacto.pagina'), 'side' => 'right'],
        ];
    }
    $left = collect($navItems)->filter(fn ($i) => ($i['side'] ?? 'left') === 'left');
    $right = collect($navItems)->filter(fn ($i) => ($i['side'] ?? '') === 'right');
    $homeUrl = rtrim(url('/'), '/');
    $mobileNavItems = collect($navItems)->reject(function ($item) use ($homeUrl) {
        $label = strtolower(trim($item['label'] ?? ''));
        if (in_array($label, ['inicio', 'home'], true)) {
            return true;
        }
        $itemUrl = rtrim($item['url'] ?? $item['href'] ?? '#', '/');
        return $itemUrl === '' || $itemUrl === $homeUrl;
    });
    
    $topbarBgColor = $h->topbar_bgcolor ?? '#111111';
    $navBgColor = $h->nav_bgcolor ?? '#ffffff';
    $navLinkColor = $h->nav_link_color ?? '#2c1a0e';

    $redesTopbar = $redesSociales ?? \App\Support\SparlexPageData::normalizeRedesList($h->redes_side ?? null);

    $redesIconos = [
        'facebook'  => 'fab fa-facebook-f',
        'instagram' => 'fab fa-instagram',
        'whatsapp'  => 'fab fa-whatsapp',
        'tiktok'    => 'fab fa-tiktok',
        'youtube'   => 'fab fa-youtube',
        'linkedin'  => 'fab fa-linkedin-in',
        'twitter'   => 'fab fa-twitter',
        'link'      => 'fas fa-link',
    ];
@endphp
<style>
    .rm-topbar { background-color: {{ $topbarBgColor }} !important; }
    .rm-navbar { background-color: {{ $navBgColor }} !important; }
    .rm-navbar .rm-nav-link { color: {{ $navLinkColor }} !important; }
</style>
<div class="rm-header-wrap">
    <div class="rm-topbar">
        <div class="rm-topbar__inner">
            <div class="rm-topbar__social">
                @if(!empty($redesTopbar))
                    @foreach($redesTopbar as $red)
                        @php
                            $tipo = $red['tipo'] ?? 'link';
                            $redUrl = trim($red['url'] ?? '');
                            if ($tipo === 'whatsapp' && $redUrl === '') {
                                $redUrl = $wa;
                            }
                            if ($redUrl === '' || $redUrl === '#') {
                                continue;
                            }
                            $redIcon = $redesIconos[$tipo] ?? 'fas fa-link';
                        @endphp
                        <a href="{{ $redUrl }}" target="_blank" rel="noopener" title="{{ $red['etiqueta'] !== '' ? $red['etiqueta'] : $tipo }}">
                            <i class="{{ $redIcon }}"></i>
                        </a>
                    @endforeach
                @endif
            </div>
            <div class="rm-topbar__promo"><i class="fas fa-tag"></i> {{ $promo }}</div>
            <div class="rm-topbar__contact">
                <button class="rm-topbar__search" data-bs-toggle="modal" data-bs-target="#searchModal" type="button"><i class="fas fa-search"></i></button>
                <span><i class="fab fa-whatsapp"></i> <a href="{{ $wa }}" class="text-white text-decoration-none">{{ $tel }}</a></span>
            </div>
        </div>
    </div>
    <nav class="rm-navbar" id="rmNavbar">
    <div class="rm-navbar__inner">
        <div class="rm-nav-left">
            <ul class="rm-nav-list">
                @foreach($left as $item)
                    @php 
                        $itemUrl = $item['url'] ?? $item['href'] ?? '#'; 
                        // Alternativa ultra-segura: extrae la ruta limpia (ej: 'contacto')
                        $segmento = trim(parse_url($itemUrl, PHP_URL_PATH), '/');
                        
                        $isActive = (($paginaActiva ?? '') === ($item['key'] ?? '')) 
                                    || (request()->url() === rtrim($itemUrl, '/'))
                                    || ($segmento !== '' && request()->is($segmento . '*'));
                    @endphp
                    <li>
                        <a href="{{ $itemUrl }}" class="rm-nav-link {{ $isActive ? 'active' : '' }}">
                            {{ $item['label'] ?? '' }}
                        </a>
                    </li>
                @endforeach
            </ul>
        </div>
        
        <div class="rm-nav-brand">
            <a href="{{ url('/') }}"><img src="{{ $logo }}" alt="Royal Masajes" class="rm-logo-img" width="180" height="90" decoding="async"></a>
        </div>
        
        <div class="rm-nav-right">
            <ul class="rm-nav-list">
                @foreach($right as $item)
                    @php 
                        $itemUrl = $item['url'] ?? $item['href'] ?? '#'; 
                        $segmento = trim(parse_url($itemUrl, PHP_URL_PATH), '/');
                        
                        $isActive = (($paginaActiva ?? '') === ($item['key'] ?? '')) 
                                    || (request()->url() === rtrim($itemUrl, '/'))
                                    || ($segmento !== '' && request()->is($segmento . '*'));
                    @endphp
                    <li>
                        <a href="{{ $itemUrl }}" class="rm-nav-link {{ $isActive ? 'active' : '' }}">
                            {{ $item['label'] ?? '' }}
                        </a>
                    </li>
                @endforeach
            </ul>
        </div>
        
        <button class="rm-toggler" id="rmToggler" aria-label="Menú" type="button">
            <span class="rm-toggler-icon">
                <span class="line-1"></span>
                <span class="line-2"></span>
                <span class="line-3"></span>
            </span>
        </button>
    </div>

    <div class="rm-mobile-menu" id="rmMobileMenu">
        <ul class="rm-mobile-list">
            @foreach($navItems as $item)
                @php
                    $itemUrl = $item['url'] ?? $item['href'] ?? '#';
                    $segmento = trim(parse_url($itemUrl, PHP_URL_PATH), '/');
                    $isActive = (($paginaActiva ?? '') === ($item['key'] ?? ''))
                        || (request()->url() === rtrim($itemUrl, '/'))
                        || ($segmento !== '' && request()->is($segmento . '*'));
                @endphp
                <li>
                    <a href="{{ $itemUrl }}" class="{{ $isActive ? 'active' : '' }}">
                        {{ $item['label'] ?? '' }}
                    </a>
                </li>
            @endforeach
        </ul>
    </div>
</nav>
</div>
@include('web.partials.sparlex.search_modal')
