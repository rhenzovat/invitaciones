<?php

namespace App\Models\Notificacion;

use App\Models\CampusCliente;
use App\Models\CampusProyecto;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificacionAlerta extends Model
{
    protected $table = 'notificacion_alerta';
    protected $primaryKey = 'id_alerta';
    public $incrementing = true;

    protected $fillable = [
        'id_user', 'id_proyecto', 'id_cliente', 'id_semaforo',
        'tipo', 'titulo', 'mensaje', 'prioridad',
        'leida', 'descartada', 'descartada_at', 'mostrada_at',
    ];

    protected $casts = [
        'leida'       => 'boolean',
        'descartada'  => 'boolean',
        'descartada_at' => 'datetime',
        'mostrada_at' => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(CampusCliente::class, 'id_cliente', 'id_cliente');
    }

    public function semaforo(): BelongsTo
    {
        return $this->belongsTo(NotificacionSemaforo::class, 'id_semaforo', 'id_semaforo');
    }
}
