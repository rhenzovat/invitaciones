<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebPaginaFaq extends Model
{
    use HasFactory;

    protected $table = 'web_pagina_faq';
    protected $guarded = [];
    protected $fillable = ['intro_label', 'titulo', 'subtitulo', 'url_imagen'];
}
