<?php

namespace App\Support;

/**
 * Raíz web pública: en local es laravel/public; en cPanel suele ser ../public_html.
 */
class PublicWebRoot
{
    public static function resolve(string $laravelBasePath): ?string
    {
        $fromEnv = self::readEnv('PUBLIC_WEB_ROOT');
        if ($fromEnv !== null && is_dir($fromEnv)) {
            return realpath($fromEnv) ?: $fromEnv;
        }

        return self::detectCpanelPublicHtml($laravelBasePath);
    }

    private static function readEnv(string $key): ?string
    {
        if (! empty($_ENV[$key]) && is_string($_ENV[$key])) {
            return rtrim($_ENV[$key], "/\\");
        }

        $value = getenv($key);
        if ($value !== false && $value !== '') {
            return rtrim((string) $value, "/\\");
        }

        return null;
    }

    /** cPanel: carpetas hermanas laravel/ y public_html/ */
    private static function detectCpanelPublicHtml(string $laravelBasePath): ?string
    {
        $candidate = dirname($laravelBasePath) . DIRECTORY_SEPARATOR . 'public_html';
        if (! is_dir($candidate)) {
            return null;
        }

        $indexFile = $candidate . DIRECTORY_SEPARATOR . 'index.php';
        if (! is_file($indexFile)) {
            return null;
        }

        $index = @file_get_contents($indexFile) ?: '';
        if (! preg_match('#\.\./laravel|laravel/vendor#', $index)) {
            return null;
        }

        return realpath($candidate) ?: $candidate;
    }
}
