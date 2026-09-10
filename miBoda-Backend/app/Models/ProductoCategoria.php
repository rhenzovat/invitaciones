<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductoCategoria extends Model
{
    use HasFactory;

    protected $table = 'administracion_producto_categoria';
    protected $primaryKey = 'id_producto_categoria';
    protected $guarded = [];
    
}