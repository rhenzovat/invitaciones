<?php

namespace App\Services\Notificacion;

use App\Models\Notificacion\NotificacionSemaforo;

class NotificacionSemaforoService
{
    /** Por vencer — se muestran en toast (rojo) */
    public const SLUGS_ROJO = ['vencido', 'hoy', 'critico'];

    /** Próximos a pasar a rojo — alerta cada 30 min */
    public const SLUGS_PROXIMO_ROJO = ['urgente'];

    /** Próximos a pasar a amarillo — alerta cada 2 h */
    public const SLUGS_PROXIMO_AMARILLO = ['atencion'];

    /** @var \Illuminate\Support\Collection<int, NotificacionSemaforo>|null */
    private static $cache = null;

    public function diasRestantes($fechaEntrega): ?int
    {
        if (!$fechaEntrega) {
            return null;
        }
        $fecha = $fechaEntrega instanceof \Carbon\Carbon
            ? $fechaEntrega->copy()->startOfDay()
            : \Carbon\Carbon::parse($fechaEntrega)->startOfDay();

        return (int) now()->startOfDay()->diffInDays($fecha, false);
    }

    public function resolver(?int $diasRestantes): ?NotificacionSemaforo
    {
        $niveles = $this->nivelesActivos();

        if ($diasRestantes === null) {
            return $niveles->firstWhere('slug', 'sin_fecha')
                ?? $niveles->sortByDesc('orden')->first();
        }

        foreach ($niveles->sortBy('orden') as $nivel) {
            if ($nivel->slug === 'sin_fecha') {
                continue;
            }
            $min = $nivel->dias_restantes_min;
            $max = $nivel->dias_restantes_max;

            if ($min !== null && $diasRestantes < $min) {
                continue;
            }
            if ($max !== null && $diasRestantes > $max) {
                continue;
            }

            return $nivel;
        }

        return $niveles->firstWhere('slug', 'a_tiempo');
    }

    public function esRojo(?NotificacionSemaforo $sem): bool
    {
        return $sem && in_array($sem->slug, self::SLUGS_ROJO, true);
    }

    public function esProximoRojo(?NotificacionSemaforo $sem): bool
    {
        return $sem && in_array($sem->slug, self::SLUGS_PROXIMO_ROJO, true);
    }

    public function esProximoAmarillo(?NotificacionSemaforo $sem): bool
    {
        return $sem && in_array($sem->slug, self::SLUGS_PROXIMO_AMARILLO, true);
    }

    /** @return array<string, mixed> */
    public function paraProyecto($proyecto): array
    {
        $dias = $this->diasRestantes($proyecto->fecha_entrega ?? null);
        $nivel = $this->resolver($dias);

        return $this->formato($nivel, $dias, (int) ($proyecto->progreso ?? 0));
    }

    /** @param iterable $proyectos @return array<string, mixed> */
    public function peorEntreProyectos(iterable $proyectos): array
    {
        $peor = null;
        $peorDias = PHP_INT_MAX;

        foreach ($proyectos as $p) {
            $dias = $this->diasRestantes($p->fecha_entrega ?? null);
            if ($dias === null) {
                continue;
            }
            if ($dias < $peorDias) {
                $peorDias = $dias;
                $peor = $p;
            }
        }

        if (!$peor) {
            return $this->formato($this->resolver(null), null, 0);
        }

        return $this->paraProyecto($peor);
    }

    /** @return array<string, mixed> */
    public function formato(?NotificacionSemaforo $nivel, ?int $dias, int $progreso): array
    {
        return [
            'id_semaforo'    => $nivel?->id_semaforo,
            'slug'           => $nivel?->slug ?? 'sin_fecha',
            'nombre'         => $nivel?->nombre ?? 'Sin fecha',
            'color_hex'      => $nivel?->color_hex ?? '#94a3b8',
            'dias_restantes' => $dias,
            'progreso'       => $progreso,
            'es_rojo'        => $this->esRojo($nivel),
        ];
    }

    /** @return \Illuminate\Support\Collection<int, NotificacionSemaforo> */
    private function nivelesActivos()
    {
        if (self::$cache === null) {
            self::$cache = NotificacionSemaforo::query()
                ->where('activo', true)
                ->orderBy('orden')
                ->get();
        }

        return self::$cache;
    }

    public static function limpiarCache(): void
    {
        self::$cache = null;
    }
}
