<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class LucdesoftLandingSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedSlider();
        $this->seedHeaderFooter();
        $this->seedContadores();
        $this->seedServicios();
        $this->seedEjemplares();
        $this->seedPortafolio();
        $this->seedContactoLanding();
    }

    private function seedSlider(): void
    {
        if (!Schema::hasTable('web_slider')) {
            return;
        }

        $slides = [
            [
                'tipo_slide'    => 'codigo',
                'slide_tag'     => 'Lima, Perú · Software & Innovación',
                'titulo'        => '¿Tu empresa trabaja sin un <em>sistema propio?</em>',
                'descripcion'   => 'Automatizamos procesos, impulsamos ventas y digitalizamos tu operación con software a medida desarrollado para tu industria.',
                'texto_boton'   => '🚀 Cotizar Gratis Ahora',
                'url_link'      => 'https://wa.me/51970048451?text=Hola%2C%20quiero%20cotizar%20un%20proyecto%20de%20software',
                'texto_boton_2' => 'Ver Servicios →',
                'url_link_2'    => '#hub',
            ],
            [
                'tipo_slide'    => 'ecommerce',
                'slide_tag'     => 'E-Commerce · Tiendas Online',
                'titulo'        => 'Vende <em>24/7</em> con<br>tu <b>tienda online</b>',
                'descripcion'   => 'E-commerce profesional con carrito, pagos, inventario y panel admin. Tu negocio abierto las 24 horas, los 365 días del año.',
                'texto_boton'   => '💬 Hablemos Hoy',
                'url_link'      => '#cta',
                'texto_boton_2' => 'Ver Ejemplares →',
                'url_link_2'    => '#ejemplares',
            ],
            [
                'tipo_slide'    => 'mobile',
                'slide_tag'     => 'Apps Móviles Android & iOS',
                'titulo'        => 'Tu negocio en la<br>palma de la <em>mano</em>',
                'descripcion'   => 'Apps nativas y multiplataforma con React Native y Kotlin. Gestión, ventas y operaciones desde cualquier dispositivo móvil.',
                'texto_boton'   => '📱 Quiero mi App',
                'url_link'      => '#cta',
                'texto_boton_2' => 'Ver Tecnologías →',
                'url_link_2'    => '#hub',
            ],
            [
                'tipo_slide'    => 'confidencialidad',
                'slide_tag'     => 'Confidencialidad · Acuerdo por escrito disponible',
                'titulo'        => 'Tu código es<br><em>100% tuyo.</em> Siempre.',
                'descripcion'   => 'Tu proyecto, tu lógica de negocio y tus datos jamás se comparten ni revenden. Garantía total de ajustes sin costo adicional.',
                'texto_boton'   => '🔒 Ver Garantías',
                'url_link'      => '#hub',
                'texto_boton_2' => 'Cotizar Proyecto →',
                'url_link_2'    => '#cta',
            ],
        ];

        foreach ($slides as $i => $slide) {
            $id = $i + 1;
            $row = array_merge($slide, ['Activo' => 'S', 'updated_at' => now()]);
            if (DB::table('web_slider')->where('id_slider', $id)->exists()) {
                DB::table('web_slider')->where('id_slider', $id)->update($row);
            } else {
                DB::table('web_slider')->insert(array_merge($row, [
                    'id_slider'    => $id,
                    'subtitulo'    => null,
                    'url_imagen'   => null,
                    'created_at'   => now(),
                ]));
            }
        }
    }

    private function seedHeaderFooter(): void
    {
        if (Schema::hasTable('web_header') && DB::table('web_header')->exists()) {
            DB::table('web_header')->where('id_header', 1)->update([
                'url_logo'         => 'temp02/logo_lucdesoft.svg',
                'top_telefonos'    => '+51 970 048 451',
                'top_email'        => 'ghiovani666@gmail.com',
                'url_whatsapp_top' => 'tel:+51970048451',
                'nav_items'        => json_encode([
                    ['texto' => 'Ejemplares', 'url' => '#ejemplares', 'target' => '_self'],
                    ['texto' => 'Portafolio', 'url' => '#portafolio', 'target' => '_self'],
                    ['texto' => 'Servicios', 'url' => '#hub', 'hub_tab' => 'soluciones', 'target' => '_self'],
                    ['texto' => 'Tecnologías', 'url' => '#hub', 'hub_tab' => 'stack', 'target' => '_self'],
                    ['texto' => '¿Por qué nosotros?', 'url' => '#hub', 'hub_tab' => 'porque', 'target' => '_self'],
                    ['texto' => 'Garantía', 'url' => '#hub', 'hub_tab' => 'garantia', 'target' => '_self'],
                    ['texto' => 'Cotizador Web', 'url' => '/cotizador', 'css_class' => 'nav-btn', 'target' => '_self'],
                ], JSON_UNESCAPED_UNICODE),
                'Activo'           => 'S',
                'updated_at'       => now(),
            ]);
        }

        if (Schema::hasTable('web_footer') && DB::table('web_footer')->where('id_footer', 1)->exists()) {
            DB::table('web_footer')->where('id_footer', 1)->update([
                'descripcion_footer' => 'Desarrollo de software a medida en Lima, Perú. Sistemas web, apps móviles, e-commerce y ERPs que transforman negocios reales.',
                'footer_telefonos'   => '+51 970 048 451',
                'footer_emails'      => 'ghiovani666@gmail.com',
                'texto_copyright'  => '© 2026 royalsensorymassage — Software Solutions & Innovation · Lima, Perú',
                'whatsapp_mensaje'   => 'Hola, quiero cotizar un proyecto de software',
                'Activo'             => 'S',
                'updated_at'         => now(),
            ]);
        }
    }

    private function seedContadores(): void
    {
        if (!Schema::hasTable('web_contadores')) {
            return;
        }

        $items = [
            ['valor' => '50', 'sufijo' => '+', 'etiqueta' => 'Proyectos Entregados', 'orden' => 1],
            ['valor' => '9', 'sufijo' => '', 'etiqueta' => 'Tipos de Soluciones', 'orden' => 2],
            ['valor' => '100', 'sufijo' => '%', 'etiqueta' => 'Confidencialidad', 'orden' => 3],
            ['valor' => '∞', 'sufijo' => '', 'etiqueta' => 'Soporte Post-Entrega', 'orden' => 4],
        ];

        foreach ($items as $i => $item) {
            $id = $i + 1;
            $row = array_merge($item, ['Activo' => 'S', 'updated_at' => now()]);
            if (DB::table('web_contadores')->where('id_contador', $id)->exists()) {
                DB::table('web_contadores')->where('id_contador', $id)->update($row);
            } else {
                DB::table('web_contadores')->insert(array_merge($row, [
                    'id_contador' => $id,
                    'created_at'  => now(),
                ]));
            }
        }
    }

    private function seedServicios(): void
    {
        if (!Schema::hasTable('web_servicios')) {
            return;
        }

        DB::table('web_servicios')->truncate();

        $servicios = [
            ['titulo' => 'Royal Masajes Lima', 'descripcion' => 'Experiencia diseñada para despertar tus sentidos y liberar tensiones acumuladas con tacto consciente y presencia absoluta.', 'url_icono' => 'bi-globe2', 'tags' => 'React,Vue.js,Next.js', 'orden' => 1],
            ['titulo' => 'Masaje Tántrico Consciente', 'descripcion' => 'Arte único que combina técnicas tántricas y sensoriales para reconectar con tu cuerpo y recuperar el equilibrio energético.', 'url_icono' => 'bi-briefcase', 'tags' => '.NET C#,Kotlin,MAUI', 'orden' => 2],
            ['titulo' => 'Relajación Profunda', 'descripcion'  => 'Enfoque en liberar tensiones físicas y mentales provocadas por jornadas exigentes y altos niveles de responsabilidad.', 'url_icono' => 'bi-cart3', 'tags' => 'Laravel,Django,React', 'orden' => 3],
            ['titulo' => 'Tacto Consciente', 'descripcion' => 'Presencia y cuidado del detalle en cada movimiento, creando un espacio de confianza para soltar el estrés del día a día.', 'url_icono' => 'bi-mortarboard', 'tags' => 'Angular,LMS,Pizarra', 'orden' => 4],
            ['titulo' => 'Experiencia Integral', 'descripcion' => 'Sesión completa que integra cuerpo, emoción y energía en un ambiente privado pensado para el bienestar de la mujer ejecutiva.', 'url_icono' => 'bi-phone', 'tags' => 'React Native,Kotlin', 'orden' => 5],
            ['titulo' => 'Ambiente Privado VIP', 'descripcion' => 'Espacio seguro, absolutamente confidencial y diseñado para quienes valoran la discreción como parte de su estilo de vida.', 'url_icono' => 'bi-building', 'tags' => 'Full Stack,ERP', 'orden' => 6],
            ['titulo' => 'Bienestar Ejecutivo', 'descripcion' => 'Ideal para mujeres profesionales con viajes frecuentes que buscan calidad y bienestar, no como lujo ocasional sino como estilo de vida.', 'url_icono' => 'bi-shield-exclamation', 'tags' => 'Seguridad,Normativas', 'orden' => 7],
            ['titulo' => 'Liberación de Tensiones', 'descripcion' => 'Técnicas especializadas para soltar cada tensión del cuerpo y devolverte la sensación de ligereza y equilibrio interior.', 'url_icono' => 'bi-heart-pulse', 'tags' => 'Web App,Mobile', 'orden' => 8],
        ];

        foreach ($servicios as $i => $s) {
            $tags = $s['tags'];
            unset($s['tags']);
            DB::table('web_servicios')->insert(array_merge($s, [
                'id_servicio' => $i + 1,
                'subtitulo'   => $tags,
                'Activo'      => 'S',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]));
        }
    }

    private function seedEjemplares(): void
    {
        if (!Schema::hasTable('web_ejemplares_seccion')) {
            return;
        }

        $path = database_path('seeders/data/ejemplares.json');
        if (!is_file($path)) {
            return;
        }

        $data = json_decode(file_get_contents($path), true);
        if (!is_array($data)) {
            return;
        }

        DB::table('web_ejemplares')->truncate();
        DB::table('web_ejemplares_seccion')->truncate();

        $slugToId = [];
        foreach ($data['secciones'] ?? [] as $sec) {
            $id = DB::table('web_ejemplares_seccion')->insertGetId([
                'slug'              => $sec['slug'],
                'anchor_id'         => $sec['anchor_id'],
                'etiqueta'          => $sec['etiqueta'] ?? 'Ejemplares',
                'titulo'            => $sec['titulo'] ?? '',
                'titulo_destacado'  => $sec['titulo_destacado'] ?? '',
                'subtitulo'         => $sec['subtitulo'] ?? '',
                'conteo_nav'        => $sec['conteo_nav'] ?? 0,
                'orden'             => $sec['orden'] ?? 0,
                'Activo'            => 'S',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
            $slugToId[$sec['slug']] = $id;
        }

        foreach ($data['items'] ?? [] as $item) {
            $secId = $slugToId[$item['seccion_slug']] ?? null;
            if (!$secId) {
                continue;
            }
            DB::table('web_ejemplares')->insert([
                'id_seccion'     => $secId,
                'slug'           => $item['slug'] ?? null,
                'nombre'         => $item['nombre'] ?? '',
                'descripcion'    => $item['descripcion'] ?? '',
                'url_imagen'     => 'temp02/' . ltrim($item['url_imagen'] ?? '', '/'),
                'numero_badge'   => $item['numero_badge'] ?? null,
                'overlay_texto'  => $item['overlay_texto'] ?? null,
                'url_demo'       => $item['url_demo'] ?? '#',
                'orden'          => $item['orden'] ?? 0,
                'Activo'         => 'S',
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }
    }

    private function seedPortafolio(): void
    {
        if (!Schema::hasTable('web_portafolio')) {
            return;
        }

        $path = database_path('seeders/data/portafolio.json');
        if (!is_file($path)) {
            return;
        }

        $items = json_decode(file_get_contents($path), true);
        if (!is_array($items)) {
            return;
        }

        DB::table('web_portafolio')->truncate();

        if (Schema::hasTable('web_portafolio_seccion')) {
            DB::table('web_portafolio_seccion')->updateOrInsert(
                ['id' => 1],
                [
                    'etiqueta'   => 'Un vistazo a nuestros últimos trabajos',
                    'titulo'     => 'Portafolio de <em>clientes</em>',
                    'subtitulo'  => 'Conoce cómo ayudamos a nuestros clientes a digitalizar, crecer y destacarse.',
                    'Activo'     => 'S',
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        foreach ($items as $i => $row) {
            DB::table('web_portafolio')->insert([
                'categoria'      => $row['cat'] ?? 'sitios',
                'tipo'           => $row['type'] ?? 'Sitio web',
                'titulo'         => $row['title'] ?? '',
                'descripcion'    => $row['desc'] ?? '',
                'tecnologias'    => $row['tech'] ?? '',
                'url_proyecto'   => $row['url'] ?? '',
                'texto_enlace'   => $row['linkText'] ?? 'Sitio web',
                'url_imagen'     => !empty($row['img']) ? 'temp02/' . ltrim($row['img'], '/') : null,
                'orden'          => $i + 1,
                'Activo'         => 'S',
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }
    }

    private function seedContactoLanding(): void
    {
        if (!Schema::hasTable('web_contacto_landing')) {
            return;
        }

        DB::table('web_contacto_landing')->updateOrInsert(
            ['id' => 1],
            [
                'titulo'        => '¿Listo para digitalizar <em>tu negocio?</em>',
                'descripcion'   => 'No dejes que la competencia te adelante. Tu sistema ideal está a un mensaje de distancia. Cotización gratuita en menos de 24 horas.',
                'email_destino' => 'ghiovani666@gmail.com',
                'updated_at'    => now(),
                'created_at'    => now(),
            ]
        );
    }
}
