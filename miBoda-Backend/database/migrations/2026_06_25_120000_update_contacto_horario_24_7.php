<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function horario24x7Json(): string
    {
        return json_encode([
            ['dia' => 'Lunes a Domingo', 'hora' => 'Las 24 horas', 'rosa' => true],
        ], JSON_UNESCAPED_UNICODE);
    }

    public function up(): void
    {
        if (! Schema::hasTable('web_pagina_contacto')) {
            return;
        }

        DB::table('web_pagina_contacto')->where('id', 1)->update([
            'horario_dias' => $this->horario24x7Json(),
            'horario_etiqueta' => 'Horario de atención',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Sin reversión automática del contenido.
    }
};
