<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebAbout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class WebAboutController extends Controller
{
    public function obtener(Request $request): JsonResponse
    {
        $id = $request->id;
        $result = DB::select('select * from web_about where id_about = ?', [$id]);

        return response()->json([
            'success' => true,
            'message' => 'Obtener registros!',
            'result'  => $result,
        ]);
    }

    public function listar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result'  => WebAbout::orderBy('id_about', 'ASC')->get(),
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'id_about'    => 'required|exists:web_about,id_about',
            'titulo'      => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'image2'      => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'banner_image'=> 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $webAbout = WebAbout::findOrFail($request->id_about);

        DB::beginTransaction();

        try {
            $dataToUpdate = ['updated_at' => now()];

            foreach (['titulo', 'descripcion', 'subtitulo', 'lema_label', 'lema_texto', 'texto_extendido', 'btn_texto', 'btn_url', 'banner_titulo', 'banner_subtitulo'] as $field) {
                if ($request->has($field)) {
                    $dataToUpdate[$field] = $request->input($field);
                }
            }

            // El admin edita lema_label; la web pública usa subtitulo en el partial.
            if ($request->has('lema_label') && !$request->has('subtitulo')) {
                $dataToUpdate['subtitulo'] = $request->input('lema_label');
            }

            // Recuadro estadístico (ej. "100%" + "Soin dédié · Atención con reserva").
            foreach (['stat_valor', 'stat_etiqueta'] as $field) {
                if ($request->has($field) && Schema::hasColumn('web_about', $field)) {
                    $dataToUpdate[$field] = $request->input($field);
                }
            }

            // Bloque CTA final de la página "Quiénes Somos".
            foreach (['cta_eyebrow', 'cta_titulo', 'cta_descripcion', 'cta_btn_texto', 'cta_btn_url'] as $field) {
                if ($request->has($field) && Schema::hasColumn('web_about', $field)) {
                    $dataToUpdate[$field] = $request->input($field);
                }
            }

            // Lista de checks: se recibe como JSON de strings desde el admin.
            if ($request->has('bullets') && Schema::hasColumn('web_about', 'bullets')) {
                $raw = $request->input('bullets');
                $decoded = is_array($raw) ? $raw : json_decode((string) $raw, true);
                $clean = array_values(array_filter(
                    array_map(fn ($b) => trim((string) (is_array($b) ? ($b['texto'] ?? '') : $b)), is_array($decoded) ? $decoded : []),
                    fn ($b) => $b !== ''
                ));
                $dataToUpdate['bullets'] = json_encode($clean, JSON_UNESCAPED_UNICODE);
            }

            if ($request->has('url_video') && Schema::hasColumn('web_about', 'url_video')) {
                $dataToUpdate['url_video'] = $request->input('url_video');
            }

            if ($request->has('mostrar_video') && Schema::hasColumn('web_about', 'mostrar_video')) {
                $dataToUpdate['mostrar_video'] = $request->boolean('mostrar_video') ? 1 : 0;
            }

            if ($request->has('Activo')) {
                $dataToUpdate['Activo'] = $request->input('Activo');
            }

            if ($request->hasFile('banner_image')) {
                if ($webAbout->banner_url_imagen && Storage::disk('public_imagenes')->exists($webAbout->banner_url_imagen)) {
                    Storage::disk('public_imagenes')->delete($webAbout->banner_url_imagen);
                }
                $dataToUpdate['banner_url_imagen'] = $request->file('banner_image')->store('storage_/about', 'public_imagenes');
            }

            if ($request->hasFile('image')) {
                if ($webAbout->url_imagen && Storage::disk('public_imagenes')->exists($webAbout->url_imagen)) {
                    Storage::disk('public_imagenes')->delete($webAbout->url_imagen);
                }
                $dataToUpdate['url_imagen'] = $request->file('image')->store('storage_/about', 'public_imagenes');
            }

            if ($request->hasFile('image2') && Schema::hasColumn('web_about', 'url_imagen_2')) {
                if ($webAbout->url_imagen_2 && Storage::disk('public_imagenes')->exists($webAbout->url_imagen_2)) {
                    Storage::disk('public_imagenes')->delete($webAbout->url_imagen_2);
                }
                $dataToUpdate['url_imagen_2'] = $request->file('image2')->store('storage_/about', 'public_imagenes');
            }

            $webAbout->update($dataToUpdate);
            $webAbout->refresh();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registro actualizado correctamente.',
                'result'  => $webAbout,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar web_about: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al actualizar el registro.',
            ], 500);
        }
    }
}
