<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebRsvpRespuesta extends Model
{
    protected $table = 'web_rsvp_respuestas';
    protected $primaryKey = 'id_rsvp_respuesta';

    protected $fillable = ['nombre', 'acompanante', 'asistira', 'id_invitado'];
}
