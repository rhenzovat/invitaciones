<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function defaultRoyalHorarioJson(): string
    {
        return json_encode([
            ['dia' => 'Lunes – Viernes', 'hora' => '10:00 am – 9:00 pm',  'rosa' => false],
            ['dia' => 'Sábados',         'hora' => '10:00 am – 8:00 pm',  'rosa' => false],
            ['dia' => 'Domingos',        'hora' => 'Solo con reserva anticipada', 'rosa' => true],
            ['dia' => 'Modalidad',       'hora' => 'Solo con reserva previa', 'rosa' => false],
        ], JSON_UNESCAPED_UNICODE);
    }

    private function legacyToJson(?object $row): ?string
    {
        if (! $row) {
            return null;
        }

        $raw = trim((string) ($row->horario_dias ?? ''));
        if ($raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && count($decoded) > 0) {
                return json_encode(array_values($decoded), JSON_UNESCAPED_UNICODE);
            }

            $filas = [];
            if (! empty($row->horario_linea2) && ! empty($row->horario_linea1)) {
                $filas[] = [
                    'dia'  => (string) $row->horario_linea2,
                    'hora' => (string) $row->horario_linea1,
                    'rosa' => false,
                ];
            }

            foreach (preg_split('/\|/', $raw) as $part) {
                $part = trim($part);
                if ($part === '') {
                    continue;
                }
                $pos = strpos($part, ':');
                if ($pos === false) {
                    $filas[] = ['dia' => $part, 'hora' => '', 'rosa' => false];
                    continue;
                }
                $filas[] = [
                    'dia'  => trim(substr($part, 0, $pos)),
                    'hora' => trim(substr($part, $pos + 1)),
                    'rosa' => stripos($part, 'domingo') !== false,
                ];
            }

            if (count($filas) > 0) {
                return json_encode($filas, JSON_UNESCAPED_UNICODE);
            }
        }

        return null;
    }

    public function up(): void
    {
        if (! Schema::hasTable('web_pagina_contacto')) {
            return;
        }

        if (Schema::hasColumn('web_pagina_contacto', 'horario_dias')) {
            Schema::table('web_pagina_contacto', function (Blueprint $table) {
                $table->text('horario_dias')->nullable()->change();
            });
        }

        $row = DB::table('web_pagina_contacto')->where('id', 1)->first();
        if (! $row) {
            return;
        }

        $json = $this->legacyToJson($row) ?? $this->defaultRoyalHorarioJson();

        DB::table('web_pagina_contacto')->where('id', 1)->update([
            'horario_dias' => $json,
            'horario_etiqueta' => $row->horario_etiqueta ?: 'Horario de atención',
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Sin reversión automática del tipo de columna.
    }
};
