<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPromoBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WebPromoBannerController extends Controller
{
    public function obtener(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'OK',
            'result'  => WebPromoBanner::find(1),
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:6144',
        ]);

        DB::beginTransaction();
        try {
            $row = WebPromoBanner::firstOrCreate(['id' => 1]);
            $data = $request->only(['subtitulo', 'titulo', 'btn_texto', 'btn_url', 'Activo']);

            if ($request->hasFile('image')) {
                $disk = Storage::disk('public_imagenes');
                $disk->makeDirectory('storage_/promo_banner');

                $oldPath = $row->url_imagen_fondo;
                if ($oldPath && str_starts_with($oldPath, 'storage_/') && $disk->exists($oldPath)) {
                    $disk->delete($oldPath);
                }

                $data['url_imagen_fondo'] = $request->file('image')->store(
                    'storage_/promo_banner',
                    'public_imagenes'
                );
            }

            $row->update($data);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Banner promo actualizado.',
                'result'  => $row->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('WebPromoBanner actualizar: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Error al guardar.'], 500);
        }
    }
}
