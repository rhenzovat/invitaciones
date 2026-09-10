@php
    $p = $promoBanner ?? null;
    $wa = $urlWhatsapp ?? '#';
@endphp
@if($p && ($p->Activo ?? 'S') === 'S')
<section class="rm-promo-banner">
    <div class="rm-promo-banner__bars rm-promo-banner__bars--top"></div>
    <div class="rm-promo-banner__bg">
        <img src="{{ \App\Support\SparlexPageData::img($p->url_imagen_fondo, 'temp02/img/carousel-1.jpg') }}" alt="Promo" class="rm-promo-banner__img" loading="lazy" decoding="async">
        <div class="rm-promo-banner__overlay"></div>
    </div>
    <div class="rm-promo-banner__content">
        @if($p->subtitulo)<p class="rm-promo-banner__sub">{{ $p->subtitulo }}</p>@endif
        @if($p->titulo)<h2 class="rm-promo-banner__title">{!! $p->titulo !!}</h2>@endif
        <a href="{{ Helpers::whatsappBtnUrl($p->btn_url ?? $wa, $footerCorp ?? null) }}" class="rm-promo-banner__btn">{{ $p->btn_texto ?? 'WhatsApp' }}</a>
    </div>
    <div class="rm-promo-banner__bars rm-promo-banner__bars--bottom"></div>
</section>
@endif
