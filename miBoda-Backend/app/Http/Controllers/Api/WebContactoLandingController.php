<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebContactoLanding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WebContactoLandingController extends Controller
{
    public function obtener(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Obtener contacto landing',
            'result'  => WebContactoLanding::firstOrCreate(['id' => 1]),
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:6144',
        ]);

        DB::beginTransaction();
        try {
            $data = WebContactoLanding::firstOrCreate(['id' => 1]);

            $asuntos = $request->input('asuntos');
            if (is_string($asuntos)) {
                $asuntos = json_decode($asuntos, true) ?? [];
            }

            $update = [
                'titulo'        => $request->input('titulo', $data->titulo),
                'descripcion'   => $request->input('descripcion', $data->descripcion),
                'email_destino' => $request->input('email_destino', $data->email_destino),
                'asuntos'       => $asuntos ?? $data->asuntos ?? [],
                'updated_at'    => now(),
            ];

            if ($request->hasFile('image')) {
                $this->eliminarArchivo($data->url_imagen);
                $update['url_imagen'] = $request->file('image')
                    ->store('storage_/contacto_landing', 'public_imagenes');
            }

            $data->update($update);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Contacto landing actualizado correctamente.',
                'result'  => $data->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('WebContactoLanding actualizar: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al actualizar.'], 500);
        }
    }

    private function eliminarArchivo(?string $path): void
    {
        if (empty($path) || str_starts_with($path, 'temp02/')) {
            return;
        }
        if (Storage::disk('public_imagenes')->exists($path)) {
            Storage::disk('public_imagenes')->delete($path);
        }
    }
}
