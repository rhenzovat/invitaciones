<?php

namespace App\Http\Middleware;

use Closure;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
class ForceUtf8Middleware
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        // Excluir binarios, PDFs y descargas (no forzar text/html)
        if ($request->is('comprobantes/*')
            || $request->is('cotizacion/ver/*/pdf')
            || $request->is('cotizacion/ver/*/descargar')
            || $response instanceof BinaryFileResponse) {
            return $response;
        }

        $contentType = (string) $response->headers->get('Content-Type', '');
        if (str_contains($contentType, 'application/pdf')
            || str_contains($contentType, 'application/octet-stream')
            || str_contains($contentType, 'image/')
            || str_contains($contentType, 'application/zip')) {
            return $response;
        }

        // Forzar encoding UTF-8 solo en respuestas HTML
        $response->header('Content-Type', 'text/html; charset=UTF-8');
        
        return $response;
    }
}