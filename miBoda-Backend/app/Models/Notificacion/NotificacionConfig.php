<?php

namespace App\Models\Notificacion;

use Illuminate\Database\Eloquent\Model;

class NotificacionConfig extends Model
{
    protected $table = 'notificacion_config';
    protected $primaryKey = 'id_config';
    public $incrementing = true;

    protected $fillable = [
        'intervalo_minutos',
        'intervalo_proximo_rojo_min',
        'intervalo_proximo_amarillo_min',
        'activo',
        'toast_navegador',
        'notificacion_sistema',
        'dias_anticipacion_alerta',
        'ultima_evaluacion_at',
        'ultima_eval_proximo_rojo_at',
        'ultima_eval_proximo_amarillo_at',
    ];

    protected $casts = [
        'activo'                        => 'boolean',
        'toast_navegador'               => 'boolean',
        'notificacion_sistema'          => 'boolean',
        'ultima_evaluacion_at'          => 'datetime',
        'ultima_eval_proximo_rojo_at'   => 'datetime',
        'ultima_eval_proximo_amarillo_at' => 'datetime',
    ];

    public static function actual(): self
    {
        return static::query()->firstOrCreate([], [
            'intervalo_minutos'             => 10,
            'intervalo_proximo_rojo_min'      => 30,
            'intervalo_proximo_amarillo_min'  => 120,
            'activo'                        => true,
            'toast_navegador'               => true,
            'notificacion_sistema'          => true,
            'dias_anticipacion_alerta'      => 14,
        ]);
    }
}
