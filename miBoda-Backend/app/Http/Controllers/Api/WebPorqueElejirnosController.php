<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPorqueElejirnos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WebPorqueElejirnosController extends Controller
{
    public function obtener()
    {
        $data = WebPorqueElejirnos::where('Activo', 'S')->first();
        return response()->json(['result' => $data]);
    }

    public function actualizar(Request $request)
    {
        $request->validate([
            'image_izquierda'  => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:3072',
            'image_centro'     => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:3072',
            'url_imagen_fondo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:6144',
        ]);

        DB::beginTransaction();
        try {
            $data = WebPorqueElejirnos::firstOrCreate(['id_porque' => 1]);

            $beneficios = $request->input('beneficios');
            if (is_string($beneficios)) {
                $beneficios = json_decode($beneficios, true) ?? [];
            }

            $updateData = [
                'badge_texto'  => $request->input('badge_texto'),
                'titulo'       => $request->input('titulo'),
                'descripcion'  => $request->input('descripcion'),
                'beneficios'   => $beneficios ?? [],
                'stat1_numero' => (int) $request->input('stat1_numero', 0),
                'stat1_sufijo' => $request->input('stat1_sufijo', '+'),
                'stat1_texto'  => $request->input('stat1_texto'),
                'stat2_numero' => (int) $request->input('stat2_numero', 0),
                'stat2_sufijo' => $request->input('stat2_sufijo', '%'),
                'stat2_texto'  => $request->input('stat2_texto'),
                'stat3_numero' => (int) $request->input('stat3_numero', 0),
                'stat3_sufijo' => $request->input('stat3_sufijo', 'S/.'),
                'stat3_texto'  => $request->input('stat3_texto'),
                'updated_at'   => now(),
            ];

            // Imagen izquierda (foto del equipo)
            if ($request->hasFile('image_izquierda')) {
                if ($data->url_imagen_izquierda && Storage::disk('public_imagenes')->exists($data->url_imagen_izquierda)) {
                    Storage::disk('public_imagenes')->delete($data->url_imagen_izquierda);
                }
                $updateData['url_imagen_izquierda'] = $request->file('image_izquierda')
                    ->store('storage_/porque_elejirnos', 'public_imagenes');
            }

            // Imagen centro (foto principal)
            if ($request->hasFile('image_centro')) {
                if ($data->url_imagen_centro && Storage::disk('public_imagenes')->exists($data->url_imagen_centro)) {
                    Storage::disk('public_imagenes')->delete($data->url_imagen_centro);
                }
                $updateData['url_imagen_centro'] = $request->file('image_centro')
                    ->store('storage_/porque_elejirnos', 'public_imagenes');
            }

            if ($request->hasFile('url_imagen_fondo')) {
                $oldFondo = $data->url_imagen_fondo ?? '';
                if ($oldFondo && !str_starts_with($oldFondo, 'temp02/') && Storage::disk('public_imagenes')->exists($oldFondo)) {
                    Storage::disk('public_imagenes')->delete($oldFondo);
                }
                $updateData['url_imagen_fondo'] = $request->file('url_imagen_fondo')
                    ->store('storage_/porque_elejirnos', 'public_imagenes');
            }

            $data->update($updateData);
            $data->refresh();
            DB::commit();

            return response()->json([
                'success' => true,
                'result'  => $data,
                'message' => 'Actualizado correctamente',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al actualizar porque_elejirnos: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al actualizar.'], 500);
        }
    }
}
