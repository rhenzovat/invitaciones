<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RoyalMasajesSeeder extends Seeder
{
    public function run(): void
    {
        $wa      = 'https://wa.me/51982311335';
        $waMsg   = 'https://wa.me/51982311335?text=' . urlencode('¡Hola! Me gustaría hacer una reserva en Royal Masajes. ¿Podrían indicarme la disponibilidad? ¡Gracias!');
        $tel     = '982 311 335';
        $logoH   = 'temp02/img/inicio/logo-header.png';
        $logoF   = 'temp02/img/inicio/logo-footer.png';

        // ══════════════════════════════════════════════════════
        // 1. HEADER / NAVBAR
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_header')) {
            $nav = json_encode([
                ['label' => 'Sobre Nosotros', 'url' => '/nosotros',  'side' => 'left',  'key' => 'nosotros'],
                ['label' => 'Masajes',         'url' => '/masajes',   'side' => 'left',  'key' => 'masajes'],
                ['label' => 'Galería',         'url' => '/galeria',   'side' => 'right', 'key' => 'galeria'],
                ['label' => 'Contacto',        'url' => '/contacto',  'side' => 'right', 'key' => 'contacto'],
            ]);

            $headerData = [
                'url_logo'         => $logoH,
                'topbar_promo'     => '📍 Atención privada en Lima — Reserva al WhatsApp',
                'top_telefonos'    => $tel,
                'url_whatsapp_top' => $waMsg,
                'nav_items'        => $nav,
                'Activo'           => 'S',
                'updated_at'       => now(),
            ];

            if (Schema::hasColumn('web_header', 'redes_side')) {
                $headerData['redes_side'] = json_encode([
                    ['tipo' => 'facebook',  'url' => 'https://www.facebook.com/',  'etiqueta' => 'Facebook',  'orden' => 1],
                    ['tipo' => 'instagram', 'url' => 'https://www.instagram.com/', 'etiqueta' => 'Instagram', 'orden' => 2],
                    ['tipo' => 'whatsapp',  'url' => $waMsg,                       'etiqueta' => 'WhatsApp',  'orden' => 3],
                ], JSON_UNESCAPED_UNICODE);
            }

            if (DB::table('web_header')->where('id_header', 1)->exists()) {
                DB::table('web_header')->where('id_header', 1)->update($headerData);
            } else {
                DB::table('web_header')->insert(array_merge($headerData, [
                    'id_header'  => 1,
                    'created_at' => now(),
                ]));
            }
        }

        // ══════════════════════════════════════════════════════
        // 2. SLIDERS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_slider')) {
            $slides = [
                1 => [
                    'subtitulo'     => 'Royal Masajes Lima',
                    'titulo'        => 'Royal Sensory Experience Massage ✨',
                    'descripcion'   => 'Reconecta con tu cuerpo y recupera el equilibrio físico, emocional y energético a través de relajación profunda y tacto consciente.',
                    'texto_boton'   => 'Conócenos',
                    'url_link'      => '/nosotros',
                    'texto_boton_2' => 'Reservar',
                    'url_link_2'    => $waMsg,
                    'url_imagen'    => 'temp02/img/inicio/slider_1.jpg',
                ],
                2 => [
                    'subtitulo'     => 'Mujeres Profesionales',
                    'titulo'        => 'Equilibrio y Discreción',
                    'descripcion'   => 'Un entorno privado diseñado para liberar el estrés de jornadas exigentes, viajes frecuentes y altos niveles de responsabilidad.',
                    'texto_boton'   => 'Servicios',
                    'url_link'      => '/masajes',
                    'texto_boton_2' => 'WhatsApp',
                    'url_link_2'    => $waMsg,
                    'url_imagen'    => 'temp02/img/inicio/slider_2.jpg',
                ],
                3 => [
                    'subtitulo'     => '+10 Años de Experiencia',
                    'titulo'        => 'Arte Sensorial Único',
                    'descripcion'   => 'Técnicas de masaje tántrico y sensorial en un ambiente que despierta tus sentidos y libera cada tensión de tu cuerpo.',
                    'texto_boton'   => 'Galería',
                    'url_link'      => '/galeria',
                    'texto_boton_2' => '982 311 335',
                    'url_link_2'    => $waMsg,
                    'url_imagen'    => 'temp02/img/inicio/slider_3.jpg',
                ],
            ];

            foreach ($slides as $id => $row) {
                $payload = array_merge($row, ['Activo' => 'S', 'updated_at' => now()]);
                if (DB::table('web_slider')->where('id_slider', $id)->exists()) {
                    DB::table('web_slider')->where('id_slider', $id)->update($payload);
                } else {
                    DB::table('web_slider')->insert(array_merge($payload, [
                        'id_slider'  => $id,
                        'created_at' => now(),
                    ]));
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // 3. FOOTER
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_footer')) {
            $footerData = [
                'descripcion_footer'    => 'Royal Sensory Experience Massage: relajación profunda y tacto consciente para mujeres profesionales en Lima. Discreción, calidad y bienestar como estilo de vida.',
                'sobre_la_empresa'      => 'Royal Sensory Experience Massage — agenda únicamente con reserva al WhatsApp 982 311 335.',
                'contacto_telefono'     => $tel,
                'contacto_direccion'    => 'Atención privada en Lima, Perú',
                'url_whatsapp'          => $waMsg,
                'footer_cta_titulo'     => 'Reserva tu Experiencia',
                'footer_cta_subtitulo'  => 'Agenda únicamente con reserva previa al WhatsApp.',
                'whatsapp_mensaje'      => '¡Hola! Me gustaría hacer una reserva en Royal Masajes. ¿Podrían indicarme la disponibilidad? ¡Gracias!',
                'Activo'                => 'S',
                'updated_at'            => now(),
            ];

            if (Schema::hasColumn('web_footer', 'logo_footer')) {
                $footerData['logo_footer'] = $logoF;
            }
            if (Schema::hasColumn('web_footer', 'logo_menu')) {
                $footerData['logo_menu'] = $logoH;
            }

            if (DB::table('web_footer')->where('id_footer', 1)->exists()) {
                DB::table('web_footer')->where('id_footer', 1)->update($footerData);
            } else {
                DB::table('web_footer')->insert(array_merge($footerData, [
                    'id_footer'  => 1,
                    'created_at' => now(),
                ]));
            }
        }

        // ══════════════════════════════════════════════════════
        // 4. PROMO BANNER
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_promo_banner')) {
            $promoBanner = [
                'subtitulo'        => '📍 Atención privada en Lima — Agenda únicamente con reserva',
                'titulo'           => 'Libera el Estrés — Reconecta Contigo',
                'btn_texto'        => 'WhatsApp ' . $tel,
                'btn_url'          => $waMsg,
                'url_imagen_fondo' => 'temp02/img/carousel-1.jpg',
                'Activo'           => 'S',
                'updated_at'       => now(),
            ];
            if (DB::table('web_promo_banner')->where('id', 1)->exists()) {
                DB::table('web_promo_banner')->where('id', 1)->update($promoBanner);
            } else {
                DB::table('web_promo_banner')->insert(array_merge($promoBanner, [
                    'id'         => 1,
                    'created_at' => now(),
                ]));
            }
        }

        // ══════════════════════════════════════════════════════
        // 5. EXPERIENCIAS (4 masajes tántricos)
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_experiencias') && DB::table('web_experiencias')->count() === 0) {
            $experiencias = [
                [
                    'badge'       => '90 min',
                    'duracion'    => '90 minutos',
                    'titulo'      => 'Sabor Simple del Tantra',
                    'subtitulo'   => 'Masaje Tántrico LITE',
                    'descripcion' => 'Ríndete a caricias suaves y sensuales en una escapada corta pero inolvidable. Perfecto para quienes desean un anticipo de la magia tántrica, incluso cuando el tiempo es escaso.',
                    'precio_nota' => 'Consultar precio',
                    'url_imagen'  => 'temp02/img/gallery-1.jpg',
                    'orden'       => 1,
                ],
                [
                    'badge'       => '120 min',
                    'duracion'    => '120 minutos',
                    'titulo'      => 'El Toque Sensual del Tantra',
                    'subtitulo'   => 'Masaje Tántrico CLÁSICO',
                    'descripcion' => 'Sumérgete en un ritual profundamente indulgente donde la ternura se encuentra con el deseo. Cada caricia te lleva a una relajación profunda: un viaje exquisito para cuerpo y alma.',
                    'precio_nota' => 'Consultar precio',
                    'url_imagen'  => 'temp02/img/gallery-3.jpg',
                    'orden'       => 2,
                ],
                [
                    'badge'       => '150 min',
                    'duracion'    => '150 minutos',
                    'titulo'      => 'Masaje Tántrico de Lujo',
                    'subtitulo'   => 'Masaje Tántrico DELUXE',
                    'descripcion' => 'Una experiencia completa que combina todas las técnicas sensoriales y tántricas en un ambiente exclusivo diseñado para tu máximo placer y relajación profunda.',
                    'precio_nota' => 'Consultar precio',
                    'url_imagen'  => 'temp02/img/gallery-5.jpg',
                    'orden'       => 3,
                ],
                [
                    'badge'       => '180 - 300 min',
                    'duracion'    => '180 – 300 minutos',
                    'titulo'      => 'Masaje Tántrico Royal',
                    'subtitulo'   => 'Masaje Tántrico ROYAL',
                    'descripcion' => 'La experiencia definitiva: sesión extendida de reconexión total, equilibrio energético y bienestar absoluto para la mujer ejecutiva que valora la calidad sin límites.',
                    'precio_nota' => 'Consultar precio',
                    'url_imagen'  => 'temp02/img/gallery-7.jpg',
                    'orden'       => 4,
                ],
            ];

            foreach ($experiencias as $exp) {
                DB::table('web_experiencias')->insert(array_merge($exp, [
                    'btn_texto'  => 'Reservar',
                    'btn_url'    => $waMsg,
                    'Activo'     => 'S',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }

        // ══════════════════════════════════════════════════════
        // 6. SERVICIOS (beneficios/pilares)
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_servicios') && DB::table('web_servicios')->count() === 0) {
            $servicios = [
                ['titulo' => 'Espacio 100% Privado',       'descripcion' => 'Atención absolutamente confidencial en un entorno diseñado para que te sientas completamente segura y cómoda en todo momento.'],
                ['titulo' => 'Tacto Consciente',           'descripcion' => 'Presencia y cuidado del detalle en cada movimiento, creando un espacio de confianza para soltar el estrés del día a día.'],
                ['titulo' => 'Técnica Especializada',      'descripcion' => 'Más de 10 años perfeccionando el arte tántrico y sensorial, adaptado a las necesidades únicas de cada mujer ejecutiva.'],
                ['titulo' => 'Equilibrio Energético',      'descripcion' => 'Reconexión profunda entre cuerpo, emoción y energía para devolverte el equilibrio que la vida ejecutiva muchas veces consume.'],
                ['titulo' => 'Masaje Sensorial Royal',     'descripcion' => 'Experiencia diseñada para despertar tus sentidos y liberar tensiones acumuladas con tacto consciente y presencia absoluta.'],
                ['titulo' => 'Relajación Profunda',        'descripcion' => 'Enfoque en liberar tensiones físicas y mentales provocadas por jornadas exigentes y altos niveles de responsabilidad.'],
                ['titulo' => 'Bienestar Ejecutivo',        'descripcion' => 'Ideal para mujeres profesionales con viajes frecuentes que buscan calidad y bienestar como parte de su estilo de vida.'],
                ['titulo' => 'Ambiente Privado VIP',       'descripcion' => 'Espacio seguro, absolutamente confidencial y diseñado para quienes valoran la discreción como parte de su estilo de vida.'],
            ];

            foreach ($servicios as $i => $srv) {
                DB::table('web_servicios')->insert([
                    'seccion_titulo' => 'Experiencias de Relajación Profunda',
                    'titulo'         => $srv['titulo'],
                    'descripcion'    => $srv['descripcion'],
                    'url_icono'      => null,
                    'url_foto'       => null,
                    'orden'          => $i + 1,
                    'Activo'         => 'S',
                    'created_at'     => now(),
                    'updated_at'     => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════════════
        // 7. TESTIMONIOS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_testimonios')) {
            $testimonios = [
                1 => ['nombre' => 'Ejecutiva Lima',          'subtitulo' => 'Directora de Empresa',       'url_avatar' => 'temp02/img/testimonial-1.jpg', 'testimonio' => 'Después de meses de estrés y viajes constantes, encontré en Royal Sensory Experience un espacio donde realmente pude soltar. La discreción, la calidad y el tacto consciente superaron todas mis expectativas.', 'orden' => 1],
                2 => ['nombre' => 'Profesional Independiente','subtitulo' => 'Consultora de Negocios',     'url_avatar' => 'temp02/img/testimonial-2.jpg', 'testimonio' => 'Valoro profundamente la confidencialidad y el cuidado en cada detalle. El masaje tántrico y sensorial me ayudó a reconectar con mi cuerpo y recuperar el equilibrio que perdía por las jornadas exigentes.', 'orden' => 2],
                3 => ['nombre' => 'Clienta Frecuente',       'subtitulo' => 'Gerente General',            'url_avatar' => 'temp02/img/testimonial-3.jpg', 'testimonio' => 'El bienestar ya no es un lujo ocasional para mí, es parte de mi estilo de vida. Más de 10 años de experiencia se notan en cada sesión. Reservo siempre por WhatsApp y la atención es impecable.', 'orden' => 3],
                4 => ['nombre' => 'Empresaria Lima',         'subtitulo' => 'CEO — Startup Tecnológica',  'url_avatar' => 'temp02/img/testimonial-1.jpg', 'testimonio' => 'Llevaba años buscando un espacio así: privado, profesional y donde realmente sintiera que me cuidan. Ahora es mi ritual mensual. Royal Masajes entiende exactamente lo que una mujer ejecutiva necesita.', 'orden' => 4],
                5 => ['nombre' => 'Profesional de Salud',    'subtitulo' => 'Médico Especialista',        'url_avatar' => 'temp02/img/testimonial-2.jpg', 'testimonio' => 'Como médico, soy muy exigente con los servicios de bienestar. El nivel técnico, la higiene y el trato personalizado de Royal Masajes son excepcionales. Lo recomiendo a todas mis pacientes con estrés crónico.', 'orden' => 5],
            ];

            foreach ($testimonios as $id => $t) {
                $payload = array_merge($t, [
                    'badge_seccion'  => 'Testimonios',
                    'seccion_titulo' => 'Lo Que Dicen Nuestras Clientas',
                    'calificacion'   => 5.0,
                    'tipo'           => 'texto',
                    'Activo'         => 'S',
                    'updated_at'     => now(),
                ]);
                if (DB::table('web_testimonios')->where('id_testimonio', $id)->exists()) {
                    DB::table('web_testimonios')->where('id_testimonio', $id)->update($payload);
                } else {
                    DB::table('web_testimonios')->insert(array_merge($payload, ['created_at' => now()]));
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // 8. PREGUNTAS FRECUENTES
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_preguntas_frecuentes') && DB::table('web_preguntas_frecuentes')->count() === 0) {
            $faqs = [
                ['pregunta' => '¿Cómo puedo hacer una reserva?',
                 'respuesta' => 'Las reservas se realizan exclusivamente por WhatsApp al número 982 311 335. Solo necesitas indicar el tipo de sesión que deseas y coordinar fecha y hora. Te confirmaremos disponibilidad de inmediato.'],

                ['pregunta' => '¿El servicio es exclusivo para mujeres?',
                 'respuesta' => 'Sí. Royal Sensory Experience Massage está diseñado exclusivamente para mujeres profesionales y ejecutivas. Nuestro entorno, técnicas y atención están orientados al bienestar femenino.'],

                ['pregunta' => '¿Es 100% confidencial?',
                 'respuesta' => 'Absolutamente. La discreción es uno de nuestros valores fundamentales. Tu identidad, tus datos y tu experiencia con nosotros son completamente confidenciales. Nunca compartimos información de nuestras clientas.'],

                ['pregunta' => '¿Cuánto dura cada sesión?',
                 'respuesta' => 'Ofrecemos sesiones de 90, 120, 150 y 180 a 300 minutos según la experiencia que elijas: LITE, CLÁSICO, DELUXE o ROYAL. Puedes consultar por WhatsApp para encontrar la más adecuada para ti.'],

                ['pregunta' => '¿Dónde están ubicados?',
                 'respuesta' => 'Operamos con atención privada en Lima, Perú. La dirección exacta se comparte únicamente al confirmar la reserva, como parte de nuestro compromiso de confidencialidad y seguridad.'],

                ['pregunta' => '¿Qué pasa si necesito cancelar mi cita?',
                 'respuesta' => 'Puedes cancelar o reprogramar con más de 24 horas de anticipación sin ningún costo. Para cancelaciones con menos de 12 horas puede aplicarse una compensación del 50%. Contáctanos por WhatsApp.'],

                ['pregunta' => '¿Cuál es el precio de los masajes?',
                 'respuesta' => 'Los precios se informan directamente por WhatsApp y pueden variar según la sesión elegida y la disponibilidad. Escríbenos y te asesoramos sin compromiso para encontrar la experiencia perfecta para ti.'],
            ];

            foreach ($faqs as $i => $faq) {
                DB::table('web_preguntas_frecuentes')->insert([
                    'badge_seccion'             => 'Preguntas Frecuentes',
                    'seccion_titulo'            => '¿Tienes dudas? Te respondemos',
                    'telefono_principal_label'  => 'WhatsApp:',
                    'telefono_principal'        => $tel,
                    'telefono_callcenter_label' => 'Reservas:',
                    'telefono_callcenter'       => 'Solo por WhatsApp',
                    'pregunta'                  => $faq['pregunta'],
                    'respuesta'                 => $faq['respuesta'],
                    'orden'                     => $i + 1,
                    'Activo'                    => 'S',
                    'created_at'                => now(),
                    'updated_at'                => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════════════
        // 9. POR QUÉ ELEGIRNOS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_porque_elejirnos') && DB::table('web_porque_elejirnos')->count() === 0) {
            DB::table('web_porque_elejirnos')->insert([
                'badge_texto'        => '¿Por qué elegir Royal Masajes?',
                'titulo'             => 'Más de 10 años dedicados al bienestar de mujeres profesionales',
                'descripcion'        => 'Nos encargamos de brindarte una experiencia de relajación profunda y tacto consciente en el entorno más privado y exclusivo de Lima. Tu bienestar, tu equilibrio y tu privacidad son nuestra prioridad.',
                'beneficios'         => json_encode([
                    'Espacio 100% privado y confidencial',
                    'Técnicas tántricas y sensoriales especializadas',
                    'Más de 10,000 clientas atendidas satisfactoriamente',
                    'Reserva únicamente por WhatsApp — sin filas ni esperas',
                    'Bienestar como estilo de vida, no como lujo ocasional',
                ]),
                'stat1_numero'       => 10,
                'stat1_sufijo'       => '+',
                'stat1_texto'        => 'Años perfeccionando el arte del masaje tántrico y sensorial en Lima',
                'stat2_numero'       => 100,
                'stat2_sufijo'       => '%',
                'stat2_texto'        => 'Confidencialidad garantizada en cada sesión para cada clienta',
                'stat3_numero'       => 10000,
                'stat3_sufijo'       => '+',
                'stat3_texto'        => 'Mujeres ejecutivas atendidas satisfactoriamente a lo largo de nuestra trayectoria',
                'url_imagen_izquierda' => 'temp02/img/about-1.jpg',
                'url_imagen_centro'    => 'temp02/img/about-2.jpg',
                'Activo'             => 'S',
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
        }

        // ══════════════════════════════════════════════════════
        // 10. GALERÍA (web_pagina_galeria)
        // ══════════════════════════════════════════════════════
        // Siempre repoblar galería: eliminar registros de contexto royal y reinsertar
        if (Schema::hasTable('web_pagina_galeria')) {
            DB::table('web_pagina_galeria')->where('contexto', 'royal_galeria')->delete();
        }

        if (Schema::hasTable('web_pagina_galeria')) {
            $galeria = [
                ['gallery-1.jpg',  'Masaje Sensorial',   'sensorial'],
                ['gallery-2.jpg',  'Relajación Profunda','relajacion'],
                ['gallery-3.jpg',  'Masaje Tántrico',    'tantrico'],
                ['gallery-4.jpg',  'Espacio Privado',    'vip'],
                ['gallery-5.jpg',  'Masaje Sensorial',   'sensorial'],
                ['gallery-6.jpg',  'Relajación',         'relajacion'],
                ['gallery-7.jpg',  'Masaje Tántrico',    'tantrico'],
                ['gallery-8.jpg',  'Espacio VIP',        'vip'],
                ['gallery-9.jpg',  'Masaje Sensorial',   'sensorial'],
                ['gallery-10.jpg', 'Masaje Sensorial',   'sensorial'],
                ['gallery-11.jpg', 'Relajación Profunda','relajacion'],
                ['gallery-12.jpg', 'Relajación Profunda','relajacion'],
                ['gallery-13.jpg', 'Masaje Tántrico',    'tantrico'],
                ['gallery-14.jpg', 'Espacio Privado',    'vip'],
            ];

            foreach ($galeria as $i => [$file, $titulo, $cat]) {
                $row = [
                    'contexto'   => 'royal_galeria',
                    'url_imagen' => 'temp02/img/' . $file,
                    'alt_imagen' => $titulo,
                    'orden'      => $i + 1,
                    'Activo'     => 'S',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                if (Schema::hasColumn('web_pagina_galeria', 'categoria')) {
                    $row['categoria'] = $cat;
                }
                if (Schema::hasColumn('web_pagina_galeria', 'titulo_overlay')) {
                    $row['titulo_overlay'] = $titulo;
                }
                DB::table('web_pagina_galeria')->insert($row);
            }
        }

        // ══════════════════════════════════════════════════════
        // 11. PÁGINA GALERÍA — SECCIÓN HEADER
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_pagina_galeria_seccion') && DB::table('web_pagina_galeria_seccion')->count() === 0) {
            DB::table('web_pagina_galeria_seccion')->insert([
                'id'                => 1,
                'seccion_titulo'    => 'Ambiente Diseñado Para Tus Sentidos',
                'seccion_subtitulo' => 'Nuestra Galería',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // ══════════════════════════════════════════════════════
        // 12. PÁGINA CONTACTO
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_pagina_contacto')) {
            $mapa = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.770826096!2d-77.042793!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c6f84ad473ef%3A0x8e4e6b6c8c8c8c8c!2sLima%2C%20Peru!5e0!3m2!1ses!2spe!4v1694259649153!5m2!1ses!2spe';
            $contactoData = [
                'banner_titulo'        => 'Contáctanos',
                'banner_url_imagen'    => 'temp02/img/inicio/slider_1.jpg',
                'frase_texto'          => 'Tu bienestar y privacidad son nuestra prioridad',
                'form_titulo'          => 'Reserva tu Sesión',
                'form_subtitulo'       => 'Escríbenos por WhatsApp y te guiamos hacia la experiencia perfecta. Respuesta inmediata.',
                'form_descripcion'     => 'Royal Sensory Experience Massage — relajación profunda y tacto consciente exclusivamente para mujeres profesionales en Lima.',
                'url_imagen_form'      => 'temp02/img/about-1.jpg',
                'mapa_embed_url'       => $mapa,
                'info_titulo'          => 'Información de Atención',
                'info_texto'           => 'Atendemos únicamente con reserva previa. Tu privacidad está 100% garantizada.',
                'telefono_etiqueta'    => 'WhatsApp',
                'telefono'             => $tel,
                'email_etiqueta'       => 'Reservas',
                'email'                => 'Solo por WhatsApp',
                'ubicacion_etiqueta'   => 'Ubicación',
                'ubicacion'            => 'Atención privada en Lima, Perú',
                'horario_etiqueta'     => 'Horario de atención',
                'horario_dias'         => json_encode([
                    ['dia' => 'Lunes a Domingo', 'hora' => 'Las 24 horas', 'rosa' => true],
                ], JSON_UNESCAPED_UNICODE),
                'telefonos_texto'      => $tel,
                'emails_texto'         => 'WhatsApp: ' . $tel,
                'productos_placeholder'=> 'Masaje Tántrico LITE — 90 min',
                'suscribe_titulo'      => 'Reserva al WhatsApp',
                'suscribe_texto'       => 'Escríbenos y te asesoramos sin compromiso.',
                'suscribe_placeholder' => 'Tu WhatsApp',
                'updated_at'           => now(),
            ];
            if (DB::table('web_pagina_contacto')->where('id', 1)->exists()) {
                DB::table('web_pagina_contacto')->where('id', 1)->update($contactoData);
            } else {
                DB::table('web_pagina_contacto')->insert(array_merge($contactoData, ['created_at' => now()]));
            }
        }

        // Tarjetas de info de contacto
        if (Schema::hasTable('web_contacto_columna')) {
            $columnas = [
                1 => ['titulo' => '📍 Ubicación',             'descripcion' => 'Atención privada en Lima, Perú. La dirección exacta se comparte únicamente al confirmar la reserva, como parte de nuestro compromiso de confidencialidad.'],
                2 => ['titulo' => '💬 WhatsApp: 982 311 335', 'descripcion' => 'Reservas exclusivamente por WhatsApp. Te respondemos de inmediato y coordinamos la sesión perfecta para ti. Sin filas, sin esperas.'],
                3 => ['titulo' => '🔒 100% Confidencial',     'descripcion' => 'Tu identidad, datos y experiencia son absolutamente privados. Nunca compartimos información de nuestras clientas con terceros.'],
            ];
            foreach ($columnas as $id => $data) {
                $payload = array_merge($data, ['orden' => $id, 'Activo' => 'S', 'updated_at' => now()]);
                if (DB::table('web_contacto_columna')->where('id', $id)->exists()) {
                    DB::table('web_contacto_columna')->where('id', $id)->update($payload);
                } else {
                    DB::table('web_contacto_columna')->insert(array_merge($payload, ['created_at' => now()]));
                }
            }
        }

        // CTA de contacto landing
        if (Schema::hasTable('web_contacto_landing')) {
            $landingData = [
                'titulo'       => 'Un rituel te espera en Miraflores',
                'descripcion'  => 'Reserva tu sesión hoy y vive la relajación profunda que tu cuerpo merece. Discreción y calidad garantizadas. Solo con reserva previa al WhatsApp.',
                'url_imagen'   => 'temp02/img/about-1.jpg',
                'email_destino'=> 'ghiovani666@gmail.com',
                'asuntos'      => json_encode([
                    'Sabor Simple del Tantra — 90 min',
                    'El Toque Sensual del Tantra — 120 min',
                    'Masaje Tántrico de Lujo — 150 min',
                    'Masaje Tántrico Royal — 180 a 300 min',
                ]),
                'updated_at'   => now(),
            ];
            if (DB::table('web_contacto_landing')->where('id', 1)->exists()) {
                DB::table('web_contacto_landing')->where('id', 1)->update($landingData);
            } else {
                DB::table('web_contacto_landing')->insert(array_merge($landingData, ['created_at' => now()]));
            }
        }

        // ══════════════════════════════════════════════════════
        // 13. PÁGINA NOSOTROS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_pagina_nosotros') && DB::table('web_pagina_nosotros')->count() === 0) {
            DB::table('web_pagina_nosotros')->insert([
                'banner_titulo'     => 'Sobre Nosotros',
                'galeria_titulo'    => 'Nuestro <span class="color-primary">Ambiente</span>',
                'galeria_subtitulo' => 'Espacio exclusivo diseñado para tu bienestar y privacidad',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // ══════════════════════════════════════════════════════
        // 14. NOSOTROS — QUIÉNES SOMOS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_nosotros_quienes') && DB::table('web_nosotros_quienes')->count() === 0) {
            DB::table('web_nosotros_quienes')->insert([
                'badge_texto'   => 'Sobre Nosotros',
                'titulo'        => 'Royal Sensory Experience Massage',
                'descripcion'   => 'Nació de la pasión por el bienestar femenino y la convicción de que cada mujer merece un espacio donde reconectarse con su cuerpo, liberar tensiones y recuperar el equilibrio que la vida ejecutiva muchas veces arrebata. Con más de 10 años de experiencia y más de 10,000 mujeres atendidas, hemos perfeccionado un arte único que combina técnicas tántricas y sensoriales con un entorno absolutamente privado, seguro y diseñado para despertar todos tus sentidos.',
                'url_imagen'    => 'temp02/img/about-1.jpg',
                'url_imagen_2'  => 'temp02/img/about-2.jpg',
                'Activo'        => 'S',
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        // ══════════════════════════════════════════════════════
        // 15. CONTADORES / ESTADÍSTICAS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_contadores') && DB::table('web_contadores')->count() === 0) {
            $contadores = [
                ['numero' => '10', 'sufijo' => '+', 'titulo' => 'Años de Experiencia',   'icono' => 'spa'],
                ['numero' => '10', 'sufijo' => 'K+','titulo' => 'Clientas Atendidas',    'icono' => 'people'],
                ['numero' => '100','sufijo' => '%', 'titulo' => 'Confidencialidad',       'icono' => 'shield'],
                ['numero' => '4',  'sufijo' => '',  'titulo' => 'Experiencias Únicas',    'icono' => 'favorite'],
            ];
            foreach ($contadores as $i => $c) {
                $row = [
                    'titulo'     => $c['titulo'],
                    'numero'     => $c['numero'],
                    'Activo'     => 'S',
                    'orden'      => $i + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                if (Schema::hasColumn('web_contadores', 'sufijo'))  $row['sufijo']  = $c['sufijo'];
                if (Schema::hasColumn('web_contadores', 'icono'))   $row['icono']   = $c['icono'];
                if (Schema::hasColumn('web_contadores', 'contexto'))$row['contexto']= 'landing';
                DB::table('web_contadores')->insert($row);
            }
        }

        // ══════════════════════════════════════════════════════
        // 16. NOSOTROS — QUIÉNES — BENEFICIOS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_nosotros_quienes_beneficio') && DB::table('web_nosotros_quienes_beneficio')->count() === 0) {
            $beneficios = [
                ['titulo' => 'Confidencialidad Total',  'descripcion' => 'Tu privacidad es nuestra prioridad absoluta. Atención completamente confidencial en un espacio seguro.'],
                ['titulo' => '+10 Años de Arte Sensorial','descripcion' => 'Técnicas tántricas y sensoriales perfeccionadas durante más de una década de dedicación al bienestar femenino.'],
                ['titulo' => 'Bienestar Continuo',      'descripcion' => 'Te acompañamos a integrar el bienestar en tu rutina de vida, no como escapada ocasional sino como práctica transformadora.'],
            ];
            foreach ($beneficios as $i => $b) {
                DB::table('web_nosotros_quienes_beneficio')->insert([
                    'titulo'      => $b['titulo'],
                    'descripcion' => $b['descripcion'],
                    'icono'       => null,
                    'orden'       => $i + 1,
                    'Activo'      => 'S',
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }

        // ══════════════════════════════════════════════════════
        // 17. EQUIPO / ESPECIALISTAS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('web_nuestro_equipo')) {
            $equipo = [
                1 => [
                    'seccion_badge'  => 'Especialista Royal',
                    'seccion_titulo' => 'Más de 10 Años de Arte Sensorial',
                    'cargo'          => 'Terapeuta Royal',
                    'titulo'         => 'Masaje Sensorial & Tántrico',
                    'descripcion'    => 'Especialista en técnicas tántricas y sensoriales con más de 10 años de experiencia dedicados exclusivamente al bienestar de mujeres profesionales en Lima.',
                    'url_facebook'   => '#',
                    'url_whatsapp'   => $waMsg,
                    'url_imagen'     => 'temp02/img/about-1.jpg',
                    'orden'          => 1,
                    'Activo'         => 'S',
                    'updated_at'     => now(),
                ],
                2 => [
                    'seccion_badge'  => '',
                    'seccion_titulo' => '',
                    'cargo'          => 'Especialista en Relajación',
                    'titulo'         => 'Tacto Consciente',
                    'descripcion'    => 'Experta en técnicas de relajación profunda y liberación de tensiones. Cada sesión es un ritual personalizado para devolverte el equilibrio físico y emocional.',
                    'url_facebook'   => '#',
                    'url_whatsapp'   => $waMsg,
                    'url_imagen'     => 'temp02/img/gallery-2.jpg',
                    'orden'          => 2,
                    'Activo'         => 'S',
                    'updated_at'     => now(),
                ],
                3 => [
                    'seccion_badge'  => '',
                    'seccion_titulo' => '',
                    'cargo'          => 'Experta en Bienestar',
                    'titulo'         => 'Mujeres Ejecutivas',
                    'descripcion'    => 'Especializada en el bienestar de mujeres con altos niveles de responsabilidad. Combina equilibrio energético con un entorno absolutamente privado y confidencial.',
                    'url_facebook'   => '#',
                    'url_whatsapp'   => $waMsg,
                    'url_imagen'     => 'temp02/img/gallery-5.jpg',
                    'orden'          => 3,
                    'Activo'         => 'S',
                    'updated_at'     => now(),
                ],
                4 => [
                    'seccion_badge'  => '',
                    'seccion_titulo' => '',
                    'cargo'          => 'Asesora de Experiencias',
                    'titulo'         => 'Atención Privada VIP',
                    'descripcion'    => 'Encargada de garantizar que cada clienta viva una experiencia única, segura y completamente adaptada a sus necesidades. Reservas y atención personalizada al WhatsApp.',
                    'url_facebook'   => '#',
                    'url_whatsapp'   => $waMsg,
                    'url_imagen'     => 'temp02/img/gallery-9.jpg',
                    'orden'          => 4,
                    'Activo'         => 'S',
                    'updated_at'     => now(),
                ],
            ];

            foreach ($equipo as $id => $data) {
                if (DB::table('web_nuestro_equipo')->where('id_miembro', $id)->exists()) {
                    DB::table('web_nuestro_equipo')->where('id_miembro', $id)->update($data);
                } else {
                    DB::table('web_nuestro_equipo')->insert(array_merge($data, [
                        'created_at' => now(),
                    ]));
                }
            }
        }

        // ══════════════════════════════════════════════════════
        // 18. METADATOS DE PÁGINAS
        // ══════════════════════════════════════════════════════
        if (Schema::hasTable('metadatos_paginas') && Schema::hasColumn('metadatos_paginas', 'nombre_pagina')) {
            $metadatos = [
                [
                    'nombre_pagina'      => 'web_masajes',
                    'titulo_pagina'      => 'Masajes Tántricos para Mujeres | Royal Sensory Experience Massage',
                    'descripcion_pagina' => 'Masajes tántricos y sensoriales exclusivos para mujeres en Lima. Conoce nuestras experiencias, beneficios y reserva tu sesión privada por WhatsApp.',
                ],
                [
                    'nombre_pagina'      => 'web_experiencias',
                    'titulo_pagina'      => 'Nuestras Experiencias | Royal Sensory Experience Massage',
                    'descripcion_pagina' => 'Explora experiencias sensoriales, masajes tántricos, bienestar femenino, renovación corporal y modelación. Reserva tu sesión privada en Lima.',
                ],
                [
                    'nombre_pagina'      => 'web_servicios',
                    'titulo_pagina'      => 'Masajes & Servicios | Royal Masajes Lima',
                    'descripcion_pagina' => 'Descubre las experiencias de masaje tántrico de Royal Masajes en Lima.',
                ],
            ];

            foreach ($metadatos as $m) {
                $exists = DB::table('metadatos_paginas')->where('nombre_pagina', $m['nombre_pagina'])->exists();
                if ($exists) {
                    DB::table('metadatos_paginas')->where('nombre_pagina', $m['nombre_pagina'])->update(array_merge($m, ['activo' => 'S', 'updated_at' => now()]));
                } else {
                    DB::table('metadatos_paginas')->insert(array_merge($m, [
                        'activo'     => 'S',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]));
                }
            }
        }
    }
}
