<?php

namespace App\Models;

use App\Support\CmsStorageUrl;
use Illuminate\Database\Eloquent\Model;

class WebPorqueElejirnos extends Model
{
    protected $table      = 'web_porque_elejirnos';
    protected $primaryKey = 'id_porque';
    protected $guarded    = [];
    protected $casts      = [
        'beneficios'   => 'array',
        'stat1_numero' => 'integer',
        'stat2_numero' => 'integer',
        'stat3_numero' => 'integer',
    ];

    protected $appends = [
        'url_imagen_izquierda_publica',
        'url_imagen_centro_publica',
    ];

    public function getUrlImagenIzquierdaPublicaAttribute(): ?string
    {
        return CmsStorageUrl::forApi($this->url_imagen_izquierda);
    }

    public function getUrlImagenCentroPublicaAttribute(): ?string
    {
        return CmsStorageUrl::forApi($this->url_imagen_centro);
    }
}
