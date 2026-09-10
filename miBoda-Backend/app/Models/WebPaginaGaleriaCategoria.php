<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class WebPaginaGaleriaCategoria extends Model
{
    protected $table = 'web_pagina_galeria_categoria';

    protected $guarded = [];

    public static function tabsFor(string $contexto = 'royal_galeria'): array
    {
        if (! Schema::hasTable('web_pagina_galeria_categoria')) {
            return WebPaginaGaleria::categoriasTabsFallback();
        }

        $tabs = ['todas' => 'Todas'];
        $rows = static::query()
            ->where('contexto', $contexto)
            ->where('Activo', 'S')
            ->orderBy('orden')
            ->orderBy('id')
            ->get();

        foreach ($rows as $row) {
            $tabs[$row->slug] = $row->nombre;
        }

        return count($tabs) > 1 ? $tabs : WebPaginaGaleria::categoriasTabsFallback();
    }
}
