@php $wa = $urlWhatsapp ?? '#'; @endphp
<div class="container-fluid pricing py-5" id="precios">
    <div class="container py-5">
        <div class="text-center mb-5">
            <p style="letter-spacing:3px; font-family:'Open Sans',sans-serif; font-weight:800; font-size:12px; text-transform:uppercase; color:#f0c96e; text-shadow:0 2px 8px rgba(0,0,0,.7); margin-bottom:.6rem;">
                NUESTROS PLANES
            </p>
            <h2 style="font-family:'PT Serif',serif; font-size:clamp(2rem,5vw,3.2rem); font-weight:700; color:#fff; text-shadow:0 3px 16px rgba(0,0,0,.8), 0 1px 4px rgba(0,0,0,.9); line-height:1.2; margin-bottom:0;">
                Elige tu Experiencia<br>
                <em style="color:#f4a8c5; font-style:italic; text-shadow:0 3px 16px rgba(0,0,0,.8);">Royal</em>
            </h2>
        </div>
        <div class="row g-4 justify-content-center">
            @forelse($planes ?? [] as $plan)
                @php
                    $chars = is_array($plan->caracteristicas) ? $plan->caracteristicas : (json_decode($plan->caracteristicas ?? '[]', true) ?: []);
                    $btn = Helpers::whatsappBtnUrl($plan->url_whatsapp ?? $wa, $footerCorp ?? null);
                @endphp
                <div class="col-xl-3 col-lg-4 col-md-6 col-sm-12 d-flex">
                    <div class="pricing-item w-100 h-100">
                        <div class="rounded pricing-content h-100 d-flex flex-column">
                            <div class="d-flex align-items-center justify-content-between bg-light rounded-top border-3 border-bottom border-primary p-4" style="min-height: 110px;">
                                <div class="text-muted fw-bold" style="font-size:20px; line-height:1.2;">{{ $plan->precio_nota ?? 'Consulta' }}</div>
                                <h5 class="text-primary text-uppercase m-0 text-end" style="max-width: 50%;">{{ $plan->nombre }}</h5>
                            </div>
                            <div class="p-4 d-flex flex-column flex-grow-1">
                                <div class="flex-grow-1">
                                    @foreach($chars as $ch)
                                        <p><i class="fa fa-check text-primary me-2"></i>{{ is_string($ch) ? $ch : ($ch['texto'] ?? '') }}</p>
                                    @endforeach
                                </div>
                                <a href="{{ $btn }}" class="rm-mc-btn-reserve mt-auto align-self-start">Reservar</a>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="col-12"><div class="p-4 text-center">Configure los planes en el administrador.</div></div>
            @endforelse
        </div>
    </div>
</div>
