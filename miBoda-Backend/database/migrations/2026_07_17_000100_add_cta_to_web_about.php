<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Campos para el bloque CTA "¿Lista para tu momento de calma?" que aparece al
 * final de la página pública "Quiénes Somos" (nosotros.blade.php). Hasta ahora
 * estaba hardcodeado en la vista; con estas columnas se administra desde el
 * mismo panel "Sobre Nosotros".
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('web_about')) {
            return;
        }

        Schema::table('web_about', function (Blueprint $table) {
            if (!Schema::hasColumn('web_about', 'cta_eyebrow')) {
                $table->string('cta_eyebrow', 150)->nullable()->after('bullets')
                      ->comment('Etiqueta superior del CTA final, ej. "Votre rituel vous attend"');
            }
            if (!Schema::hasColumn('web_about', 'cta_titulo')) {
                $table->string('cta_titulo', 255)->nullable()->after('cta_eyebrow')
                      ->comment('Título del CTA final');
            }
            if (!Schema::hasColumn('web_about', 'cta_descripcion')) {
                $table->text('cta_descripcion')->nullable()->after('cta_titulo')
                      ->comment('Texto descriptivo del CTA final');
            }
            if (!Schema::hasColumn('web_about', 'cta_btn_texto')) {
                $table->string('cta_btn_texto', 120)->nullable()->after('cta_descripcion')
                      ->comment('Texto del botón del CTA final');
            }
            if (!Schema::hasColumn('web_about', 'cta_btn_url')) {
                $table->string('cta_btn_url', 500)->nullable()->after('cta_btn_texto')
                      ->comment('URL del botón del CTA final; si está vacío usa el WhatsApp del sitio');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('web_about')) {
            return;
        }

        Schema::table('web_about', function (Blueprint $table) {
            foreach (['cta_eyebrow', 'cta_titulo', 'cta_descripcion', 'cta_btn_texto', 'cta_btn_url'] as $col) {
                if (Schema::hasColumn('web_about', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
