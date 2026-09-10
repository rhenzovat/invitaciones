<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion\NotificacionAlerta;
use App\Models\Notificacion\NotificacionConfig;
use App\Models\Notificacion\NotificacionEstado;
use App\Models\Notificacion\NotificacionSemaforo;
use App\Services\Notificacion\NotificacionAlertaService;
use App\Services\Notificacion\NotificacionPushService;
use App\Services\Notificacion\NotificacionSemaforoService;
use App\Support\EloquentCreateWithPk;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotificacionController extends Controller
{
    public function __construct(
        private readonly NotificacionAlertaService $alertas,
        private readonly NotificacionSemaforoService $semaforo,
        private readonly NotificacionPushService $push,
    ) {}

    private function isAdmin(Request $request): bool
    {
        $user = $request->user();

        return $user && (int) $user->es_administrador_principal === 1;
    }

    public function configObtener(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $cfg = NotificacionConfig::actual();

        return response()->json([
            'success' => true,
            'result'  => $this->formatConfig($cfg),
        ]);
    }

    public function configGuardar(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $request->validate([
            'intervalo_minutos'             => 'nullable|integer|min:1|max:1440',
            'intervalo_proximo_rojo_min'    => 'nullable|integer|min:1|max:1440',
            'intervalo_proximo_amarillo_min'=> 'nullable|integer|min:1|max:1440',
            'activo'                   => 'nullable|boolean',
            'toast_navegador'          => 'nullable|boolean',
            'notificacion_sistema'     => 'nullable|boolean',
            'dias_anticipacion_alerta' => 'nullable|integer|min:1|max:365',
        ]);

        $cfg = NotificacionConfig::actual();
        $cfg->fill(array_filter([
            'intervalo_minutos'             => $request->input('intervalo_minutos'),
            'intervalo_proximo_rojo_min'    => $request->input('intervalo_proximo_rojo_min'),
            'intervalo_proximo_amarillo_min'=> $request->input('intervalo_proximo_amarillo_min'),
            'activo'                   => $request->has('activo') ? $request->boolean('activo') : null,
            'toast_navegador'          => $request->has('toast_navegador') ? $request->boolean('toast_navegador') : null,
            'notificacion_sistema'     => $request->has('notificacion_sistema') ? $request->boolean('notificacion_sistema') : null,
            'dias_anticipacion_alerta' => $request->input('dias_anticipacion_alerta'),
        ], fn ($v) => $v !== null));
        $cfg->save();

        return response()->json([
            'success' => true,
            'message' => 'Configuración guardada',
            'result'  => $this->formatConfig($cfg->fresh()),
        ]);
    }

    public function estadosListar(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $rows = NotificacionEstado::query()->orderBy('orden')->get()
            ->map(fn ($e) => $this->formatEstado($e));

        return response()->json(['success' => true, 'result' => $rows]);
    }

    public function estadosGuardar(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $id = (int) $request->input('id_estado', 0);
        $request->validate([
            'nombre'    => 'required|string|max:80',
            'color_hex' => 'required|string|max:20',
            'aplica_a'  => 'nullable|in:cliente,proyecto,ambos',
            'orden'     => 'nullable|integer|min:0',
            'activo'    => 'nullable|boolean',
        ]);

        $data = [
            'nombre'    => $request->nombre,
            'color_hex' => $request->color_hex,
            'aplica_a'  => $request->input('aplica_a', 'ambos'),
            'orden'     => (int) ($request->input('orden', 0)),
            'activo'    => $request->boolean('activo', true),
        ];

        if ($id > 0) {
            $row = NotificacionEstado::findOrFail($id);
            if (!$request->filled('slug') && !$row->es_sistema) {
                $data['slug'] = Str::slug($request->nombre);
            }
            $row->update($data);
        } else {
            $data['slug'] = Str::slug($request->input('slug', $request->nombre));
            $data['es_sistema'] = false;
            $row = EloquentCreateWithPk::create(NotificacionEstado::class, $data);
        }

        return response()->json([
            'success' => true,
            'message' => 'Estado guardado',
            'result'  => $this->formatEstado($row->fresh()),
        ]);
    }

    public function estadosEliminar(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $row = NotificacionEstado::findOrFail($id);
        if ($row->es_sistema) {
            return response()->json(['success' => false, 'message' => 'No se puede eliminar un estado del sistema'], 422);
        }
        $row->update(['activo' => false]);

        return response()->json(['success' => true, 'message' => 'Estado desactivado']);
    }

    public function semaforosListar(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $rows = NotificacionSemaforo::query()->orderBy('orden')->get()
            ->map(fn ($s) => $this->formatSemaforo($s));

        return response()->json(['success' => true, 'result' => $rows]);
    }

    public function semaforosGuardar(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $id = (int) $request->input('id_semaforo', 0);
        $request->validate([
            'nombre'             => 'required|string|max:80',
            'color_hex'          => 'required|string|max:20',
            'dias_restantes_min' => 'nullable|integer',
            'dias_restantes_max' => 'nullable|integer',
            'orden'              => 'nullable|integer|min:0',
            'activo'             => 'nullable|boolean',
        ]);

        $data = [
            'nombre'             => $request->nombre,
            'color_hex'          => $request->color_hex,
            'dias_restantes_min' => $request->input('dias_restantes_min'),
            'dias_restantes_max' => $request->input('dias_restantes_max'),
            'orden'              => (int) ($request->input('orden', 0)),
            'activo'             => $request->boolean('activo', true),
        ];

        if ($id > 0) {
            $row = NotificacionSemaforo::findOrFail($id);
            $row->update($data);
        } else {
            $data['slug'] = Str::slug($request->input('slug', $request->nombre));
            $row = EloquentCreateWithPk::create(NotificacionSemaforo::class, $data);
        }

        NotificacionSemaforoService::limpiarCache();

        return response()->json([
            'success' => true,
            'message' => 'Semáforo guardado',
            'result'  => $this->formatSemaforo($row->fresh()),
        ]);
    }

    public function semaforosEliminar(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $row = NotificacionSemaforo::findOrFail($id);
        $row->update(['activo' => false]);
        NotificacionSemaforoService::limpiarCache();

        return response()->json(['success' => true, 'message' => 'Semáforo desactivado']);
    }

    public function alertasPendientes(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $this->alertas->evaluarCiclo($request->user()->id);

        $cfg = NotificacionConfig::actual();
        $rows = $this->alertas->pendientesParaUsuario($request->user()->id, 30)
            ->map(fn ($a) => $this->formatAlerta($a));

        return response()->json([
            'success' => true,
            'result'  => [
                'config'  => $this->formatConfig($cfg),
                'alertas' => $rows,
            ],
        ]);
    }

    public function alertaDescartar(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $ok = $this->alertas->descartar($id, $request->user()->id);

        return response()->json([
            'success' => $ok,
            'message' => $ok ? 'Alerta descartada' : 'No encontrada',
        ]);
    }

    public function alertaMarcarLeida(Request $request, int $id): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $this->alertas->marcarLeida($id, $request->user()->id);
        $this->alertas->marcarMostrada($id);

        return response()->json(['success' => true, 'message' => 'Marcada como leída']);
    }

    public function evaluarManual(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $n = $this->alertas->evaluarCiclo($request->user()->id);
        $cfg = NotificacionConfig::actual();
        $rows = $this->alertas->pendientesParaUsuario($request->user()->id, 30)
            ->map(fn ($a) => $this->formatAlerta($a));

        return response()->json([
            'success' => true,
            'message' => "Evaluación completada ({$n} alerta(s) nuevas)",
            'result'  => [
                'creadas' => $n,
                'config'  => $this->formatConfig($cfg),
                'alertas' => $rows,
            ],
        ]);
    }

    public function pushVapidPublicKey(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $key = $this->push->vapidPublicKey();

        return response()->json([
            'success' => (bool) $key,
            'result'  => [
                'public_key' => $key,
                'habilitado' => $this->push->pushHabilitado(),
            ],
        ]);
    }

    public function pushSuscribir(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        if (!$this->push->pushHabilitado()) {
            return response()->json([
                'success' => false,
                'message' => 'Web Push no configurado en el servidor (faltan claves VAPID)',
            ], 422);
        }

        $request->validate([
            'endpoint'       => 'required|string|max:500',
            'keys.p256dh'    => 'required|string|max:255',
            'keys.auth'      => 'required|string|max:255',
        ]);

        $sub = $this->push->guardarSuscripcion($request->user()->id, [
            'endpoint'   => $request->endpoint,
            'keys'       => $request->input('keys'),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Suscripción Web Push registrada',
            'result'  => ['id_subscription' => $sub->id_subscription],
        ]);
    }

    public function pushDesuscribir(Request $request): JsonResponse
    {
        if (!$this->isAdmin($request)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $request->validate(['endpoint' => 'required|string|max:500']);

        $this->push->eliminarSuscripcion($request->user()->id, $request->endpoint);

        return response()->json(['success' => true, 'message' => 'Suscripción eliminada']);
    }

    private function formatConfig(NotificacionConfig $c): array
    {
        return [
            'id_config'                => $c->id_config,
            'intervalo_minutos'        => (int) $c->intervalo_minutos,
            'intervalo_proximo_rojo_min' => (int) ($c->intervalo_proximo_rojo_min ?? 30),
            'intervalo_proximo_amarillo_min' => (int) ($c->intervalo_proximo_amarillo_min ?? 120),
            'activo'                   => (bool) $c->activo,
            'toast_navegador'          => (bool) $c->toast_navegador,
            'notificacion_sistema'     => (bool) $c->notificacion_sistema,
            'dias_anticipacion_alerta' => (int) $c->dias_anticipacion_alerta,
            'ultima_evaluacion_at'     => $c->ultima_evaluacion_at?->toIso8601String(),
            'web_push_habilitado'      => $this->push->pushHabilitado(),
        ];
    }

    private function formatEstado(NotificacionEstado $e): array
    {
        return [
            'id_estado'  => $e->id_estado,
            'slug'       => $e->slug,
            'nombre'     => $e->nombre,
            'color_hex'  => $e->color_hex,
            'aplica_a'   => $e->aplica_a,
            'es_sistema' => (bool) $e->es_sistema,
            'orden'      => (int) $e->orden,
            'activo'     => (bool) $e->activo,
        ];
    }

    private function formatSemaforo(NotificacionSemaforo $s): array
    {
        return [
            'id_semaforo'        => $s->id_semaforo,
            'slug'               => $s->slug,
            'nombre'             => $s->nombre,
            'color_hex'          => $s->color_hex,
            'dias_restantes_min' => $s->dias_restantes_min,
            'dias_restantes_max' => $s->dias_restantes_max,
            'orden'              => (int) $s->orden,
            'activo'             => (bool) $s->activo,
        ];
    }

    private function formatAlerta(NotificacionAlerta $a): array
    {
        return [
            'id_alerta'    => $a->id_alerta,
            'tipo'         => $a->tipo,
            'titulo'       => $a->titulo,
            'mensaje'      => $a->mensaje,
            'prioridad'    => (int) $a->prioridad,
            'orden_prioridad' => (int) ($a->proyecto?->orden_prioridad ?? 5),
            'leida'        => (bool) $a->leida,
            'descartada'   => (bool) $a->descartada,
            'created_at'   => $a->created_at?->toIso8601String(),
            'id_proyecto'  => $a->id_proyecto,
            'id_cliente'   => $a->id_cliente,
            'proyecto'     => $a->proyecto?->nombre,
            'cliente'      => $a->cliente?->nombreCompleto(),
            'semaforo'     => $a->semaforo ? $this->formatSemaforo($a->semaforo) : null,
        ];
    }
}
