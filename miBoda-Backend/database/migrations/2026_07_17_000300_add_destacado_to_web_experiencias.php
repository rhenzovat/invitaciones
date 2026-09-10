<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marca "destacado" para las experiencias/rituales. Solo las destacadas se
 * muestran en la sección de servicios del INICIO; en la página /servicios se
 * muestran todas.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('web_experiencias')) {
            return;
        }

        Schema::table('web_experiencias', function (Blueprint $table) {
            if (!Schema::hasColumn('web_experiencias', 'destacado')) {
                $table->tinyInteger('destacado')->default(0)->after('orden')
                      ->comment('1 = se muestra en la sección de servicios del inicio');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('web_experiencias')) {
            return;
        }

        Schema::table('web_experiencias', function (Blueprint $table) {
            if (Schema::hasColumn('web_experiencias', 'destacado')) {
                $table->dropColumn('destacado');
            }
        });
    }
};
