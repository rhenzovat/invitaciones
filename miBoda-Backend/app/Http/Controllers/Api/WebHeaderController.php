<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebHeader;
use App\Support\SparlexPageData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WebHeaderController extends Controller
{
    public function obtener()
    {
        $data = WebHeader::find(1) ?? WebHeader::where('Activo', 'S')->first();

        if ($data && ! empty($data->redes_side)) {
            $data->redes_side = SparlexPageData::normalizeRedesList($data->redes_side);
        }

        return response()->json(['result' => $data]);
    }

    public function actualizar(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        DB::beginTransaction();
        try {
            $data = WebHeader::firstOrCreate(
                ['id_header' => 1],
                [
                    'Activo'          => 'S',
                    'url_logo'        => 'storage_/header/logo-amour-spa.png',
                    'nav_items'       => [],
                    'telefono_label'  => 'Llámanos:',
                    'telefono_numero' => '',
                    'telefono_href'   => '',
                    'btn_texto'       => '',
                ]
            );

            $updateData = ['updated_at' => now()];

            if ($request->has('nav_items')) {
                $navItems = $request->input('nav_items');
                if (is_string($navItems)) {
                    $navItems = json_decode($navItems, true) ?? [];
                }
                $updateData['nav_items'] = $navItems ?? [];
            }

            $mensajeCentro = $this->firstInput($request, [
                'topbar_mensaje_centro', 'topbar_ubicacion', 'top_ubicacion',
            ]);
            if ($mensajeCentro !== null) {
                $updateData['topbar_mensaje_centro'] = $mensajeCentro;
                $updateData['top_ubicacion']         = $mensajeCentro;
            }

            $waNumero = $this->firstInput($request, ['topbar_wa_numero', 'telefono_numero']);
            if ($waNumero !== null) {
                $updateData['topbar_wa_numero'] = $waNumero;
            }

            $waHref = $this->firstInput($request, ['topbar_wa_href', 'url_whatsapp_top']);
            if ($waHref !== null) {
                $updateData['url_whatsapp_top'] = $waHref;
            }

            foreach (['topbar_bgcolor', 'nav_bgcolor', 'nav_link_color', 'topbar_btn_bgcolor'] as $colorField) {
                if ($request->has($colorField)) {
                    $updateData[$colorField] = $request->input($colorField);
                }
            }

            foreach ([
                'top_email'            => ['topbar_correo', 'top_email'],
                'top_telefonos'        => ['topbar_celular', 'top_telefonos'],
                'url_contacto_top'     => ['topbar_cta_href', 'url_contacto_top'],
                'topbar_wa_texto'      => ['topbar_wa_texto'],
                'topbar_cta_texto'     => ['topbar_cta_texto'],
                'telefono_label'       => ['telefono_label'],
                'telefono_numero'      => ['telefono_numero'],
                'telefono_href'        => ['telefono_href'],
                'btn_texto'            => ['btn_texto'],
                'etiqueta_hero_lateral'=> ['etiqueta_hero_lateral'],
                'btn_visitanos_texto'  => ['btn_visitanos_texto'],
                'btn_visitanos_url'    => ['btn_visitanos_url'],
                'btn_eventos_texto'    => ['btn_eventos_texto'],
                'btn_eventos_url'      => ['btn_eventos_url'],
            ] as $column => $keys) {
                $value = $this->firstInput($request, $keys);
                if ($value !== null) {
                    $updateData[$column] = $value;
                }
            }

            if ($request->has('side_menu_enlaces')) {
                $val = $request->input('side_menu_enlaces');
                if (is_string($val)) {
                    $val = json_decode($val, true) ?? [];
                }
                $updateData['side_menu_enlaces'] = $val ?? [];
            }

            foreach (['redes_side', 'topbar_redes'] as $jsonField) {
                if (! $request->has($jsonField)) {
                    continue;
                }
                $val = $request->input($jsonField);
                if (is_string($val)) {
                    $val = json_decode($val, true) ?? [];
                }
                $updateData['redes_side'] = SparlexPageData::normalizeRedesList($val ?? []);
                break;
            }

            if ($request->hasFile('image')) {
                if ($data->url_logo && Storage::disk('public_imagenes')->exists($data->url_logo)) {
                    Storage::disk('public_imagenes')->delete($data->url_logo);
                }
                $path = $request->file('image')->store('storage_/header', 'public_imagenes');
                $updateData['url_logo'] = $path;
            }

            $data->update($updateData);
            $data->refresh();
            DB::commit();

            return response()->json([
                'success' => true,
                'result'  => $data,
                'message' => 'Header actualizado correctamente',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al actualizar header: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Error al actualizar el header.'], 500);
        }
    }

    /** Primer valor presente en el request; null si ninguna clave fue enviada. */
    private function firstInput(Request $request, array $keys): mixed
    {
        foreach ($keys as $key) {
            if ($request->has($key)) {
                return $request->input($key);
            }
        }
        return null;
    }
}
