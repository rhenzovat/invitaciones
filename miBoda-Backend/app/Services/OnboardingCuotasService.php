<?php

namespace App\Services;

use App\Models\CampusOnboardingLink;
use App\Support\OnboardingMediaUrl;
use Illuminate\Support\Facades\Storage;

/**
 * Plan de cuotas (1–4) para enlaces de onboarding.
 */
class OnboardingCuotasService
{
    public const MIN_CUOTAS = 1;
    public const MAX_CUOTAS = 4;

    /**
     * Divide el total en N partes enteras (soles).
     * El redondeo extra se asigna a las primeras cuotas (mayor → menor), igual que cotización.
     */
    public static function dividirMonto(float $total, int $n): array
    {
        $n        = max(self::MIN_CUOTAS, min(self::MAX_CUOTAS, $n));
        $totalInt = max(0, (int) round($total));
        if ($totalInt === 0) {
            return array_fill(0, $n, 0.0);
        }

        $base  = intdiv($totalInt, $n);
        $extra = $totalInt - ($base * $n);
        $montos = [];

        for ($i = 0; $i < $n; $i++) {
            $montos[] = (float) ($base + ($i < $extra ? 1 : 0));
        }

        return $montos;
    }

    /** Actualiza montos guardados si aún usan la lógica antigua (decimales). */
    public static function alinearMontosConTotal(CampusOnboardingLink $link): void
    {
        $num = max(self::MIN_CUOTAS, min(self::MAX_CUOTAS, (int) ($link->num_cuotas ?: 1)));
        if ($num <= 1) {
            return;
        }

        self::asegurarSincronizado($link);
        $cuotas = self::getDetalle($link);
        if ($cuotas === []) {
            return;
        }

        $montos  = self::dividirMonto((float) ($link->empresa_monto ?? 0), count($cuotas));
        $changed = false;

        foreach ($cuotas as $idx => &$c) {
            $nuevo = $montos[$idx] ?? 0.0;
            if ((int) round((float) ($c['monto'] ?? 0)) !== (int) round($nuevo)) {
                $c['monto'] = $nuevo;
                $changed    = true;
            }
        }
        unset($c);

        if ($changed) {
            $link->cuotas_detalle = array_values($cuotas);
            $link->saveQuietly();
        }
    }

    /** @return array<int, array{numero:int,monto:float,estado:string,filename:?string,subido_at:?string}> */
    public static function getDetalle(CampusOnboardingLink $link): array
    {
        $raw = $link->cuotas_detalle;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        return is_array($raw) ? array_values($raw) : [];
    }

    public static function asegurarSincronizado(CampusOnboardingLink $link): void
    {
        $num = max(self::MIN_CUOTAS, min(self::MAX_CUOTAS, (int) ($link->num_cuotas ?: 1)));
        if (empty(self::getDetalle($link))) {
            self::sincronizar($link, $num, $link->empresa_monto !== null ? (float) $link->empresa_monto : null);
        }
    }

    /**
     * Regenera cuotas conservando comprobantes ya subidos por número de cuota.
     */
    public static function sincronizar(
        CampusOnboardingLink $link,
        ?int $numCuotas = null,
        ?float $monto = null,
        bool $persist = true
    ): array {
        $num   = max(self::MIN_CUOTAS, min(self::MAX_CUOTAS, $numCuotas ?? (int) ($link->num_cuotas ?: 1)));
        $total = $monto ?? (float) ($link->empresa_monto ?? 0);
        $prev  = collect(self::getDetalle($link))->keyBy('numero');
        $montos = $total > 0 ? self::dividirMonto($total, $num) : array_fill(0, $num, 0.0);

        $cuotas = [];
        foreach ($montos as $idx => $montoCuota) {
            $numero = $idx + 1;
            $old    = $prev->get($numero);

            $estado   = 'pendiente';
            $filename = null;
            $subidoAt = null;

            if ($old) {
                $filename = $old['filename'] ?? null;
                $subidoAt = $old['subido_at'] ?? null;
                $estado   = $old['estado'] ?? 'pendiente';
                if ($filename && !in_array($estado, ['subido', 'confirmado'], true)) {
                    $estado = 'subido';
                }
                if ($link->pago_confirmado && $filename) {
                    $estado = 'confirmado';
                }
                if (!$filename) {
                    $estado   = 'pendiente';
                    $subidoAt = null;
                }
            }

            $cuotas[] = [
                'numero'    => $numero,
                'monto'     => $montoCuota,
                'estado'    => $estado,
                'filename'  => $filename,
                'subido_at' => $subidoAt,
            ];
        }

        self::asignarArchivosHuerfanos($link, $cuotas);

        $link->num_cuotas      = $num;
        $link->cuotas_detalle  = $cuotas;

        if ($persist) {
            $link->save();
        }

        return $cuotas;
    }

    /** Archivos legacy (sin prefijo cuota-N) → primera cuota libre. */
    private static function asignarArchivosHuerfanos(CampusOnboardingLink $link, array &$cuotas): void
    {
        $dir = "onboarding/pagos/{$link->token}";
        if (!Storage::disk('public')->exists($dir)) {
            return;
        }

        $asignados = collect($cuotas)->pluck('filename')->filter()->all();
        $files     = Storage::disk('public')->files($dir);

        foreach ($files as $path) {
            $name = basename($path);
            if (in_array($name, $asignados, true)) {
                continue;
            }

            $numero = self::numeroDesdeFilename($name);
            if ($numero === null) {
                foreach ($cuotas as &$c) {
                    if (empty($c['filename'])) {
                        $c['filename']  = $name;
                        $c['estado']    = $link->pago_confirmado ? 'confirmado' : 'subido';
                        $c['subido_at'] = $c['subido_at'] ?? now()->toDateTimeString();
                        break;
                    }
                }
                unset($c);
                continue;
            }

            foreach ($cuotas as &$c) {
                if ((int) $c['numero'] === $numero) {
                    $c['filename']  = $name;
                    $c['estado']    = $link->pago_confirmado ? 'confirmado' : 'subido';
                    $c['subido_at'] = $c['subido_at'] ?? now()->toDateTimeString();
                    break;
                }
            }
            unset($c);
        }
    }

    public static function numeroDesdeFilename(string $filename): ?int
    {
        if (preg_match('/^cuota-(\d+)-/i', $filename, $m)) {
            return (int) $m[1];
        }

        return null;
    }

    public static function nombreArchivoCuota(int $numero, string $extension): string
    {
        $ext = strtolower(preg_replace('/[^a-z0-9]/i', '', $extension) ?: 'jpg');

        return 'cuota-' . $numero . '-' . uniqid('', true) . '.' . $ext;
    }

    public static function marcarSubida(CampusOnboardingLink $link, int $numero, string $filename): void
    {
        self::asegurarSincronizado($link);
        $cuotas = self::getDetalle($link);

        foreach ($cuotas as &$c) {
            if ((int) $c['numero'] === $numero) {
                if (!empty($c['filename']) && $c['filename'] !== $filename) {
                    self::borrarArchivo($link->token, $c['filename']);
                }
                $c['filename']  = $filename;
                $c['estado']    = 'subido';
                $c['subido_at'] = now()->toDateTimeString();
                break;
            }
        }
        unset($c);

        $link->cuotas_detalle = $cuotas;
        $link->pago_confirmado = false;
        $link->progreso = $link->recalcularProgreso();
        $link->save();
    }

    public static function marcarEliminada(CampusOnboardingLink $link, string $filename): void
    {
        self::asegurarSincronizado($link);
        $cuotas = self::getDetalle($link);

        foreach ($cuotas as &$c) {
            if (($c['filename'] ?? '') === $filename) {
                $c['filename']  = null;
                $c['estado']    = 'pendiente';
                $c['subido_at'] = null;
                break;
            }
        }
        unset($c);

        $link->cuotas_detalle = $cuotas;
        $link->pago_confirmado = false;
        $link->progreso = $link->recalcularProgreso();
        $link->save();
    }

    public static function confirmarTodas(CampusOnboardingLink $link): void
    {
        self::asegurarSincronizado($link);
        $cuotas = self::getDetalle($link);

        foreach ($cuotas as &$c) {
            if (!empty($c['filename'])) {
                $c['estado'] = 'confirmado';
            }
        }
        unset($c);

        $link->cuotas_detalle  = $cuotas;
        $link->pago_confirmado = true;
    }

    public static function revertirConfirmacion(CampusOnboardingLink $link): void
    {
        self::asegurarSincronizado($link);
        $cuotas = self::getDetalle($link);

        foreach ($cuotas as &$c) {
            if (($c['estado'] ?? '') === 'confirmado') {
                $c['estado'] = !empty($c['filename']) ? 'subido' : 'pendiente';
            }
        }
        unset($c);

        $link->cuotas_detalle  = $cuotas;
        $link->pago_confirmado = false;
    }

    public static function cuotaDisponible(CampusOnboardingLink $link, int $numero): bool
    {
        self::asegurarSincronizado($link);

        foreach (self::getDetalle($link) as $c) {
            if ((int) $c['numero'] === $numero) {
                return true;
            }
        }

        return false;
    }

    public static function puedeSubirCuota(CampusOnboardingLink $link, int $numero): bool
    {
        if ($link->pago_confirmado) {
            return false;
        }

        foreach (self::getDetalle($link) as $c) {
            if ((int) $c['numero'] === $numero) {
                return ($c['estado'] ?? 'pendiente') !== 'confirmado';
            }
        }

        return false;
    }

    private static function borrarArchivo(string $token, string $filename): void
    {
        $path = "onboarding/pagos/{$token}/{$filename}";
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /** Respuesta API con URL por cuota. */
    public static function paraRespuesta(CampusOnboardingLink $link): array
    {
        self::asegurarSincronizado($link);
        self::alinearMontosConTotal($link);

        $cuotas   = self::getDetalle($link);
        $pend     = 0;
        $subidas  = 0;
        $confirm  = 0;

        $out = array_map(function ($c) use ($link, &$pend, &$subidas, &$confirm) {
            $estado = $c['estado'] ?? 'pendiente';
            if ($estado === 'pendiente') {
                $pend++;
            } elseif ($estado === 'subido') {
                $subidas++;
            } elseif ($estado === 'confirmado') {
                $confirm++;
            }

            $filename = $c['filename'] ?? null;

            return [
                'numero'    => (int) $c['numero'],
                'monto'     => (float) ($c['monto'] ?? 0),
                'estado'    => $estado,
                'filename'  => $filename,
                'url'       => $filename
                    ? OnboardingMediaUrl::pago($link->token, "onboarding/pagos/{$link->token}/{$filename}")
                    : null,
                'subido_at' => $c['subido_at'] ?? null,
            ];
        }, $cuotas);

        $n = max(1, count($out));

        return [
            'num_cuotas'        => (int) ($link->num_cuotas ?: 1),
            'cuotas'            => $out,
            'cuotas_pendientes' => $pend,
            'cuotas_subidas'    => $subidas,
            'cuotas_confirmadas'=> $confirm,
            'cuotas_completadas'=> $subidas + $confirm,
            'pago_progreso_pct' => (int) round((($subidas + $confirm) / $n) * 100),
        ];
    }

    public static function puntosProgresoPago(CampusOnboardingLink $link): int
    {
        if ($link->pago_confirmado) {
            return 10;
        }

        self::asegurarSincronizado($link);
        $cuotas = self::getDetalle($link);
        $n      = max(1, count($cuotas));
        $hechas = 0;

        foreach ($cuotas as $c) {
            if (in_array($c['estado'] ?? '', ['subido', 'confirmado'], true)) {
                $hechas++;
            }
        }

        return (int) round(($hechas / $n) * 10);
    }
}
