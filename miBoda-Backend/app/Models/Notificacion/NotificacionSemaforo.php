<?php

namespace App\Models\Notificacion;

use Illuminate\Database\Eloquent\Model;

class NotificacionSemaforo extends Model
{
    protected $table = 'notificacion_semaforo';
    protected $primaryKey = 'id_semaforo';
    public $incrementing = true;

    protected $fillable = [
        'slug', 'nombre', 'color_hex', 'dias_restantes_min', 'dias_restantes_max', 'orden', 'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
