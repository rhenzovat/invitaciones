<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusAgendaFase extends Model
{
    protected $table      = 'campus_agenda_fases';
    protected $primaryKey = 'id_fase';

    protected $fillable = [
        'id_proyecto', 'nombre', 'descripcion', 'color', 'orden',
    ];

    public function proyecto()
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function tareas()
    {
        return $this->hasMany(CampusAgendaTarea::class, 'id_fase', 'id_fase');
    }
}
