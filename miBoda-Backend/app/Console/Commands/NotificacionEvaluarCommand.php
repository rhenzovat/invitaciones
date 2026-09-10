<?php

namespace App\Console\Commands;

use App\Services\Notificacion\NotificacionAlertaService;
use Illuminate\Console\Command;

class NotificacionEvaluarCommand extends Command
{
    protected $signature = 'notificacion:evaluar {--force : Ignorar intervalo configurado}';

    protected $description = 'Evalúa proyectos próximos a vencer y genera alertas notificacion_alerta';

    public function handle(NotificacionAlertaService $service): int
    {
        if (!$this->option('force') && !$service->debeEvaluar()) {
            $this->line('Aún no corresponde evaluar (intervalo no cumplido).');

            return self::SUCCESS;
        }

        $n = $service->evaluar();
        $this->info("Alertas generadas: {$n}");

        return self::SUCCESS;
    }
}
