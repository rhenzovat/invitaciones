@php $wa = $urlWhatsapp ?? '#'; @endphp
<section class="rm-massage-cards py-5" id="servicios">
    <div class="container py-5">
        <div class="text-center mb-5">
            <p class="fs-5 text-uppercase text-center text-primary mb-2" style="letter-spacing:2px; font-family:'Open Sans',sans-serif; font-weight:700; font-size:13px!important;">Nuestros Servicios</p>
            <h1 class="rm-mc-heading">Masajes Tántricos para Mujeres</h1>
        </div>
        <div class="row g-4">
            @forelse($experiencias ?? [] as $exp)
                @php $img = \App\Support\SparlexPageData::img($exp->url_imagen, 'temp02/img/gallery-1.jpg'); $btn = Helpers::whatsappBtnUrl($exp->btn_url ?? $wa, $footerCorp ?? null); @endphp
                <div class="col-lg-6">
                    <div class="rm-mc-card" id="exp-{{ $exp->id_experiencia }}">
                        <div class="rm-mc-img-wrap">
                            @if($exp->badge)<span class="rm-mc-badge">{{ $exp->badge }}</span>@endif
                            <img src="{{ $img }}" alt="{{ $exp->titulo }}" class="rm-mc-img" loading="lazy" decoding="async">
                        </div>
                        <div class="rm-mc-body">
                            <h2 class="rm-mc-title">{{ $exp->titulo }}</h2>
                            @if($exp->subtitulo)<p class="rm-mc-subtitle">{{ $exp->subtitulo }}</p>@endif
                            <p class="rm-mc-desc">{{ $exp->descripcion }}</p>
                            <p class="rm-mc-price">{{ $exp->precio_nota ?? 'Consultar precio' }}</p>
                            <div class="rm-mc-actions">
                                <a href="{{ $btn }}" class="rm-mc-btn-reserve"><i class="fab fa-whatsapp"></i> {{ $exp->btn_texto ?? 'Reservar' }}</a>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="col-12 text-center text-muted">Configure las experiencias en el administrador.</div>
            @endforelse
        </div>
    </div>
</section>
