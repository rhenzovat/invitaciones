<?php

namespace App\Console\Commands;

use App\Models\CampusProyecto;
use App\Models\Cotizacion\CotizacionTipoProyecto;
use App\Services\Campus\CampusProyectoPaqueteService;
use Illuminate\Console\Command;

class BackfillCampusProyectoPaquetesCommand extends Command
{
    protected $signature = 'campus:backfill-paquetes {--dry-run : Solo listar proyectos sin copia}';

    protected $description = 'Genera copia congelada (campus_proyecto_paquetes) para proyectos que aún no la tienen';

    public function handle(CampusProyectoPaqueteService $service): int
    {
        $tipos = CotizacionTipoProyecto::query()->where('Activo', 'S')->get();
        $sinCopia = CampusProyecto::query()
            ->whereDoesntHave('paquete')
            ->orderBy('id_proyecto')
            ->get();

        if ($sinCopia->isEmpty()) {
            $this->info('Todos los proyectos ya tienen copia de paquete.');

            return self::SUCCESS;
        }

        $this->info('Proyectos sin copia: ' . $sinCopia->count());

        $copiados = 0;
        $omitidos = 0;

        foreach ($sinCopia as $proyecto) {
            $tipo = $this->resolverTipo($proyecto, $tipos);
            if (!$tipo) {
                $this->warn("  #{$proyecto->id_proyecto} {$proyecto->nombre} — sin tipo de catálogo detectado");
                $omitidos++;
                continue;
            }

            if ($this->option('dry-run')) {
                $this->line("  [dry-run] #{$proyecto->id_proyecto} ← {$tipo->titulo}");
                $copiados++;
                continue;
            }

            $service->copiarDesdeCatalogo($proyecto, $tipo);
            $this->line("  Copiado #{$proyecto->id_proyecto} ← {$tipo->titulo}");
            $copiados++;
        }

        $this->newLine();
        $this->info("Listos: {$copiados} · Omitidos: {$omitidos}");

        if ($this->option('dry-run')) {
            $this->comment('Ejecute sin --dry-run para crear las copias.');
        }

        return self::SUCCESS;
    }

    private function resolverTipo(CampusProyecto $p, $tipos): ?CotizacionTipoProyecto
    {
        $nombre = mb_strtolower(trim($p->nombre));
        $icono  = mb_strtolower(trim($p->icono ?? ''));

        foreach ($tipos as $tipo) {
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
}
