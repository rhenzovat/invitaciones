<?php

namespace App\Support;

/**
 * URLs públicas de archivos CMS (public/storage_/ y assets temp02).
 */
class CmsStorageUrl
{
    public static function forWeb(?string $relativePath, ?string $fallbackAsset = null): string
    {
        if (empty($relativePath)) {
            return $fallbackAsset ? asset(ltrim($fallbackAsset, '/')) : '';
        }

        if (preg_match('#^https?://#i', $relativePath)) {
            return $relativePath;
        }

        $resolved = self::resolveExistingPath($relativePath);
        if ($resolved !== null) {
            return asset($resolved);
        }

        $normalized = self::normalizePath($relativePath);
        if ($normalized !== '') {
            // Ruta configurada en CMS: no volver al fallback del tema si el archivo falta
            return asset($normalized);
        }

        if ($fallbackAsset) {
            return asset(ltrim($fallbackAsset, '/'));
        }

        return '';
    }

    /** Para JSON del admin (asset con APP_URL). */
    public static function forApi(?string $relativePath): ?string
    {
        if (empty($relativePath)) {
            return null;
        }

        if (preg_match('#^https?://#i', $relativePath)) {
            return $relativePath;
        }

        $resolved = self::resolveExistingPath($relativePath);

        return asset($resolved ?? self::normalizePath($relativePath));
    }

    /** @return list<string> */
    private static function candidatePaths(string $relativePath): array
    {
        $path = self::normalizePath($relativePath);
        if ($path === '') {
            return [];
        }

        $basename = basename($path);
        $candidates = [$path];

        if (str_starts_with($path, 'storage_/slider/')) {
            $candidates[] = 'temp02/img/inicio/' . $basename;
            if (preg_match('/^(\d+)\./', $basename, $m)) {
                $ext = pathinfo($basename, PATHINFO_EXTENSION);
                $candidates[] = 'temp02/img/inicio/slider_' . $m[1] . ($ext ? '.' . $ext : '');
            }
        }

        if (str_starts_with($path, 'storage_/footer/')) {
            $ext = pathinfo($basename, PATHINFO_EXTENSION);
            foreach (['footer-central', 'logo-footer', 'logo-header'] as $name) {
                $candidates[] = 'temp02/img/inicio/' . $name . ($ext ? '.' . $ext : '');
            }
        }

        if (! str_starts_with($path, 'storage_/')) {
            $candidates[] = 'storage_/slider/' . $basename;
            $candidates[] = 'storage_/footer/' . $basename;
        }

        if (! str_starts_with($path, 'temp02/img/')) {
            $candidates[] = 'temp02/img/' . $basename;
            $candidates[] = 'temp02/img/inicio/' . $basename;
        }

        if (! str_starts_with($path, 'storage_/')) {
            $candidates[] = 'storage_/galeria_royal/' . $basename;
            $candidates[] = 'storage_/experiencias/' . $basename;
        }

        return array_values(array_unique($candidates));
    }

    private static function resolveExistingPath(string $relativePath): ?string
    {
        foreach (self::candidatePaths($relativePath) as $candidate) {
            if (is_file(public_path($candidate))) {
                return $candidate;
            }
        }

        return null;
    }

    private static function normalizePath(string $relativePath): string
    {
        return ltrim(str_replace('\\', '/', trim($relativePath)), '/');
    }
}
