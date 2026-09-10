<?php

namespace App\Models;

use App\Support\CmsStorageUrl;
use Illuminate\Database\Eloquent\Model;

class WebPromoBanner extends Model
{
    protected $table = 'web_promo_banner';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $guarded = [];

    protected $appends = ['url_imagen_fondo_publica'];

    public function getUrlImagenFondoPublicaAttribute(): ?string
    {
        return CmsStorageUrl::forApi($this->url_imagen_fondo);
    }
}
