<?php

namespace App\Http\Middleware;

use App\Helpers\Helper;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Colapsa URLs con doble barra (//) a la canónica.
 * WhatsApp cachea por separado .com, .com/ y .com// — la variante // es la única
 * distinguible en HTTP además del string que pega el usuario.
 */
class CanonicalHomeRedirect
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->isMethod('GET') || $request->is('admin', 'admin/*', 'api/*')) {
            return $next($request);
        }

        $pathInfo = $request->getPathInfo();
        $canonical = Helper::publicBaseUrl();

        // Colapsa dobles barras en cualquier ruta
        if (str_contains($pathInfo, '//')) {
            $cleanPath = preg_replace('#/+#', '/', $pathInfo) ?: '/';
            $target = $cleanPath === '/' ? $canonical : $canonical . $cleanPath;

            return redirect($target, 301);
        }

        return $next($request);
    }
}
