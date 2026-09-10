<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebEvento;
use App\Models\WebInvitado;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebInvitadoController extends Controller
{
    public function listar(): JsonResponse
    {
        $items = WebInvitado::where('Activo', 'S')->orderBy('nombre')->get();
        $capacidad = (int) (WebEvento::where('Activo', 'S')->value('capacidad_maxima') ?? 100);

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => [
                'invitados' => $items,
                'capacidad_maxima' => $capacidad,
                'pases_totales' => (int) $items->sum('pases_asignados'),
            ],
        ]);
    }

    public function crear(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:200',
            'pases_asignados' => 'required|integer|min:1|max:50',
            'notas' => 'nullable|string',
        ]);

        $invitado = WebInvitado::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Invitado agregado correctamente.',
            'result' => $invitado,
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_invitado' => 'required|exists:web_invitados,id_invitado',
            'nombre' => 'required|string|max:200',
            'pases_asignados' => 'required|integer|min:1|max:50',
            'notas' => 'nullable|string',
        ]);

        $invitado = WebInvitado::findOrFail($data['id_invitado']);
        $invitado->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Invitado actualizado correctamente.',
            'result' => $invitado,
        ]);
    }

    public function eliminar(Request $request): JsonResponse
    {
        $request->validate([
            'id_invitado' => 'required|exists:web_invitados,id_invitado',
        ]);

        WebInvitado::findOrFail($request->id_invitado)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invitado eliminado correctamente.',
        ]);
    }
}
