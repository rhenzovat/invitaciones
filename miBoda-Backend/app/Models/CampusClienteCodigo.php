<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampusClienteCodigo extends Model
{
    protected $table = 'campus_cliente_codigo';
    protected $primaryKey = 'id_archivo';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_cliente',
        'nombre',
        'lenguaje',
        'contenido',
        'orden',
        'id_user',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(CampusCliente::class, 'id_cliente', 'id_cliente');
    }

    public function autor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user', 'id');
    }
}
