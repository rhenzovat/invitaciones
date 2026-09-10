<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPaginaPublicacionesBanner;
use App\Models\WebPublicaciones;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WebPublicacionesController extends Controller
{
    public function listar(): JsonResponse
    {
        $items = WebPublicaciones::orderBy('orden')->get();
        $first = $items->first();

        $banners = WebPaginaPublicacionesBanner::first();

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result'  => [
                'seccion_titulo'    => $first?->seccion_titulo ?? '',
                'seccion_subtitulo' => $first?->seccion_subtitulo ?? '',
                'paginas_banner'    => $banners,
                'items'             => $items,
            ],
        ]);
    }

    public function actualizar_paginas_banner(Request $request): JsonResponse
    {
        $banner = WebPaginaPublicacionesBanner::firstOrCreate(['id' => 1]);
        $data = $request->only(['listado_banner_titulo']);

        if ($request->hasFile('listado_banner_image')) {
            $this->eliminarArchivo($banner->listado_banner_url_imagen);
            $data['listado_banner_url_imagen'] = $request->file('listado_banner_image')
                ->store('storage_/pagina_banner', 'public_imagenes');
        }
        if ($request->hasFile('detalle_banner_image')) {
            $this->eliminarArchivo($banner->detalle_banner_url_imagen);
            $data['detalle_banner_url_imagen'] = $request->file('detalle_banner_image')
                ->store('storage_/pagina_banner', 'public_imagenes');
        }

        $banner->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Banners de páginas actualizados.',
            'result'  => $banner->fresh(),
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
            $ref = WebPublicaciones::orderBy('id_publicacion')->first();
            $maxOrden = WebPublicaciones::max('orden') ?? 0;

            $slug = $request->input('slug') ?: Str::slug($request->titulo);
            $data = [
                'seccion_titulo'    => $ref?->seccion_titulo,
                'seccion_subtitulo' => $ref?->seccion_subtitulo,
                'titulo'            => $request->titulo,
                'slug'              => $slug,
                'resumen'           => $request->input('resumen'),
                'contenido'         => $request->input('contenido'),
                'autor'             => $request->input('autor', 'Bibliotecas Rodantes'),
                'categoria'         => $request->input('categoria', 'Publicación'),
                'fecha_publicacion' => $request->input('fecha_publicacion', now()->toDateString()),
                'chip'              => $request->input('chip', 'Publicación'),
                'url_enlace'        => $request->input('url_enlace', '/publicaciones/' . $slug),
                'orden'             => $maxOrden + 1,
                'Activo'            => 'S',
            ];

            if ($request->hasFile('image')) {
                $data['url_imagen'] = $request->file('image')->store('storage_/publicaciones', 'public_imagenes');
            }
            if ($request->hasFile('banner_image')) {
                $data['banner_url_imagen'] = $request->file('banner_image')
                    ->store('storage_/publicaciones_banner', 'public_imagenes');
            }

            $registro = WebPublicaciones::create($data);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Publicación creada correctamente.',
                'result'  => $registro,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('WebPublicaciones crear: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al crear el registro.'], 500);
        }
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'id_publicacion' => 'required|exists:web_publicaciones,id_publicacion',
            'titulo'         => 'nullable|string|max:255',
            'resumen'        => 'nullable|string',
            'chip'           => 'nullable|string|max:80',
            'url_enlace'     => 'nullable|string|max:500',
            'remove_image'   => 'nullable|boolean',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:6144',
        ]);

        $registro = WebPublicaciones::findOrFail($request->id_publicacion);

        DB::beginTransaction();
        try {
            $titulo = $request->input('titulo', $registro->titulo);
            $slug = $request->input('slug', $registro->slug) ?: Str::slug($titulo);
            $data = [
                'titulo'            => $titulo,
                'slug'              => $slug,
                'resumen'           => $request->input('resumen', $registro->resumen),
                'contenido'         => $request->input('contenido', $registro->contenido),
                'autor'             => $request->input('autor', $registro->autor),
                'categoria'         => $request->input('categoria', $registro->categoria),
                'fecha_publicacion' => $request->input('fecha_publicacion', $registro->fecha_publicacion),
                'chip'              => $request->input('chip', $registro->chip),
                'url_enlace'        => $request->input('url_enlace', '/publicaciones/' . $slug),
                'updated_at'        => now(),
            ];

            if ($request->boolean('remove_image')) {
                $this->eliminarArchivo($registro->url_imagen);
                $data['url_imagen'] = null;
            } elseif ($request->hasFile('image')) {
                $this->eliminarArchivo($registro->url_imagen);
                $data['url_imagen'] = $request->file('image')->store('storage_/publicaciones', 'public_imagenes');
            }

            if ($request->hasFile('banner_image')) {
                $this->eliminarArchivo($registro->banner_url_imagen);
                $data['banner_url_imagen'] = $request->file('banner_image')
                    ->store('storage_/publicaciones_banner', 'public_imagenes');
            }

            $registro->update($data);
            $registro->refresh();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Publicación actualizada correctamente.',
                'result'  => $registro,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al actualizar el registro.'], 500);
        }
    }

    public function actualizar_seccion(Request $request): JsonResponse
    {
        $request->validate([
            'seccion_titulo'    => 'nullable|string|max:500',
            'seccion_subtitulo' => 'nullable|string|max:1000',
        ]);

        WebPublicaciones::query()->update([
            'seccion_titulo'    => $request->input('seccion_titulo'),
            'seccion_subtitulo' => $request->input('seccion_subtitulo'),
            'updated_at'        => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sección actualizada.',
            'result'  => $request->only(['seccion_titulo', 'seccion_subtitulo']),
        ]);
    }

    public function eliminar(Request $request): JsonResponse
    {
        $request->validate(['id_publicacion' => 'required|exists:web_publicaciones,id_publicacion']);
        $registro = WebPublicaciones::findOrFail($request->id_publicacion);

        DB::beginTransaction();
        try {
            $this->eliminarArchivo($registro->url_imagen);
            $registro->delete();
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Publicación eliminada correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al eliminar el registro.'], 500);
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
