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
            if (! Schema::hasColumn('web_evento', 'countdown_nota_1')) {
                $table->text('countdown_nota_1')->nullable()->after('hero_subtitulo');
            }
            if (! Schema::hasColumn('web_evento', 'countdown_nota_2')) {
                $table->text('countdown_nota_2')->nullable()->after('countdown_nota_1');
            }
            if (! Schema::hasColumn('web_evento', 'vestimenta_img_novia')) {
                $table->string('vestimenta_img_novia', 500)->nullable()->after('vestimenta_restriccion');
            }
            if (! Schema::hasColumn('web_evento', 'vestimenta_img_novio')) {
                $table->string('vestimenta_img_novio', 500)->nullable()->after('vestimenta_img_novia');
            }
        });

        DB::table('web_evento')->whereNull('countdown_nota_1')->update([
            'countdown_nota_1' => 'Nuestro matrimonio marcará una etapa inolvidable en nuestras vidas, y queremos compartirlo contigo.',
            'countdown_nota_2' => '¡Nos encantaría que nos acompañes!',
            'vestimenta_img_novia' => 'assets/img/vestimenta/vestido2.png',
            'vestimenta_img_novio' => 'assets/img/vestimenta/traje.png',
        ]);
    }

    public function down(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            foreach (['countdown_nota_1', 'countdown_nota_2', 'vestimenta_img_novia', 'vestimenta_img_novio'] as $col) {
                if (Schema::hasColumn('web_evento', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
