<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Agrega al sidebar admin los 3 módulos de "bandejas" de la invitación
 * (RSVP, Sugerencias de Canción, Galería de Fotos). Idempotente.
 */
return new class extends Migration
{
    private array $modulos = [
        ['nombre' => 'Editar Invitación', 'url' => '/evento/index', 'icon' => 'favorite'],
        ['nombre' => 'RSVP - Confirmaciones', 'url' => '/rsvp-respuestas/index', 'icon' => 'how_to_reg'],
        ['nombre' => 'Sugerencias de Canción', 'url' => '/cancion-sugerencias/index', 'icon' => 'music_note'],
        ['nombre' => 'Galería de Fotos', 'url' => '/galeria-fotos/index', 'icon' => 'photo_library'],
    ];

    public function up(): void
    {
        if (! Schema::hasTable('sistema_modulo')) {
            return;
        }

        $now = now();

        foreach ($this->modulos as $m) {
            $existente = DB::table('sistema_modulo')->where('url', $m['url'])->first();

            if ($existente) {
                $idModulo = $existente->id_modulo;
                DB::table('sistema_modulo')->where('id_modulo', $idModulo)->update([
                    'nombre' => $m['nombre'],
                    'Activo' => 'S',
                    'Icon' => $m['icon'],
                    'updated_at' => $now,
                ]);
            } else {
                $idModulo = DB::table('sistema_modulo')->insertGetId([
                    'nombre' => $m['nombre'],
                    'url' => $m['url'],
                    'Activo' => 'S',
                    'Icon' => $m['icon'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            if (Schema::hasTable('seguridad_roles_modulo')) {
                $yaAsignado = DB::table('seguridad_roles_modulo')
                    ->where('id_roles', 1)->where('id_modulo', $idModulo)->exists();
                if (! $yaAsignado) {
                    DB::table('seguridad_roles_modulo')->insert([
                        'id_roles' => 1,
                        'id_modulo' => $idModulo,
                        'created_at' => $now,
                        'updated_at' => $now,
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

        foreach ($this->modulos as $m) {
            DB::table('sistema_modulo')->where('url', $m['url'])->update(['Activo' => 'N']);
        }
    }
};
