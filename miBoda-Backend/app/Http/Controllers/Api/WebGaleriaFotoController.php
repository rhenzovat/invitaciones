<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebGaleriaFoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WebGaleriaFotoController extends Controller
{
    public function listar(): JsonResponse
    {
        $items = WebGaleriaFoto::orderBy('orden', 'DESC')->get()
            ->map(function ($foto) {
                $foto->url_imagen_publica = asset($foto->url_imagen);
                $foto->url_imagen_thumb_publica = $foto->url_imagen_thumb
                    ? asset($foto->url_imagen_thumb)
                    : $foto->url_imagen_publica;
                return $foto;
            });

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $items,
        ]);
    }

    public function eliminar(Request $request): JsonResponse
    {
        $request->validate([
            'id_foto' => 'required|exists:web_galeria_fotos,id_foto',
        ]);

        $foto = WebGaleriaFoto::findOrFail($request->id_foto);

        if ($foto->url_imagen && Storage::disk('public_imagenes')->exists($foto->url_imagen)) {
            Storage::disk('public_imagenes')->delete($foto->url_imagen);
        }
        if ($foto->url_imagen_thumb && Storage::disk('public_imagenes')->exists($foto->url_imagen_thumb)) {
            Storage::disk('public_imagenes')->delete($foto->url_imagen_thumb);
        }

        $foto->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto eliminada correctamente.',
        ]);
    }
}
