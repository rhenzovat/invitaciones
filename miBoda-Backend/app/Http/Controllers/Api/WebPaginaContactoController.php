<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebContactoColumna;
use App\Models\WebPaginaContacto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WebPaginaContactoController extends Controller
{
    public function obtener(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'OK',
            'result'  => [
                'pagina'   => WebPaginaContacto::first(),
                'columnas' => WebContactoColumna::where('Activo', 'S')->orderBy('orden')->get(),
            ],
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $pagina = WebPaginaContacto::firstOrCreate(['id' => 1]);

        $fields = [
            'banner_titulo', 'form_titulo', 'form_subtitulo', 'form_descripcion',
            'btn_texto',
            'mapa_embed_url', 'info_titulo', 'info_texto',
            'telefono_etiqueta', 'telefonos_texto', 'telefono',
            'email_etiqueta', 'emails_texto', 'email',
            'ubicacion_etiqueta', 'ubicacion',
            'horario_etiqueta', 'horario_linea1', 'horario_linea2', 'horario_dias',
            'productos_placeholder',
            'suscribe_titulo', 'suscribe_texto', 'suscribe_placeholder',
            'frase_texto',
        ];

        $data = [];
        foreach ($fields as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        if ($request->hasFile('image')) {
            $this->del($pagina->url_imagen_form);
            $data['url_imagen_form'] = $request->file('image')->store('storage_/pagina_contacto', 'public_imagenes');
        }
        if ($request->hasFile('banner_image')) {
            $this->del($pagina->banner_url_imagen);
            $data['banner_url_imagen'] = $request->file('banner_image')->store('storage_/pagina_banner', 'public_imagenes');
        }

        if ($data !== []) {
            $pagina->update($data);
        }

        return response()->json([
            'success' => true,
            'message' => 'Contacto actualizado',
            'result'  => [
                'pagina'   => $pagina->fresh(),
                'columnas' => WebContactoColumna::where('Activo', 'S')->orderBy('orden')->get(),
            ],
        ]);
    }

    public function crear_columna(Request $request): JsonResponse
    {
        $request->validate([
            'titulo'      => 'required|string|max:500',
            'descripcion' => 'nullable|string',
            'icono'       => 'nullable|string|max:100',
        ]);
        $max = WebContactoColumna::max('orden') ?? 0;
        $item = WebContactoColumna::create([
            'titulo'      => $request->titulo,
            'descripcion' => $request->descripcion,
            'icono'       => $request->icono,
            'orden'       => $max + 1,
            'Activo'      => 'S',
        ]);

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function actualizar_columna(Request $request): JsonResponse
    {
        $request->validate([
            'id'          => 'required|exists:web_contacto_columna,id',
            'titulo'      => 'required|string|max:500',
            'descripcion' => 'nullable|string',
            'icono'       => 'nullable|string|max:100',
        ]);
        $item = WebContactoColumna::findOrFail($request->id);
        $item->update($request->only(['titulo', 'descripcion', 'icono']));

        return response()->json(['success' => true, 'result' => $item]);
    }

    public function eliminar_columna(Request $request): JsonResponse
    {
        $id = $request->input('id') ?? $request->query('id');
        WebContactoColumna::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Eliminado']);
    }

    private function del(?string $path): void
    {
        if ($path && !str_starts_with($path, 'temp02/') && Storage::disk('public_imagenes')->exists($path)) {
            Storage::disk('public_imagenes')->delete($path);
        }
    }
}
