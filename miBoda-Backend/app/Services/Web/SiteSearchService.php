<?php

namespace App\Services\Web;

use App\Models\MetadatosPagina;
use App\Models\WebAbout;
use App\Models\WebExperiencias;
use App\Models\WebPaginaGaleria;
use App\Models\WebPaginaNosotros;
use App\Models\WebPlan;
use App\Models\WebPublicaciones;
use App\Models\WebServicios;
use App\Models\WebTestimonios;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class SiteSearchService
{
    /** @var list<array{title: string, url: string, keywords: string, content: string, boost?: int}>|null */
    private ?array $index = null;

    public function findBest(string $query): array
    {
        $query = trim($query);
        if ($query === '') {
            return [
                'url'   => route('home'),
                'title' => 'Inicio',
                'score' => 0,
            ];
        }

        $best = null;
        foreach ($this->buildIndex() as $entry) {
            $score = $this->scoreEntry($entry, $query);
            if ($best === null || $score > $best['score']) {
                $best = [
                    'url'   => $entry['url'],
                    'title' => $entry['title'],
                    'score' => $score,
                ];
            }
        }

        if ($best === null || $best['score'] < 5) {
            return [
                'url'   => route('royal.masajes') . '?q=' . urlencode($query),
                'title' => 'Masajes',
                'score' => 0,
            ];
        }

        return $best;
    }

    /** @return list<array{title: string, url: string, score: int}> */
    public function findResults(string $query, int $limit = 8): array
    {
        $query = trim($query);
        if ($query === '') {
            return [];
        }

        $scored = [];
        foreach ($this->buildIndex() as $entry) {
            $score = $this->scoreEntry($entry, $query);
            if ($score >= 5) {
                $scored[] = [
                    'title' => $entry['title'],
                    'url'   => $entry['url'],
                    'score' => $score,
                ];
            }
        }

        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_slice($scored, 0, $limit);
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function buildIndex(): array
    {
        if ($this->index !== null) {
            return $this->index;
        }

        $entries = $this->staticEntries();
        $entries = array_merge($entries, $this->metadataEntries());
        $entries = array_merge($entries, $this->experienceEntries());
        $entries = array_merge($entries, $this->planEntries());
        $entries = array_merge($entries, $this->publicationEntries());
        $entries = array_merge($entries, $this->galleryEntries());
        $entries = array_merge($entries, $this->serviceEntries());
        $entries = array_merge($entries, $this->testimonialEntries());
        $entries = array_merge($entries, $this->aboutEntries());

        $this->index = $entries;

        return $this->index;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function staticEntries(): array
    {
        $home = route('home');

        $categories = [
            'tantrico'  => 'tántricas sensoriales tantra tantrico nuru',
            'bienestar' => 'bienestar femenino holístico volcánico armónico',
            'corporal'  => 'corporal renovación muscular tejido profundo piernas',
            'estetica'  => 'estética modelación reductora drenaje anticelulitis reafirmante',
        ];

        $entries = [
            [
                'title'    => 'Inicio',
                'url'      => $home,
                'keywords' => 'inicio home principal royal masajes lima',
                'content'  => 'arte sensorial único relax renew experiencia',
            ],
            [
                'title'    => 'Masajes y servicios',
                'url'      => route('royal.masajes'),
                'keywords' => 'masajes masaje servicios servicio tratamiento sesión reservar',
                'content'  => 'masajes tántricos experiencias exclusivas tipos categorías',
                'boost'    => 5,
            ],
            [
                'title'    => 'Galería',
                'url'      => route('royal.galeria'),
                'keywords' => 'galería fotos imágenes ambiente spa fotografías',
                'content'  => 'ambiente diseñado sentidos sensorial relajación',
            ],
            [
                'title'    => 'Sobre nosotros',
                'url'      => route('nosotros'),
                'keywords' => 'nosotros about equipo historia quiénes somos',
                'content'  => 'royal masajes experiencia profesional confidencial',
            ],
            [
                'title'    => 'Contacto',
                'url'      => route('contacto.pagina'),
                'keywords' => 'contacto whatsapp teléfono reservar cita agenda escribir',
                'content'  => '982 311 335 atención privada lima',
            ],
            [
                'title'    => 'Publicaciones',
                'url'      => route('publicaciones'),
                'keywords' => 'publicaciones noticias blog artículos consejos bienestar',
                'content'  => 'últimas noticias mujer profesional',
            ],
            [
                'title'    => 'Precios y planes',
                'url'      => $home . '#precios',
                'keywords' => 'precios precio plan planes tarifa tarifas costo costos paquete royal deluxe',
                'content'  => 'elige tu experiencia reservar consultar precio',
                'boost'    => 8,
            ],
            [
                'title'    => 'Servicios en inicio',
                'url'      => $home . '#servicios',
                'keywords' => 'servicios experiencias masajes tántricos mujeres relajación profunda',
                'content'  => 'nuestros servicios masajes tántricos para mujeres',
            ],
            [
                'title'    => 'Testimonios',
                'url'      => $home . '#testimonios',
                'keywords' => 'testimonios reseñas opiniones clientes experiencias',
                'content'  => 'clientas satisfechas recomendaciones',
            ],
            [
                'title'    => 'Equipo',
                'url'      => $home . '#equipo',
                'keywords' => 'equipo terapeutas staff profesionales',
                'content'  => 'nuestro equipo nuestro staff',
            ],
            [
                'title'    => 'Cotizador',
                'url'      => route('cotizador'),
                'keywords' => 'cotizador cotización presupuesto cotizar',
                'content'  => 'solicitar cotización proyecto',
            ],
            [
                'title'    => 'Términos y condiciones',
                'url'      => route('royal.terminos'),
                'keywords' => 'términos condiciones legal contrato',
                'content'  => 'términos del servicio',
            ],
            [
                'title'    => 'Política de privacidad',
                'url'      => route('royal.politicas'),
                'keywords' => 'política privacidad datos personales cookies',
                'content'  => 'protección de datos',
            ],
        ];

        foreach ($categories as $key => $keywords) {
            $entries[] = [
                'title'    => 'Categoría: ' . ucfirst($key),
                'url'      => route('royal.masajes') . '?cat=' . $key,
                'keywords' => $keywords . ' categoría ' . $key,
                'content'  => 'masajes servicios ' . $key,
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function metadataEntries(): array
    {
        if (! Schema::hasTable('metadatos_paginas')) {
            return [];
        }

        $map = [
            'home'                     => route('home'),
            'web_about'                => route('nosotros'),
            'web_servicios'            => route('royal.masajes'),
            'web_masajes'              => route('royal.masajes'),
            'web_experiencias'         => route('royal.experiencias'),
            'web_gallery'              => route('royal.galeria'),
            'web_contact'              => route('contacto.pagina'),
            'blogs'                    => route('publicaciones'),
            'web_terminos_condiciones' => route('royal.terminos'),
            'web_politica_privacidad'  => route('royal.politicas'),
        ];

        $entries = [];
        foreach ($map as $pagina => $url) {
            $meta = MetadatosPagina::metaVigente($pagina);
            if (! $meta) {
                continue;
            }
            $entries[] = [
                'title'    => (string) ($meta->titulo_pagina ?? $pagina),
                'url'      => $url,
                'keywords' => (string) ($meta->nombre_pagina ?? $pagina),
                'content'  => (string) ($meta->descripcion_pagina ?? ''),
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function experienceEntries(): array
    {
        if (! Schema::hasTable('web_experiencias')) {
            return [];
        }

        $entries = [];
        foreach (WebExperiencias::where('Activo', 'S')->orderBy('orden')->get() as $exp) {
            $entries[] = [
                'title'    => (string) ($exp->titulo ?? 'Experiencia'),
                'url'      => route('royal.masajes') . '#exp-' . $exp->id_experiencia,
                'keywords' => implode(' ', array_filter([
                    $exp->subtitulo,
                    $exp->badge,
                    $exp->duracion,
                    $exp->precio_nota,
                    $exp->categoria ?? null,
                    'masaje servicio experiencia precio',
                ])),
                'content'  => strip_tags((string) ($exp->descripcion ?? '')),
                'boost'    => 10,
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function planEntries(): array
    {
        if (! Schema::hasTable('web_planes')) {
            return [];
        }

        $entries = [];
        foreach (WebPlan::where('Activo', 'S')->orderBy('orden')->get() as $plan) {
            $chars = is_array($plan->caracteristicas)
                ? $plan->caracteristicas
                : (json_decode($plan->caracteristicas ?? '[]', true) ?: []);
            $charText = collect($chars)->map(fn ($c) => is_string($c) ? $c : ($c['texto'] ?? ''))->implode(' ');

            $entries[] = [
                'title'    => (string) ($plan->nombre ?? 'Plan'),
                'url'      => route('home') . '#precios',
                'keywords' => 'plan precio tarifa paquete ' . ($plan->precio_nota ?? ''),
                'content'  => $charText,
                'boost'    => 6,
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function publicationEntries(): array
    {
        if (! Schema::hasTable('web_publicaciones')) {
            return [];
        }

        $entries = [];
        foreach (WebPublicaciones::where('Activo', 'S')->orderBy('orden')->get() as $pub) {
            $slug = $pub->slug ?: Str::slug((string) $pub->titulo);
            $url = $slug
                ? route('publicacion.detalle', $slug)
                : route('publicaciones');

            $entries[] = [
                'title'    => (string) ($pub->titulo ?? 'Publicación'),
                'url'      => $url,
                'keywords' => implode(' ', array_filter([
                    $pub->categoria ?? null,
                    $pub->chip ?? null,
                    $pub->autor ?? null,
                    'publicación noticia blog artículo',
                ])),
                'content'  => strip_tags((string) ($pub->resumen ?? $pub->contenido ?? '')),
                'boost'    => 8,
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function galleryEntries(): array
    {
        if (! Schema::hasTable('web_pagina_galeria')) {
            return [];
        }

        $entries = [];
        foreach (WebPaginaGaleria::where('Activo', 'S')->orderBy('orden')->get() as $item) {
            $entries[] = [
                'title'    => (string) ($item->titulo_overlay ?: $item->alt_imagen ?: 'Galería'),
                'url'      => route('royal.galeria'),
                'keywords' => implode(' ', array_filter([
                    $item->categoria ?? null,
                    $item->alt_imagen ?? null,
                    'galería foto imagen spa',
                ])),
                'content'  => (string) ($item->alt_imagen ?? ''),
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function serviceEntries(): array
    {
        if (! Schema::hasTable('web_servicios')) {
            return [];
        }

        $entries = [];
        foreach (WebServicios::where('Activo', 'S')->orderBy('orden')->get() as $svc) {
            $entries[] = [
                'title'    => (string) ($svc->titulo ?? 'Servicio'),
                'url'      => route('home') . '#servicios',
                'keywords' => implode(' ', array_filter([
                    $svc->subtitulo ?? null,
                    $svc->seccion_titulo ?? null,
                    'servicio masaje',
                ])),
                'content'  => strip_tags((string) ($svc->descripcion ?? '')),
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function testimonialEntries(): array
    {
        if (! Schema::hasTable('web_testimonios')) {
            return [];
        }

        $entries = [];
        foreach (WebTestimonios::where('Activo', 'S')->orderBy('orden')->get() as $t) {
            $entries[] = [
                'title'    => (string) ($t->nombre ?? 'Testimonio'),
                'url'      => route('home') . '#testimonios',
                'keywords' => 'testimonio reseña opinión ' . ($t->subtitulo ?? ''),
                'content'  => strip_tags((string) ($t->testimonio ?? '')),
            ];
        }

        return $entries;
    }

    /** @return list<array{title: string, url: string, keywords: string, content: string, boost?: int}> */
    private function aboutEntries(): array
    {
        $entries = [];

        if (Schema::hasTable('web_pagina_nosotros')) {
            $pagina = WebPaginaNosotros::first();
            if ($pagina) {
                $entries[] = [
                    'title'    => (string) ($pagina->titulo ?? 'Nosotros'),
                    'url'      => route('nosotros'),
                    'keywords' => 'nosotros historia empresa about',
                    'content'  => strip_tags((string) ($pagina->descripcion ?? $pagina->contenido ?? '')),
                ];
            }
        }

        if (Schema::hasTable('web_about')) {
            $about = WebAbout::where('Activo', 'S')->first();
            if ($about) {
                $entries[] = [
                    'title'    => (string) ($about->titulo ?? 'About'),
                    'url'      => route('home') . '#nosotros',
                    'keywords' => 'about nosotros bienvenida',
                    'content'  => strip_tags(implode(' ', array_filter([
                        $about->descripcion ?? null,
                        $about->parrafo ?? null,
                    ]))),
                ];
            }
        }

        return $entries;
    }

    /** @param array{title: string, url: string, keywords: string, content: string, boost?: int} $entry */
    private function scoreEntry(array $entry, string $query): int
    {
        $q = $this->normalize($query);
        if ($q === '') {
            return 0;
        }

        $title = $this->normalize($entry['title']);
        $keywords = $this->normalize($entry['keywords']);
        $content = $this->normalize($entry['content']);
        $haystack = trim($title . ' ' . $keywords . ' ' . $content);

        $score = (int) ($entry['boost'] ?? 0);

        if ($title === $q) {
            $score += 120;
        } elseif (str_contains($title, $q)) {
            $score += 80;
        }

        if (str_contains($keywords, $q)) {
            $score += 50;
        }

        if (str_contains($content, $q)) {
            $score += 25;
        }

        if (str_contains($haystack, $q)) {
            $score += 15;
        }

        foreach (preg_split('/\s+/u', $q, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $word) {
            if (mb_strlen($word) < 3) {
                continue;
            }
            if (str_contains($title, $word)) {
                $score += 18;
            }
            if (str_contains($keywords, $word)) {
                $score += 12;
            }
            if (str_contains($content, $word)) {
                $score += 6;
            }
        }

        return $score;
    }

    private function normalize(string $text): string
    {
        $text = mb_strtolower(trim(strip_tags($text)));

        return strtr($text, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
            'à' => 'a', 'è' => 'e', 'ì' => 'i', 'ò' => 'o', 'ù' => 'u',
        ]);
    }
}
