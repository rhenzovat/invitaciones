<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductoImagen extends Model
{
    use HasFactory;

    protected $table = 'administracion_producto_imagen';
    protected $primaryKey = 'id_producto_imagen';
    protected $guarded = [];
    
}