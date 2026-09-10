<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reorganiza el sidebar para miBoda:
 *  - Desactiva los módulos de contenido propios de Amour Spa / Royal Masajes
 *    que no aplican a una invitación de boda (quedan en historial, no se borran).
 *  - Convierte cada sub-módulo del editor de la invitación en un módulo de
 *    primer nivel del sidebar (antes solo eran tarjetas dentro del hub
 *    /evento/index), para que aparezcan como enlaces directos.
 * Idempotente.
 */
return new class extends Migration
{
    private array $desactivar = [
        '/nuestro_equipo/index',      // Nuestro Equipo (Amour)
        '/testimonios/index',         // Testimonios (Amour)
        '/faq/index',                 // Preguntas Frecuentes (Amour)
        '/about/index',               // Quiénes Somos (Amour)
        '/experiencias/index',        // Servicios/Rituales (Amour)
        '/planes/index',              // Planes & Precios (Amour)
        '/footer/index',              // Footer & Cierre (Amour)
        '/whatsapp/index',            // WhatsApp Flotante (Amour)
    ];

    private array $desactivarPorNombre = [
        'Inicio & Header',
        'Contacto',
    ];

    private array $activar = [
        ['nombre' => 'General (Hero y Frase)', 'url' => '/evento-general/index', 'icon' => 'mail'],
        ['nombre' => 'Sobre Animado', 'url' => '/evento-sobre/index', 'icon' => 'mail_outline'],
        ['nombre' => 'Familia', 'url' => '/evento-familia/index', 'icon' => 'groups'],
        ['nombre' => 'Ubicaciones', 'url' => '/evento-ubicaciones/index', 'icon' => 'place'],
        ['nombre' => 'Itinerario', 'url' => '/evento-itinerario/index', 'icon' => 'schedule'],
        ['nombre' => 'Vestimenta', 'url' => '/evento-vestimenta/index', 'icon' => 'checkroom'],
        ['nombre' => 'RSVP - Configuración', 'url' => '/evento-rsvp/index', 'icon' => 'how_to_reg'],
        ['nombre' => 'Mesa de Regalos', 'url' => '/evento-regalos/index', 'icon' => 'card_giftcard'],
        ['nombre' => 'Fotos y Versículos', 'url' => '/evento-momentos/index', 'icon' => 'photo_camera'],
        ['nombre' => 'Nuestra Historia', 'url' => '/evento-historia/index', 'icon' => 'auto_stories'],
        ['nombre' => 'Video, Música y Avisos', 'url' => '/evento-multimedia/index', 'icon' => 'movie'],
    ];

    public function up(): void
    {
        if (! Schema::hasTable('sistema_modulo')) {
            return;
        }

        $now = now();

        DB::table('sistema_modulo')->whereIn('url', $this->desactivar)->update(['Activo' => 'N', 'updated_at' => $now]);
        DB::table('sistema_modulo')->whereIn('nombre', $this->desactivarPorNombre)->update(['Activo' => 'N', 'updated_at' => $now]);

        foreach ($this->activar as $m) {
            $existente = DB::table('sistema_modulo')->where('url', $m['url'])->first();

            if ($existente) {
                $idModulo = $existente->id_modulo;
                DB::table('sistema_modulo')->where('id_modulo', $idModulo)->update([
                    'nombre' => $m['nombre'], 'Activo' => 'S', 'Icon' => $m['icon'], 'updated_at' => $now,
                ]);
            } else {
                $idModulo = DB::table('sistema_modulo')->insertGetId([
                    'nombre' => $m['nombre'], 'url' => $m['url'], 'Activo' => 'S', 'Icon' => $m['icon'],
                    'created_at' => $now, 'updated_at' => $now,
                ]);
            }

            if (Schema::hasTable('seguridad_roles_modulo')) {
                $yaAsignado = DB::table('seguridad_roles_modulo')
                    ->where('id_roles', 1)->where('id_modulo', $idModulo)->exists();
                if (! $yaAsignado) {
                    DB::table('seguridad_roles_modulo')->insert([
                        'id_roles' => 1, 'id_modulo' => $idModulo, 'created_at' => $now, 'updated_at' => $now,
                    ]);
                }
            }
        }

        if (Schema::hasTable('seguridad_roles_sidebar_orden')) {
            DB::table('seguridad_roles_sidebar_orden')->where('id_roles', 1)->delete();
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('sistema_modulo')) {
            return;
        }
        DB::table('sistema_modulo')->whereIn('url', $this->desactivar)->update(['Activo' => 'S']);
        DB::table('sistema_modulo')->whereIn('nombre', $this->desactivarPorNombre)->update(['Activo' => 'S']);
        foreach ($this->activar as $m) {
            DB::table('sistema_modulo')->where('url', $m['url'])->update(['Activo' => 'N']);
        }
    }
};
