<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('web_evento', function (Blueprint $table) {
            $table->increments('id_evento');

            $table->string('novio', 150)->nullable();
            $table->string('novia', 150)->nullable();
            $table->string('monograma', 50)->nullable();
            $table->dateTime('fecha_boda')->nullable();
            $table->string('fecha_boda_texto', 150)->nullable();
            $table->string('invitado_por_defecto', 150)->nullable();
            $table->integer('pases_por_defecto')->default(2);

            $table->text('frase_texto')->nullable();
            $table->string('frase_referencia', 150)->nullable();

            // Sobre / portada animada
            $table->text('envelope_verse_texto')->nullable();
            $table->string('envelope_verse_referencia', 150)->nullable();
            $table->string('envelope_sello_img', 500)->nullable();
            $table->string('envelope_foto1', 500)->nullable();
            $table->string('envelope_foto2', 500)->nullable();

            // Listas repetibles (JSON)
            $table->json('familia')->nullable();
            $table->json('ubicaciones')->nullable();
            $table->json('itinerario')->nullable();
            $table->json('historia')->nullable();
            $table->json('vestimenta_colores')->nullable();
            $table->json('regalos_transferencias')->nullable();
            $table->json('regalos_yape_plin')->nullable();

            $table->string('vestimenta_tipo', 100)->nullable();
            $table->string('vestimenta_restriccion', 255)->nullable();

            $table->boolean('solo_adultos_activo')->default(false);
            $table->text('solo_adultos_texto')->nullable();

            $table->string('foto_pareja_src', 500)->nullable();

            $table->string('rsvp_fecha_limite', 100)->nullable();
            $table->string('rsvp_contacto_nombre', 150)->nullable();
            $table->string('rsvp_contacto_whatsapp', 30)->nullable();

            $table->boolean('regalos_sobre_activo')->default(true);
            $table->string('regalos_tienda_nombre', 150)->nullable();
            $table->string('regalos_tienda_url', 500)->nullable();
            $table->string('regalos_direccion_fisica', 255)->nullable();

            $table->string('video_src', 500)->nullable();
            $table->text('estacionamiento_texto')->nullable();

            $table->string('musica_src', 500)->nullable();
            $table->decimal('musica_volumen', 3, 2)->default(0.40);

            $table->text('footer_texto')->nullable();

            // Fotos "momento" (foto a pantalla completa entre secciones) +
            // versículos adicionales, en sus 3 posiciones fijas actuales.
            $table->text('momento1_verso_texto')->nullable();
            $table->string('momento1_verso_referencia', 150)->nullable();
            $table->string('momento1_foto', 500)->nullable();
            $table->string('momento2_foto', 500)->nullable();
            $table->text('momento2_verso_texto')->nullable();
            $table->string('momento2_verso_referencia', 150)->nullable();
            $table->string('momento3_foto', 500)->nullable();

            // Integraciones externas que se mantienen por ahora (Fase A no las reemplaza)
            $table->json('cloudinary_config')->nullable();
            $table->json('google_form_rsvp')->nullable();
            $table->json('google_form_cancion')->nullable();
            $table->json('google_form_galeria')->nullable();

            $table->enum('Activo', ['S', 'N'])->default('S');
            $table->timestamps();
        });

        DB::table('web_evento')->insert([
            'novio' => 'Renzo',
            'novia' => 'Yakelin',
            'monograma' => 'R & Y',
            'fecha_boda' => '2026-11-11 16:00:00',
            'fecha_boda_texto' => '11 de noviembre de 2026',
            'invitado_por_defecto' => '',
            'pases_por_defecto' => 2,

            'frase_texto' => 'El amor es paciente, el amor es bondadoso. No es celoso ni presumido ni arrogante.',
            'frase_referencia' => '— 1 Corintios 13:4',

            'envelope_verse_texto' => 'Y sobre todas estas cosas, vístanse de amor, que es el vínculo perfecto',
            'envelope_verse_referencia' => 'Colosenses 3:14',
            'envelope_sello_img' => 'assets/img/sello.png',
            'envelope_foto1' => 'assets/img/pareja-carta.jpg',
            'envelope_foto2' => 'assets/img/pareja-carta-02.jpg',

            'familia' => json_encode([
                ['titulo' => 'Padres del novio', 'personas' => ['Sr. Eusebio Calixto Vargas Gómez', 'Sra. Salomina Tenorio Gómez']],
                ['titulo' => 'Padres de la novia', 'personas' => ['Sr. Carlos Ramos', 'Sra. Rosa Mendo']],
                ['titulo' => 'Padrinos de Boda', 'personas' => ['Sr. Luis Ramírez', 'Sra. Sofía Castañeda']],
                ['titulo' => 'Testigos', 'personas' => ['Pedro Salinas', 'Laura Ibáñez']],
            ], JSON_UNESCAPED_UNICODE),

            'ubicaciones' => json_encode([
                [
                    'icono' => '📝',
                    'imagen' => 'assets/img/ubicaciones/civil.svg',
                    'tipo' => 'Ceremonia Civil',
                    'lugar' => 'Registro Civil',
                    'horario' => 'Miércoles 11 de noviembre • 4:00 P.M.',
                    'direccion' => 'Jr. Los Olivos 456, Lima',
                    'mapsUrl' => 'https://maps.google.com',
                ],
                [
                    'icono' => '🎉',
                    'imagen' => 'assets/img/local/recepcion.jpg',
                    'tipo' => 'Recepción',
                    'lugar' => 'Jardín Las Palmeras',
                    'horario' => 'Miércoles 11 de noviembre • 7:00 P.M.',
                    'direccion' => 'Av. Las Flores 789, Lima',
                    'mapsUrl' => 'https://maps.app.goo.gl/bH2hWb7G8NKzLMxt6?g_st=awb',
                ],
            ], JSON_UNESCAPED_UNICODE),

            'itinerario' => json_encode([
                ['hora' => '4:00 P.M.', 'titulo' => 'Ceremonia Civil', 'imagen' => 'assets/img/decor/inglesia.png'],
                ['hora' => '7:00 P.M.', 'titulo' => 'Recepción y Cena', 'imagen' => 'assets/img/decor/comida.png'],
                ['hora' => '9:00 P.M.', 'titulo' => 'Fiesta', 'imagen' => 'assets/img/decor/fiesta.png'],
            ], JSON_UNESCAPED_UNICODE),

            'historia' => json_encode([
                ['fecha' => 'Marzo 2017', 'titulo' => 'Nuestro cita en el malecon', 'descripcion' => 'Una tarde especial en el malecón. Nos tomaron una foto juntos, nos regalaron un llavero a cada uno... y desde ese día, guardamos ese recuerdo en el corazón (y en nuestras llaves).', 'icono' => '💫', 'imagen' => 'assets/img/historia/primera-salida.jpeg'],
                ['fecha' => 'Febrero 2019', 'titulo' => 'Locura y complicidad', 'descripcion' => 'Cada día a tu lado es una aventura. Disfrutando la vida con la persona que me hace reír sin parar.', 'icono' => '😂', 'imagen' => 'assets/img/historia/viaje-costa.jpeg'],
                ['fecha' => 'Diciembre 2021', 'titulo' => 'Mis raíces, tu hogar', 'descripcion' => 'Te llevé a conocer Vilcahuaman, el pueblo de mi papá. Ver mis raíces a través de tus ojos y compartirte mi historia fue el viaje más especial.', 'icono' => '⛰️', 'imagen' => 'assets/img/historia/viaje-ayacucho.jpeg'],
                ['fecha' => 'Enero 2024', 'titulo' => 'Cosechando logros', 'descripcion' => 'Celebrando tus triunfos y acompañándote en cada meta alcanzada. ¡Qué orgullo sentirme parte de tus logros!', 'icono' => '🎓', 'imagen' => 'assets/img/historia/graduacion01.jpeg'],
                ['fecha' => 'Enero 2024', 'titulo' => "El día del 'Sí'", 'descripcion' => "Entre luces, pétalos y lágrimas de felicidad, me pediste que fuera tu compañera de vida. ¡Ese 'sí' lo cambió todo!", 'icono' => '💍', 'imagen' => 'assets/img/historia/pedida-de-mano.jpeg'],
                ['fecha' => '11 de noviembre de 2026', 'titulo' => '¡Nos Casamos!', 'descripcion' => 'Después de tantos sueños y aventuras, el día más esperado de nuestras vidas por fin llegó. ¡Te esperamos para celebrarlo juntos!', 'icono' => '💍', 'imagen' => 'assets/img/historia/compromiso.jpeg'],
            ], JSON_UNESCAPED_UNICODE),

            'vestimenta_tipo' => 'Formal',
            'vestimenta_restriccion' => 'Evita el color blanco, reservado para la novia',
            'vestimenta_colores' => json_encode(['#C57B57', '#EDE1C7', '#A16207', '#E8C79A']),

            'solo_adultos_activo' => 1,
            'solo_adultos_texto' => 'Amamos a los niños, sin embargo, en este dia especial deseamos que sea solo para adultos. Agradecemos tu comprensión y cariño.',

            'foto_pareja_src' => 'assets/img/pareja.jpg',

            'rsvp_fecha_limite' => '25 de octubre de 2026',
            'rsvp_contacto_nombre' => 'Ana Maria',
            'rsvp_contacto_whatsapp' => '51940318235',

            'regalos_sobre_activo' => 1,
            'regalos_tienda_nombre' => 'Tienda de Regalos',
            'regalos_tienda_url' => '',
            'regalos_transferencias' => json_encode([
                ['banco' => 'BCP', 'titular' => 'A nombre: Renzo Vargas Tenorio', 'cuenta' => '193-057-93290006', 'cci' => '00219310579329000610'],
                ['banco' => 'BBVA', 'titular' => 'A nombre: Yakelin Ramos Meno', 'cuenta' => '0011-0579-0220464139', 'cci' => '011-579-000220464139-09'],
            ], JSON_UNESCAPED_UNICODE),
            'regalos_yape_plin' => json_encode([
                ['app' => 'Yape', 'nombre' => 'Renzo Vargas Tenorio', 'numero' => '972601910'],
                ['app' => 'Plin', 'nombre' => 'Yakelin Ramos Mendo', 'numero' => '982838430'],
            ], JSON_UNESCAPED_UNICODE),
            'regalos_direccion_fisica' => 'Portada de manchay III MZ E1 LT 09 - Manchay, Pachacamac, Lima',

            'video_src' => 'assets/video/video.mp4',
            'estacionamiento_texto' => 'Para su comodidad, el lugar del evento contará con estacionamiento disponible para los invitados. Les recomendamos llegar con anticipación.',

            'musica_src' => 'assets/audio/musica.mp3',
            'musica_volumen' => 0.40,

            'footer_texto' => '¡Gracias por acompañarnos en este día tan especial!',

            'momento1_verso_texto' => 'Y si alguno prevaleciere contra uno, dos le resistirán; y cordón de tres dobleces no se rompe pronto.',
            'momento1_verso_referencia' => 'Eclesiastés 4:12',
            'momento1_foto' => 'assets/img/momentos/cordon2.jpg',
            'momento2_foto' => 'assets/img/momentos/interludio-2.jpg',
            'momento2_verso_texto' => 'Ahora permanecen estas tres cosas: la fe, la esperanza y el amor. Pero la más importante de todas es el amor.',
            'momento2_verso_referencia' => '1 Corintios 13:13',
            'momento3_foto' => 'assets/img/momentos/interludio-3.jpeg',

            'cloudinary_config' => json_encode([
                'cloudName' => 'auo6aayd',
                'uploadPreset' => 'boda_galeria',
                'folder' => 'galeria-boda',
                'tag' => 'galeria-boda',
            ]),
            'google_form_rsvp' => json_encode([
                'formId' => '1FAIpQLSfmaKbRn7An0fCRmvqWK_7OUmaxLGjHyDI9qiD3unsyxX9U5w',
                'entryNombre' => 'entry.109166667',
                'entryAcompanante' => 'entry.1444773697',
                'entryAsistencia' => 'entry.1836758661',
            ]),
            'google_form_cancion' => json_encode([
                'formId' => '1FAIpQLSfKmRMTQKs1fPJ3E4j6clT7LS8aK9fNBPnE0bjl9M3kDtR2rQ',
                'entryCancion' => 'entry.881067131',
                'entryArtista' => 'entry.2112199985',
                'entryDe' => 'entry.654336312',
            ]),
            'google_form_galeria' => json_encode([
                'formId' => '1FAIpQLSdz81062n2VgIR6ARoKSkPPTEiyjCgHxmEleemQ5fS2n96aIg',
                'entryUrl' => 'entry.960913072',
            ]),

            'Activo' => 'S',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('web_evento');
    }
};
