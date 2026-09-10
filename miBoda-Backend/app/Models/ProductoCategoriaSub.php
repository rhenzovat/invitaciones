<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductoCategoriaSub extends Model
{
    use HasFactory;

    protected $table = 'administracion_producto_categoria_sub';
    protected $primaryKey = 'id_producto_categoria_sub';
    protected $guarded = [];
    
}