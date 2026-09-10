<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebEvento extends Model
{
    protected $table = 'web_evento';
    protected $primaryKey = 'id_evento';
    public $timestamps = true;

    protected $guarded = [];

    protected $casts = [
        'fecha_boda' => 'datetime',
        'familia' => 'array',
        'ubicaciones' => 'array',
        'itinerario' => 'array',
        'historia' => 'array',
        'vestimenta_colores' => 'array',
        'cancion_generos' => 'array',
        'regalos_transferencias' => 'array',
        'regalos_yape_plin' => 'array',
        'cloudinary_config' => 'array',
        'google_form_rsvp' => 'array',
        'google_form_cancion' => 'array',
        'google_form_galeria' => 'array',
        'solo_adultos_activo' => 'boolean',
        'regalos_sobre_activo' => 'boolean',
        'pases_por_defecto' => 'integer',
        'capacidad_maxima' => 'integer',
        'musica_volumen' => 'float',
    ];
}
