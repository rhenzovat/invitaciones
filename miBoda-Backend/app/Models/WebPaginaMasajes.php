<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebPaginaMasajes extends Model
{
    protected $table = 'web_pagina_masajes';

    protected $fillable = [
        'hero_tag', 'hero_titulo', 'hero_url_imagen',
        'intro_label', 'intro_titulo', 'intro_titulo2', 'intro_subtitulo',
        'cta_texto', 'cta_btn',
    ];
}
