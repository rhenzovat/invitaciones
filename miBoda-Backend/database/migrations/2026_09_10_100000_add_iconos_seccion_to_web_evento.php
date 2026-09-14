<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Ícono decorativo (divider) de cada sección de la invitación — hasta ahora
 * fijo en index.blade.php. Se guarda como ruta relativa (ej. assets/img/decor/
 * icon-invitacion/mapa.png) o una URL absoluta si el cliente pega un link.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            $table->string('icono_countdown')->nullable()->after('countdown_nota_2');
            $table->string('icono_ubicaciones')->nullable()->after('ubicaciones');
            $table->string('icono_itinerario')->nullable()->after('itinerario');
            $table->string('icono_vestimenta')->nullable()->after('vestimenta_restriccion');
            $table->string('icono_rsvp')->nullable()->after('capacidad_maxima');
            $table->string('icono_regalos')->nullable()->after('regalos_direccion_fisica');
            $table->string('icono_video')->nullable()->after('video_texto');
            $table->string('icono_galeria')->nullable()->after('galeria_nota');
            $table->string('icono_cancion')->nullable()->after('cancion_generos');
            $table->string('icono_historia')->nullable()->after('historia');
        });

        DB::table('web_evento')->update([
            'icono_countdown'   => 'assets/img/decor/icon-invitacion/calendario.png',
            'icono_ubicaciones' => 'assets/img/decor/icon-invitacion/mapa.png',
            'icono_itinerario'  => 'assets/img/decor/icon-invitacion/fecha-limite.png',
            'icono_vestimenta'  => 'assets/img/decor/icon-invitacion/camisa.png',
            'icono_rsvp'        => 'assets/img/decor/icon-invitacion/papiro.png',
            'icono_regalos'     => 'assets/img/decor/icon-invitacion/caja-de-regalo.png',
            'icono_video'       => 'assets/img/decor/icon-invitacion/silla-de-director.png',
            'icono_galeria'     => 'assets/img/decor/icon-invitacion/camara-reflex-digital.png',
            'icono_cancion'     => 'assets/img/decor/icon-invitacion/guitarra.png',
            'icono_historia'    => 'assets/img/decor/icon-invitacion/amor.png',
        ]);
    }

    public function down(): void
    {
        Schema::table('web_evento', function (Blueprint $table) {
            $table->dropColumn([
                'icono_countdown', 'icono_ubicaciones', 'icono_itinerario', 'icono_vestimenta',
                'icono_rsvp', 'icono_regalos', 'icono_video', 'icono_galeria', 'icono_cancion', 'icono_historia',
            ]);
        });
    }
};
