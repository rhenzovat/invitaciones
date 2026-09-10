<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Agrega los campos que el template público "Sobre Nosotros" (features-6) ya
 * consume pero que hasta ahora no existían en la tabla, por lo que mostraban
 * valores fijos y no eran editables desde el admin:
 *   - stat_valor      → el número grande del recuadro (ej. "100%").
 *   - stat_etiqueta   → el texto bajo el número (ej. "Soin dédié · Atención con reserva").
 *   - bullets         → lista de checks (JSON de strings) del bloque derecho.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('web_about')) {
            return;
        }

        Schema::table('web_about', function (Blueprint $table) {
            if (!Schema::hasColumn('web_about', 'stat_valor')) {
                $table->string('stat_valor', 30)->nullable()->after('descripcion')
                      ->comment('Número/valor del recuadro sobre la imagen, ej. 100%');
            }
            if (!Schema::hasColumn('web_about', 'stat_etiqueta')) {
                $table->string('stat_etiqueta', 255)->nullable()->after('stat_valor')
                      ->comment('Texto descriptivo bajo el valor del recuadro');
            }
            if (!Schema::hasColumn('web_about', 'bullets')) {
                $table->text('bullets')->nullable()->after('stat_etiqueta')
                      ->comment('Lista de checks (JSON de strings) del bloque Sobre Nosotros');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('web_about')) {
            return;
        }

        Schema::table('web_about', function (Blueprint $table) {
            foreach (['stat_valor', 'stat_etiqueta', 'bullets'] as $col) {
                if (Schema::hasColumn('web_about', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
