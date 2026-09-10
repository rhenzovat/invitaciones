<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebServicios extends Model
{
    use HasFactory;

    protected $table = 'web_servicios';
    protected $primaryKey = 'id_servicio';
    protected $guarded = [];
}
