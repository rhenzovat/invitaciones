<?php

namespace App\Models\Notificacion;

use Illuminate\Database\Eloquent\Model;

class NotificacionEstado extends Model
{
    protected $table = 'notificacion_estado';
    protected $primaryKey = 'id_estado';
    public $incrementing = true;

    protected $fillable = [
        'slug', 'nombre', 'color_hex', 'aplica_a', 'es_sistema', 'orden', 'activo',
    ];

    protected $casts = [
        'es_sistema' => 'boolean',
        'activo'     => 'boolean',
    ];
}
