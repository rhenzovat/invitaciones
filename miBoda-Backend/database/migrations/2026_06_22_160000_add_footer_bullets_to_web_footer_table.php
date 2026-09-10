<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('web_footer')) {
            return;
        }

        Schema::table('web_footer', function (Blueprint $table) {
            if (! Schema::hasColumn('web_footer', 'footer_bullets')) {
                $table->text('footer_bullets')->nullable()->after('footer_redes');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('web_footer')) {
            return;
        }

        Schema::table('web_footer', function (Blueprint $table) {
            if (Schema::hasColumn('web_footer', 'footer_bullets')) {
                $table->dropColumn('footer_bullets');
            }
        });
    }
};
