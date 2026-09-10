<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CampusCliente extends Model
{
    protected $table = 'campus_clientes';
    protected $primaryKey = 'id_cliente';

    protected $fillable = [
        'nombre',
        'apellido',
        'empresa',
        'ruc',
        'dni',
        'email',
        'telefono',
        'whatsapp',
        'estado',
        'id_notificacion_estado',
        'id_user',
        'creado_por',
        'notas',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por', 'id');
    }

    public function proyectos(): BelongsToMany
    {
        return $this->belongsToMany(
            CampusProyecto::class,
            'campus_cliente_proyecto',
            'id_cliente',
            'id_proyecto',
            'id_cliente',
            'id_proyecto'
        );
    }

    public function notasDetalle(): HasMany
    {
        return $this->hasMany(CampusClienteNota::class, 'id_cliente', 'id_cliente');
    }

    public function archivosCodigo(): HasMany
    {
        return $this->hasMany(CampusClienteCodigo::class, 'id_cliente', 'id_cliente');
    }

    public function estadoNotificacion(): BelongsTo
    {
        return $this->belongsTo(
            \App\Models\Notificacion\NotificacionEstado::class,
            'id_notificacion_estado',
            'id_estado'
        );
    }

    public function nombreCompleto(): string
    {
        return trim($this->nombre . ' ' . ($this->apellido ?? ''));
    }
}
