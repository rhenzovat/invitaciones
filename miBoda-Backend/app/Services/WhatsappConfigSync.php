<?php

namespace App\Services;

use App\Models\WebFooter;
use App\Models\WebHeader;
use App\Models\WebWhatsappConfig;
use Helpers;
use Illuminate\Support\Facades\Schema;

class WhatsappConfigSync
{
    /** Valores por defecto al crear el registro singleton. */
    public static function defaultsForCreate(): array
    {
        $numero  = '51982311335';
        $mensaje = '¡Hola! Me gustaría hacer una reserva en Royal Masajes. ¿Podrían indicarme la disponibilidad? ¡Gracias!';

        $footer = WebFooter::find(1);
        if ($footer) {
            $mensaje = Helpers::whatsappDefaultMessage($footer) ?: $mensaje;
            $digits  = Helpers::whatsappPhoneDigits($footer);
            if ($digits !== '') {
                $numero = $digits;
            }
        }

        return [
            'wa_numero'         => $numero,
            'wa_mensaje'        => $mensaje,
            'wa_burbuja_linea1' => '💆‍♀️ ¿Lista para reservar tu experiencia?',
            'wa_burbuja_linea2' => '¡Escríbenos!',
            'wa_label'          => 'WhatsApp',
            'wa_badge'          => '1',
            'wa_delay_segundos' => 2.5,
            'Activo'            => 'S',
        ];
    }

    /** Sincroniza número/mensaje con footer y header corporativo. */
    public static function syncCorporateContacts(WebWhatsappConfig $cfg): void
    {
        $digits = preg_replace('/\D/', '', (string) $cfg->wa_numero);
        if ($digits === '') {
            return;
        }

        if (strlen($digits) === 9) {
            $digits = '51' . $digits;
        }

        $displayPhone = self::formatPeruDisplay($digits);
        $waUrl        = 'https://wa.me/' . $digits . '?text=' . rawurlencode((string) $cfg->wa_mensaje);

        $footer = WebFooter::find(1);
        if ($footer) {
            $footer->contacto_telefono = $displayPhone;
            $footer->whatsapp_mensaje  = $cfg->wa_mensaje;
            $footer->url_whatsapp      = Helpers::whatsappUrl($footer, $cfg->wa_mensaje, $digits);
            $footer->updated_at        = now();
            $footer->save();
        }

        $header = WebHeader::find(1);
        if ($header) {
            if (Schema::hasColumn('web_header', 'topbar_wa_numero')) {
                $header->topbar_wa_numero = $displayPhone;
            }
            if (Schema::hasColumn('web_header', 'url_whatsapp_top')) {
                $header->url_whatsapp_top = $waUrl;
            }
            if (Schema::hasColumn('web_header', 'topbar_wa_href')) {
                $header->topbar_wa_href = $waUrl;
            }
            $header->updated_at = now();
            $header->save();
        }
    }

    private static function formatPeruDisplay(string $digits): string
    {
        if (strlen($digits) === 11 && str_starts_with($digits, '51')) {
            $local = substr($digits, 2);

            return substr($local, 0, 3) . ' ' . substr($local, 3, 3) . ' ' . substr($local, 6);
        }

        return $digits;
    }
}
