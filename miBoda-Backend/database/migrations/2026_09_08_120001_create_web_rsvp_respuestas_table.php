<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_rsvp_respuestas', function (Blueprint $table) {
            $table->increments('id_rsvp_respuesta');
            $table->string('nombre', 200);
            $table->string('acompanante', 200)->nullable();
            $table->enum('asistira', ['S', 'N']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_rsvp_respuestas');
    }
};
