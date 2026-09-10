<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('web_pagina_faq', function (Blueprint $table) {
            $table->id();
            $table->string('intro_label')->nullable()->default('Antes de su visita');
            $table->string('titulo')->nullable()->default('Preguntas frecuentes · Amour Spa');
            // varchar en vez de TEXT: MySQL no permite DEFAULT en columnas TEXT.
            $table->string('subtitulo', 500)->nullable()->default('Todo lo esencial antes de cruzar nuestro umbral en Diez Canseco.');
            $table->string('url_imagen')->nullable()->default('temp02/assets/images/inicio/preguntas.jfif');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('web_pagina_faq');
    }
};
