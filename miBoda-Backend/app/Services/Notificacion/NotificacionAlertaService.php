<?php

namespace App\Services\Notificacion;

use App\Models\CampusCliente;
use App\Models\CampusProyecto;
use App\Models\Notificacion\NotificacionAlerta;
use App\Models\Notificacion\NotificacionConfig;
use App\Models\Notificacion\NotificacionEstado;
use App\Models\Notificacion\NotificacionSemaforo;
use App\Models\User;
use App\Support\EloquentCreateWithPk;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class NotificacionAlertaService
{
    public function __construct(
        private readonly NotificacionSemaforoService $semaforo
    ) {}

    public function debeEvaluar(?NotificacionConfig $config = null): bool
    {
        return $this->debeEvaluarTopPrioridad($config);
    }

    public function debeEvaluarTopPrioridad(?NotificacionConfig $config = null): bool
    {
        $config ??= NotificacionConfig::actual();
        if (!$config->activo) {
            return false;
        }
        if (!$config->ultima_evaluacion_at) {
            return true;
        }

        return $config->ultima_evaluacion_at->lte(
            now()->subMinutes(max(1, (int) $config->intervalo_minutos))
        );
    }

    /** Ejecuta todos los ciclos de alerta según intervalos configurados. */
    public function evaluarCiclo(?int $forUserId = null): int
    {
        $config = NotificacionConfig::actual();
        if (!$config->activo) {
            return 0;
        }

        $creadas = $this->sincronizarAlertasRojas($forUserId, $config);

        if ($this->debeEvaluarTopPrioridad($config)) {
            if ($this->recordatorioPrioridadUno($forUserId, $config)) {
                $creadas++;
            }
            $config->ultima_evaluacion_at = now();
            $config->save();
        }

        if ($this->debeEvaluarProximoRojo($config)) {
            $creadas += $this->evaluarPorSlugs(
                $forUserId,
                $config,
                NotificacionSemaforoService::SLUGS_PROXIMO_ROJO,
                'proximo_rojo',
                (int) $config->intervalo_proximo_rojo_min
            );
            $config->ultima_eval_proximo_rojo_at = now();
            $config->save();
        }

        if ($this->debeEvaluarProximoAmarillo($config)) {
            $creadas += $this->evaluarPorSlugs(
                $forUserId,
                $config,
                NotificacionSemaforoService::SLUGS_PROXIMO_AMARILLO,
                'proximo_amarillo',
                (int) $config->intervalo_proximo_amarillo_min
            );
            $config->ultima_eval_proximo_amarillo_at = now();
            $config->save();
        }

        return $creadas;
    }

    /** @deprecated Use evaluarCiclo */
    public function evaluar(?int $forUserId = null): int
    {
        return $this->evaluarCiclo($forUserId);
    }

    /** @return Collection<int, NotificacionAlerta> — solo rojas para toast */
    public function pendientesParaUsuario(int $userId, int $limit = 30): Collection
    {
        return NotificacionAlerta::query()
            ->with(['semaforo', 'proyecto', 'cliente'])
            ->where('id_user', $userId)
            ->where('descartada', false)
            ->where('leida', false)
            ->whereHas('semaforo', fn ($q) => $q->whereIn('slug', NotificacionSemaforoService::SLUGS_ROJO))
            ->get()
            ->sortBy([
                fn ($a) => (int) ($a->proyecto?->orden_prioridad ?? 99),
                fn ($a) => (int) ($a->semaforo?->dias_restantes_min ?? 99),
            ])
            ->take($limit)
            ->values();
    }

    public function marcarMostrada(int $idAlerta): void
    {
        NotificacionAlerta::query()
            ->whereKey($idAlerta)
            ->update(['mostrada_at' => now()]);
    }

    public function descartar(int $idAlerta, int $userId): bool
    {
        $row = NotificacionAlerta::query()
            ->whereKey($idAlerta)
            ->where('id_user', $userId)
            ->first();

        if (!$row) {
            return false;
        }

        $row->update([
            'descartada'    => true,
            'leida'         => true,
            'descartada_at' => now(),
        ]);

        return true;
    }

    public function marcarLeida(int $idAlerta, int $userId): bool
    {
        return (bool) NotificacionAlerta::query()
            ->whereKey($idAlerta)
            ->where('id_user', $userId)
            ->update(['leida' => true]);
    }

    /** @return array<string, mixed>|null */
    public function formatoEstado(?int $idEstado): ?array
    {
        if (!$idEstado) {
            return null;
        }
        $e = NotificacionEstado::find($idEstado);
        if (!$e || !$e->activo) {
            return null;
        }

        return [
            'id_estado'  => $e->id_estado,
            'slug'       => $e->slug,
            'nombre'     => $e->nombre,
            'color_hex'  => $e->color_hex,
        ];
    }

    private function sincronizarAlertasRojas(?int $forUserId, NotificacionConfig $config): int
    {
        $creadas = 0;
        foreach ($this->administradores($forUserId) as $admin) {
            foreach ($this->proyectosMonitoreados((int) $config->dias_anticipacion_alerta) as $proyecto) {
                $dias = $this->semaforo->diasRestantes($proyecto->fecha_entrega);
                $sem = $this->semaforo->resolver($dias);
                if (!$this->semaforo->esRojo($sem)) {
                    continue;
                }
                if ($this->tieneAlertaPendiente($admin->id, $proyecto->id_proyecto)) {
                    continue;
                }
                if ($this->enSilencioTrasDescarte(
                    $admin->id,
                    $proyecto->id_proyecto,
                    (int) $config->intervalo_minutos
                )) {
                    continue;
                }
                if ($this->crearAlerta($admin, $proyecto, $sem, $dias, 'rojo', $config)) {
                    $creadas++;
                }
            }
        }

        return $creadas;
    }

    /** Una sola alerta cada 10 min: rojo + orden_prioridad = 1 */
    private function recordatorioPrioridadUno(?int $forUserId, NotificacionConfig $config): bool
    {
        $candidato = null;
        $mejorDias = PHP_INT_MAX;

        foreach ($this->administradores($forUserId) as $admin) {
            foreach ($this->proyectosMonitoreados((int) $config->dias_anticipacion_alerta) as $proyecto) {
                if ((int) ($proyecto->orden_prioridad ?? 99) !== 1) {
                    continue;
                }
                $dias = $this->semaforo->diasRestantes($proyecto->fecha_entrega);
                $sem = $this->semaforo->resolver($dias);
                if (!$this->semaforo->esRojo($sem)) {
                    continue;
                }
                if ($dias < $mejorDias) {
                    $mejorDias = $dias;
                    $candidato = [$admin, $proyecto, $sem, $dias];
                }
            }
        }

        if (!$candidato) {
            return false;
        }

        [$admin, $proyecto, $sem, $dias] = $candidato;

        if ($this->enSilencioTrasDescarte(
            $admin->id,
            $proyecto->id_proyecto,
            (int) $config->intervalo_minutos,
            ['rojo', 'prioridad_top']
        )) {
            return false;
        }

        $existente = NotificacionAlerta::query()
            ->where('id_user', $admin->id)
            ->where('id_proyecto', $proyecto->id_proyecto)
            ->where('tipo', 'prioridad_top')
            ->where('descartada', false)
            ->where('created_at', '>=', now()->subMinutes(max(1, (int) $config->intervalo_minutos)))
            ->first();

        if ($existente) {
            if ($config->notificacion_sistema) {
                app(NotificacionPushService::class)->enviarAlerta($admin->id, $existente);
            }

            return false;
        }

        return $this->crearAlerta($admin, $proyecto, $sem, $dias, 'prioridad_top', $config);
    }

    /** @param array<int, string> $slugs */
    private function evaluarPorSlugs(
        ?int $forUserId,
        NotificacionConfig $config,
        array $slugs,
        string $tipo,
        int $intervaloMin
    ): int {
        $creadas = 0;
        $desde = now()->subMinutes(max(1, $intervaloMin));

        foreach ($this->administradores($forUserId) as $admin) {
            foreach ($this->proyectosMonitoreados((int) $config->dias_anticipacion_alerta) as $proyecto) {
                $dias = $this->semaforo->diasRestantes($proyecto->fecha_entrega);
                $sem = $this->semaforo->resolver($dias);
                if (!$sem || !in_array($sem->slug, $slugs, true)) {
                    continue;
                }

                $reciente = NotificacionAlerta::query()
                    ->where('id_user', $admin->id)
                    ->where('id_proyecto', $proyecto->id_proyecto)
                    ->where('tipo', $tipo)
                    ->where('created_at', '>=', $desde)
                    ->exists();

                if ($reciente) {
                    continue;
                }

                if ($this->crearAlerta($admin, $proyecto, $sem, $dias, $tipo, $config)) {
                    $creadas++;
                }
            }
        }

        return $creadas;
    }

    private function debeEvaluarProximoRojo(NotificacionConfig $config): bool
    {
        $mins = max(1, (int) ($config->intervalo_proximo_rojo_min ?? 30));
        if (!$config->ultima_eval_proximo_rojo_at) {
            return true;
        }

        return $config->ultima_eval_proximo_rojo_at->lte(now()->subMinutes($mins));
    }

    private function debeEvaluarProximoAmarillo(NotificacionConfig $config): bool
    {
        $mins = max(1, (int) ($config->intervalo_proximo_amarillo_min ?? 120));
        if (!$config->ultima_eval_proximo_amarillo_at) {
            return true;
        }

        return $config->ultima_eval_proximo_amarillo_at->lte(now()->subMinutes($mins));
    }

    private function tieneAlertaPendiente(int $userId, int $idProyecto): bool
    {
        return NotificacionAlerta::query()
            ->where('id_user', $userId)
            ->where('id_proyecto', $idProyecto)
            ->where('descartada', false)
            ->where('leida', false)
            ->exists();
    }

    /** No recrear toast hasta que pase el intervalo tras descartar. */
    private function enSilencioTrasDescarte(
        int $userId,
        int $idProyecto,
        int $intervaloMin,
        array $tipos = ['rojo', 'prioridad_top']
    ): bool {
        $desde = now()->subMinutes(max(1, $intervaloMin));

        return NotificacionAlerta::query()
            ->where('id_user', $userId)
            ->where('id_proyecto', $idProyecto)
            ->whereIn('tipo', $tipos)
            ->where('descartada', true)
            ->where(function ($q) use ($desde) {
                $q->where('descartada_at', '>=', $desde)
                    ->orWhere(function ($q2) use ($desde) {
                        $q2->whereNull('descartada_at')->where('updated_at', '>=', $desde);
                    });
            })
            ->exists();
    }

    private function crearAlerta(
        User $admin,
        CampusProyecto $proyecto,
        ?NotificacionSemaforo $sem,
        ?int $dias,
        string $tipo,
        NotificacionConfig $config
    ): bool {
        $cliente = $proyecto->clientesCrm->first();
        $progreso = (int) ($proyecto->progreso ?? 0);
        [$titulo, $mensaje, $prioridad] = $this->mensajeHumano($proyecto, $cliente, $dias ?? 0, $progreso, $tipo, $sem);

        $alerta = EloquentCreateWithPk::create(NotificacionAlerta::class, [
            'id_user'      => $admin->id,
            'id_proyecto'  => $proyecto->id_proyecto,
            'id_cliente'   => $cliente?->id_cliente,
            'id_semaforo'  => $sem?->id_semaforo,
            'tipo'         => $tipo,
            'titulo'       => $titulo,
            'mensaje'      => $mensaje,
            'prioridad'    => $prioridad,
            'leida'        => false,
            'descartada'   => false,
        ]);

        if ($config->notificacion_sistema) {
            app(NotificacionPushService::class)->enviarAlerta($admin->id, $alerta);
        }

        return true;
    }

    /** @return array{0: string, 1: string, 2: int} */
    private function mensajeHumano(
        CampusProyecto $p,
        ?CampusCliente $cliente,
        int $dias,
        int $progreso,
        string $tipo = 'rojo',
        ?NotificacionSemaforo $sem = null
    ): array {
        $nombreP = $p->nombre;
        $nombreC = $cliente?->nombreCompleto() ?? 'tu cliente';
        $orden = (int) ($p->orden_prioridad ?? 5);

        if ($tipo === 'prioridad_top') {
            return [
                '🔴 Prioridad #1 — por vencer',
                "«{$nombreP}» de {$nombreC} requiere atención inmediata (orden {$orden}). "
                . ($dias < 0 ? 'Vencido' : ($dias === 0 ? 'Vence hoy' : "Quedan {$dias} día(s)"))
                . " · {$progreso}% avance.",
                10,
            ];
        }

        if ($tipo === 'proximo_rojo') {
            return [
                '⚠️ Próximo a rojo',
                "«{$nombreP}» de {$nombreC} pasará a semáforo rojo pronto ({$dias} día(s) restantes, {$progreso}%).",
                4,
            ];
        }

        if ($tipo === 'proximo_amarillo') {
            return [
                'Atención — plazo acercándose',
                "«{$nombreP}» de {$nombreC} se acerca a zona amarilla ({$dias} días, {$progreso}% avance).",
                3,
            ];
        }

        $nivel = $sem?->nombre ?? 'Crítico';

        if ($dias < 0) {
            $hace = abs($dias);

            return [
                '🔴 Proyecto vencido',
                "«{$nombreP}» de {$nombreC} venció hace {$hace} día(s) ({$nivel}) · {$progreso}%.",
                8,
            ];
        }

        if ($dias === 0) {
            return [
                '🔴 Entrega hoy',
                "Hoy vence «{$nombreP}» ({$nombreC}) · {$progreso}%.",
                8,
            ];
        }

        return [
            '🔴 Por vencer',
            "«{$nombreP}» de {$nombreC}: {$dias} día(s) restantes ({$nivel}) · {$progreso}%. Orden prioridad: {$orden}.",
            7,
        ];
    }

    /** @return Collection<int, User> */
    private function administradores(?int $forUserId): Collection
    {
        $q = User::query()->where('es_administrador_principal', 1);
        if ($forUserId) {
            $q->where('id', $forUserId);
        }

        return $q->get();
    }

    /** @return Collection<int, CampusProyecto> */
    private function proyectosMonitoreados(int $diasAnticipacion): Collection
    {
        $limite = Carbon::now()->addDays($diasAnticipacion)->endOfDay();

        return CampusProyecto::query()
            ->with(['clientesCrm', 'estadoNotificacion'])
            ->where('activo', true)
            ->whereNotNull('fecha_entrega')
            ->where('fecha_entrega', '<=', $limite)
            ->orderBy('orden_prioridad')
            ->orderBy('fecha_entrega')
            ->get()
            ->filter(function (CampusProyecto $p) {
                if (in_array($p->estado, ['completado', 'pausado'], true)) {
                    return false;
                }
                $slug = $p->estadoNotificacion?->slug;
                if ($slug && in_array($slug, ['entregado', 'inactivo'], true)) {
                    return false;
                }

                return true;
            });
    }
}
