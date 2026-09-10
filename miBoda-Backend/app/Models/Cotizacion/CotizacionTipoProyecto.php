<?php

namespace App\Models\Cotizacion;

use Illuminate\Database\Eloquent\Model;

class CotizacionTipoProyecto extends Model
{
    protected $table = 'cotizacion_tipo_proyecto';
    protected $primaryKey = 'id_tipo';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'slug',
        'titulo',
        'icon',
        'descripcion',
        'subtexto_emocional',
        'frase_destacada',
        'badge_etiqueta',
        'texto_boton',
        'precio_base',
        'dias_entrega',
        'nota_custom',
        'includes',
        'funcionalidades',
        'orden',
        'requiere_modulos',
        'Activo',
    ];

    protected $casts = [
        'includes'        => 'array',
        'funcionalidades' => 'array',
        'precio_base'     => 'float',
    ];
}
