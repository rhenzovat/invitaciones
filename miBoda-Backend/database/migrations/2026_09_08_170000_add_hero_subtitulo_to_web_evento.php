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
            if (! Schema::hasColumn('web_evento', 'hero_subtitulo')) {
                $table->string('hero_subtitulo', 255)->nullable()->after('fecha_boda_texto');
            }
        });

        DB::table('web_evento')->whereNull('hero_subtitulo')->update([
            'hero_subtitulo' => 'Tu presencia es nuestro mejor regalo y hace este día aún más especial',
        ]);
    }

    public function down(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            if (Schema::hasColumn('web_evento', 'hero_subtitulo')) {
                $table->dropColumn('hero_subtitulo');
            }
        });
    }
};
