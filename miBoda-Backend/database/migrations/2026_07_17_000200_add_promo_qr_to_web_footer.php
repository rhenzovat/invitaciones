<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Campos de la columna "Promociones" del footer Amour (footer.blade.php), que
 * hasta ahora usaban valores fijos y no eran editables:
 *   - promo_texto → texto descriptivo del bloque Promociones.
 *   - url_qr      → imagen del código QR.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('web_footer')) {
            return;
        }

        Schema::table('web_footer', function (Blueprint $table) {
            if (!Schema::hasColumn('web_footer', 'promo_texto')) {
                $table->text('promo_texto')->nullable()->after('texto_copyright')
                      ->comment('Texto del bloque Promociones del footer');
            }
            if (!Schema::hasColumn('web_footer', 'url_qr')) {
                $table->string('url_qr', 500)->nullable()->after('promo_texto')
                      ->comment('Imagen del código QR del footer');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('web_footer')) {
            return;
        }

        Schema::table('web_footer', function (Blueprint $table) {
            foreach (['promo_texto', 'url_qr'] as $col) {
                if (Schema::hasColumn('web_footer', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
