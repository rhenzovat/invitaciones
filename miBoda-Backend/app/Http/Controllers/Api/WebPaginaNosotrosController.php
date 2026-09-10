<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebAbout;
use App\Models\WebAboutContador;
use App\Models\WebNosotrosProducto;
use App\Models\WebNosotrosProductoSeccion;
use App\Models\WebNosotrosQuienes;
use App\Models\WebNosotrosQuienesBeneficio;
use App\Models\WebPaginaNosotros;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class WebPaginaNosotrosController extends Controller
{
    public function obtener(): JsonResponse
    {
        $about = WebAbout::where('Activo', 'S')->orderBy('id_about')->first();

        return response()->json([
            'success' => true,
            'message' => 'OK',
            'result'  => [
                'pagina'              => WebPaginaNosotros::first(),
                'quienes'             => Schema::hasTable('web_nosotros_quienes')
                    ? WebNosotrosQuienes::where('Activo', 'S')->first()
                    : null,
                'quienes_beneficios'  => Schema::hasTable('web_nosotros_quienes_beneficio')
                    ? WebNosotrosQuienesBeneficio::where('Activo', 'S')->orderBy('orden')->get()
                    : [],
                'about_contadores'    => $about
                    ? WebAboutContador::where('id_about', $about->id_about)->where('Activo', 'S')->orderBy('orden')->get()
                    : [],
                'producto_seccion'    => Schema::hasTable('web_nosotros_producto_seccion')
                    ? WebNosotrosProductoSeccion::first()
                    : null,
                'productos'           => Schema::hasTable('web_nosotros_producto')
                    ? WebNosotrosProducto::where('Activo', 'S')->orderBy('orden')->get()
                    : [],
            ],
        ]);
    }

    public function actualizar_pagina(Request $request): JsonResponse
    {
        $pagina = WebPaginaNosotros::firstOrCreate(['id' => 1]);
        $data = $request->only([
            'banner_titulo',
            'intro_titulo',
            'intro_descripcion',
            'intro_btn_texto',
            'intro_btn_url',
            'frase_texto',
        ]);

        if ($request->hasFile('banner_image')) {
            $this->del($pagina->banner_url_imagen);
            $data['banner_url_imagen'] = $request->file('banner_image')
                ->store('storage_/pagina_banner', 'public_imagenes');
        }
        if ($request->hasFile('intro_logo')) {
            $this->del($pagina->intro_url_logo);
            $data['intro_url_logo'] = $request->file('intro_logo')
                ->store('storage_/nosotros_intro', 'public_imagenes');
        }
        if ($request->hasFile('catalogo_image')) {
            $this->del($pagina->catalogo_url_imagen);
            $data['catalogo_url_imagen'] = $request->file('catalogo_image')
                ->store('storage_/nosotros_catalogo', 'public_imagenes');
        }

        $pagina->update($data);

        return response()->json(['success' => true, 'message' => 'Página actualizada', 'result' => $pagina->fresh()]);
    }

    public function actualizar_quienes(Request $request): JsonResponse
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'image'  => 'nullable|image|max:6144',
        ]);

        $quienes = WebNosotrosQuienes::firstOrCreate(['id' => 1]);
        $data = [
            'titulo'      => $request->titulo,
            'descripcion' => $request->input('descripcion'),
            'Activo'      => 'S',
            'updated_at'  => now(),
        ];

        if ($request->hasFile('image')) {
            $this->del($quienes->url_imagen);
            $data['url_imagen'] = $request->file('image')->store('storage_/nosotros_quienes', 'public_imagenes');
        }

        $quienes->update($data);

        return response()->json(['success' => true, 'message' => 'Quiénes Somos actualizado', 'result' => $quienes->fresh()]);
    }

    public function crear_beneficio(Request $request): JsonResponse
    {
        $request->validate(['texto' => 'required|string|max:500']);
        $max = WebNosotrosQuienesBeneficio::max('orden') ?? 0;
        $item = WebNosotrosQuienesBeneficio::create([
            'texto'  => $request->texto,
            'orden'  => $max + 1,
            'Activo' => 'S',
        ]);

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function actualizar_beneficio(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|exists:web_nosotros_quienes_beneficio,id', 'texto' => 'required|string|max:500']);
        $item = WebNosotrosQuienesBeneficio::findOrFail($request->id);
        $item->update(['texto' => $request->texto]);

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function eliminar_beneficio(Request $request): JsonResponse
    {
        WebNosotrosQuienesBeneficio::findOrFail($request->id)->delete();

        return response()->json(['success' => true, 'message' => 'Eliminado']);
    }

    public function crear_contador(Request $request): JsonResponse
    {
        $request->validate([
            'valor'    => 'required|string|max:30',
            'etiqueta' => 'required|string|max:255',
        ]);

        $aboutId = WebAbout::where('Activo', 'S')->value('id_about') ?? 1;
        $max = WebAboutContador::where('id_about', $aboutId)->max('orden') ?? 0;
        $item = WebAboutContador::create([
            'id_about'    => $aboutId,
            'valor'       => $request->valor,
            'sufijo'      => $request->input('sufijo', ''),
            'etiqueta'    => $request->etiqueta,
            'descripcion' => $request->input('descripcion'),
            'orden'       => $max + 1,
            'Activo'      => 'S',
        ]);

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function actualizar_contador(Request $request): JsonResponse
    {
        $request->validate(['id' => 'required|exists:web_about_contador,id']);
        $item = WebAboutContador::findOrFail($request->id);
        $item->update($request->only(['valor', 'sufijo', 'etiqueta', 'descripcion']));

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function eliminar_contador(Request $request): JsonResponse
    {
        WebAboutContador::findOrFail($request->id)->delete();

        return response()->json(['success' => true, 'message' => 'Eliminado']);
    }

    public function actualizar_producto_seccion(Request $request): JsonResponse
    {
        $sec = WebNosotrosProductoSeccion::firstOrCreate(['id' => 1]);
        $sec->update($request->only(['seccion_titulo', 'seccion_descripcion']));

        return response()->json(['success' => true, 'result' => $sec->fresh()]);
    }

    public function crear_producto(Request $request): JsonResponse
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'image'  => 'nullable|image|max:6144',
        ]);

        $max = WebNosotrosProducto::max('orden') ?? 0;
        $data = [
            'titulo'      => $request->titulo,
            'descripcion' => $request->input('descripcion'),
            'btn_texto'   => $request->input('btn_texto', 'Me interesa'),
            'btn_url'     => $request->input('btn_url', 'https://wa.me/51981629466'),
            'orden'       => $max + 1,
            'Activo'      => 'S',
        ];

        if ($request->hasFile('image')) {
            $data['url_imagen'] = $request->file('image')->store('storage_/nosotros_producto', 'public_imagenes');
        }

        $item = WebNosotrosProducto::create($data);

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function actualizar_producto(Request $request): JsonResponse
    {
        $request->validate([
            'id'     => 'required|exists:web_nosotros_producto,id',
            'titulo' => 'nullable|string|max:255',
            'image'  => 'nullable|image|max:6144',
        ]);

        $item = WebNosotrosProducto::findOrFail($request->id);
        $data = [
            'titulo'      => $request->input('titulo', $item->titulo),
            'descripcion' => $request->input('descripcion', $item->descripcion),
            'btn_texto'   => $request->input('btn_texto', $item->btn_texto),
            'btn_url'     => $request->input('btn_url', $item->btn_url),
            'updated_at'  => now(),
        ];

        if ($request->hasFile('image')) {
            $this->del($item->url_imagen);
            $data['url_imagen'] = $request->file('image')->store('storage_/nosotros_producto', 'public_imagenes');
        }

        $item->update($data);

        return response()->json(['success' => true, 'result' => $item->fresh()]);
    }

    public function eliminar_producto(Request $request): JsonResponse
    {
        $item = WebNosotrosProducto::findOrFail($request->id);
        $this->del($item->url_imagen);
        $item->delete();

        return response()->json(['success' => true, 'message' => 'Eliminado']);
    }

    private function del(?string $path): void
    {
        if ($path && !str_starts_with($path, 'temp02/') && Storage::disk('public_imagenes')->exists($path)) {
            Storage::disk('public_imagenes')->delete($path);
        }
    }
}
