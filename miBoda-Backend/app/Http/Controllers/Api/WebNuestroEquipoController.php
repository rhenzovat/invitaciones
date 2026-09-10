<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebNuestroEquipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebNuestroEquipoController extends Controller
{
    public function listar()
    {
        $config   = WebNuestroEquipo::orderBy('id_miembro')->first();
        $miembros = WebNuestroEquipo::where('Activo', 'S')->orderBy('orden')->get();

        return response()->json([
            'result' => [
                'seccion' => [
                    'badge_texto'    => $config->seccion_badge  ?? 'Manos que escuchan',
                    'titulo_seccion' => $config->seccion_titulo ?? 'Manos especialistas',
                ],
                'miembros' => $miembros,
            ],
        ]);
    }

    public function actualizar_seccion(Request $request)
    {
        $first = WebNuestroEquipo::orderBy('id_miembro')->first();
        if ($first) {
            $first->update([
                'seccion_badge'  => $request->input('badge_texto'),
                'seccion_titulo' => $request->input('titulo_seccion'),
            ]);
        }
        return response()->json(['result' => true]);
    }

    public function crear(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ]);

        DB::beginTransaction();
        try {
            $urlImagen = null;
            if ($request->hasFile('image')) {
                $urlImagen = $request->file('image')->store('storage_/nuestro_equipo', 'public_imagenes');
            }

            $miembro = WebNuestroEquipo::create([
                'cargo'        => $request->input('cargo'),
                'titulo'       => $request->input('titulo'),
                'descripcion'  => $request->input('descripcion'),
                'url_facebook' => $request->input('url_facebook'),
                'url_whatsapp' => $request->input('url_whatsapp'),
                'url_imagen'   => $urlImagen,
                'orden'        => (int) $request->input('orden', 99),
                'Activo'       => 'S',
            ]);

            DB::commit();
            return response()->json(['result' => $miembro]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error crear miembro equipo: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al crear el miembro.'], 500);
        }
    }

    public function actualizar(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        ]);

        DB::beginTransaction();
        try {
            $miembro = WebNuestroEquipo::findOrFail($request->input('id_miembro'));

            $updateData = [
                'cargo'        => $request->input('cargo'),
                'titulo'       => $request->input('titulo'),
                'descripcion'  => $request->input('descripcion'),
                'url_facebook' => $request->input('url_facebook'),
                'url_whatsapp' => $request->input('url_whatsapp'),
                'orden'        => (int) $request->input('orden', 99),
            ];

            if ($request->hasFile('image')) {
                if ($miembro->url_imagen && Storage::disk('public_imagenes')->exists($miembro->url_imagen)) {
                    Storage::disk('public_imagenes')->delete($miembro->url_imagen);
                }
                $updateData['url_imagen'] = $request->file('image')->store('storage_/nuestro_equipo', 'public_imagenes');
            }

            $miembro->update($updateData);
            $miembro->refresh();
            DB::commit();
            return response()->json(['result' => $miembro]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error actualizar miembro equipo: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al actualizar el miembro.'], 500);
        }
    }

    public function eliminar(Request $request)
    {
        $miembro = WebNuestroEquipo::findOrFail($request->input('id_miembro'));
        if ($miembro->url_imagen && Storage::disk('public_imagenes')->exists($miembro->url_imagen)) {
            Storage::disk('public_imagenes')->delete($miembro->url_imagen);
        }
        $miembro->delete();
        return response()->json(['result' => true]);
    }
}
