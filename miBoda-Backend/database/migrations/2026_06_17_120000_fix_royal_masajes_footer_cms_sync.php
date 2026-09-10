<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Corrige datos del footer heredados de plantillas de marketing digital
 * (impacto-gigante / redes sociales) para sincronizar admin ↔ sitio público Royal Masajes.
 */
return new class extends Migration
{
    private const MARKETING_SNIPPETS = [
        'negocio explote',
        'redes sociales',
        'marketing digital',
        'Empieza hoy y recibe mensajes',
        'Agencia de marketing',
        '939691536',
        '901967564',
        'Breña, Lima',
    ];

    public function up(): void
    {
        if (! Schema::hasTable('web_footer')) {
            return;
        }

        $row = DB::table('web_footer')->where('id_footer', 1)->first();
        if (! $row) {
            return;
        }

        $updates = [];
        $royalDesc = 'Royal Sensory Experience Massage: relajación profunda y tacto consciente para mujeres profesionales en Lima. Discreción, calidad y bienestar como estilo de vida.';

        if ($this->looksLikeMarketing($row->footer_cta_subtitulo ?? '')) {
            $updates['footer_cta_subtitulo'] = 'Agenda únicamente con reserva previa al WhatsApp.';
        }

        if ($this->looksLikeMarketing($row->footer_cta_titulo ?? '')) {
            $updates['footer_cta_titulo'] = 'Reserva tu Experiencia';
        }

        if ($this->looksLikeMarketing($row->sobre_la_empresa ?? '')) {
            $updates['sobre_la_empresa'] = 'Royal Sensory Experience Massage — agenda únicamente con reserva al WhatsApp 982 311 335.';
        }

        if ($this->looksLikeMarketing($row->descripcion_footer ?? '')) {
            $updates['descripcion_footer'] = $royalDesc;
        }

        if (empty(trim((string) ($row->descripcion_footer ?? '')))) {
            $updates['descripcion_footer'] = $royalDesc;
        }

        if (empty(trim((string) ($row->footer_cta_subtitulo ?? ''))) || $this->looksLikeMarketing($row->footer_cta_subtitulo ?? '')) {
            $updates['footer_cta_subtitulo'] = 'Agenda únicamente con reserva previa al WhatsApp.';
        }

        if (empty(trim((string) ($row->footer_cta_titulo ?? ''))) || $this->looksLikeMarketing($row->footer_cta_titulo ?? '')) {
            $updates['footer_cta_titulo'] = 'Reserva tu Experiencia';
        }

        if (in_array(preg_replace('/\D/', '', (string) ($row->contacto_telefono ?? '')), ['939691536', '901967564'], true)
            || empty(trim((string) ($row->contacto_telefono ?? '')))) {
            $updates['contacto_telefono'] = '982311335';
        }

        if ($this->looksLikeMarketing($row->contacto_direccion ?? '') || empty(trim((string) ($row->contacto_direccion ?? '')))) {
            $updates['contacto_direccion'] = 'Atención privada en Lima, Perú';
        }

        if (Schema::hasColumn('web_footer', 'url_whatsapp')) {
            $wa = (string) ($row->url_whatsapp ?? '');
            if ($wa === '#' || $wa === '' || str_contains($wa, 'socialmedia')) {
                $updates['url_whatsapp'] = 'https://wa.me/51982311335?text=' . rawurlencode(
                    '¡Hola! Me gustaría hacer una reserva en Royal Masajes. ¿Podrían indicarme la disponibilidad? ¡Gracias!'
                );
            }
        }

        if (Schema::hasColumn('web_footer', 'whatsapp_mensaje') && empty(trim((string) ($row->whatsapp_mensaje ?? '')))) {
            $updates['whatsapp_mensaje'] = '¡Hola! Me gustaría hacer una reserva en Royal Masajes. ¿Podrían indicarme la disponibilidad? ¡Gracias!';
        }

        if (Schema::hasColumn('web_footer', 'footer_bullets') && empty(trim((string) ($row->footer_bullets ?? '')))) {
            $updates['footer_bullets'] = json_encode([
                ['icon' => '🛡', 'text' => 'Espacio privado y confidencial'],
                ['icon' => '🌿', 'text' => '+10 años de experiencia'],
                ['icon' => '📍', 'text' => 'Atención privada en Lima, Perú'],
                ['icon' => '👥', 'text' => '+10.000 mujeres atendidas'],
                ['icon' => '💛', 'text' => 'Bienestar como estilo de vida'],
            ], JSON_UNESCAPED_UNICODE);
        }

        if ($updates !== []) {
            $updates['updated_at'] = now();
            DB::table('web_footer')->where('id_footer', 1)->update($updates);
        }
    }

    private function looksLikeMarketing(?string $value): bool
    {
        if ($value === null || trim($value) === '') {
            return false;
        }
        $lower = mb_strtolower($value);
        foreach (self::MARKETING_SNIPPETS as $snippet) {
            if (str_contains($lower, mb_strtolower($snippet))) {
                return true;
            }
        }

        return false;
    }

    public function down(): void
    {
        // Sin reversión: evita reintroducir textos de marketing en producción.
    }
};
