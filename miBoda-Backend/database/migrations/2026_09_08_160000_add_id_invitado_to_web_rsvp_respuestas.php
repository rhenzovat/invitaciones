<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Liga cada respuesta RSVP al invitado de la lista con el que hizo match,
 * para poder bloquear confirmaciones duplicadas de forma confiable (sin
 * depender de que escriban su nombre exactamente igual las dos veces).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_rsvp_respuestas', function (Blueprint $table) {
            if (! Schema::hasColumn('web_rsvp_respuestas', 'id_invitado')) {
                $table->unsignedInteger('id_invitado')->nullable()->after('id_rsvp_respuesta');
            }
        });
    }

    public function down(): void
    {
        Schema::table('web_rsvp_respuestas', function (Blueprint $table) {
            if (Schema::hasColumn('web_rsvp_respuestas', 'id_invitado')) {
                $table->dropColumn('id_invitado');
            }
        });
    }
};
