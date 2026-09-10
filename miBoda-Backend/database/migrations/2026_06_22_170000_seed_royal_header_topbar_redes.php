<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('web_header') || ! Schema::hasColumn('web_header', 'redes_side')) {
            return;
        }

        $row = DB::table('web_header')->where('id_header', 1)->first();
        if (! $row) {
            return;
        }

        $raw = $row->redes_side ?? null;
        if ($raw !== null && $raw !== '' && $raw !== '[]') {
            return;
        }

        DB::table('web_header')->where('id_header', 1)->update([
            'redes_side' => json_encode([
                ['tipo' => 'facebook', 'url' => 'https://www.facebook.com/', 'etiqueta' => 'Facebook', 'orden' => 1],
                ['tipo' => 'instagram', 'url' => 'https://www.instagram.com/', 'etiqueta' => 'Instagram', 'orden' => 2],
                ['tipo' => 'whatsapp', 'url' => 'https://wa.me/51982311335', 'etiqueta' => 'WhatsApp', 'orden' => 3],
            ], JSON_UNESCAPED_UNICODE),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Sin reversión automática.
    }
};
