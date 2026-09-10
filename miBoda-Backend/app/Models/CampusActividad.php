<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusActividad extends Model
{
    use HasFactory;

    protected $table = 'campus_actividad';
    protected $primaryKey = 'id_actividad';

    protected $fillable = [
        'id_proyecto',
        'descripcion',
        'tipo',
        'id_user',
    ];

    public function proyecto()
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }
}
