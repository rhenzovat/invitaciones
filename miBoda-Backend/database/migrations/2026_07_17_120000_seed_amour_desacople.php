<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private function waUrl(string $text = ''): string
    {
        $base = '51977807314';
        $msg  = $text !== '' ? $text : 'Hola Amour Spa, me gustaría reservar un ritual de bienestar en Miraflores.';

        return 'https://wa.me/' . $base . '?text=' . urlencode($msg);
    }

    public function up(): void
    {
        $wa     = $this->waUrl();
        $waRes  = $this->waUrl('Hola Amour Spa, quisiera reservar una cita en su spa de Miraflores.');
        $now    = now();

        if (Schema::hasTable('web_slider_config') && ! Schema::hasColumn('web_slider_config', 'url_video')) {
            Schema::table('web_slider_config', function (Blueprint $table) {
                $table->string('url_video', 500)->nullable()->after('pause_on_hover');
            });
        }

        if (Schema::hasTable('web_slider_config')) {
            DB::table('web_slider_config')->updateOrInsert(['id' => 1], [
                'url_video'  => 'temp02/assets/images/home5-banner.mp4',
                'updated_at' => $now,
            ]);
        }

        // Desactivar contenido legacy Royal / marketing genérico
        foreach (['web_experiencias', 'web_planes', 'web_testimonios', 'web_nuestro_equipo', 'web_masaje_faq'] as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->update(['Activo' => 'N', 'updated_at' => $now]);
            }
        }
        if (Schema::hasTable('web_slider')) {
            DB::table('web_slider')->where('id_slider', '<=', 3)->update(['Activo' => 'N', 'updated_at' => $now]);
        }

        // Header Amour
        if (Schema::hasTable('web_header')) {
            $nav = json_encode([
                ['label' => 'Inicio', 'url' => '/', 'side' => 'left', 'key' => 'home', 'type' => 'link'],
                ['label' => 'Quiénes Somos', 'url' => '/nosotros', 'side' => 'left', 'key' => 'nosotros', 'type' => 'link'],
                ['label' => 'Servicios', 'url' => '/servicios', 'side' => 'right', 'key' => 'servicios', 'type' => 'link'],
                ['label' => 'Contáctenos', 'url' => '/contacto', 'side' => 'right', 'key' => 'contacto', 'type' => 'link'],
                ['label' => 'Reservas', 'url' => $waRes, 'type' => 'cta', 'key' => 'reservas'],
            ], JSON_UNESCAPED_UNICODE);

            $header = [
                'url_logo'         => 'temp02/assets/images/inicio/logo-principal-blanco.png',
                'nav_items'        => $nav,
                'telefono_numero'  => '+51 977 807 314',
                'telefono_href'    => 'tel:+51977807314',
                'btn_texto'        => 'Reservas',
                'top_telefonos'    => '+51 977 807 314',
                'url_whatsapp_top' => $waRes,
                'Activo'           => 'S',
                'updated_at'       => $now,
            ];
            if (Schema::hasColumn('web_header', 'redes_side')) {
                $header['redes_side'] = json_encode([
                    ['tipo' => 'instagram', 'url' => 'https://www.instagram.com/amour.spa.lima/', 'etiqueta' => 'Instagram', 'orden' => 1],
                    ['tipo' => 'whatsapp', 'url' => $wa, 'etiqueta' => 'WhatsApp', 'orden' => 2],
                ], JSON_UNESCAPED_UNICODE);
            }
            DB::table('web_header')->updateOrInsert(['id_header' => 1], array_merge($header, ['created_at' => $now]));
        }

        // WhatsApp config
        if (Schema::hasTable('web_whatsapp_config')) {
            DB::table('web_whatsapp_config')->updateOrInsert(['id' => 1], [
                'wa_numero'         => '51977807314',
                'wa_mensaje'        => 'Hola Amour Spa, vi su página web y me interesa reservar un ritual de bienestar en Miraflores.',
                'wa_burbuja_linea1' => '¿Reservamos tu ritual?',
                'wa_burbuja_linea2' => '',
                'wa_label'          => 'WhatsApp',
                'Activo'            => 'S',
                'updated_at'        => $now,
            ]);
        }

        // Sliders hero (3 slides temp02)
        if (Schema::hasTable('web_slider')) {
            $slides = [
                1 => [
                    'subtitulo'   => 'El arte del tacto · Miraflores',
                    'titulo'      => 'Amour Spa & Arte del Cuerpo',
                    'descripcion' => 'Como la Venus que emerge del agua en los frescos antiguos, aquí la piel se convierte en lienzo: un santuario de calma donde el masaje es oficio, poesía y relajación.',
                    'slide_tag'   => 'bienestar · dulzura · ritual · ',
                    'url_imagen'  => 'temp02/assets/images/inicio/servicios/amour-01.jpg',
                ],
                2 => [
                    'subtitulo'   => 'Ritual de bienestar · Masajes',
                    'titulo'      => 'Cuidado & Relajación',
                    'descripcion' => 'Inspirados en los baños termales de la antigua Roma, nuestros masajes despiertan los sentidos y disuelven la tensión.',
                    'slide_tag'   => 'bienestar · dulzura · ritual · ',
                    'url_imagen'  => 'temp02/assets/images/inicio/servicios/amour-02.jpg',
                ],
                3 => [
                    'subtitulo'   => 'Belleza & serenidad · Spa Privado',
                    'titulo'      => 'Experiencia Única',
                    'descripcion' => 'Cada tratamiento facial es un ritual de belleza digno de las diosas griegas: técnicas depuradas, productos nobles y una atmósfera íntima.',
                    'slide_tag'   => 'bienestar · dulzura · ritual · ',
                    'url_imagen'  => 'temp02/assets/images/inicio/servicios/amour-03.jpg',
                ],
            ];
            foreach ($slides as $id => $row) {
                DB::table('web_slider')->updateOrInsert(['id_slider' => $id], array_merge($row, [
                    'Activo'     => 'S',
                    'updated_at' => $now,
                    'created_at' => $now,
                ]));
            }
        }

        // Página servicios (secciones galería + tarifas)
        if (Schema::hasTable('web_pagina_masajes')) {
            DB::table('web_pagina_masajes')->updateOrInsert(['id' => 1], [
                'hero_tag'         => "Nos rituels · L'art du toucher",
                'hero_titulo'      => 'Rituales & Servicios',
                'hero_url_imagen'  => 'temp02/assets/images/inicio/servicios/spa-2.webp',
                'intro_label'      => 'Nos Soins · Nuestros Rituales',
                'intro_titulo'     => 'Doce rituales para el cuerpo y la piel',
                'intro_titulo2'    => 'Rituales que cuidan cuerpo y piel',
                'intro_subtitulo'  => 'En Amour Spa, cada sesión recuerda al culto grecorromano del cuerpo cuidado: manos expertas, aceites nobles y un silencio que restaura.',
                'cta_texto'        => 'Tarifas · Inversión en calma',
                'updated_at'       => $now,
                'created_at'       => $now,
            ]);
        }

        // Experiencias / rituales (12)
        if (Schema::hasTable('web_experiencias')) {
            $rituales = [
                ['Piedras calientes', 'Calor que armoniza el cuerpo', 'amour-01.jpg', 1],
                ['Aceites esenciales', 'Aromas que despiertan la calma', 'amour-02.jpg', 2],
                ['Masaje relajante', 'Manos que liberan la tensión', 'amour-03.jpg', 3],
                ['Ritual de la piel', 'La piel, templo de bienestar', 'amour-04.jpg', 4],
                ['Descontracturante', 'Alivio focal en cuello, espalda y hombros', 'spa-1.webp', 5],
                ['Ritual Sensorial', 'Arte del tacto consciente y piel cuidada', 'spa-2.webp', 6],
                ['Dúo Armonía', 'Dos personas, misma sala, misma calma', 'spa-3.webp', 7],
                ['Firma Amour', 'El ritual completo: cuerpo, piel y silencio', 'spa-4.webp', 8],
                ['Hombros y Cervical', 'Ideal después de pantallas y oficina', '1.jfif', 9],
                ['Pies Viajeros', 'Reflexología ligera para caminantes', '2.png', 10],
                ['Antiestrés Express', 'Escape breve entre reuniones', '3.png', 11],
                ['Consulta de Bienestar', 'Te orientamos al tratamiento ideal', '4.jfif', 12],
            ];
            DB::table('web_experiencias')->where('Activo', 'N')->delete();
            foreach ($rituales as [$cat, $titulo, $file, $orden]) {
                DB::table('web_experiencias')->insert([
                    'badge'       => $cat,
                    'subtitulo'   => $cat,
                    'titulo'      => $titulo,
                    'descripcion' => $titulo,
                    'url_imagen'  => 'temp02/assets/images/inicio/servicios/' . $file,
                    'btn_url'     => '#servicios-tarifas',
                    'orden'       => $orden,
                    'Activo'      => 'S',
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]);
            }
        }

        // Planes / tarifas (12)
        if (Schema::hasTable('web_planes')) {
            $tarifas = [
                ['Masaje Relajante', 180, '60 min · Relajación profunda para soltar el día.'],
                ['Masaje Descontracturante', 200, '70 min · Alivio focal en cuello, espalda y hombros.'],
                ['Ritual Sensorial', 250, '80 min · Arte del tacto consciente, ritmo lento y piel cuidada.'],
                ['Piedras Calientes', 220, '75 min · Calor mineral que ablanda la tensión.'],
                ['Masaje Aromático', 190, '60 min · Aceites esenciales y respiración guiada.'],
                ['Dúo Armonía', 340, '60 min · Dos personas, misma sala, misma calma compartida.'],
                ['Ritual de la Piel', 210, '70 min · Exfoliación suave y nutrición de la epidermis.'],
                ['Hombros y Cervical', 140, '40 min · Ideal después de pantallas y oficina.'],
                ['Pies Viajeros', 120, '35 min · Reflexología ligera para caminantes de la ciudad.'],
                ['Firma Amour', 320, '100 min · El ritual completo: cuerpo, piel y silencio.'],
                ['Antiestrés Express', 110, '30 min · Escape breve entre reuniones.'],
                ['Consulta de Bienestar', 0, 'Te orientamos al tratamiento ideal según tu cuerpo y tu ritmo.'],
            ];
            DB::table('web_planes')->where('Activo', 'N')->delete();
            foreach ($tarifas as $i => [$nombre, $precio, $desc]) {
                DB::table('web_planes')->insert([
                    'nombre'          => $nombre,
                    'descripcion'     => $desc,
                    'precio'          => $precio,
                    'precio_nota'     => $precio > 0 ? null : 'Gratis',
                    'caracteristicas' => json_encode([]),
                    'url_whatsapp'    => $wa,
                    'orden'           => $i + 1,
                    'Activo'          => 'S',
                    'created_at'      => $now,
                    'updated_at'      => $now,
                ]);
            }
        }

        // About home
        if (Schema::hasTable('web_about')) {
            DB::table('web_about')->updateOrInsert(['id_about' => 1], [
                'subtitulo'   => '¿Qué es Amour Spa?',
                'titulo'      => 'Un santuario donde el cuerpo se escribe con delicadeza',
                'descripcion' => 'Amour Spa nace en Miraflores como un atelier del tacto: masajes relajantes y terapias corporales pensadas para soltar el ruido de Lima, aliviar la tensión y devolver a la piel su douceur.',
                'url_imagen'  => 'temp02/assets/images/inicio/amour-nosotros.jpeg',
                'Activo'      => 'S',
                'updated_at'  => $now,
                'created_at'  => $now,
            ]);
        }

        if (Schema::hasTable('web_about_caracteristica')) {
            DB::table('web_about_caracteristica')->where('Activo', 'S')->update(['Activo' => 'N']);
            DB::table('web_about_caracteristica')->insert([
                ['id_about' => 1, 'titulo' => 'MANOS EXPERTAS', 'descripcion' => 'Terapeutas formados en el arte del masaje y la presencia consciente.', 'url_imagen' => 'temp02/assets/images/therapist.png', 'orden' => 1, 'Activo' => 'S', 'created_at' => $now, 'updated_at' => $now],
                ['id_about' => 1, 'titulo' => 'ARMONÍA CORPORAL', 'descripcion' => 'Enfoque integral: relajación muscular, respiración y bienestar de la piel.', 'url_imagen' => 'temp02/assets/images/holistic.png', 'orden' => 2, 'Activo' => 'S', 'created_at' => $now, 'updated_at' => $now],
            ]);
        }

        // Testimonios
        if (Schema::hasTable('web_testimonios')) {
            DB::table('web_testimonios')->where('Activo', 'N')->delete();
            $testimonios = [
                ['Camila R.', 'Diseñadora · Miraflores', 'Salí como si alguien hubiera borrado el ruido de Lima de mis hombros.', 'client-1.png', 5],
                ['Andrés M.', 'Arquitecto · San Isidro', 'Ambiente impecable y profesional. Mi espalda lo agradece cada semana.', 'client-3.png', 5],
                ['Valentina S.', 'Docente · Barranco', 'El Ritual de la piel me recordó a esos baños romanos de novela: vapor, silencio y cuidado.', 'client-2.png', 4.5],
            ];
            foreach ($testimonios as $i => [$nombre, $sub, $texto, $avatar, $stars]) {
                DB::table('web_testimonios')->insert([
                    'badge_seccion'  => $i === 0 ? 'Las Voces De Nuestros Invitados' : null,
                    'seccion_titulo' => $i === 0 ? 'Historias de calma en Miraflores' : null,
                    'nombre'         => $nombre,
                    'subtitulo'      => $sub,
                    'testimonio'     => $texto,
                    'calificacion'   => $stars,
                    'url_avatar'     => 'temp02/assets/images/' . $avatar,
                    'orden'          => $i + 1,
                    'Activo'         => 'S',
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
            }
        }

        // Equipo
        if (Schema::hasTable('web_nuestro_equipo')) {
            DB::table('web_nuestro_equipo')->where('Activo', 'N')->delete();
            $equipo = [
                ['Ana', 'Maître Massage · Relajación', '1.jpg', 1],
                ['Lucía', 'Ritual de la piel', '2.jpg', 2],
                ['Carla', 'Pierres & Descontracturante', '6.jpg', 3],
                ['Sofía', 'Aromathérapie Corporelle', '4.jpg', 4],
                ['Inès', 'Signature Amour', '3.jpg', 5],
            ];
            foreach ($equipo as [$nombre, $cargo, $img, $orden]) {
                DB::table('web_nuestro_equipo')->insert([
                    'seccion_badge'  => $orden === 1 ? 'Manos que escuchan' : null,
                    'seccion_titulo' => $orden === 1 ? 'Manos especialistas' : null,
                    'titulo'         => $nombre,
                    'cargo'          => $cargo,
                    'url_imagen'     => 'temp02/assets/images/inicio/equipo/' . $img,
                    'url_facebook'   => 'https://www.instagram.com/amour.spa.lima/',
                    'orden'          => $orden,
                    'Activo'         => 'S',
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);
            }
        }

        // FAQ
        if (Schema::hasTable('web_masaje_faq')) {
            DB::table('web_masaje_faq')->where('Activo', 'N')->delete();
            $faqs = [
                ['¿Qué tipo de masajes ofrecen?', 'Masajes relajantes, descontracturantes, rituales sensoriales del tacto, Piedras calientes, aromathérapie corporal y cuidados de la piel.'],
                ['¿Necesito reservar con anticipación?', 'Sí. Atendemos únicamente con reserva previa. Puedes escribirnos por WhatsApp al +51 977 807 314.'],
                ['¿Dónde están ubicados?', 'Av. Ernesto Diez Canseco 204, Miraflores, Lima 15074, Perú.'],
                ['¿Cómo es la experiencia Amour?', 'Como un petit salon francés: recepción discreta, consulta breve, manos expertas y un ritmo que honra la piel.'],
                ['¿Qué debo llevar o preparar?', 'Solo tu presencia. Llega 5–10 minutos antes y comunica cualquier molestia muscular.'],
                ['¿Puedo elegir a mi terapeuta?', 'Sí, cuando la disponibilidad lo permita, puedes solicitar una terapeuta específica al reservar.'],
            ];
            foreach ($faqs as $i => [$q, $a]) {
                DB::table('web_masaje_faq')->insert([
                    'titulo'     => $q,
                    'contenido'  => $a,
                    'orden'      => $i + 1,
                    'Activo'     => 'S',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Footer
        if (Schema::hasTable('web_footer')) {
            $footer = [
                'descripcion_footer'  => "Amour Spa es un centro de bienestar en Miraflores especializado en masajes relajantes y terapias corporales. L'art du toucher: atención profesional, ambiente cómodo y reserva previa.",
                'contacto_telefono'   => '+51 977 807 314',
                'contacto_direccion'  => 'Av. Ernesto Diez Canseco 204, Miraflores, Lima',
                'contacto_email'      => 'informacion@amourspa.com',
                'url_whatsapp'        => $wa,
                'nuestros_horarios'   => 'Lun–Sáb 10:00–21:00 | Dom con reserva previa',
                'Activo'              => 'S',
                'updated_at'          => $now,
            ];
            if (Schema::hasColumn('web_footer', 'logo_footer')) {
                $footer['logo_footer'] = 'temp02/assets/images/inicio/logo-principal-blanco.png';
            }
            DB::table('web_footer')->updateOrInsert(['id_footer' => 1], array_merge($footer, ['created_at' => $now]));
        }

        // Metadatos SEO
        if (Schema::hasTable('metadatos_paginas')) {
            $pages = [
                'home'          => ['Amour Spa Miraflores | Masajes & Bienestar', 'Centro de bienestar en Miraflores: masajes relajantes y terapias corporales.'],
                'web_about'     => ['Quiénes Somos | Amour Spa', 'Conoce Amour Spa: filosofía y equipo en Miraflores.'],
                'web_servicios' => ['Rituales & Servicios | Amour Spa', 'Galería y tarifas de rituales de bienestar en Miraflores.'],
                'web_contact'   => ['Contáctenos | Amour Spa', 'Escríbenos o reserva tu ritual en Amour Spa, Miraflores.'],
            ];
            foreach ($pages as $nombre => [$titulo, $desc]) {
                DB::table('metadatos_paginas')->where('nombre_pagina', $nombre)->update([
                    'titulo_pagina'      => $titulo,
                    'descripcion_pagina' => $desc,
                    'activo'             => 'S',
                    'updated_at'         => $now,
                ]);
            }
        }

        // Menú admin: renombrar referencias Royal si existen
        if (Schema::hasTable('sistema_menu')) {
            DB::table('sistema_menu')->where('nombre', 'like', '%Royal Masajes%')->update([
                'nombre' => DB::raw("REPLACE(nombre, 'Royal Masajes', 'Amour Spa')"),
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('web_slider_config') && Schema::hasColumn('web_slider_config', 'url_video')) {
            Schema::table('web_slider_config', function (Blueprint $table) {
                $table->dropColumn('url_video');
            });
        }
    }
};
