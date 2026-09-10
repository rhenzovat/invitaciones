<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebTestimonios;
use App\Support\CmsStorageUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class WebTestimoniosController extends Controller
{
    public function listar(): JsonResponse
    {
        $items = WebTestimonios::orderBy('orden', 'ASC')->get()
            ->map(function ($t) {
                // Agrega URL pública absoluta para que el admin React resuelva la imagen
                if ($t->url_avatar) {
                    $t->url_avatar_publica = CmsStorageUrl::forApi($t->url_avatar);
                }
                if ($t->url_captura) {
                    $t->url_captura_publica = CmsStorageUrl::forApi($t->url_captura);
                }
                if ($t->url_imagen_lateral) {
                    $t->url_imagen_lateral_publica = CmsStorageUrl::forApi($t->url_imagen_lateral);
                }
                return $t;
            });

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result'  => $items,
        ]);
    }

    public function crear(Request $request): JsonResponse
    {
        $request->validate([
            'tipo'           => 'nullable|in:texto,captura',
            'nombre'         => 'nullable|string|max:150',
            'subtitulo'      => 'nullable|string|max:200',
            'testimonio'     => 'nullable|string',
            'calificacion'   => 'nullable|numeric|min:0|max:5',
            'badge_seccion'  => 'nullable|string|max:200',
            'seccion_titulo' => 'nullable|string|max:500',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'captura'        => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:8192',
            // 'url_link'       => 'nullable|string|max:500',
        ]);

        $tipo = $request->input('tipo', WebTestimonios::TIPO_TEXTO);
        $ref = WebTestimonios::orderBy('orden')->first();

        DB::beginTransaction();
        try {
            $maxOrden = (int) (WebTestimonios::max('orden') ?? 0);

            $data = [
                'tipo'           => $tipo,
                'badge_seccion'  => $request->input('badge_seccion', $ref?->badge_seccion),
                'seccion_titulo' => $request->input('seccion_titulo', $ref?->seccion_titulo),
                'url_link'       => $request->input('url_link') ?: null,
                'orden'          => $maxOrden + 1,
                'Activo'         => 'S',
            ];

            if ($tipo === WebTestimonios::TIPO_CAPTURA) {
                if (! $request->hasFile('captura')) {
                    DB::rollBack();

                    return response()->json([
                        'success' => false,
                        'message' => 'Debe subir una imagen de captura (WhatsApp u otra evidencia).',
                    ], 422);
                }

                $data['nombre']       = $request->input('nombre') ?: 'Evidencia WhatsApp';
                $data['subtitulo']    = $request->subtitulo;
                $data['testimonio']   = null;
                $data['calificacion'] = $request->calificacion ?? 5.0;
                $data['url_captura']  = $request->file('captura')
                    ->store('storage_/testimonios/capturas', 'public_imagenes');
                $data['url_avatar']   = null;
            } else {
                $data['nombre']       = $request->input('nombre') ?: 'Cliente Satisfecho';
                $data['subtitulo']    = $request->subtitulo;
                $data['testimonio']   = $request->testimonio;
                $data['calificacion'] = $request->calificacion ?? 4.8;

                if ($request->hasFile('image')) {
                    $data['url_avatar'] = $request->file('image')
                        ->store('storage_/testimonios', 'public_imagenes');
                }
            }

            $registro = WebTestimonios::create($data);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Testimonio creado correctamente.',
                'result'  => $registro,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al crear testimonio: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al crear el registro.',
            ], 500);
        }
    }

    public function eliminar(Request $request): JsonResponse
    {
        $request->validate([
            'id_testimonio' => 'required|exists:web_testimonios,id_testimonio',
        ]);

        $registro = WebTestimonios::findOrFail($request->id_testimonio);

        DB::beginTransaction();
        try {
            $this->eliminarArchivo($registro->url_avatar);
            $this->eliminarArchivo($registro->url_captura);
            $registro->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Testimonio eliminado correctamente.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al eliminar testimonio: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al eliminar el registro.',
            ], 500);
        }
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'id_testimonio'  => 'required|exists:web_testimonios,id_testimonio',
            'tipo'           => 'nullable|in:texto,captura',
            'nombre'         => 'nullable|string|max:150',
            'subtitulo'      => 'nullable|string|max:200',
            'testimonio'     => 'nullable|string',
            'calificacion'   => 'nullable|numeric|min:0|max:5',
            'badge_seccion'  => 'nullable|string|max:200',
            'seccion_titulo' => 'nullable|string|max:500',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:4096',
            'captura'        => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:8192',
            // 'url_link'       => 'nullable|string|max:500',
        ]);

        $registro = WebTestimonios::findOrFail($request->id_testimonio);
        $tipo = $request->input('tipo', $registro->tipo ?? WebTestimonios::TIPO_TEXTO);
        $tipoAnterior = $registro->tipo ?? WebTestimonios::TIPO_TEXTO;

        DB::beginTransaction();
        try {
            $data = [
                'tipo'           => $tipo,
                'badge_seccion'  => $request->badge_seccion,
                'seccion_titulo' => $request->seccion_titulo,
                'url_link'       => $request->input('url_link') ?: null,
                'updated_at'     => now(),
            ];

            if ($tipo === WebTestimonios::TIPO_CAPTURA) {
                $data['nombre']       = $request->input('nombre') ?: 'Evidencia WhatsApp';
                $data['subtitulo']    = $request->subtitulo;
                $data['testimonio']   = null;
                $data['calificacion'] = $request->calificacion ?? $registro->calificacion ?? 5.0;

                if ($request->hasFile('captura')) {
                    $this->eliminarArchivo($registro->url_captura);
                    $data['url_captura'] = $request->file('captura')
                        ->store('storage_/testimonios/capturas', 'public_imagenes');
                } elseif ($tipoAnterior !== WebTestimonios::TIPO_CAPTURA && empty($registro->url_captura)) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Debe subir una imagen de captura (WhatsApp u otra evidencia).',
                    ], 422);
                }

                if ($tipoAnterior === WebTestimonios::TIPO_TEXTO) {
                    $data['url_avatar'] = $registro->url_avatar;
                }
            } else {
                $data['nombre']       = $request->input('nombre') ?: 'Cliente Satisfecho';
                $data['subtitulo']    = $request->subtitulo;
                $data['testimonio']   = $request->testimonio;
                $data['calificacion'] = $request->calificacion ?? 5.0;

                if ($request->hasFile('image')) {
                    $this->eliminarArchivo($registro->url_avatar);
                    $data['url_avatar'] = $request->file('image')
                        ->store('storage_/testimonios', 'public_imagenes');
                }

                if ($tipoAnterior === WebTestimonios::TIPO_CAPTURA) {
                    $this->eliminarArchivo($registro->url_captura);
                    $data['url_captura'] = null;
                }
            }

            $registro->update($data);
            $registro->refresh();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Testimonio actualizado correctamente.',
                'result'  => $registro,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al actualizar testimonio: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al actualizar el registro.',
            ], 500);
        }
    }

    public function actualizarSeccion(Request $request): JsonResponse
    {
        $request->validate([
            'badge_seccion'      => 'nullable|string|max:200',
            'seccion_titulo'     => 'nullable|string|max:500',
            'seccion_descripcion'=> 'nullable|string|max:2000',
            'imagen_lateral'     => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:6144',
        ]);

        DB::beginTransaction();
        try {
            $data = [
                'badge_seccion'  => $request->badge_seccion,
                'seccion_titulo' => $request->seccion_titulo,
                'updated_at'     => now(),
            ];
            if (Schema::hasColumn('web_testimonios', 'seccion_descripcion')) {
                $data['seccion_descripcion'] = $request->input('seccion_descripcion');
            }
            if ($request->hasFile('imagen_lateral') && Schema::hasColumn('web_testimonios', 'url_imagen_lateral')) {
                $prev = WebTestimonios::whereNotNull('url_imagen_lateral')->value('url_imagen_lateral');
                if ($prev && !str_starts_with($prev, 'temp02/')) {
                    $this->eliminarArchivo($prev);
                }
                $data['url_imagen_lateral'] = $request->file('imagen_lateral')
                    ->store('storage_/testimonios', 'public_imagenes');
            }

            WebTestimonios::query()->update($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Encabezado actualizado en todos los registros.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al actualizar sección testimonios: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al actualizar la sección.',
            ], 500);
        }
    }

    private function eliminarArchivo(?string $ruta): void
    {
        if ($ruta && Storage::disk('public_imagenes')->exists($ruta)) {
            Storage::disk('public_imagenes')->delete($ruta);
        }
    }
}
