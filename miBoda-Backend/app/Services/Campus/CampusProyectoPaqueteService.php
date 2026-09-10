<?php

namespace App\Services\Campus;

use App\Models\CampusProyecto;
use App\Models\CampusProyectoPaquete;
use App\Models\Cotizacion\CotizacionConfig;
use App\Models\Cotizacion\CotizacionTipoProyecto;
use Illuminate\Support\Facades\Schema;

class CampusProyectoPaqueteService
{
    /**
     * Copia congelada del paquete del catálogo al proyecto del cliente.
     * Cada venta conserva su propia versión aunque el catálogo web cambie después.
     */
    public function copiarDesdeCatalogo(CampusProyecto $proyecto, CotizacionTipoProyecto $tipo): CampusProyectoPaquete
    {
        $includes = json_decode(json_encode($this->normalizarJsonArray($tipo->includes)), true) ?: [];
        $funcs    = json_decode(json_encode($this->normalizarJsonArray($tipo->funcionalidades)), true) ?: [];

        return CampusProyectoPaquete::updateOrCreate(
            ['id_proyecto' => $proyecto->id_proyecto],
            [
                'id_tipo_origen'     => $tipo->id_tipo,
                'slug_origen'        => $tipo->slug,
                'titulo'             => $tipo->titulo,
                'icon'               => $tipo->icon,
                'descripcion'        => $tipo->descripcion,
                'subtexto_emocional' => $tipo->subtexto_emocional,
                'frase_destacada'    => $tipo->frase_destacada,
                'badge_etiqueta'     => $tipo->badge_etiqueta,
                'texto_boton'        => $tipo->texto_boton,
                'precio_base'        => (float) ($tipo->precio_base ?? 0),
                'moneda'             => $this->monedaActual(),
                'dias_entrega'       => $tipo->dias_entrega,
                'nota_custom'        => $tipo->nota_custom,
                'includes'           => $includes,
                'funcionalidades'    => $funcs,
                'requiere_modulos'   => $tipo->requiere_modulos ?? 'N',
                'copiado_en'         => now(),
            ]
        );
    }

    public function monedaActual(): string
    {
        if (!Schema::hasTable('cotizacion_config')) {
            return 'S/';
        }

        $moneda = CotizacionConfig::query()->value('moneda');

        return $moneda ?: 'S/';
    }

    private function normalizarJsonArray(mixed $value): array
    {
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }

        return is_array($value) ? $value : [];
    }
}
