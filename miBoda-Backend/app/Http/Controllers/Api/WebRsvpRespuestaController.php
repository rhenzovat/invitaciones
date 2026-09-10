<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebRsvpRespuesta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebRsvpRespuestaController extends Controller
{
    public function listar(): JsonResponse
    {
        $items = WebRsvpRespuesta::orderBy('created_at', 'DESC')->get();

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $items,
        ]);
    }

    public function eliminar(Request $request): JsonResponse
    {
        $request->validate([
            'id_rsvp_respuesta' => 'required|exists:web_rsvp_respuestas,id_rsvp_respuesta',
        ]);

        WebRsvpRespuesta::findOrFail($request->id_rsvp_respuesta)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Respuesta eliminada correctamente.',
        ]);
    }
}
