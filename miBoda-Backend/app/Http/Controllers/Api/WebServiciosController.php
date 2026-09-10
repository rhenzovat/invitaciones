<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Models\WebServicios;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class WebServiciosController extends Controller
{
    public function listar(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result'  => WebServicios::orderBy('orden', 'ASC')->get(),
        ]);
    }

    public function crear(Request $request): JsonResponse
    {
        $request->validate([
            'titulo'  => 'required|string|max:255',
            'image'   => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'foto'    => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
        ]);

        DB::beginTransaction();
        try {
            $maxOrden = WebServicios::max('orden') ?? 0;
            $ref = WebServicios::orderBy('id_servicio')->first();

            $data = [
                'seccion_titulo' => $request->input('seccion_titulo', $ref?->seccion_titulo),
                'titulo'         => $request->titulo,
                'subtitulo'      => $request->input('subtitulo'),
                'descripcion'    => $request->input('descripcion'),
                'btn_texto'      => $request->input('btn_texto'),
                'btn_url'        => $request->input('btn_url'),
                'orden'          => $maxOrden + 1,
                'Activo'         => 'S',
            ];

            if ($request->hasFile('image')) {
                $data['url_icono'] = $request->file('image')->store('storage_/servicios', 'public_imagenes');
            }

            if ($request->hasFile('foto')) {
                $data['url_foto'] = $request->file('foto')->store('storage_/servicios/fotos', 'public_imagenes');
            } elseif ($request->filled('url_foto_manual')) {
                $data['url_foto'] = $request->url_foto_manual;
            }

            $registro = WebServicios::create($data);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Servicio creado correctamente.',
                'result'  => $registro,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al crear servicio: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al crear el registro.'], 500);
        }
    }

    public function actualizar(Request $request): JsonResponse
    {
        $request->validate([
            'id_servicio'    => 'required|exists:web_servicios,id_servicio',
            'titulo'         => 'required|string|max:255',
            'descripcion'    => 'nullable|string',
            'seccion_titulo' => 'nullable|string|max:500',
            'subtitulo'      => 'nullable|string|max:255',
            'btn_texto'      => 'nullable|string|max:120',
            'btn_url'        => 'nullable|string|max:500',
            'image'          => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'foto'           => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,svg|max:5120',
            'url_foto_manual'=> 'nullable|string|max:500',
        ]);

        $registro = WebServicios::find($request->id_servicio);

        DB::beginTransaction();
        try {
            $data = [
                'titulo'         => $request->titulo,
                'subtitulo'      => $request->input('subtitulo', $registro->subtitulo),
                'descripcion'    => $request->descripcion,
                'seccion_titulo' => $request->seccion_titulo,
                'btn_texto'      => $request->input('btn_texto', $registro->btn_texto),
                'btn_url'        => $request->input('btn_url', $registro->btn_url),
                'updated_at'     => now(),
            ];

            if ($request->hasFile('image')) {
                if ($registro->url_icono && Storage::disk('public_imagenes')->exists($registro->url_icono)) {
                    Storage::disk('public_imagenes')->delete($registro->url_icono);
                }
                $path = $request->file('image')->store('storage_/servicios', 'public_imagenes');
                $data['url_icono'] = $path;
            }

            if ($request->hasFile('foto')) {
                $oldFoto = $registro->url_foto ?? '';
                if ($oldFoto && !str_starts_with($oldFoto, 'temp02/') && Storage::disk('public_imagenes')->exists($oldFoto)) {
                    Storage::disk('public_imagenes')->delete($oldFoto);
                }
                $path = $request->file('foto')->store('storage_/servicios/fotos', 'public_imagenes');
                $data['url_foto'] = $path;
            } elseif ($request->filled('url_foto_manual')) {
                $data['url_foto'] = $request->url_foto_manual;
            }

            $registro->update($data);
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registro actualizado correctamente.',
                'result'  => $registro,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::channel('stderr')->error('Error al actualizar servicio: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Hubo un error al actualizar el registro.',
            ], 500);
        }
    }

    public function eliminar(Request $request): JsonResponse
    {
        $request->validate(['id_servicio' => 'required|exists:web_servicios,id_servicio']);
        $registro = WebServicios::findOrFail($request->id_servicio);

        DB::beginTransaction();
        try {
            if ($registro->url_icono && Storage::disk('public_imagenes')->exists($registro->url_icono)) {
                Storage::disk('public_imagenes')->delete($registro->url_icono);
            }
            $oldFoto = $registro->url_foto ?? '';
            if ($oldFoto && !str_starts_with($oldFoto, 'temp02/') && Storage::disk('public_imagenes')->exists($oldFoto)) {
                Storage::disk('public_imagenes')->delete($oldFoto);
            }
            $registro->delete();
            DB::commit();

            return response()->json(['success' => true, 'message' => 'Servicio eliminado correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error al eliminar el registro.'], 500);
        }
    }
}
