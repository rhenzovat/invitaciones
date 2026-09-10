<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            $table->text('video_texto')->nullable();
            $table->text('galeria_texto')->nullable();
            $table->string('galeria_nota', 255)->nullable();
            $table->string('galeria_boton_subir', 100)->nullable();
            $table->string('galeria_boton_ver', 100)->nullable();
            $table->text('cancion_texto')->nullable();
        });

        DB::table('web_evento')->update([
            'video_texto' => 'Un pequeño adelanto de nuestra historia',
            'galeria_texto' => 'Comparte tus momentos especiales con nosotros',
            'galeria_nota' => 'Sube tus fotos desde el día de la boda',
            'galeria_boton_subir' => 'Subir Foto',
            'galeria_boton_ver' => 'Ver Galería',
            'cancion_texto' => '¿Qué canción no puede faltar en nuestra celebración?',
        ]);
    }

    public function down(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            $table->dropColumn(['video_texto', 'galeria_texto', 'galeria_nota', 'galeria_boton_subir', 'galeria_boton_ver', 'cancion_texto']);
        });
    }
};
