<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('web_pagina_galeria_categoria')) {
            return;
        }

        Schema::create('web_pagina_galeria_categoria', function (Blueprint $table) {
            $table->increments('id');
            $table->string('contexto', 40)->default('royal_galeria');
            $table->string('slug', 60);
            $table->string('nombre', 120);
            $table->integer('orden')->default(0);
            $table->enum('Activo', ['S', 'N'])->default('S');
            $table->timestamps();
            $table->unique(['contexto', 'slug']);
        });

        $defaults = [
            ['slug' => 'sensorial',  'nombre' => 'Sensorial',             'orden' => 1],
            ['slug' => 'relajacion', 'nombre' => 'Relajación',            'orden' => 2],
            ['slug' => 'tantrico',   'nombre' => 'Tántrico',              'orden' => 3],
            ['slug' => 'vip',        'nombre' => 'Nuestros ambientes',    'orden' => 4],
            ['slug' => 'esteticos',  'nombre' => 'Estéticos corporales',  'orden' => 5],
        ];

        foreach ($defaults as $row) {
            DB::table('web_pagina_galeria_categoria')->insert(array_merge($row, [
                'contexto'   => 'royal_galeria',
                'Activo'     => 'S',
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('web_pagina_galeria_categoria');
    }
};
