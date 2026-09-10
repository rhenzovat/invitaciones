<?php

namespace App\Services;

use App\Models\CampusAgendaFase;
use App\Models\CampusAgendaTarea;
use App\Models\CampusCliente;
use App\Models\CampusClienteProyecto;
use App\Models\CampusOnboardingLink;
use App\Models\CampusProyecto;
use App\Models\CampusProyectoPaquete;
use App\Models\Cotizacion\CotizacionTipoProyecto;
use App\Services\Campus\CampusProyectoPaqueteService;
use Illuminate\Support\Collection;

class OnboardingReporteBuilder
{
    private const MODULOS_ARCHIVO = [
        'documentos'     => 'Documentos',
        'boletas'        => 'Boletas',
        'presentaciones' => 'Presentaciones',
        'manuales'       => 'Manuales',
    ];

    private const ESTADO_PROYECTO = [
        'en_progreso' => 'En progreso',
        'en_revision' => 'En revisión',
        'completado'  => 'Completado',
        'pausado'     => 'Pausado',
    ];

    private const ESTADO_TAREA = [
        'pendiente'    => 'Pendiente',
        'en_progreso'  => 'En progreso',
        'completado'   => 'Completado',
        'bloqueado'    => 'Bloqueado',
    ];

    private const ESTADO_CLIENTE = [
        'prospecto'            => 'Prospecto (sin correo)',
        'pendiente_email'      => 'Pendiente de correo',
        'pendiente_activacion' => 'Pendiente activación',
        'activo'               => 'Activo',
        'inactivo'             => 'Inactivo',
    ];

    private const ICONO_LABEL = [
        'web'        => 'Sitio web',
        'erp'        => 'ERP / Sistema',
        'ecommerce'  => 'E-commerce',
        'education'  => 'Educación',
        'landing'    => 'Landing page',
        'api'        => 'API / Backend',
        'tienda'     => 'Tienda online',
        'corporativo'=> 'Corporativo',
    ];

    /** @var Collection<int, CotizacionTipoProyecto> */
    private Collection $tiposCatalogo;

    public function __construct()
    {
        $this->tiposCatalogo = CotizacionTipoProyecto::query()
            ->where('Activo', 'S')
            ->get();
    }

    public function build(CampusOnboardingLink $link): array
    {
        $cliente = $link->id_cliente
            ? CampusCliente::with(['user:id,name,email', 'creador:id,name'])->find($link->id_cliente)
            : null;

        $proyectos = $cliente
            ? $this->loadProyectosCliente($cliente->id_cliente)
            : collect();

        $proyectosData = $proyectos->map(fn (CampusProyecto $p) => $this->mapProyecto($p))->values()->all();

        $tiposResumen = $this->agruparTiposProyecto($proyectos);

        $linksHistorial = $link->id_cliente
            ? CampusOnboardingLink::where('id_cliente', $link->id_cliente)
                ->orderByDesc('created_at')
                ->get()
            : collect([$link]);

        return [
            'cliente'          => $cliente,
            'cliente_estado'   => $cliente ? ($this::ESTADO_CLIENTE[$cliente->estado] ?? $cliente->estado) : null,
            'proyectos'        => $proyectosData,
            'resumen'          => $this->buildResumen($cliente, $proyectos, $proyectosData, $linksHistorial, $link),
            'tipos_resumen'    => $tiposResumen,
            'links_historial'  => $linksHistorial,
            'estado_proyecto'  => self::ESTADO_PROYECTO,
            'estado_tarea'     => self::ESTADO_TAREA,
            'modulos_archivo'  => self::MODULOS_ARCHIVO,
        ];
    }

    private function loadProyectosCliente(int $idCliente): Collection
    {
        $cliente = CampusCliente::find($idCliente);
        $ids = CampusClienteProyecto::query()
            ->where('id_cliente', $idCliente)
            ->pluck('id_proyecto');

        if ($cliente?->id_user) {
            $idsUser = CampusClienteProyecto::query()
                ->where('id_user', $cliente->id_user)
                ->pluck('id_proyecto');
            $ids = $ids->merge($idsUser)->unique()->values();
        }

        if ($ids->isEmpty()) {
            return collect();
        }

        $proyectos = CampusProyecto::query()
            ->whereIn('id_proyecto', $ids)
            ->with([
                'paquete',
                'archivos' => fn ($q) => $q->where('activo', true)->orderBy('modulo')->orderBy('nombre'),
                'enlaces'  => fn ($q) => $q->where('activo', true)->orderBy('categoria')->orderBy('nombre'),
            ])
            ->withCount(['archivos', 'enlaces'])
            ->orderByDesc('activo')
            ->orderByDesc('created_at')
            ->get();

        $tareas = CampusAgendaTarea::query()
            ->whereIn('id_proyecto', $ids)
            ->orderBy('orden')
            ->get()
            ->groupBy('id_proyecto');

        $fases = CampusAgendaFase::query()
            ->whereIn('id_proyecto', $ids)
            ->orderBy('orden')
            ->get()
            ->groupBy('id_proyecto');

        return $proyectos->map(function (CampusProyecto $p) use ($tareas, $fases) {
            $p->setRelation('agenda_tareas', $tareas->get($p->id_proyecto, collect()));
            $p->setRelation('agenda_fases', $fases->get($p->id_proyecto, collect()));
            return $p;
        });
    }

    private function mapProyecto(CampusProyecto $p): array
    {
        $paquete     = $this->resolvePaqueteProyecto($p);
        $itemsPaquete = $this->normalizarItemsPaquete($paquete);

        $archivosPorModulo = $this->agruparArchivos($p->archivos);
        $tareas = $p->agenda_tareas ?? collect();
        $tareasPendientes = $tareas->whereIn('estado', ['pendiente', 'en_progreso', 'bloqueado'])->values();
        $tareasCompletadas = $tareas->where('estado', 'completado')->count();
        $faltantes = $this->calcularFaltantes($p, $archivosPorModulo, $tareasPendientes, null);

        return [
            'id'                  => $p->id_proyecto,
            'nombre'              => $p->nombre,
            'descripcion'         => $p->descripcion,
            'estado'              => $p->estado,
            'estado_label'        => self::ESTADO_PROYECTO[$p->estado] ?? $p->estado,
            'activo'              => (bool) $p->activo,
            'activo_label'        => $p->activo ? 'Activo' : 'Inactivo',
            'progreso'            => (int) ($p->progreso ?? 0),
            'fecha_inicio'        => $p->fecha_inicio?->format('d/m/Y'),
            'fecha_entrega'       => $p->fecha_entrega?->format('d/m/Y'),
            'icono'               => $p->icono,
            'icono_label'         => self::ICONO_LABEL[$p->icono] ?? ucfirst($p->icono ?? 'General'),
            'paquete'             => $paquete?->toResumenArray(),
            'usa_copia_paquete'   => (bool) $paquete,
            'tipo_catalogo'       => $paquete ? (object) ['titulo' => $paquete->titulo] : null,
            'precio_paquete'      => $paquete ? ($paquete->moneda . ' ' . number_format($paquete->precio_base, 2)) : null,
            'includes'            => $itemsPaquete['includes'],
            'funcionalidades'     => $itemsPaquete['funcionalidades'],
            'includes_cols'       => $itemsPaquete['includes_cols'],
            'funcionalidades_cols'=> $itemsPaquete['funcionalidades_cols'],
            'archivos_por_modulo' => $archivosPorModulo,
            'archivos_total'      => $p->archivos_count ?? $p->archivos->count(),
            'enlaces'             => $p->enlaces->map(fn ($e) => [
                'nombre'      => $e->nombre,
                'url'         => $e->url,
                'categoria'   => $e->categoria ?: 'General',
                'descripcion' => $e->descripcion,
            ])->all(),
            'enlaces_total'       => $p->enlaces_count ?? $p->enlaces->count(),
            'fases'               => ($p->agenda_fases ?? collect())->map(fn ($f) => [
                'nombre'      => $f->nombre,
                'descripcion' => $f->descripcion,
                'tareas'      => $tareas->where('id_fase', $f->id_fase)->count(),
            ])->all(),
            'tareas_pendientes'   => $tareasPendientes->map(fn ($t) => [
                'nombre'   => $t->nombre,
                'estado'   => self::ESTADO_TAREA[$t->estado] ?? $t->estado,
                'prioridad'=> $t->prioridad,
                'avance'   => (int) ($t->porcentaje_avance ?? 0),
                'fecha_fin'=> $t->fecha_fin?->format('d/m/Y'),
            ])->all(),
            'tareas_total'        => $tareas->count(),
            'tareas_completadas'  => $tareasCompletadas,
            'faltantes'           => $faltantes,
            'created_at'          => $p->created_at?->format('d/m/Y'),
            'updated_at'          => $p->updated_at?->format('d/m/Y H:i'),
        ];
    }

    /**
     * Copia congelada del catálogo (campus_proyecto_paquetes).
     * Si no existe, se genera una vez desde el tipo detectado (proyectos antiguos).
     */
    private function resolvePaqueteProyecto(CampusProyecto $p): ?CampusProyectoPaquete
    {
        if ($p->relationLoaded('paquete') && $p->paquete) {
            return $p->paquete;
        }

        $paquete = CampusProyectoPaquete::where('id_proyecto', $p->id_proyecto)->first();
        if ($paquete) {
            $p->setRelation('paquete', $paquete);

            return $paquete;
        }

        $tipo = $this->resolverTipoCatalogo($p);
        if (!$tipo) {
            return null;
        }

        $paquete = app(CampusProyectoPaqueteService::class)->copiarDesdeCatalogo($p, $tipo);
        $p->setRelation('paquete', $paquete);

        return $paquete;
    }

    /** Textos del paquete copiado — nunca del catálogo en vivo para el PDF. */
    private function normalizarItemsPaquete(?CampusProyectoPaquete $paquete): array
    {
        $vacias = [[], [], []];
        if (!$paquete) {
            return [
                'includes'             => [],
                'funcionalidades'      => [],
                'includes_cols'        => $vacias,
                'funcionalidades_cols' => $vacias,
            ];
        }

        $includes = $this->normalizarListaTexto($paquete->includes ?? []);
        $includesLower = array_map(fn ($t) => mb_strtolower($t), $includes);

        $funcionalidades = [];
        foreach ($paquete->funcionalidades ?? [] as $fn) {
            if (is_array($fn) && array_key_exists('incluido', $fn) && !$fn['incluido']) {
                continue;
            }
            $texto = $this->textoItem($fn);
            if ($texto === '' || in_array(mb_strtolower($texto), $includesLower, true)) {
                continue;
            }
            $funcionalidades[] = $texto;
        }

        return [
            'includes'             => $includes,
            'funcionalidades'      => $funcionalidades,
            'includes_cols'        => $this->splitEnColumnas($includes, 3),
            'funcionalidades_cols' => $this->splitEnColumnas($funcionalidades, 3),
        ];
    }

    private function normalizarListaTexto(mixed $items): array
    {
        if (!is_array($items)) {
            return [];
        }

        $out = [];
        foreach ($items as $item) {
            $texto = $this->textoItem($item);
            if ($texto !== '') {
                $out[] = $texto;
            }
        }

        return array_values($out);
    }

    private function textoItem(mixed $item): string
    {
        if (is_string($item)) {
            return trim($item);
        }
        if (is_array($item)) {
            return trim((string) ($item['nombre'] ?? $item['texto'] ?? ''));
        }

        return '';
    }

    /** @return list<list<string>> Tres columnas para el PDF. */
    private function splitEnColumnas(array $items, int $cols = 3): array
    {
        $cols = max(1, $cols);
        if ($items === []) {
            return array_fill(0, $cols, []);
        }

        $perCol = (int) ceil(count($items) / $cols);
        $chunks = array_chunk($items, max(1, $perCol));

        while (count($chunks) < $cols) {
            $chunks[] = [];
        }

        return array_slice($chunks, 0, $cols);
    }

    private function resolverTipoCatalogo(CampusProyecto $p): ?CotizacionTipoProyecto
    {
        $nombre = mb_strtolower(trim($p->nombre));
        $icono  = mb_strtolower(trim($p->icono ?? ''));

        foreach ($this->tiposCatalogo as $tipo) {
            if (mb_strtolower($tipo->titulo) === $nombre) {
                return $tipo;
            }
            if ($tipo->slug && $tipo->slug === $icono) {
                return $tipo;
            }
            if ($tipo->icon && mb_strtolower($tipo->icon) === $icono) {
                return $tipo;
            }
        }

        return null;
    }

    private function agruparArchivos(Collection $archivos): array
    {
        $grupos = [];
        foreach (self::MODULOS_ARCHIVO as $key => $label) {
            $items = $archivos->where('modulo', $key)->values();
            $grupos[$key] = [
                'label' => $label,
                'items' => $items->map(fn ($a) => [
                    'nombre'    => $a->nombre ?: $a->nombre_original,
                    'extension' => $a->extension,
                    'tamano'    => $this->formatTamano($a->tamano),
                ])->all(),
                'count' => $items->count(),
            ];
        }

        $otros = $archivos->whereNotIn('modulo', array_keys(self::MODULOS_ARCHIVO))->values();
        if ($otros->isNotEmpty()) {
            $grupos['otros'] = [
                'label' => 'Otros',
                'items' => $otros->map(fn ($a) => [
                    'nombre'    => $a->nombre ?: $a->nombre_original,
                    'extension' => $a->extension,
                    'tamano'    => $this->formatTamano($a->tamano),
                ])->all(),
                'count' => $otros->count(),
            ];
        }

        return $grupos;
    }

    private function calcularFaltantes(
        CampusProyecto $p,
        array $archivosPorModulo,
        Collection $tareasPendientes,
        ?CotizacionTipoProyecto $tipoCatalogo
    ): array {
        $faltantes = [];

        if (!$p->activo) {
            $faltantes[] = 'Proyecto marcado como inactivo en el sistema';
        }

        if (empty(trim($p->descripcion ?? ''))) {
            $faltantes[] = 'Descripción del proyecto sin registrar';
        }

        if (!$p->fecha_entrega) {
            $faltantes[] = 'Fecha de entrega no definida';
        }

        if ($p->estado !== 'completado' && (int) $p->progreso < 100) {
            $faltantes[] = 'Progreso incompleto (' . (int) $p->progreso . '% de 100%)';
        }

        if ($p->estado === 'pausado') {
            $faltantes[] = 'Proyecto en estado pausado';
        }

        foreach (self::MODULOS_ARCHIVO as $key => $label) {
            if (($archivosPorModulo[$key]['count'] ?? 0) === 0) {
                $faltantes[] = 'Sin archivos en ' . $label;
            }
        }

        if (($p->enlaces_count ?? 0) === 0 && $p->enlaces->isEmpty()) {
            $faltantes[] = 'Sin enlaces ni repositorios registrados';
        }

        foreach ($tareasPendientes as $t) {
            $estado = self::ESTADO_TAREA[$t->estado] ?? $t->estado;
            $faltantes[] = 'Tarea pendiente: ' . $t->nombre . ' (' . $estado . ')';
        }

        return $faltantes;
    }

    private function agruparTiposProyecto(Collection $proyectos): array
    {
        $grupos = [];
        foreach ($proyectos as $p) {
            $key = $p->icono ?: 'general';
            if (!isset($grupos[$key])) {
                $grupos[$key] = [
                    'icono'       => $key,
                    'icono_label' => self::ICONO_LABEL[$key] ?? ucfirst($key),
                    'count'       => 0,
                    'nombres'     => [],
                ];
            }
            $grupos[$key]['count']++;
            $grupos[$key]['nombres'][] = $p->nombre;
        }

        return array_values($grupos);
    }

    private function buildResumen(
        ?CampusCliente $cliente,
        Collection $proyectos,
        array $proyectosData,
        Collection $linksHistorial,
        CampusOnboardingLink $linkActual
    ): array {
        $activos   = $proyectos->where('activo', true)->count();
        $inactivos = $proyectos->where('activo', false)->count();
        $completados = $proyectos->where('estado', 'completado')->count();
        $enCurso = $proyectos->whereIn('estado', ['en_progreso', 'en_revision'])->count();
        $pausados = $proyectos->where('estado', 'pausado')->count();

        $totalFaltantes = array_sum(array_map(fn ($p) => count($p['faltantes']), $proyectosData));
        $linksActivos = $linksHistorial->filter(fn ($l) => $l->estado === 'activo' && $l->estaVigente())->count();

        return [
            'proyectos_total'      => $proyectos->count(),
            'proyectos_activos'    => $activos,
            'proyectos_inactivos'  => $inactivos,
            'proyectos_completados'=> $completados,
            'proyectos_en_curso'   => $enCurso,
            'proyectos_pausados'   => $pausados,
            'tipos_distintos'      => count($this->agruparTiposProyecto($proyectos)),
            'total_faltantes'      => $totalFaltantes,
            'onboarding_total'     => $linksHistorial->count(),
            'onboarding_activos'   => $linksActivos,
            'onboarding_pago_ok'   => $linksHistorial->where('pago_confirmado', true)->count(),
            'cliente_vinculado'    => $cliente && $cliente->id_user ? 'Sí' : 'No',
            'cliente_activo_crm'   => $cliente ? ($cliente->activo ? 'Sí' : 'No') : '—',
            'link_actual_vigente'  => $linkActual->estaVigente() ? 'Sí' : 'No',
        ];
    }

    private function formatTamano(?int $bytes): string
    {
        if (!$bytes) {
            return '—';
        }
        if ($bytes < 1024) {
            return $bytes . ' B';
        }
        if ($bytes < 1048576) {
            return round($bytes / 1024, 1) . ' KB';
        }
        return round($bytes / 1048576, 1) . ' MB';
    }
}
