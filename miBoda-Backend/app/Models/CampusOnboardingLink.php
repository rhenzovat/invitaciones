<?php

namespace App\Models;

use App\Services\OnboardingCuotasService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class CampusOnboardingLink extends Model
{
    protected $table = 'campus_onboarding_links';
    protected $primaryKey = 'id_onboarding';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'id_cliente', 'token', 'dias_vigencia', 'fecha_expiracion', 'estado',
        'empresa_nombre', 'empresa_banco', 'empresa_cuenta', 'empresa_cci',
        'empresa_titular', 'empresa_ruc', 'empresa_monto', 'num_cuotas', 'cuotas_detalle',
        'empresa_qr_path',
        'empresa_descripcion', 'empresa_yape', 'empresa_dni',
        'empresa_bcp_cuenta', 'empresa_bcp_cci',
        'form_nombres', 'form_apellidos', 'form_empresa', 'form_ruc', 'form_dni',
        'form_email', 'form_telefono', 'form_whatsapp', 'form_direccion',
        'form_marca', 'form_rubro', 'form_desc_proyecto', 'form_dominio', 'form_colores',
        'form_imagen_path',
        'form_completado', 'pago_confirmado', 'progreso',
        'vistas', 'primer_acceso', 'ultimo_acceso', 'creado_por',
    ];

    protected $casts = [
        'fecha_expiracion' => 'datetime',
        'primer_acceso'    => 'datetime',
        'ultimo_acceso'    => 'datetime',
        'form_completado'  => 'boolean',
        'pago_confirmado'  => 'boolean',
        'cuotas_detalle'   => 'array',
        'empresa_monto'    => 'float',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(CampusCliente::class, 'id_cliente', 'id_cliente');
    }

    public function creadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por', 'id');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function estaVigente(): bool
    {
        if ($this->estado !== 'activo' || !$this->fecha_expiracion) {
            return false;
        }

        return Carbon::now()->lessThanOrEqualTo($this->fecha_expiracion);
    }

    public function diasRestantes(): int
    {
        if (!$this->fecha_expiracion) {
            return 0;
        }

        $now = Carbon::now();
        if ($now->greaterThan($this->fecha_expiracion)) {
            return 0;
        }

        // 1 día = 24 h desde creación/renovación; mientras siga vigente, mínimo 1 día visible
        $hoursLeft = $now->floatDiffInHours($this->fecha_expiracion, false);
        if ($hoursLeft <= 0) {
            return 0;
        }

        return (int) max(1, (int) ceil($hoursLeft / 24));
    }

    /**
     * Recalcula el progreso (0-100) basado en campos llenados + pago.
     * Campos del formulario: 8 campos  → cada uno vale ~11.25 pts
     * Imagen:                           → 10 pts
     * Pago confirmado:                  → 10 pts
     * Total: 100
     */
    public function recalcularProgreso(): int
    {
        $campos = [
            'form_nombres', 'form_apellidos', 'form_empresa',
            'form_ruc', 'form_dni', 'form_email',
            'form_telefono', 'form_whatsapp', 'form_direccion',
            'form_marca', 'form_rubro', 'form_desc_proyecto',
        ];
        $llenados = 0;
        foreach ($campos as $c) {
            if (!empty($this->{$c})) $llenados++;
        }

        $puntosCampos  = round(($llenados / count($campos)) * 80);   // 80% formulario
        $puntosImagen  = $this->form_imagen_path ? 10 : 0;            // 10% imagen
        $puntosPago    = OnboardingCuotasService::puntosProgresoPago($this);

        return min(100, $puntosCampos + $puntosImagen + $puntosPago);
    }

    // ── Scopes ────────────────────────────────────────────────────────────────

    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo')
                     ->where('fecha_expiracion', '>', Carbon::now());
    }
}
