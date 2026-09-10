<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampusProyectoPaquete extends Model
{
    protected $table = 'campus_proyecto_paquetes';
    protected $primaryKey = 'id_paquete';

    protected $fillable = [
        'id_proyecto',
        'id_tipo_origen',
        'slug_origen',
        'titulo',
        'icon',
        'descripcion',
        'subtexto_emocional',
        'frase_destacada',
        'badge_etiqueta',
        'texto_boton',
        'precio_base',
        'moneda',
        'dias_entrega',
        'nota_custom',
        'includes',
        'funcionalidades',
        'requiere_modulos',
        'copiado_en',
    ];

    protected $casts = [
        'includes'        => 'array',
        'funcionalidades' => 'array',
        'precio_base'     => 'float',
        'copiado_en'      => 'datetime',
    ];

    public function proyecto(): BelongsTo
    {
        return $this->belongsTo(CampusProyecto::class, 'id_proyecto', 'id_proyecto');
    }

    public function toResumenArray(): array
    {
        return [
            'id_paquete'          => $this->id_paquete,
            'id_tipo_origen'      => $this->id_tipo_origen,
            'slug_origen'         => $this->slug_origen,
            'titulo'              => $this->titulo,
            'icon'                => $this->icon,
            'descripcion'         => $this->descripcion,
            'subtexto_emocional'  => $this->subtexto_emocional,
            'frase_destacada'     => $this->frase_destacada,
            'badge_etiqueta'      => $this->badge_etiqueta,
            'texto_boton'         => $this->texto_boton,
            'precio_base'         => $this->precio_base,
            'moneda'              => $this->moneda,
            'dias_entrega'        => $this->dias_entrega,
            'nota_custom'         => $this->nota_custom,
            'includes'            => $this->includes ?? [],
            'funcionalidades'     => $this->funcionalidades ?? [],
            'requiere_modulos'    => $this->requiere_modulos,
            'copiado_en'          => $this->copiado_en?->format('d/m/Y H:i'),
        ];
    }
}
