<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('web_about')) {
            return;
        }

        Schema::table('web_about', function (Blueprint $table) {
            if (!Schema::hasColumn('web_about', 'banner_titulo')) {
                $table->string('banner_titulo', 255)->nullable()->after('id_about');
            }
            if (!Schema::hasColumn('web_about', 'banner_subtitulo')) {
                $table->string('banner_subtitulo', 255)->nullable()->after('banner_titulo');
            }
            if (!Schema::hasColumn('web_about', 'banner_url_imagen')) {
                $table->string('banner_url_imagen', 500)->nullable()->after('banner_subtitulo');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('web_about')) {
            return;
        }

        Schema::table('web_about', function (Blueprint $table) {
            foreach (['banner_titulo', 'banner_subtitulo', 'banner_url_imagen'] as $col) {
                if (Schema::hasColumn('web_about', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
