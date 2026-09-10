<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusAgendaCanvas extends Model
{
    protected $table = 'campus_agenda_canvas';

    protected $fillable = [
        'id_proyecto', 'estado_json', 'version', 'guardado_por',
    ];

    public function proyecto()
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }
}
