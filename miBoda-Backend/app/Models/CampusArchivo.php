<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusArchivo extends Model
{
    use HasFactory;

    protected $table = 'campus_archivos';
    protected $primaryKey = 'id_archivo';

    protected $fillable = [
        'id_proyecto',
        'modulo',
        'nombre',
        'descripcion',
        'ruta_archivo',
        'nombre_original',
        'extension',
        'tamano',
        'subido_por',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'tamano' => 'integer',
    ];

    public function proyecto()
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }
}
