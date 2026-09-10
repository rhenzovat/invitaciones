@php
    $sec = $planesSeccion ?? null;
    $wa = $urlWhatsapp ?? Helpers::landingWhatsappUrl($footerCorp ?? null);
    $items = $planes ?? collect();
    $half = (int) ceil(max($items->count(), 1) / 2);
    $left = $items->take($half);
    $right = $items->skip($half);
    $sectionId = ($amourRitualesFull ?? false) ? 'id="servicios-tarifas"' : '';
@endphp
<section {!! $sectionId !!} class="pricing-section white">
    <div class="right-text d-none d-xl-block"><h2 class="vertical dmSansFont">Lista de precios</h2></div>
    <div class="container">
        <div class="row align-items-center g-3 gx-xl-4 section-title justify-content-center align-items-center">
            <div class="col-lg-6 d-flex justify-content-center align-items-center flex-column text-center">
                <h4 class="sub-heading fade_up_anim">{{ $sec->cta_texto ?? $sec->intro_label ?? 'Tarifas · Inversión en calma' }}</h4>
                <h2 class="mb-3 fade_up_anim text-uppercase">{{ $sec->intro_titulo2 ?? $sec->intro_titulo ?? 'La pasión del tacto, el arte de la piel' }}</h2>
                <p class="fade_up_anim" data-delay=".3">{{ $sec->intro_subtitulo ?? 'Precios claros, duración honesta y un solo objetivo: que salgas más ligero, más presente, más tú.' }}</p>
            </div>
        </div>
        <div class="pricing-list-area row">
            <div class="col-lg-6 d-flex flex-column left-side-pricing">
                @foreach($left as $plan)
                    @php
                        $precio = ($plan->precio ?? 0) > 0 ? 'S/ ' . number_format($plan->precio, 0) : ($plan->precio_nota ?? 'Gratis');
                    @endphp
                    <div class="item">
                        <div class="d-flex justify-content-between align-items-center gap-2">
                            <p class="name">{{ $plan->nombre }}</p>
                            <div class="dashed-line"></div>
                            <p class="price">{{ $precio }}</p>
                        </div>
                        @if($plan->descripcion)<p class="pt-1">{{ $plan->descripcion }}</p>@endif
                    </div>
                @endforeach
            </div>
            <div class="col-lg-6 d-flex flex-column right-side-pricing">
                @foreach($right as $plan)
                    @php
                        $precio = ($plan->precio ?? 0) > 0 ? 'S/ ' . number_format($plan->precio, 0) : ($plan->precio_nota ?? 'Gratis');
                    @endphp
                    <div class="item">
                        <div class="d-flex justify-content-between align-items-center gap-2">
                            <p class="name">{{ $plan->nombre }}</p>
                            <div class="dashed-line"></div>
                            <p class="price">{{ $precio }}</p>
                        </div>
                        @if($plan->descripcion)<p class="pt-1">{{ $plan->descripcion }}</p>@endif
                    </div>
                @endforeach
            </div>
        </div>
        <div class="col-12 d-flex justify-content-center mt-4 pt-xl-3">
            <a href="{{ $wa }}" class="outline-btn secondary" target="_blank" rel="noopener">Consultar disponibilidad <i class="ph ph-arrow-right"></i></a>
        </div>
    </div>
</section>
