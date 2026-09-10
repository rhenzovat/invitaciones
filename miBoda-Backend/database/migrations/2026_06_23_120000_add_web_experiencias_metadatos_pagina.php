<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('metadatos_paginas')) {
            return;
        }

        $slug = 'web_experiencias';
        $now  = now();

        $row = [
            'nombre_pagina'      => $slug,
            'titulo_pagina'      => 'Nuestras Experiencias | Royal Sensory Experience Massage',
            'descripcion_pagina' => 'Explora experiencias sensoriales, masajes tántricos, bienestar femenino, renovación corporal y modelación. Reserva tu sesión privada en Lima.',
            'activo'             => 'S',
            'updated_at'         => $now,
        ];

        $exists = DB::table('metadatos_paginas')->where('nombre_pagina', $slug)->exists();

        if ($exists) {
            DB::table('metadatos_paginas')->where('nombre_pagina', $slug)->update($row);
        } else {
            DB::table('metadatos_paginas')->insert(array_merge($row, [
                'created_at' => $now,
            ]));
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('metadatos_paginas')) {
            DB::table('metadatos_paginas')->where('nombre_pagina', 'web_experiencias')->delete();
        }
    }
};
