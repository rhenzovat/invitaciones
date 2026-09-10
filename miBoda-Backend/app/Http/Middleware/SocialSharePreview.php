<?php

namespace App\Http\Middleware;

use App\Support\SocialSharePreviewData;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Respuesta HTML mínima para WhatsApp / Facebook / Twitter.
 * Evita MinifyHtml, no-store y HTML pesado que rompen la vista previa.
 */
class SocialSharePreview
{
    public function handle(Request $request, Closure $next): Response
    {
        if (
            $request->isMethod('GET')
            && ! $request->is('admin', 'admin/*', 'api/*')
            && $this->isSocialCrawler($request)
        ) {
            $data = SocialSharePreviewData::forRequest($request);

            return response()
                ->view('web.social_preview', $data)
                ->header('Content-Type', 'text/html; charset=UTF-8')
                ->header('Cache-Control', 'public, max-age=86400');
        }

        $response = $next($request);

        if ($this->isSocialCrawler($request) && $response->isSuccessful()) {
            $response->headers->set('Cache-Control', 'public, max-age=86400');
            $response->headers->remove('Pragma');
        }

        return $response;
    }

    private function isSocialCrawler(Request $request): bool
    {
        $ua = strtolower($request->userAgent() ?? '');

        foreach ([
            'facebookexternalhit',
            'facebot',
            'whatsapp',
            'twitterbot',
            'linkedinbot',
            'telegrambot',
            'slackbot',
            'discordbot',
            'googlebot',
        ] as $bot) {
            if (str_contains($ua, $bot)) {
                return true;
            }
        }

        return false;
    }
}
