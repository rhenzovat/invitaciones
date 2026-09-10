<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Campos de la sección de testimonios del sitio Amour (partials/05_testimonios.blade.php)
 * que el blade ya consume pero no existían en la tabla:
 *   - seccion_descripcion → párrafo introductorio de la columna izquierda.
 *   - url_imagen_lateral  → imagen grande de la columna derecha.
 * Se guardan por fila (patrón de la sección); el blade los lee de la primera.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('web_testimonios')) {
            return;
        }

        Schema::table('web_testimonios', function (Blueprint $table) {
            if (!Schema::hasColumn('web_testimonios', 'seccion_descripcion')) {
                $table->text('seccion_descripcion')->nullable()->after('seccion_titulo')
                      ->comment('Párrafo introductorio de la sección de testimonios');
            }
            if (!Schema::hasColumn('web_testimonios', 'url_imagen_lateral')) {
                $table->string('url_imagen_lateral', 500)->nullable()->after('seccion_descripcion')
                      ->comment('Imagen lateral (columna derecha) de la sección de testimonios');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('web_testimonios')) {
            return;
        }

        Schema::table('web_testimonios', function (Blueprint $table) {
            foreach (['seccion_descripcion', 'url_imagen_lateral'] as $col) {
                if (Schema::hasColumn('web_testimonios', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
