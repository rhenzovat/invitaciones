<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusAgendaTarea extends Model
{
    protected $table      = 'campus_agenda_tareas';
    protected $primaryKey = 'id_tarea';

    protected $fillable = [
        'id_proyecto', 'id_fase', 'nombre', 'descripcion', 'responsable',
        'fecha_inicio', 'fecha_fin', 'estado', 'prioridad',
        'porcentaje_avance', 'es_hito', 'color', 'orden',
    ];

    protected $casts = [
        'es_hito'           => 'boolean',
        'fecha_inicio'      => 'date:Y-m-d',
        'fecha_fin'         => 'date:Y-m-d',
        'porcentaje_avance' => 'integer',
    ];

    public function proyecto()
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function fase()
    {
        return $this->belongsTo(CampusAgendaFase::class, 'id_fase', 'id_fase');
    }

    public function predecesoras()
    {
        return $this->belongsToMany(
            CampusAgendaTarea::class,
            'campus_agenda_dependencias',
            'id_tarea',
            'id_predecesora'
        );
    }

    public function sucesoras()
    {
        return $this->belongsToMany(
            CampusAgendaTarea::class,
            'campus_agenda_dependencias',
            'id_predecesora',
            'id_tarea'
        );
    }
}
