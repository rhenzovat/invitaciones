<?php

namespace App\Models\Notificacion;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificacionPushSubscription extends Model
{
    protected $table = 'notificacion_push_subscription';

    protected $primaryKey = 'id_subscription';

    protected $fillable = [
        'id_user',
        'endpoint',
        'p256dh',
        'auth',
        'user_agent',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }
}
