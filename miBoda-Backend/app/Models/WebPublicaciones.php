<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebPublicaciones extends Model
{
    protected $table = 'web_publicaciones';
    protected $primaryKey = 'id_publicacion';
    protected $guarded = [];

    protected $appends = ['url_imagen_publica'];

    public function getUrlImagenPublicaAttribute(): ?string
    {
        if (empty($this->url_imagen)) {
            return null;
        }
        if (str_starts_with($this->url_imagen, 'http')) {
            return $this->url_imagen;
        }
        return asset($this->url_imagen);
    }
}
