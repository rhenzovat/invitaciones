<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebCancionSugerencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebCancionSugerenciaController extends Controller
{
    public function listar(): JsonResponse
    {
        $items = WebCancionSugerencia::orderBy('created_at', 'DESC')->get();

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $items,
        ]);
    }

    public function eliminar(Request $request): JsonResponse
    {
        $request->validate([
            'id_sugerencia' => 'required|exists:web_cancion_sugerencias,id_sugerencia',
        ]);

        WebCancionSugerencia::findOrFail($request->id_sugerencia)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sugerencia eliminada correctamente.',
        ]);
    }
}
