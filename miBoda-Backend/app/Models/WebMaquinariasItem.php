<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebMaquinariasItem extends Model
{
    protected $table = 'web_maquinarias_item';
    protected $guarded = [];

    public function hasFlip(): bool
    {
        return !empty($this->url_imagen_front) && !empty($this->url_imagen_back);
    }
}
