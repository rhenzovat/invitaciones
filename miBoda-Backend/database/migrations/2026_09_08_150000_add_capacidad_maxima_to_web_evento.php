<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            if (! Schema::hasColumn('web_evento', 'capacidad_maxima')) {
                $table->integer('capacidad_maxima')->default(100)->after('pases_por_defecto');
            }
        });
    }

    public function down(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            if (Schema::hasColumn('web_evento', 'capacidad_maxima')) {
                $table->dropColumn('capacidad_maxima');
            }
        });
    }
};
