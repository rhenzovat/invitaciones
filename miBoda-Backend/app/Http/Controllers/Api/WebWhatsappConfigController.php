<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebWhatsappConfig;
use App\Services\WhatsappConfigSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebWhatsappConfigController extends Controller
{
    public function obtener(): JsonResponse
    {
        $cfg = WebWhatsappConfig::firstOrCreate(
            ['id' => 1],
            WhatsappConfigSync::defaultsForCreate()
        );

        return response()->json([
            'success' => true,
            'result'  => $cfg,
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'wa_numero'         => 'nullable|string|max:30',
            'wa_mensaje'        => 'nullable|string|max:2000',
            'wa_burbuja_linea1' => 'nullable|string|max:200',
            'wa_burbuja_linea2' => 'nullable|string|max:200',
            'wa_label'          => 'nullable|string|max:50',
            'wa_badge'          => 'nullable|string|max:10',
            'wa_delay_segundos' => 'nullable|numeric|min:0|max:60',
            'Activo'            => 'nullable|in:S,N',
        ]);

        $cfg = WebWhatsappConfig::firstOrCreate(['id' => 1], WhatsappConfigSync::defaultsForCreate());

        $data = $request->only([
            'wa_numero', 'wa_mensaje',
            'wa_burbuja_linea1', 'wa_burbuja_linea2',
            'wa_label', 'wa_badge', 'wa_delay_segundos', 'Activo',
        ]);

        if (isset($data['wa_numero'])) {
            $data['wa_numero'] = preg_replace('/\D/', '', $data['wa_numero']);
        }

        $cfg->update($data);
        WhatsappConfigSync::syncCorporateContacts($cfg->fresh());

        return response()->json([
            'success' => true,
            'message' => 'Configuración WhatsApp actualizada',
            'result'  => $cfg->fresh(),
        ]);
    }
}
