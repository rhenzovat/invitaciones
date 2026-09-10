@php
    $waConfig = \App\Models\WebWhatsappConfig::find(1);
    if (!$waConfig) {
        $waConfig = (object) \App\Services\WhatsappConfigSync::defaultsForCreate();
    }
    $waNumero = preg_replace('/\D/', '', $waConfig->wa_numero ?? '51977807314');
    $waMensaje = $waConfig->wa_mensaje ?? 'Hola Amour Spa, me gustaría reservar un ritual de bienestar en Miraflores.';
    $waUrl = 'https://wa.me/' . $waNumero . '?text=' . urlencode($waMensaje);
@endphp
<script>
window.AMOUR_WA = {
  numero:   @json($waNumero),
  mensaje:  @json($waMensaje),
  url:      @json($waUrl),
  burbuja1: @json($waConfig->wa_burbuja_linea1 ?? '¿Reservamos tu ritual?'),
  burbuja2: @json($waConfig->wa_burbuja_linea2 ?? '¡Escríbenos!'),
  label:    @json($waConfig->wa_label ?? 'WhatsApp'),
  badge:    @json($waConfig->wa_badge ?? '1'),
  delay:    {{ (float) ($waConfig->wa_delay_segundos ?? 2.5) }},
  activo:   @json(($waConfig->Activo ?? 'S') === 'S'),
};
</script>
