<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const CONTEXTO = 'royal_galeria';

    public function up(): void
    {
        if (! Schema::hasTable('web_pagina_galeria_categoria')) {
            return;
        }

        DB::table('web_pagina_galeria_categoria')
            ->where('contexto', self::CONTEXTO)
            ->where('slug', 'vip')
            ->update([
                'nombre'     => 'Nuestros ambientes',
                'updated_at' => now(),
            ]);

        $existeEsteticos = DB::table('web_pagina_galeria_categoria')
            ->where('contexto', self::CONTEXTO)
            ->where('slug', 'esteticos')
            ->exists();

        if (! $existeEsteticos) {
            DB::table('web_pagina_galeria_categoria')->insert([
                'contexto'   => self::CONTEXTO,
                'slug'       => 'esteticos',
                'nombre'     => 'Estéticos corporales',
                'orden'      => 5,
                'Activo'     => 'S',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('web_pagina_galeria_categoria')) {
            return;
        }

        DB::table('web_pagina_galeria_categoria')
            ->where('contexto', self::CONTEXTO)
            ->where('slug', 'vip')
            ->update(['nombre' => 'Privado VIP']);

        DB::table('web_pagina_galeria_categoria')
            ->where('contexto', self::CONTEXTO)
            ->where('slug', 'esteticos')
            ->delete();
    }
};
