<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebPaginaExperiencias extends Model
{
    protected $table = 'web_pagina_experiencias';

    protected $fillable = [
        'hero_tag', 'hero_titulo', 'hero_url_imagen',
        'stat1_valor', 'stat1_label', 'stat2_valor', 'stat2_label',
        'stat3_valor', 'stat3_label', 'stat4_valor', 'stat4_label',
        'intro_label', 'intro_titulo', 'intro_titulo2',
        'cat_tantrico_titulo', 'cat_tantrico_desc',
        'cat_bienestar_titulo', 'cat_bienestar_desc',
        'cat_corporal_titulo',  'cat_corporal_desc',
        'cat_estetica_titulo',  'cat_estetica_desc',
        'cta_titulo', 'cta_texto', 'cta_btn',
    ];
}
