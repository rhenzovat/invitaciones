<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El invitado ya no escribe libremente el artista; elige un género de una
 * lista fija (reggaetón, salsa, cumbia, etc.) para que la lista de
 * canciones se pueda organizar/filtrar mejor al armar el playlist real.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_cancion_sugerencias', function (Blueprint $table) {
            $table->renameColumn('artista', 'genero');
        });
    }

    public function down(): void
    {
        Schema::table('web_cancion_sugerencias', function (Blueprint $table) {
            $table->renameColumn('genero', 'artista');
        });
    }
};
