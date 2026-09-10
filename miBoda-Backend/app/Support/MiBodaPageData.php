<?php

namespace App\Support;

use App\Models\MetadatosPagina;
use App\Models\WebEvento;
use App\Models\WebGaleriaFoto;

class MiBodaPageData
{
    public static function home(): array
    {
        $evento = WebEvento::where('Activo', 'S')->first();

        return [
            'metaData' => MetadatosPagina::metaVigente('web_home'),
            'evento' => $evento,
            'configJson' => self::buildConfigJson($evento),
            'videoSrc' => $evento ? self::assetUrl($evento->video_src) : null,
            'envelopeFoto1' => $evento ? self::assetUrl($evento->envelope_foto1) : null,
            'envelopeFoto2' => $evento ? self::assetUrl($evento->envelope_foto2) : null,
            'envelopeSello' => $evento ? self::assetUrl($evento->envelope_sello_img) : null,
            'momento1Foto' => $evento ? self::assetUrl($evento->momento1_foto) : null,
            'momento2Foto' => $evento ? self::assetUrl($evento->momento2_foto) : null,
            'momento3Foto' => $evento ? self::assetUrl($evento->momento3_foto) : null,
        ];
    }

    public static function galeria(): array
    {
        $evento = WebEvento::where('Activo', 'S')->first();
        $urlPublica = fn ($url) => preg_match('#^https?://#i', $url) ? $url : asset($url);
        $fotos = WebGaleriaFoto::where('Activo', 'S')->orderBy('orden')->get()
            ->map(fn ($foto) => [
                'full' => $urlPublica($foto->url_imagen),
                'thumb' => $foto->url_imagen_thumb ? $urlPublica($foto->url_imagen_thumb) : $urlPublica($foto->url_imagen),
            ])
            ->values();

        return [
            'metaData' => MetadatosPagina::metaVigente('web_galeria'),
            'fotos' => $fotos,
            'musicaSrc' => $evento ? self::assetUrl($evento->musica_src) : null,
        ];
    }

    /**
     * Reconstruye el objeto CONFIG que espera public/temp02/js/main.js,
     * a partir de la fila de web_evento. Se inyecta como JSON en el
     * layout Blade antes de cargar main.js.
     */
    public static function buildConfigJson(?WebEvento $e): array
    {
        if (! $e) {
            return [];
        }

        $ubicaciones = collect($e->ubicaciones ?? [])->map(function ($u) {
            $u['imagen'] = self::assetUrl($u['imagen'] ?? null);
            return $u;
        })->values()->all();

        $itinerario = collect($e->itinerario ?? [])->map(function ($i) {
            $i['imagen'] = self::assetUrl($i['imagen'] ?? null);
            return $i;
        })->values()->all();

        $historia = collect($e->historia ?? [])->map(function ($h) {
            $h['imagen'] = self::assetUrl($h['imagen'] ?? null);
            if (! empty($h['icono']) && self::looksLikeImagePath($h['icono'])) {
                $h['icono'] = self::assetUrl($h['icono']);
            }
            return $h;
        })->values()->all();

        return [
            'novio' => $e->novio,
            'novia' => $e->novia,
            'monograma' => $e->monograma,
            'fechaBodaISO' => optional($e->fecha_boda)->format('Y-m-d\TH:i:s'),
            'fechaBodaTexto' => $e->fecha_boda_texto,
            'invitadoPorDefecto' => $e->invitado_por_defecto,
            'pasesPorDefecto' => $e->pases_por_defecto,

            'frase' => [
                'texto' => $e->frase_texto,
                'referencia' => $e->frase_referencia,
            ],

            'familia' => $e->familia ?? [],
            'ubicaciones' => $ubicaciones,
            'itinerario' => $itinerario,
            'historia' => $historia,

            'vestimenta' => [
                'tipo' => $e->vestimenta_tipo,
                'restriccion' => $e->vestimenta_restriccion,
                'colores' => $e->vestimenta_colores ?? [],
            ],

            'soloAdultos' => [
                'activo' => (bool) $e->solo_adultos_activo,
                'texto' => $e->solo_adultos_texto,
            ],

            'rsvp' => [
                'fechaLimite' => $e->rsvp_fecha_limite,
                'contactoNombre' => $e->rsvp_contacto_nombre,
                'contactoWhatsapp' => $e->rsvp_contacto_whatsapp,
            ],

            'googleForm' => $e->google_form_rsvp ?: new \stdClass(),
            'googleFormCancion' => $e->google_form_cancion ?: new \stdClass(),
            'cloudinary' => $e->cloudinary_config ?: new \stdClass(),
            'googleFormGaleria' => $e->google_form_galeria ?: new \stdClass(),

            'regalos' => [
                'sobre' => (bool) $e->regalos_sobre_activo,
                'tienda' => [
                    'nombre' => $e->regalos_tienda_nombre,
                    'url' => $e->regalos_tienda_url,
                ],
                'transferencias' => $e->regalos_transferencias ?? [],
                'yapePlin' => $e->regalos_yape_plin ?? [],
                'direccionFisica' => $e->regalos_direccion_fisica,
            ],

            'estacionamiento' => $e->estacionamiento_texto,

            'musica' => [
                'src' => self::assetUrl($e->musica_src),
                'volumen' => (float) $e->musica_volumen,
            ],

            'fotoParejaSrc' => self::assetUrl($e->foto_pareja_src),
        ];
    }

    public static function assetUrl(?string $path): ?string
    {
        if (empty($path)) {
            return $path;
        }
        if (preg_match('#^(https?:)?//#', $path) || str_starts_with($path, '/')) {
            return $path;
        }
        // Fotos subidas desde el admin (WebEventoController::subirImagen) viven
        // en public/storage_/evento/..., no dentro de public/temp02/.
        if (str_starts_with($path, 'storage_/')) {
            return asset($path);
        }

        return asset('temp02/'.$path);
    }

    /**
     * Distingue una ruta/URL de imagen (ícono subido, ej. Flaticon) de un
     * simple carácter emoji guardado directamente en el campo "icono".
     */
    private static function looksLikeImagePath(string $v): bool
    {
        return (bool) preg_match('#^(https?:)?//#', $v)
            || str_starts_with($v, 'storage_/')
            || (bool) preg_match('/\.(png|jpe?g|gif|svg|webp)$/i', $v);
    }
}
