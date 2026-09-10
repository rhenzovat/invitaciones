<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class NotificacionVapidGenerarCommand extends Command
{
    protected $signature = 'notificacion:vapid-generar';

    protected $description = 'Genera claves VAPID para Web Push (copiar a .env)';

    public function handle(): int
    {
        $keys = VAPID::createVapidKeys();

        $this->info('Agrega estas líneas a tu .env del backend:');
        $this->line('');
        $this->line('VAPID_PUBLIC_KEY=' . $keys['publicKey']);
        $this->line('VAPID_PRIVATE_KEY=' . $keys['privateKey']);
        $this->line('VAPID_SUBJECT=mailto:tu@email.com');
        $this->line('');

        return self::SUCCESS;
    }
}
