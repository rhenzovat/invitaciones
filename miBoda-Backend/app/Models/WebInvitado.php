<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebInvitado extends Model
{
    protected $table = 'web_invitados';
    protected $primaryKey = 'id_invitado';

    protected $fillable = ['nombre', 'pases_asignados', 'notas', 'Activo'];

    protected $casts = [
        'pases_asignados' => 'integer',
    ];
}
