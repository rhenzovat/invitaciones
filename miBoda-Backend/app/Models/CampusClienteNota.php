<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampusClienteNota extends Model
{
    protected $table = 'campus_cliente_notas';
    protected $primaryKey = 'id_nota';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_cliente',
        'titulo',
        'tipo',
        'contenido',
        'url',
        'color',
        'fijado',
        'id_user',
    ];

    protected $casts = [
        'fijado' => 'boolean',
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
