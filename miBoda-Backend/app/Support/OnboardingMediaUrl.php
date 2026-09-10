<?php

namespace App\Support;

use App\Models\CampusOnboardingLink;
use Illuminate\Support\Facades\Storage;

/**
 * URLs públicas de archivos onboarding vía API (no dependen de public/storage symlink).
 */
class OnboardingMediaUrl
{
    public static function base(): string
    {
        return rtrim(config('app.url'), '/') . '/api/public/onboarding';
    }

    public static function pago(string $token, string $storagePathOrFilename): string
    {
        $filename = basename($storagePathOrFilename);

        return self::base() . '/' . $token . '/media/pago/' . rawurlencode($filename);
    }

    public static function cliente(string $token, ?string $version = null): string
    {
        $url = self::base() . '/' . $token . '/media/cliente';
        if ($version !== null && $version !== '') {
            $url .= '?v=' . rawurlencode($version);
        }

        return $url;
    }

    public static function qr(string $token): string
    {
        return self::base() . '/' . $token . '/media/qr';
    }

    /** Versión cache-bust basada en mtime del archivo en disco. */
    public static function versionDesdePath(?string $storagePath): ?string
    {
        if (!$storagePath || !Storage::disk('public')->exists($storagePath)) {
            return null;
        }

        return (string) Storage::disk('public')->lastModified($storagePath);
    }

    public static function urlImagenCliente(CampusOnboardingLink $link): ?string
    {
        if (!$link->form_imagen_path) {
            return null;
        }

        return self::cliente($link->token, self::versionDesdePath($link->form_imagen_path));
    }

    /** @return list<array{url: string, filename: string}> */
    public static function listarComprobantesPago(string $token, array $storagePaths): array
    {
        return array_map(fn (string $path) => [
            'url'      => self::pago($token, $path),
            'filename' => basename($path),
        ], $storagePaths);
    }
}
