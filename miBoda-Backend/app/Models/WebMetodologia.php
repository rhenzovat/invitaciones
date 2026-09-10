<?php

namespace App\Models;

use App\Support\CmsStorageUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebMetodologia extends Model
{
    use HasFactory;

    protected $table = 'web_metodologia';
    protected $primaryKey = 'id_metodologia';
    protected $guarded = [];

    protected $appends = [
        'url_imagen_publica',
    ];

    public function getUrlImagenPublicaAttribute(): ?string
    {
        if (empty($this->url_imagen) || str_starts_with($this->url_imagen, 'temp02/')) {
            return asset($this->url_imagen);
        }

        return CmsStorageUrl::forApi($this->url_imagen);
    }
}
