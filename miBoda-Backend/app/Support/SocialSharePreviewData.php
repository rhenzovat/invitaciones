<?php

namespace App\Support;

use App\Helpers\Helper;
use App\Models\MetadatosPagina;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SocialSharePreviewData
{
    public static function forRequest(Request $request): array
    {
        $slug = self::pageSlug($request);
        $meta = MetadatosPagina::metaVigente($slug);

        $title = self::cleanText(
            $meta?->titulo_pagina
            ?? 'Royal Sensory Experience Massage | Masajes para mujeres en Lima'
        );

        $description = self::cleanText(
            $meta?->descripcion_pagina
            ?? 'Masajes para mujeres en Surco, Lima. Royal Sensory Experience Massage — relajación profunda, tacto consciente y bienestar en espacio privado.'
        );

        if (strlen($description) > 200) {
            $description = Str::limit($description, 197, '…');
        }

        return [
            'title' => $title,
            'description' => $description,
            'image' => Helper::siteOgImageUrl(),
            'url' => Helper::canonicalShareUrl(),
            'siteName' => 'Royal Sensory Experience Massage',
            'favicon' => Helper::siteFaviconUrl('favicon.ico'),
            'appleTouch' => Helper::siteFaviconUrl('apple-touch-icon.png'),
        ];
    }

    private static function pageSlug(Request $request): string
    {
        $path = trim($request->path(), '/');

        return match ($path) {
            '', 'home' => 'home',
            'nosotros' => 'nosotros',
            'masajes', 'servicios' => 'servicios',
            'experiencias' => 'experiencias',
            'galeria' => 'galeria',
            'contacto' => 'contacto',
            'politicas', 'politica-privacidad' => 'politicas',
            'terminos', 'terminos-condiciones' => 'terminos',
            default => 'home',
        };
    }

    private static function cleanText(?string $text): string
    {
        $text = html_entity_decode(strip_tags((string) $text), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim(preg_replace('/\s+/u', ' ', $text) ?? '');
    }
}
