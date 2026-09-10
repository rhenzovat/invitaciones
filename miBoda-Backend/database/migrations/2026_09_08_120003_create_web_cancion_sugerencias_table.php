<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_cancion_sugerencias', function (Blueprint $table) {
            $table->increments('id_sugerencia');
            $table->string('nombre_cancion', 200);
            $table->string('artista', 200)->nullable();
            $table->string('nombre_invitado', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_cancion_sugerencias');
    }
};
