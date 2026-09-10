<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebCancionSugerencia extends Model
{
    protected $table = 'web_cancion_sugerencias';
    protected $primaryKey = 'id_sugerencia';

    protected $fillable = ['nombre_cancion', 'genero', 'nombre_invitado'];
}
