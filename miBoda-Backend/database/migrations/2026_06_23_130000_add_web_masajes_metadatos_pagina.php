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

        $slug = 'web_masajes';
        $now  = now();

        $row = [
            'nombre_pagina'      => $slug,
            'titulo_pagina'      => 'Masajes Tántricos para Mujeres | Royal Sensory Experience Massage',
            'descripcion_pagina' => 'Masajes tántricos y sensoriales exclusivos para mujeres en Lima. Conoce nuestras experiencias, beneficios y reserva tu sesión privada por WhatsApp.',
            'activo'             => 'S',
            'updated_at'         => $now,
        ];

        $exists = DB::table('metadatos_paginas')->where('nombre_pagina', $slug)->exists();

        if ($exists) {
            DB::table('metadatos_paginas')->where('nombre_pagina', $slug)->update($row);
        } else {
            // Migrar textos desde web_servicios si existía (misma ruta /masajes)
            $legacy = DB::table('metadatos_paginas')->where('nombre_pagina', 'web_servicios')->first();
            if ($legacy) {
                if (! empty($legacy->titulo_pagina)) {
                    $row['titulo_pagina'] = $legacy->titulo_pagina;
                }
                if (! empty($legacy->descripcion_pagina)) {
                    $row['descripcion_pagina'] = $legacy->descripcion_pagina;
                }
            }

            DB::table('metadatos_paginas')->insert(array_merge($row, [
                'created_at' => $now,
            ]));
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('metadatos_paginas')) {
            DB::table('metadatos_paginas')->where('nombre_pagina', 'web_masajes')->delete();
        }
    }
};
