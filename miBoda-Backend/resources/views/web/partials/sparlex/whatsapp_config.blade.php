@php
    $waConfig = \App\Models\WebWhatsappConfig::find(1);
    if (!$waConfig) {
        $waConfig = (object) \App\Services\WhatsappConfigSync::defaultsForCreate();
    }
@endphp
<script>
window.RM_WA = {
  numero:   @json(preg_replace('/\D/', '', $waConfig->wa_numero ?? '51982311335')),
  mensaje:  @json($waConfig->wa_mensaje ?? '¡Hola! Me gustaría hacer una reserva en Royal Masajes. ¿Podrían indicarme la disponibilidad? ¡Gracias!'),
  burbuja1: @json($waConfig->wa_burbuja_linea1 ?? '💆‍♀️ ¿Lista para reservar tu experiencia?'),
  burbuja2: @json($waConfig->wa_burbuja_linea2 ?? '¡Escríbenos!'),
  label:    @json($waConfig->wa_label ?? 'WhatsApp'),
  badge:    @json($waConfig->wa_badge ?? '1'),
  delay:    {{ (float) ($waConfig->wa_delay_segundos ?? 2.5) }},
  activo:   @json(($waConfig->Activo ?? 'S') === 'S'),
};
</script>
