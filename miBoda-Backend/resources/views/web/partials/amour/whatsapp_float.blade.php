@php
    $waConfig = \App\Models\WebWhatsappConfig::find(1);
    if (!$waConfig) {
        $waConfig = (object) \App\Services\WhatsappConfigSync::defaultsForCreate();
    }
    $waActivo = ($waConfig->Activo ?? 'S') === 'S';
@endphp
@if($waActivo)
@php
    $waNumero = preg_replace('/\D/', '', $waConfig->wa_numero ?? '51977807314');
    $waMensaje = $waConfig->wa_mensaje ?? 'Hola Amour Spa, me gustaría reservar un ritual de bienestar en Miraflores.';
    $waUrl = 'https://wa.me/' . $waNumero . '?text=' . rawurlencode($waMensaje);
    $burbuja1 = trim((string) ($waConfig->wa_burbuja_linea1 ?? '¿Reservamos tu ritual?'));
    $burbuja2 = trim((string) ($waConfig->wa_burbuja_linea2 ?? ''));
    $waLabel = trim((string) ($waConfig->wa_label ?? 'WhatsApp'));
@endphp
<a
    href="{{ $waUrl }}"
    class="whatsapp-float"
    id="whatsapp-float-btn"
    target="_blank"
    rel="noopener"
    aria-label="{{ $waLabel ?: 'Escríbenos por WhatsApp' }}"
    title="{{ $waLabel ?: 'Escríbenos por WhatsApp' }}"
>
    <span class="whatsapp-float__ring" aria-hidden="true"></span>
    <span class="whatsapp-float__core">
        <i class="ph ph-whatsapp-logo whatsapp-float__icon" aria-hidden="true"></i>
    </span>
    @if($burbuja1 !== '' || $burbuja2 !== '')
    <span class="whatsapp-float__tooltip" role="tooltip">
        @if($burbuja1 !== '')<strong class="whatsapp-float__tooltip-title">{{ $burbuja1 }}</strong>@endif
        @if($burbuja2 !== '')<span class="whatsapp-float__tooltip-sub">{{ $burbuja2 }}</span>@endif
    </span>
    @endif
</a>
@endif
