<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_contacto_columna', function (Blueprint $table) {
            if (!Schema::hasColumn('web_contacto_columna', 'icono')) {
                $table->string('icono', 100)->nullable()->after('descripcion');
            }
        });
    }

    public function down(): void
    {
        Schema::table('web_contacto_columna', function (Blueprint $table) {
            $table->dropColumn('icono');
        });
    }
};
