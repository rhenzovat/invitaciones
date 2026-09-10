<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebCancionSugerencia;
use App\Models\WebEvento;
use App\Models\WebGaleriaFoto;
use App\Models\WebInvitado;
use App\Models\WebRsvpRespuesta;
use App\Support\ImageThumbnailer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * Endpoints públicos (sin auth) para los formularios de la invitación:
 * RSVP, sugerencia de canción y subida de fotos a la galería.
 * Protegidos por throttle en las rutas (ver routes/api.php).
 */
class MiBodaPublicController extends Controller
{
    public function rsvp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:200',
            'apellidos' => 'required|string|max:200',
            'acompanante' => 'nullable|string|max:200',
            'confirma' => 'required|in:si,no',
        ]);

        $nombreCompleto = trim($data['nombre'].' '.$data['apellidos']);

        $invitado = $this->coincideConInvitado($data['nombre'], $data['apellidos']);
        if (! $invitado) {
            return response()->json([
                'success' => false,
                'message' => 'No encontramos tu nombre en la lista de invitados. Verifica que lo escribiste igual que en la invitación, o contáctanos por WhatsApp.',
            ], 422);
        }

        if (WebRsvpRespuesta::where('id_invitado', $invitado->id_invitado)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Ya registramos tu confirmación anteriormente. Si necesitas corregir algo, contáctanos por WhatsApp.',
            ], 422);
        }

        WebRsvpRespuesta::create([
            'nombre' => $nombreCompleto,
            'acompanante' => $data['acompanante'] ?? null,
            'asistira' => $data['confirma'] === 'si' ? 'S' : 'N',
            'id_invitado' => $invitado->id_invitado,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Confirmación registrada correctamente.',
        ]);
    }

    private function normalizar(string $s): string
    {
        $s = mb_strtolower(trim($s));
        $s = preg_replace('/\s+/', ' ', $s);
        $map = ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ñ' => 'n'];

        return strtr($s, $map);
    }

    /**
     * Coincidencia flexible: basta con que el nombre de pila coincida con el
     * primer token del invitado en la lista, y que al menos una palabra de
     * los apellidos ingresados aparezca entre el resto de sus tokens — así
     * "Renzo Vargas" o "Renzo Tenorio" coinciden con "Renzo Vargas Tenorio".
     */
    private function coincideConInvitado(string $nombre, string $apellidos): ?WebInvitado
    {
        $nombreN = $this->normalizar($nombre);
        $apellidosTokens = array_filter(explode(' ', $this->normalizar($apellidos)));
        if ($nombreN === '' || empty($apellidosTokens)) {
            return null;
        }

        foreach (WebInvitado::where('Activo', 'S')->get() as $inv) {
            $tokens = array_values(array_filter(explode(' ', $this->normalizar($inv->nombre))));
            if (empty($tokens) || $tokens[0] !== $nombreN) {
                continue;
            }
            $restantes = array_slice($tokens, 1);
            foreach ($apellidosTokens as $ap) {
                if (in_array($ap, $restantes, true)) {
                    return $inv;
                }
            }
        }

        return null;
    }

    public function cancion(Request $request): JsonResponse
    {
        $evento = WebEvento::where('Activo', 'S')->first();
        $generos = $evento->cancion_generos ?? [];

        $data = $request->validate([
            'cancion' => 'required|string|max:200',
            'genero' => ['required', 'string', Rule::in($generos)],
            'de' => 'nullable|string|max:200',
        ]);

        WebCancionSugerencia::create([
            'nombre_cancion' => $data['cancion'],
            'genero' => $data['genero'],
            'nombre_invitado' => $data['de'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sugerencia registrada correctamente.',
        ]);
    }

    public function galeriaUpload(Request $request): JsonResponse
    {
        $request->validate([
            'fotos' => 'required|array|min:1|max:10',
            'fotos.*' => 'image|mimes:jpeg,jpg,png,webp,heic,heif|max:15360',
        ]);

        $maxOrden = (int) (WebGaleriaFoto::max('orden') ?? 0);
        $guardadas = [];

        foreach ($request->file('fotos') as $file) {
            $nombre = uniqid('foto_', true).'.'.$file->getClientOriginalExtension();
            $ruta = Storage::disk('public_imagenes')->putFileAs('storage_/galeria_boda', $file, $nombre);

            // Miniatura liviana para la grilla de la galería; si el formato
            // no se puede procesar con GD (p.ej. HEIC), se usa el original.
            $rutaThumb = null;
            $miniatura = ImageThumbnailer::generar($file->getRealPath());
            if ($miniatura !== null) {
                $nombreThumb = 'thumb_'.$nombre.'.jpg';
                $rutaThumb = Storage::disk('public_imagenes')->put('storage_/galeria_boda/thumbs/'.$nombreThumb, $miniatura)
                    ? 'storage_/galeria_boda/thumbs/'.$nombreThumb
                    : null;
            }

            $foto = WebGaleriaFoto::create([
                'url_imagen' => $ruta,
                'url_imagen_thumb' => $rutaThumb,
                'orden' => ++$maxOrden,
                'Activo' => 'S',
            ]);

            $guardadas[] = asset($foto->url_imagen);
        }

        return response()->json([
            'success' => true,
            'message' => 'Fotos subidas correctamente. ¡Gracias por compartir!',
            'result' => $guardadas,
        ]);
    }
}
