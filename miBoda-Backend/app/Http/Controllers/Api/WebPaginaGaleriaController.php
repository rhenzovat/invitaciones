<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPaginaGaleria;
use App\Models\WebPaginaGaleriaCategoria;
use App\Models\WebPaginaGaleriaSeccion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WebPaginaGaleriaController extends Controller
{
    private const CONTEXTO = 'royal_galeria';

    public function listar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'OK',
            'result'  => [
                'seccion'    => WebPaginaGaleriaSeccion::find(1),
                'items'      => WebPaginaGaleria::where('contexto', self::CONTEXTO)->orderBy('orden')->get(),
                'categorias' => $this->listarCategorias(),
            ],
        ]);
    }

    public function actualizar_seccion(Request $request): JsonResponse
    {
        $sec = WebPaginaGaleriaSeccion::firstOrCreate(['id' => 1]);
        $sec->update($request->only(['seccion_titulo', 'seccion_subtitulo']));

        return response()->json(['success' => true, 'result' => $sec->fresh()]);
    }

    public function crear(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:6144']);
        $max = (int) (WebPaginaGaleria::where('contexto', self::CONTEXTO)->max('orden') ?? 0);

        $item = WebPaginaGaleria::create([
            'contexto'       => self::CONTEXTO,
            'categoria'      => $this->resolveCategoriaSlug($request->input('categoria')),
            'titulo_overlay' => $request->input('titulo_overlay'),
            'alt_imagen'     => $request->input('alt_imagen'),
            'url_imagen'     => $request->file('image')->store('storage_/galeria_royal', 'public_imagenes'),
            'orden'          => $max + 1,
            'Activo'         => 'S',
        ]);

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate(['id_galeria' => 'required|integer']);
        $item = WebPaginaGaleria::findOrFail($request->id_galeria);
        $data = $request->only(['titulo_overlay', 'alt_imagen', 'orden', 'Activo']);

        if ($request->has('categoria')) {
            $data['categoria'] = $this->resolveCategoriaSlug($request->input('categoria'));
        }

        if ($request->hasFile('image')) {
            $this->del($item->url_imagen);
            $data['url_imagen'] = $request->file('image')->store('storage_/galeria_royal', 'public_imagenes');
        }

        $item->update($data);

        return response()->json(['success' => true, 'result' => $item->fresh()]);
    }

    public function eliminar(Request $request): JsonResponse
    {
        $item = WebPaginaGaleria::findOrFail($request->id_galeria);
        $this->del($item->url_imagen);
        $item->delete();

        return response()->json(['success' => true, 'message' => 'Eliminado']);
    }

    public function crear_categoria(Request $request): JsonResponse
    {
        $request->validate([
            'nombre' => 'required|string|max:120',
            'slug'   => 'nullable|string|max:60',
            'orden'  => 'nullable|integer|min:0',
        ]);

        $slug = $this->uniqueSlug(
            $request->input('slug') ?: $request->input('nombre'),
            self::CONTEXTO
        );

        $max = (int) (WebPaginaGaleriaCategoria::where('contexto', self::CONTEXTO)->max('orden') ?? 0);

        $cat = WebPaginaGaleriaCategoria::create([
            'contexto' => self::CONTEXTO,
            'slug'     => $slug,
            'nombre'   => trim($request->input('nombre')),
            'orden'    => $request->input('orden', $max + 1),
            'Activo'   => 'S',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Categoría creada',
            'result'  => $cat,
        ]);
    }

    public function actualizar_categoria(Request $request): JsonResponse
    {
        $request->validate([
            'id'     => 'required|integer',
            'nombre' => 'required|string|max:120',
            'slug'   => 'nullable|string|max:60',
            'orden'  => 'nullable|integer|min:0',
        ]);

        $cat = WebPaginaGaleriaCategoria::where('contexto', self::CONTEXTO)->findOrFail($request->id);
        $oldSlug = $cat->slug;

        $slug = $request->filled('slug')
            ? $this->uniqueSlug($request->input('slug'), self::CONTEXTO, $cat->id)
            : $oldSlug;

        $cat->update([
            'nombre' => trim($request->input('nombre')),
            'slug'   => $slug,
            'orden'  => $request->input('orden', $cat->orden),
        ]);

        if ($slug !== $oldSlug) {
            WebPaginaGaleria::where('contexto', self::CONTEXTO)
                ->where('categoria', $oldSlug)
                ->update(['categoria' => $slug]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Categoría actualizada',
            'result'  => $cat->fresh(),
        ]);
    }

    public function eliminar_categoria(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|integer']);
        $cat = WebPaginaGaleriaCategoria::where('contexto', self::CONTEXTO)->findOrFail($request->id);

        $enUso = WebPaginaGaleria::where('contexto', self::CONTEXTO)
            ->where('categoria', $cat->slug)
            ->count();

        if ($enUso > 0) {
            return response()->json([
                'success' => false,
                'message' => "No se puede eliminar: {$enUso} imagen(es) usan esta categoría. Reasígnalas primero.",
            ], 422);
        }

        $cat->delete();

        return response()->json(['success' => true, 'message' => 'Categoría eliminada']);
    }

    private function listarCategorias()
    {
        if (! Schema::hasTable('web_pagina_galeria_categoria')) {
            return collect([
                ['id' => null, 'slug' => 'sensorial',  'nombre' => 'Sensorial',             'orden' => 1],
                ['id' => null, 'slug' => 'relajacion', 'nombre' => 'Relajación',            'orden' => 2],
                ['id' => null, 'slug' => 'tantrico',   'nombre' => 'Tántrico',              'orden' => 3],
                ['id' => null, 'slug' => 'vip',        'nombre' => 'Nuestros ambientes',    'orden' => 4],
                ['id' => null, 'slug' => 'esteticos',  'nombre' => 'Estéticos corporales',  'orden' => 5],
            ]);
        }

        return WebPaginaGaleriaCategoria::where('contexto', self::CONTEXTO)
            ->where('Activo', 'S')
            ->orderBy('orden')
            ->orderBy('id')
            ->get();
    }

    private function resolveCategoriaSlug(?string $slug): string
    {
        $slug = Str::slug((string) $slug, '_');
        if ($slug === '' || $slug === 'todas') {
            $first = WebPaginaGaleriaCategoria::where('contexto', self::CONTEXTO)
                ->where('Activo', 'S')
                ->orderBy('orden')
                ->value('slug');

            return $first ?: 'sensorial';
        }

        if (Schema::hasTable('web_pagina_galeria_categoria')) {
            $exists = WebPaginaGaleriaCategoria::where('contexto', self::CONTEXTO)
                ->where('slug', $slug)
                ->where('Activo', 'S')
                ->exists();
            if ($exists) {
                return $slug;
            }
        }

        return 'sensorial';
    }

    private function uniqueSlug(string $raw, string $contexto, ?int $ignoreId = null): string
    {
        $base = Str::slug($raw, '_');
        if ($base === '' || $base === 'todas') {
            $base = 'categoria';
        }

        $slug = $base;
        $n = 2;
        while ($this->slugTaken($slug, $contexto, $ignoreId)) {
            $slug = $base . '_' . $n;
            $n++;
        }

        return $slug;
    }

    private function slugTaken(string $slug, string $contexto, ?int $ignoreId = null): bool
    {
        if (! Schema::hasTable('web_pagina_galeria_categoria')) {
            return false;
        }

        $q = WebPaginaGaleriaCategoria::where('contexto', $contexto)->where('slug', $slug);
        if ($ignoreId) {
            $q->where('id', '!=', $ignoreId);
        }

        return $q->exists();
    }

    private function del(?string $path): void
    {
        if ($path && ! str_starts_with($path, 'temp02/') && Storage::disk('public_imagenes')->exists($path)) {
            Storage::disk('public_imagenes')->delete($path);
        }
    }
}
