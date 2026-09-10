<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusAgendaHistorial extends Model
{
    protected $table = 'campus_agenda_historial';

    protected $primaryKey = 'id';

    public $incrementing = true;

    protected $fillable = [
        'id_proyecto', 'id_tarea', 'id_usuario', 'accion',
        'datos_anteriores', 'datos_nuevos', 'descripcion',
    ];

    protected $casts = [
        'datos_anteriores' => 'array',
        'datos_nuevos'     => 'array',
    ];
}
