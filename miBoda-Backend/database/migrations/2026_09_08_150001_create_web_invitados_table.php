<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Lista de planificación de invitados (nombre + cupos asignados). Es una
 * herramienta interna para llevar la cuenta de a quién se invitó y cuántos
 * pases tiene cada uno frente al aforo total — NO controla ni restringe
 * quién puede confirmar en el formulario RSVP público, que sigue abierto.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_invitados', function (Blueprint $table) {
            $table->increments('id_invitado');
            $table->string('nombre', 200);
            $table->integer('pases_asignados')->default(1);
            $table->text('notas')->nullable();
            $table->enum('Activo', ['S', 'N'])->default('S');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('web_invitados');
    }
};
