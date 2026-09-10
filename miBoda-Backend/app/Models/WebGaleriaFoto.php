<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebGaleriaFoto extends Model
{
    protected $table = 'web_galeria_fotos';
    protected $primaryKey = 'id_foto';

    protected $fillable = ['url_imagen', 'url_imagen_thumb', 'orden', 'Activo'];
}
