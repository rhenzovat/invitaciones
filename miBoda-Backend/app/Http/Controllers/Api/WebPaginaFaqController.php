<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPaginaFaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WebPaginaFaqController extends Controller
{
    /**
     * Obtener la configuración de la página FAQ
     */
    public function obtener()
    {
        $pagina = WebPaginaFaq::first() ?? WebPaginaFaq::create([
            'intro_label' => 'Antes de su visita',
            'titulo' => 'Preguntas frecuentes · Amour Spa',
            'subtitulo' => 'Todo lo esencial antes de cruzar nuestro umbral en Diez Canseco.',
            'url_imagen' => 'temp02/assets/images/inicio/preguntas.jfif',
        ]);

        return response()->json([
            'success' => true,
            'result' => $pagina,
        ]);
    }

    /**
     * Actualizar la configuración de la página FAQ
     */
    public function actualizar(Request $request)
    {
        $request->validate([
            'intro_label' => 'sometimes|nullable|string|max:255',
            'titulo'      => 'sometimes|nullable|string|max:255',
            'subtitulo'   => 'sometimes|nullable|string|max:500',
            'imagen'      => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,jfif|max:6144',
        ]);

        $pagina = WebPaginaFaq::first() ?? WebPaginaFaq::create([
            'intro_label' => 'Antes de su visita',
            'titulo'      => 'Preguntas frecuentes · Amour Spa',
            'subtitulo'   => 'Todo lo esencial antes de cruzar nuestro umbral en Diez Canseco.',
            'url_imagen'  => 'temp02/assets/images/inicio/preguntas.jfif',
        ]);

        $data = [];
        foreach (['intro_label', 'titulo', 'subtitulo'] as $f) {
            if ($request->has($f)) {
                $data[$f] = $request->input($f);
            }
        }

        if ($request->hasFile('imagen')) {
            if ($pagina->url_imagen
                && !str_starts_with($pagina->url_imagen, 'temp02/')
                && Storage::disk('public_imagenes')->exists($pagina->url_imagen)) {
                Storage::disk('public_imagenes')->delete($pagina->url_imagen);
            }
            $data['url_imagen'] = $request->file('imagen')->store('storage_/faq', 'public_imagenes');
        }

        $pagina->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Configuración actualizada',
            'result'  => $pagina->fresh(),
        ]);
    }

    /**
     * Métodos no utilizados (API REST completa)
     */
    public function index() {}
    public function store(Request $request) {}
    public function show(string $id) {}
    public function destroy(string $id) {}
}
