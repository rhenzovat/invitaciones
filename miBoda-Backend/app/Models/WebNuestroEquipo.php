<?php

namespace App\Models;

use App\Support\CmsStorageUrl;
use Illuminate\Database\Eloquent\Model;

class WebNuestroEquipo extends Model
{
    protected $table      = 'web_nuestro_equipo';
    protected $primaryKey = 'id_miembro';
    protected $guarded    = [];

    protected $appends = [
        'url_imagen_publica',
    ];

    public function getUrlImagenPublicaAttribute(): ?string
    {
        return CmsStorageUrl::forApi($this->url_imagen);
    }
}
