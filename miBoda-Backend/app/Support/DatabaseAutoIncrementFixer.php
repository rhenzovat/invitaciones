<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Corrige PK + AUTO_INCREMENT en tablas legacy (MySQL 1364 / 1075).
 */
final class DatabaseAutoIncrementFixer
{
    /** @var array<string, string> */
    public const TABLES = [
        'notificacion_config'             => 'id_config',
        'notificacion_estado'             => 'id_estado',
        'notificacion_semaforo'           => 'id_semaforo',
        'notificacion_alerta'             => 'id_alerta',
        // Campus CRM
        'campus_clientes'                 => 'id_cliente',
        'campus_cliente_notas'            => 'id_nota',
        'campus_cliente_codigo'           => 'id_archivo',
        'campus_onboarding_links'         => 'id_onboarding',
        'campus_proyectos'                => 'id_proyecto',
        'campus_proyecto_paquetes'        => 'id_paquete',
        'campus_archivos'                 => 'id_archivo',
        'campus_enlaces'                  => 'id_enlace',
        'campus_actividad'                => 'id_actividad',
        'campus_cliente_proyecto'         => 'id',
        'campus_agenda_fases'             => 'id_fase',
        'campus_agenda_tareas'            => 'id_tarea',
        'campus_agenda_historial'         => 'id',
        'campus_agenda_dependencias'      => 'id',
        'campus_agenda_canvas'            => 'id',
        'excalidraw_scenes'               => 'id_excalidraw_scene',
        // Cotización
        'cotizacion_modulo'               => 'id_modulo',
        'cotizacion_tipo_proyecto'        => 'id_tipo',
        'cotizacion_presupuesto'          => 'id_presupuesto',
        'cotizacion_presupuesto_detalle'  => 'id_detalle',
        'cotizacion_presupuesto_qr_log'   => 'id',
        // Etiquetas de menú
        'administracion_entidad_etiqueta' => 'id',
    ];

    public static function fixAll(): void
    {
        foreach (self::TABLES as $table => $column) {
            self::fix($table, $column);
        }
    }

    public static function fix(string $table, string $column): bool
    {
        if (!Schema::hasTable($table) || Schema::getConnection()->getDriverName() !== 'mysql') {
            return false;
        }

        $cols = DB::select('
            SELECT COLUMN_NAME, COLUMN_KEY, EXTRA, COLUMN_TYPE, IS_NULLABLE
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
        ', [$table]);

        $target = null;
        foreach ($cols as $c) {
            if ($c->COLUMN_NAME === $column) {
                $target = $c;
                break;
            }
        }

        if (!$target) {
            return false;
        }

        $targetExtra = strtolower((string) ($target->EXTRA ?? ''));
        if (str_contains($targetExtra, 'auto_increment') && ($target->COLUMN_KEY ?? '') === 'PRI') {
            return false;
        }

        $parts = [];

        // Quitar AUTO_INCREMENT de otras columnas (solo puede haber una por tabla).
        foreach ($cols as $c) {
            if ($c->COLUMN_NAME === $column) {
                continue;
            }
            if (!str_contains(strtolower((string) ($c->EXTRA ?? '')), 'auto_increment')) {
                continue;
            }
            $parts[] = self::modifyClause($c, false);
        }

        $pkCols = self::primaryKeyColumns($table);
        $targetIsPk = ($target->COLUMN_KEY ?? '') === 'PRI';

        if (!$targetIsPk) {
            if ($pkCols !== [] && $pkCols !== [$column]) {
                $parts[] = 'DROP PRIMARY KEY';
            }
            if ($pkCols !== [$column]) {
                $parts[] = "ADD PRIMARY KEY (`{$column}`)";
            }
        }

        $parts[] = self::modifyClause($target, true);

        DB::statement('ALTER TABLE `' . $table . '` ' . implode(', ', $parts));

        return true;
    }

    /** @return list<string> */
    private static function primaryKeyColumns(string $table): array
    {
        $indexes = DB::select("SHOW INDEX FROM `{$table}` WHERE Key_name = 'PRIMARY'");
        $cols    = [];
        foreach ($indexes as $idx) {
            $cols[(int) $idx->Seq_in_index] = $idx->Column_name;
        }
        ksort($cols);

        return array_values($cols);
    }

    private static function modifyClause(object $col, bool $autoIncrement): string
    {
        $type = self::sqlType($col);
        $null = ($col->IS_NULLABLE ?? '') === 'YES' && !$autoIncrement ? 'NULL' : 'NOT NULL';
        $ai   = $autoIncrement ? ' AUTO_INCREMENT' : '';

        return "MODIFY `{$col->COLUMN_NAME}` {$type} {$null}{$ai}";
    }

    private static function sqlType(object $col): string
    {
        $name = (string) $col->COLUMN_NAME;
        if (preg_match('/^id(_|$)/', $name)) {
            return 'BIGINT UNSIGNED';
        }

        return strtoupper((string) $col->COLUMN_TYPE);
    }
}
