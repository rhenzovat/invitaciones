<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CampusProyecto extends Model
{
    use HasFactory;

    protected $table = 'campus_proyectos';
    protected $primaryKey = 'id_proyecto';

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
        'id_notificacion_estado',
        'fecha_inicio',
        'fecha_entrega',
        'progreso',
        'orden_prioridad',
        'icono',
        'color',
        'activo',
    ];

    protected $casts = [
        'activo'        => 'boolean',
        'progreso'      => 'integer',
        'orden_prioridad' => 'integer',
        'fecha_inicio'  => 'date',
        'fecha_entrega' => 'date',
    ];

    public function archivos()
    {
        return $this->hasMany(CampusArchivo::class, 'id_proyecto', 'id_proyecto');
    }

    public function enlaces()
    {
        return $this->hasMany(CampusEnlace::class, 'id_proyecto', 'id_proyecto');
    }

    public function actividades()
    {
        return $this->hasMany(CampusActividad::class, 'id_proyecto', 'id_proyecto');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'campus_cliente_proyecto', 'id_proyecto', 'id_user');
    }

    public function clientesCrm()
    {
        return $this->belongsToMany(
            CampusCliente::class,
            'campus_cliente_proyecto',
            'id_proyecto',
            'id_cliente',
            'id_proyecto',
            'id_cliente'
        );
    }

    public function paquete()
    {
        return $this->hasOne(CampusProyectoPaquete::class, 'id_proyecto', 'id_proyecto');
    }

    public function estadoNotificacion()
    {
        return $this->belongsTo(
            \App\Models\Notificacion\NotificacionEstado::class,
            'id_notificacion_estado',
            'id_estado'
        );
    }
}
