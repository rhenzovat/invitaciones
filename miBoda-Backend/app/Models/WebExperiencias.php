<?php

namespace App\Models;

use App\Support\CmsStorageUrl;
use Illuminate\Database\Eloquent\Model;

class WebExperiencias extends Model
{
    protected $table = 'web_experiencias';
    protected $primaryKey = 'id_experiencia';
    protected $guarded = [];

    protected $appends = ['url_imagen_publica'];

    public function getUrlImagenPublicaAttribute(): ?string
    {
        return CmsStorageUrl::forApi($this->url_imagen);
    }
}
