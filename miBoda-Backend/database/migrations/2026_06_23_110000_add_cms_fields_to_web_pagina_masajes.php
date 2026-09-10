<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('web_pagina_masajes')) {
            return;
        }

        Schema::table('web_pagina_masajes', function (Blueprint $table) {
            if (! Schema::hasColumn('web_pagina_masajes', 'hero_tag')) {
                $table->string('hero_tag', 120)->default('Royal Sensory Experience');
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'hero_titulo')) {
                $table->string('hero_titulo', 200)->default('Nuestros Masajes Tántricos');
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'hero_url_imagen')) {
                $table->string('hero_url_imagen', 400)->nullable();
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'intro_label')) {
                $table->string('intro_label', 150)->default('Conocimiento & Bienestar');
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'intro_titulo')) {
                $table->string('intro_titulo', 200)->default('Masaje Tántrico —');
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'intro_titulo2')) {
                $table->string('intro_titulo2', 200)->default('Todo lo que necesitas saber');
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'intro_subtitulo')) {
                $table->string('intro_subtitulo', 350)->nullable();
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'cta_texto')) {
                $table->string('cta_texto', 300)->nullable();
            }
            if (! Schema::hasColumn('web_pagina_masajes', 'cta_btn')) {
                $table->string('cta_btn', 80)->default('Chatear por WhatsApp');
            }
        });

        if (DB::table('web_pagina_masajes')->count() === 0) {
            DB::table('web_pagina_masajes')->insert([
                'hero_tag'        => 'Royal Sensory Experience',
                'hero_titulo'     => 'Nuestros Masajes Tántricos',
                'intro_label'     => 'Conocimiento & Bienestar',
                'intro_titulo'    => 'Masaje Tántrico —',
                'intro_titulo2'   => 'Todo lo que necesitas saber',
                'intro_subtitulo' => 'Descubre la filosofía, los beneficios y la experiencia del masaje tántrico auténtico para mujeres en Lima.',
                'cta_texto'       => '¿Tienes más preguntas? Escríbenos directamente',
                'cta_btn'         => 'Reservar mi sesión',
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Sin reversión automática de columnas.
    }
};
