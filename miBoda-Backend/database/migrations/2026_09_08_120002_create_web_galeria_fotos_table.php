<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_galeria_fotos', function (Blueprint $table) {
            $table->increments('id_foto');
            $table->string('url_imagen', 500);
            $table->integer('orden')->default(0);
            $table->enum('Activo', ['S', 'N'])->default('S');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_galeria_fotos');
    }
};
