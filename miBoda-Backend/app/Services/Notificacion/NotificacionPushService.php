<?php

namespace App\Services\Notificacion;

use App\Models\Notificacion\NotificacionAlerta;
use App\Models\Notificacion\NotificacionPushSubscription;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class NotificacionPushService
{
    public function vapidPublicKey(): ?string
    {
        $key = config('notificacion.vapid.public_key');

        return $key !== '' ? $key : null;
    }

    public function pushHabilitado(): bool
    {
        return $this->vapidPublicKey() !== null
            && config('notificacion.vapid.private_key') !== '';
    }

    public function guardarSuscripcion(int $userId, array $data): NotificacionPushSubscription
    {
        return NotificacionPushSubscription::updateOrCreate(
            [
                'id_user'  => $userId,
                'endpoint' => $data['endpoint'],
            ],
            [
                'p256dh'     => $data['keys']['p256dh'] ?? $data['p256dh'],
                'auth'       => $data['keys']['auth'] ?? $data['auth'],
                'user_agent' => $data['user_agent'] ?? null,
            ]
        );
    }

    public function eliminarSuscripcion(int $userId, string $endpoint): bool
    {
        return (bool) NotificacionPushSubscription::query()
            ->where('id_user', $userId)
            ->where('endpoint', $endpoint)
            ->delete();
    }

    public function enviarAlerta(int $userId, NotificacionAlerta $alerta): int
    {
        if (!$this->pushHabilitado()) {
            return 0;
        }

        $subs = NotificacionPushSubscription::query()
            ->where('id_user', $userId)
            ->get();

        if ($subs->isEmpty()) {
            return 0;
        }

        $alerta->loadMissing('cliente');
        $nombreCliente = $alerta->cliente?->nombreCompleto();
        $title = $nombreCliente ? "{$nombreCliente} — {$alerta->titulo}" : $alerta->titulo;

        $base = rtrim(config('notificacion.frontend_url'), '/');
        $url = $alerta->id_proyecto
            ? "{$base}/campus/proyecto/{$alerta->id_proyecto}"
            : "{$base}/campus/dashboard";
        $payload = json_encode([
            'title' => $title,
            'body'  => $alerta->mensaje,
            'tag'   => 'campus-notif-' . $alerta->id_alerta,
            'url'   => $url,
            'icon'  => $base . '/icon/favicon.svg',
        ], JSON_UNESCAPED_UNICODE);

        $webPush = $this->cliente();
        $enviados = 0;

        foreach ($subs as $sub) {
            $webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'keys'     => [
                        'p256dh' => $sub->p256dh,
                        'auth'   => $sub->auth,
                    ],
                ]),
                $payload
            );
        }

        foreach ($webPush->flush() as $report) {
            if ($report->isSuccess()) {
                $enviados++;
                continue;
            }

            $endpoint = $report->getEndpoint();
            if ($report->isSubscriptionExpired()) {
                NotificacionPushSubscription::query()->where('endpoint', $endpoint)->delete();
            } else {
                Log::warning('Web Push falló', [
                    'endpoint' => $endpoint,
                    'reason'   => $report->getReason(),
                ]);
            }
        }

        return $enviados;
    }

    private function cliente(): WebPush
    {
        return new WebPush([
            'VAPID' => [
                'subject'    => config('notificacion.vapid.subject'),
                'publicKey'  => config('notificacion.vapid.public_key'),
                'privateKey' => config('notificacion.vapid.private_key'),
            ],
        ]);
    }
}
