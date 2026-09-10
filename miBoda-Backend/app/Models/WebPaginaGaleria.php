<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebPaginaGaleria extends Model
{
    protected $table = 'web_pagina_galeria';
    protected $primaryKey = 'id_galeria';
    protected $guarded = [];

    protected $appends = ['url_imagen_publica'];

    public function getUrlImagenPublicaAttribute(): ?string
    {
        return $this->url_imagen ? \App\Support\CmsStorageUrl::forWeb($this->url_imagen) : null;
    }

    public static function categoriasTabs(): array
    {
        return WebPaginaGaleriaCategoria::tabsFor('royal_galeria');
    }

    public static function categoriasTabsFallback(): array
    {
        return [
            'todas'      => 'Todas',
            'sensorial'  => 'Sensorial',
            'relajacion' => 'Relajación',
            'tantrico'   => 'Tántrico',
            'vip'        => 'Nuestros ambientes',
            'esteticos'  => 'Estéticos corporales',
        ];
    }
}
