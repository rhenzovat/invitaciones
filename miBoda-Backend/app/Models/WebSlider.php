<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebSlider extends Model
{
    use HasFactory;

    /** Registro reservado para imagen de fondo interna (no va al carrusel del inicio). */
    public const ID_BANNER_INTERNO = 4;

    protected $table = 'web_slider';
    protected $primaryKey = 'id_slider';
    protected $guarded = [];

    public function scopeForHeroCarousel($query)
    {
        return $query->where('id_slider', '!=', self::ID_BANNER_INTERNO);
    }
}
