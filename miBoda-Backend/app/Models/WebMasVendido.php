<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebMasVendido extends Model
{
    use HasFactory;

    protected $table = 'web_mas_vendido';
    protected $primaryKey = 'id_mas_vendido';
    protected $guarded = [];
    
}