<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Antes las etiquetas del formulario "Sugiere una Canción" y la lista de
 * géneros musicales estaban fijas en código (MiBodaPublicController). Ahora
 * viven en web_evento para poder editarlas desde el admin, igual que ya
 * se hace con los botones de la Galería (galeria_boton_subir, etc.).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            $table->string('cancion_label_nombre', 100)->nullable();
            $table->string('cancion_label_genero', 100)->nullable();
            $table->string('cancion_label_de', 100)->nullable();
            $table->string('cancion_boton', 100)->nullable();
            $table->json('cancion_generos')->nullable();
        });

        DB::table('web_evento')->update([
            'cancion_label_nombre' => 'Nombre de la canción',
            'cancion_label_genero' => 'Género',
            'cancion_label_de' => 'Tu nombre',
            'cancion_boton' => 'Sugerir Canción',
            'cancion_generos' => json_encode([
                'Reggaetón', 'Salsa', 'Cumbia', 'Merengue', 'Bachata',
                'Rock', 'Pop', 'Huayno', 'Saya', 'Vals Criollo', 'Otro',
            ]),
        ]);
    }

    public function down(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            $table->dropColumn(['cancion_label_nombre', 'cancion_label_genero', 'cancion_label_de', 'cancion_boton', 'cancion_generos']);
        });
    }
};
