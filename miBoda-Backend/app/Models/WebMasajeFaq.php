<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebMasajeFaq extends Model
{
    protected $table = 'web_masaje_faq';

    protected $fillable = [
        'titulo',
        'contenido',
        'icono',
        'orden',
        'Activo',
    ];

    protected $casts = [
        'orden' => 'integer',
    ];

    public function scopeActivos($query)
    {
        return $query->where('Activo', 'S')->orderBy('orden');
    }
}
