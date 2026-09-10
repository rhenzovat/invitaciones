@php
    $lista = $redesSociales ?? [];
@endphp
@if(!empty($lista))
<section style="background:#2c1a0e; padding:48px 0;">
    <div class="container text-center">
        <h4 style="font-family:'PT Serif',serif; color:#fff; margin-bottom:8px;">
            {{ $redesSocialesTitulo ?? 'Síguenos en Redes' }}
        </h4>
        <p style="color:rgba(255,255,255,0.6); font-size:13px; margin-bottom:24px;">
            {{ $redesSocialesSubtitulo ?? 'Mantente al día con nuestras novedades y experiencias.' }}
        </p>
        <div class="d-flex justify-content-center gap-3 flex-wrap">
            @include('web.partials.sparlex.redes_sociales', [
                'redes' => $lista,
                'wa' => $urlWhatsapp ?? '#',
                'variant' => 'circles-lg',
            ])
        </div>
    </div>
</section>
@endif
