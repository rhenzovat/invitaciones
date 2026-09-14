<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebEvento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WebEventoController extends Controller
{
    public function obtener(): JsonResponse
    {
        $evento = WebEvento::where('Activo', 'S')->first() ?? WebEvento::first();

        return response()->json([
            'success' => true,
            'message' => 'Datos de la invitación',
            'result' => $evento,
        ]);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $data = $request->validate([
            'novio' => 'nullable|string|max:150',
            'novia' => 'nullable|string|max:150',
            'monograma' => 'nullable|string|max:50',
            'fecha_boda' => 'nullable|date',
            'fecha_boda_texto' => 'nullable|string|max:150',
            'hero_subtitulo' => 'nullable|string|max:255',
            'hero_foto' => 'nullable|string|max:500',
            'countdown_nota_1' => 'nullable|string',
            'countdown_nota_2' => 'nullable|string',
            'invitado_por_defecto' => 'nullable|string|max:150',
            'pases_por_defecto' => 'nullable|integer|min:1|max:20',
            'capacidad_maxima' => 'nullable|integer|min:1|max:5000',

            'frase_texto' => 'nullable|string',
            'frase_referencia' => 'nullable|string|max:150',

            'envelope_verse_texto' => 'nullable|string',
            'envelope_verse_referencia' => 'nullable|string|max:150',
            'envelope_sello_img' => 'nullable|string|max:500',
            'envelope_foto1' => 'nullable|string|max:500',
            'envelope_foto2' => 'nullable|string|max:500',

            'familia' => 'nullable|array',
            'ubicaciones' => 'nullable|array',
            'itinerario' => 'nullable|array',
            'historia' => 'nullable|array',
            'vestimenta_colores' => 'nullable|array',
            'regalos_transferencias' => 'nullable|array',
            'regalos_yape_plin' => 'nullable|array',

            'vestimenta_tipo' => 'nullable|string|max:100',
            'vestimenta_restriccion' => 'nullable|string|max:255',
            'vestimenta_img_novia' => 'nullable|string|max:500',
            'vestimenta_img_novio' => 'nullable|string|max:500',

            'solo_adultos_activo' => 'nullable|boolean',
            'solo_adultos_texto' => 'nullable|string',

            'foto_pareja_src' => 'nullable|string|max:500',

            'rsvp_fecha_limite' => 'nullable|string|max:100',
            'rsvp_contacto_nombre' => 'nullable|string|max:150',
            'rsvp_contacto_whatsapp' => 'nullable|string|max:30',

            'regalos_sobre_activo' => 'nullable|boolean',
            'regalos_tienda_nombre' => 'nullable|string|max:150',
            'regalos_tienda_url' => 'nullable|string|max:500',
            'regalos_direccion_fisica' => 'nullable|string|max:255',

            'video_src' => 'nullable|string|max:500',
            'video_texto' => 'nullable|string',
            'estacionamiento_texto' => 'nullable|string',

            'galeria_texto' => 'nullable|string',
            'galeria_nota' => 'nullable|string|max:255',
            'galeria_boton_subir' => 'nullable|string|max:100',
            'galeria_boton_ver' => 'nullable|string|max:100',

            'cancion_texto' => 'nullable|string',
            'cancion_label_nombre' => 'nullable|string|max:100',
            'cancion_label_genero' => 'nullable|string|max:100',
            'cancion_label_de' => 'nullable|string|max:100',
            'cancion_boton' => 'nullable|string|max:100',
            'cancion_generos' => 'nullable|array',

            'musica_src' => 'nullable|string|max:500',
            'musica_volumen' => 'nullable|numeric|min:0|max:1',

            'icono_countdown' => 'nullable|string|max:500',
            'icono_ubicaciones' => 'nullable|string|max:500',
            'icono_itinerario' => 'nullable|string|max:500',
            'icono_vestimenta' => 'nullable|string|max:500',
            'icono_rsvp' => 'nullable|string|max:500',
            'icono_regalos' => 'nullable|string|max:500',
            'icono_video' => 'nullable|string|max:500',
            'icono_galeria' => 'nullable|string|max:500',
            'icono_cancion' => 'nullable|string|max:500',
            'icono_historia' => 'nullable|string|max:500',

            'footer_texto' => 'nullable|string',

            'momento1_verso_texto' => 'nullable|string',
            'momento1_verso_referencia' => 'nullable|string|max:150',
            'momento1_foto' => 'nullable|string|max:500',
            'momento2_foto' => 'nullable|string|max:500',
            'momento2_verso_texto' => 'nullable|string',
            'momento2_verso_referencia' => 'nullable|string|max:150',
            'momento3_foto' => 'nullable|string|max:500',
        ]);

        $evento = WebEvento::where('Activo', 'S')->first() ?? WebEvento::first();

        if (! $evento) {
            $evento = new WebEvento();
            $evento->Activo = 'S';
        }

        $evento->fill($data);
        $evento->save();

        return response()->json([
            'success' => true,
            'message' => 'Invitación actualizada correctamente.',
            'result' => $evento,
        ]);
    }

    /**
     * Sube una imagen (foto de pareja, ubicación, momento, etc.) y devuelve
     * la ruta relativa para guardar en el campo correspondiente de web_evento.
     */
    public function subirImagen(Request $request): JsonResponse
    {
        $request->validate([
            'imagen' => 'required|image|mimes:jpeg,jpg,png,webp,gif,svg|max:10240',
        ]);

        $file = $request->file('imagen');
        $nombre = uniqid('evt_', true).'.'.$file->getClientOriginalExtension();
        $ruta = Storage::disk('public_imagenes')->putFileAs('storage_/evento', $file, $nombre);

        return response()->json([
            'success' => true,
            'message' => 'Imagen subida correctamente.',
            'result' => [
                'path' => $ruta,
                'url' => asset($ruta),
            ],
        ]);
    }
}
