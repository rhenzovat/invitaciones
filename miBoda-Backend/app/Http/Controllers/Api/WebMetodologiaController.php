<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Models\WebMetodologia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class WebMetodologiaController extends Controller
{
    public function listar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result'  => WebMetodologia::orderBy('orden', 'ASC')->get(),
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'id_metodologia' => 'required|exists:web_metodologia,id_metodologia',
            'titulo'         => 'required|string|max:255',
            'descripcion'    => 'nullable|string',
            'badge_seccion'  => 'nullable|string|max:200',
            'seccion_titulo' => 'nullable|string|max:500',
            'remove_image'   => 'nullable|boolean',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
        ]);

        $registro = WebMetodologia::find($request->id_metodologia);

        DB::beginTransaction();
        try {
            $data = [
                'titulo'         => $request->titulo,
                'descripcion'    => $request->descripcion,
                'badge_seccion'  => $request->badge_seccion,
                'seccion_titulo' => $request->seccion_titulo,
                'updated_at'     => now(),
            ];

            if ($request->boolean('remove_image')) {
                $this->deleteImagenSubida($registro->url_imagen);
                $data['url_imagen'] = $this->imagenPorDefecto((int) $registro->paso);
            } elseif ($request->hasFile('image')) {
                $this->deleteImagenSubida($registro->url_imagen);
                $path = $request->file('image')->store('storage_/metodologia', 'public_imagenes');
                $data['url_imagen'] = $path;
            }

            $registro->update($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registro actualizado correctamente.',
                'result'  => $registro->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al actualizar metodología: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al actualizar el registro.',
            ], 500);
        }
    }

    private function imagenPorDefecto(int $paso): string
    {
        $n = max(1, min(3, $paso));

        return "temp02/assets/img/works-icon-{$n}.png";
    }

    /** Elimina solo archivos subidos (storage_/...), no los iconos por defecto en temp02. */
    private function deleteImagenSubida(?string $ruta): void
    {
        if (!$ruta || str_starts_with($ruta, 'temp02/')) {
            return;
        }

        if (Storage::disk('public_imagenes')->exists($ruta)) {
            Storage::disk('public_imagenes')->delete($ruta);
        }
    }
}
