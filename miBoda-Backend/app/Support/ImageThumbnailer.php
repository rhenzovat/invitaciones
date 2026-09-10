<?php

namespace App\Support;

/**
 * Genera miniaturas livianas (JPEG, redimensionadas) a partir de las fotos
 * que suben los invitados a la galería, usando GD (ya viene con PHP, sin
 * dependencias nuevas). El original se guarda intacto para descarga; la
 * miniatura es solo para que la grilla de la galería no cargue cientos de
 * fotos a resolución completa.
 */
class ImageThumbnailer
{
    /**
     * @return string|null Contenido binario JPEG de la miniatura, o null si
     *                      el formato no se pudo decodificar con GD (p.ej.
     *                      HEIC sin soporte) — en ese caso hay que usar el
     *                      original tal cual.
     */
    public static function generar(string $rutaAbsolutaOriginal, int $anchoMax = 640, int $calidad = 72): ?string
    {
        if (! function_exists('imagecreatefromstring')) {
            return null;
        }

        $datos = @file_get_contents($rutaAbsolutaOriginal);
        if ($datos === false) {
            return null;
        }

        $origen = @imagecreatefromstring($datos);
        if ($origen === false) {
            return null;
        }

        $origen = self::corregirOrientacion($origen, $rutaAbsolutaOriginal);

        $anchoOriginal = imagesx($origen);
        $altoOriginal = imagesy($origen);

        if ($anchoOriginal <= $anchoMax) {
            $anchoNuevo = $anchoOriginal;
            $altoNuevo = $altoOriginal;
        } else {
            $anchoNuevo = $anchoMax;
            $altoNuevo = (int) round($altoOriginal * ($anchoMax / $anchoOriginal));
        }

        $miniatura = imagecreatetruecolor($anchoNuevo, $altoNuevo);
        // Fondo blanco por si el original tiene transparencia (PNG).
        $blanco = imagecolorallocate($miniatura, 255, 255, 255);
        imagefill($miniatura, 0, 0, $blanco);

        imagecopyresampled(
            $miniatura, $origen,
            0, 0, 0, 0,
            $anchoNuevo, $altoNuevo, $anchoOriginal, $altoOriginal
        );

        ob_start();
        imagejpeg($miniatura, null, $calidad);
        $contenido = ob_get_clean();

        imagedestroy($origen);
        imagedestroy($miniatura);

        return $contenido ?: null;
    }

    /**
     * Las fotos de celular suelen traer la orientación real en metadata EXIF
     * en vez de rotar los píxeles. Los navegadores respetan ese EXIF al
     * mostrar el <img>, pero GD lo ignora — así que sin esto, la miniatura
     * podría verse rotada aunque el original se vea bien.
     */
    private static function corregirOrientacion($imagen, string $ruta)
    {
        if (! function_exists('exif_read_data')) {
            return $imagen;
        }

        $exif = @exif_read_data($ruta);
        $orientacion = $exif['Orientation'] ?? 1;

        switch ($orientacion) {
            case 3:
                return imagerotate($imagen, 180, 0);
            case 6:
                return imagerotate($imagen, -90, 0);
            case 8:
                return imagerotate($imagen, 90, 0);
            default:
                return $imagen;
        }
    }
}
