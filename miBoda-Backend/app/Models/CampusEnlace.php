<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusEnlace extends Model
{
    use HasFactory;

    protected $table = 'campus_enlaces';
    protected $primaryKey = 'id_enlace';

    protected $fillable = [
        'id_proyecto',
        'nombre',
        'descripcion',
        'url',
        'categoria',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function proyecto()
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }
}
