<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('web_footer')) {
            return;
        }

        Schema::table('web_footer', function ($table) {
            if (! Schema::hasColumn('web_footer', 'footer_redes_titulo')) {
                $table->string('footer_redes_titulo', 160)->nullable();
            }
            if (! Schema::hasColumn('web_footer', 'footer_redes_subtitulo')) {
                $table->string('footer_redes_subtitulo', 255)->nullable();
            }
        });

        $patch = ['updated_at' => now()];
        $row = DB::table('web_footer')->where('id_footer', 1)->first();
        if ($row) {
            if (empty($row->footer_redes_titulo)) {
                $patch['footer_redes_titulo'] = 'Síguenos en Redes';
            }
            if (empty($row->footer_redes_subtitulo)) {
                $patch['footer_redes_subtitulo'] = 'Mantente al día con nuestras novedades y experiencias.';
            }
            if (count($patch) > 1) {
                DB::table('web_footer')->where('id_footer', 1)->update($patch);
            }
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('web_footer')) {
            return;
        }
        Schema::table('web_footer', function ($table) {
            if (Schema::hasColumn('web_footer', 'footer_redes_titulo')) {
                $table->dropColumn('footer_redes_titulo');
            }
            if (Schema::hasColumn('web_footer', 'footer_redes_subtitulo')) {
                $table->dropColumn('footer_redes_subtitulo');
            }
        });
    }
};
