<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebHeader extends Model
{
    protected $table      = 'web_header';
    protected $primaryKey = 'id_header';
    protected $guarded    = [];
    protected $casts      = [
        'nav_items'         => 'array',
        'side_menu_enlaces' => 'array',
        'redes_side'        => 'array',
    ];
}
