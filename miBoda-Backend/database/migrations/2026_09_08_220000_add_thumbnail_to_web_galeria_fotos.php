<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Las fotos que suben los invitados se guardan a resolución completa (para
 * que se puedan descargar en buena calidad), pero mostrar cientos de fotos
 * a resolución original en la grilla de la galería es lo que la vuelve
 * lenta. Esta columna guarda una miniatura liviana generada en el momento
 * de subir la foto, para usarla solo en la grilla.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_galeria_fotos', function (Blueprint $table) {
            $table->string('url_imagen_thumb', 500)->nullable()->after('url_imagen');
        });
    }

    public function down(): void
    {
        Schema::table('web_galeria_fotos', function (Blueprint $table) {
            $table->dropColumn('url_imagen_thumb');
        });
    }
};
