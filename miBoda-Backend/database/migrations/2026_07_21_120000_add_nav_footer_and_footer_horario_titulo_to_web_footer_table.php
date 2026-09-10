<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_footer', function (Blueprint $table) {
            if (! Schema::hasColumn('web_footer', 'nav_footer')) {
                $table->text('nav_footer')->nullable()->after('footer_bullets');
            }

            if (! Schema::hasColumn('web_footer', 'footer_horario_titulo')) {
                $table->string('footer_horario_titulo', 120)->nullable()->after('nav_footer');
            }
        });

        $row = DB::table('web_footer')->where('id_footer', 1)->first();
        if ($row) {
            $updates = [];

            if (Schema::hasColumn('web_footer', 'footer_horario_titulo') && empty($row->footer_horario_titulo)) {
                $updates['footer_horario_titulo'] = 'Horario';
            }

            if (Schema::hasColumn('web_footer', 'nav_footer') && empty($row->nav_footer)) {
                $updates['nav_footer'] = json_encode([
                    'links' => [
                        'title' => 'Links',
                        'items' => [
                            ['label' => 'Inicio', 'href' => '/'],
                            ['label' => 'Quiénes Somos', 'href' => '/#about'],
                            ['label' => 'Rituales', 'href' => '/#services'],
                            ['label' => 'FAQ', 'href' => '/#faq'],
                            ['label' => 'Contacto', 'href' => '/#contact'],
                        ],
                    ],
                    'services' => [
                        'title' => 'Servicios',
                        'items' => [
                            ['label' => 'Relajante', 'href' => '/#services'],
                            ['label' => 'Sensorial', 'href' => '/#services'],
                            ['label' => 'Pierres', 'href' => '/#services'],
                            ['label' => 'Peau', 'href' => '/#services'],
                            ['label' => 'Signature', 'href' => '/#services'],
                        ],
                    ],
                ], JSON_UNESCAPED_UNICODE);
            }

            if (! empty($updates)) {
                $updates['updated_at'] = now();
                DB::table('web_footer')->where('id_footer', 1)->update($updates);
            }
        }
    }

    public function down(): void
    {
        Schema::table('web_footer', function (Blueprint $table) {
            if (Schema::hasColumn('web_footer', 'footer_horario_titulo')) {
                $table->dropColumn('footer_horario_titulo');
            }

            if (Schema::hasColumn('web_footer', 'nav_footer')) {
                $table->dropColumn('nav_footer');
            }
        });
    }
};