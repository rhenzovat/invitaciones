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
            $table->string('hero_foto', 500)->nullable();
        });

        DB::table('web_evento')->update([
            'hero_foto' => 'assets/img/hero/hero-principal-wsp.jpeg',
        ]);
    }

    public function down(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            $table->dropColumn('hero_foto');
        });
    }
};
