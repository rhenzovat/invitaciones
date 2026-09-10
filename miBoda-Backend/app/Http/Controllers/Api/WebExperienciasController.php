<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebExperiencias;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class WebExperienciasController extends Controller
{
    public function listar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Listar experiencias',
            'result'  => WebExperiencias::orderBy('orden')->get(),
        ]);
    }

    public function crear(Request $request): JsonResponse
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'image'  => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:6144',
        ]);

        DB::beginTransaction();
        try {
            $max = (int) (WebExperiencias::max('orden') ?? 0);
            $data = $request->only([
                'badge', 'duracion', 'titulo', 'subtitulo', 'descripcion',
                'precio_nota', 'btn_texto', 'btn_url', 'categoria', 'icono_categoria', 'Activo',
            ]);
            $data['orden'] = $max + 1;
            $data['Activo'] = $data['Activo'] ?? 'S';
            if ($request->has('destacado') && Schema::hasColumn('web_experiencias', 'destacado')) {
                $data['destacado'] = $request->boolean('destacado') ? 1 : 0;
            }

            if ($request->hasFile('image')) {
                $data['url_imagen'] = $request->file('image')
                    ->store('storage_/experiencias', 'public_imagenes');
            }

            $item = WebExperiencias::create($data);
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Creado.', 'result' => $item]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('WebExperiencias crear: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Error al crear.'], 500);
        }
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'id_experiencia' => 'required|integer',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:6144',
        ]);

        DB::beginTransaction();
        try {
            $item = WebExperiencias::findOrFail($request->id_experiencia);
            $data = $request->only([
                'badge', 'duracion', 'titulo', 'subtitulo', 'descripcion',
                'precio_nota', 'btn_texto', 'btn_url', 'orden', 'categoria', 'icono_categoria', 'Activo',
            ]);
            if ($request->has('destacado') && Schema::hasColumn('web_experiencias', 'destacado')) {
                $data['destacado'] = $request->boolean('destacado') ? 1 : 0;
            }

            if ($request->hasFile('image')) {
                if ($item->url_imagen && Storage::disk('public_imagenes')->exists($item->url_imagen)) {
                    Storage::disk('public_imagenes')->delete($item->url_imagen);
                }
                $data['url_imagen'] = $request->file('image')
                    ->store('storage_/experiencias', 'public_imagenes');
            }

            $item->update(array_filter($data, fn ($v) => $v !== null));
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Actualizado.', 'result' => $item->fresh()]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('WebExperiencias actualizar: ' . $e->getMessage());

            return response()->json(['success' => false, 'message' => 'Error al actualizar.'], 500);
        }
    }

    public function eliminar(Request $request): JsonResponse
    {
        $item = WebExperiencias::findOrFail($request->id_experiencia);
        if ($item->url_imagen && Storage::disk('public_imagenes')->exists($item->url_imagen)) {
            Storage::disk('public_imagenes')->delete($item->url_imagen);
        }
        $item->delete();

        return response()->json(['success' => true, 'message' => 'Eliminado.']);
    }
}
