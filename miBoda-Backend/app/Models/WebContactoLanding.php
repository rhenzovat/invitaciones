<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebContactoLanding extends Model
{
    protected $table = 'web_contacto_landing';
    protected $guarded = [];
    protected $casts = ['asuntos' => 'array'];
}
