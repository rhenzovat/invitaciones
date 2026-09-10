<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Deja "Quiénes Somos" y "Nuestro Equipo" como MÓDULOS de primer nivel del sidebar
 * (enlaces directos), no como submenús dentro de una carpeta "Nosotros".
 *
 *  - El módulo de la página About (url /about/index) se renombra a "Quiénes Somos"
 *    y se le quitan submenús para que vuelva a ser un enlace directo.
 *  - Se asegura un módulo "Nuestro Equipo" → /nuestro_equipo/index, activo y asignado
 *    a los mismos roles.
 *
 * El módulo del equipo (frontend, API, tabla y datos) ya existe; esto solo organiza
 * cómo aparecen ambos en el menú admin. Idempotente.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('sistema_modulo') || ! Schema::hasTable('sistema_menu')) {
            return;
        }

        $now = now();

        // 1. Módulo "Quiénes Somos" (página About). Resolver por url; fallback por nombre.
        $qs = DB::table('sistema_modulo')->where('url', '/about/index')->first()
            ?: DB::table('sistema_modulo')->whereIn('nombre', ['Quiénes Somos', 'Nosotros'])->first();

        $roles = [];

        if ($qs) {
            DB::table('sistema_modulo')->where('id_modulo', $qs->id_modulo)->update([
                'nombre'     => 'Quiénes Somos',
                'Activo'     => 'S',
                'updated_at' => $now,
            ]);

            // Quitar submenús que lo convertirían en carpeta (limpieza de enfoque previo).
            $this->purgarMenus(DB::table('sistema_menu')->where('id_modulo', $qs->id_modulo)->pluck('id_menu'));

            if (Schema::hasTable('seguridad_roles_modulo')) {
                $roles = DB::table('seguridad_roles_modulo')
                    ->where('id_modulo', $qs->id_modulo)->pluck('id_roles')->all();
            }
        }
        if (empty($roles)) {
            $roles = [1];
        }

        // 2. Asegurar el MÓDULO "Nuestro Equipo" (enlace directo).
        $me = DB::table('sistema_modulo')->where('url', '/nuestro_equipo/index')->first();
        if ($me) {
            DB::table('sistema_modulo')->where('id_modulo', $me->id_modulo)->update([
                'nombre'     => 'Nuestro Equipo',
                'Activo'     => 'S',
                'Icon'       => 'groups',
                'updated_at' => $now,
            ]);
            $idME = (int) $me->id_modulo;
        } else {
            $idME = DB::table('sistema_modulo')->insertGetId([
                'nombre'     => 'Nuestro Equipo',
                'url'        => '/nuestro_equipo/index',
                'Activo'     => 'S',
                'Icon'       => 'groups',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Quitar cualquier menú suelto con esa url (colgado de otro módulo en enfoques previos).
        $this->purgarMenus(DB::table('sistema_menu')->where('url', '/nuestro_equipo/index')->pluck('id_menu'));

        // 3. Asignar el módulo "Nuestro Equipo" a los roles.
        if (Schema::hasTable('seguridad_roles_modulo')) {
            foreach ($roles as $idRol) {
                $existe = DB::table('seguridad_roles_modulo')
                    ->where('id_roles', $idRol)->where('id_modulo', $idME)->exists();
                if (! $existe) {
                    DB::table('seguridad_roles_modulo')->insert([
                        'id_roles'   => $idRol,
                        'id_modulo'  => $idME,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        // 4. Limpiar la caché de orden del sidebar para refrescar el menú.
        if (Schema::hasTable('seguridad_roles_sidebar_orden')) {
            DB::table('seguridad_roles_sidebar_orden')->whereIn('id_roles', $roles)->delete();
        }
    }

    /** Elimina menús (y sus asignaciones por rol) por lista de ids. */
    private function purgarMenus($ids): void
    {
        if ($ids->isEmpty()) {
            return;
        }
        if (Schema::hasTable('seguridad_roles_menu')) {
            DB::table('seguridad_roles_menu')->whereIn('id_menu', $ids)->delete();
        }
        DB::table('sistema_menu')->whereIn('id_menu', $ids)->delete();
    }

    public function down(): void
    {
        // Oculta el módulo "Nuestro Equipo" (no borra su contenido ni la página About).
        if (! Schema::hasTable('sistema_modulo')) {
            return;
        }
        $me = DB::table('sistema_modulo')->where('url', '/nuestro_equipo/index')->first();
        if ($me) {
            DB::table('sistema_modulo')->where('id_modulo', $me->id_modulo)->update(['Activo' => 'N', 'updated_at' => now()]);
            if (Schema::hasTable('seguridad_roles_modulo')) {
                DB::table('seguridad_roles_modulo')->where('id_modulo', $me->id_modulo)->delete();
            }
        }
    }
};
