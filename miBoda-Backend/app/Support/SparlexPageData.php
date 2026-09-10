<?php

namespace App\Support;

use App\Models\MetadatosPagina;
use App\Models\WebAbout;
use App\Models\WebAboutCaracteristica;
use App\Models\WebContactoColumna;
use App\Models\WebContactoLanding;
use App\Models\WebContadores;
use App\Models\WebExperiencias;
use App\Models\WebFooter;
use App\Models\WebHeader;
use App\Models\WebNuestroEquipo;
use App\Models\WebPaginaContacto;
use App\Models\WebPaginaGaleria;
use App\Models\WebPaginaGaleriaSeccion;
use App\Models\WebPaginaMasajes;
use App\Models\WebPaginaNosotros;
use App\Models\WebPlan;
use App\Models\WebPorqueElejirnos;
use App\Models\WebPromoBanner;
use App\Models\WebPublicaciones;
use App\Models\WebServicios;
use App\Models\WebSlider;
use App\Models\WebSliderConfig;
use App\Models\WebTestimonios;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SparlexPageData
{
    public static function img(?string $path, ?string $fallback = null): string
    {
        if (empty($path)) {
            return $fallback ? asset($fallback) : '';
        }
        if (str_starts_with($path, 'http')) {
            return $path;
        }

        return CmsStorageUrl::forWeb($path, $fallback);
    }

    public static function normalizeRedesList(mixed $raw): array
    {
        if (is_string($raw) && $raw !== '') {
            $raw = json_decode($raw, true);
        }
        if (! is_array($raw) || $raw === []) {
            return [];
        }
        if (! array_is_list($raw)) {
            $raw = array_values($raw);
        }

        usort($raw, fn ($a, $b) => ($a['orden'] ?? 0) <=> ($b['orden'] ?? 0));

        return array_values(array_map(static function (array $red, int $i): array {
            $tipo     = $red['tipo'] ?? $red['red'] ?? 'link';
            $url      = trim((string) ($red['url'] ?? ''));
            $etiqueta = trim((string) ($red['etiqueta'] ?? $red['label'] ?? ''));

            // Compatibilidad: URL pegada en etiqueta por error en el admin
            if ($url === '' && preg_match('#^https?://#i', $etiqueta)) {
                $url      = $etiqueta;
                $etiqueta = '';
            }

            return [
                'tipo'     => $tipo,
                'url'      => $url,
                'etiqueta' => $etiqueta,
                'orden'    => (int) ($red['orden'] ?? ($i + 1)),
            ];
        }, $raw, array_keys($raw)));
    }

    public static function layout(string $paginaActiva = ''): array
    {
        $footerData = DB::table('web_footer')->where('id_footer', 1)->where('Activo', 'S')->get();
        $footerCorp = $footerData->first();

        if ($footerCorp) {
            foreach (['footer_redes', 'footer_bullets'] as $jsonField) {
                if (! empty($footerCorp->{$jsonField}) && is_string($footerCorp->{$jsonField})) {
                    $decoded = json_decode($footerCorp->{$jsonField}, true);
                    if (is_array($decoded)) {
                        $footerCorp->{$jsonField} = $decoded;
                    }
                }
            }
            $footerData = collect([$footerCorp]);
        }

        $webHeader = WebHeader::find(1) ?? WebHeader::where('Activo', 'S')->first();

        $redesSociales = [];
        if ($footerCorp && ! empty($footerCorp->footer_redes)) {
            $redesSociales = self::normalizeRedesList($footerCorp->footer_redes);
        } elseif ($webHeader && ! empty($webHeader->redes_side)) {
            $redesSociales = self::normalizeRedesList($webHeader->redes_side);
        }

        if ($webHeader) {
            $webHeader->redes_side = $redesSociales;
        }

        $tituloRedes = 'Síguenos en Redes';
        $subtituloRedes = 'Mantente al día con nuestras novedades y experiencias.';
        if ($footerCorp) {
            if (! empty($footerCorp->footer_redes_titulo)) {
                $tituloRedes = $footerCorp->footer_redes_titulo;
            }
            if (! empty($footerCorp->footer_redes_subtitulo)) {
                $subtituloRedes = $footerCorp->footer_redes_subtitulo;
            }
        }

        return [
            'webHeader'              => $webHeader,
            'footerData'             => $footerData,
            'footerCorp'             => $footerCorp,
            'urlWhatsapp'            => \Helpers::landingWhatsappUrl($footerCorp),
            'paginaActiva'           => $paginaActiva,
            'redesSociales'          => $redesSociales,
            'redesSocialesTitulo'    => $tituloRedes,
            'redesSocialesSubtitulo' => $subtituloRedes,
        ];
    }

    public static function home(): array
    {
        $metaData = MetadatosPagina::metaVigente('home');

        $serviciosRef = WebServicios::where('Activo', 'S')->orderBy('orden')->first();

        return array_merge(self::layout('home'), [
            'metaData'          => $metaData,
            'sliderData'        => WebSlider::where('Activo', 'S')->forHeroCarousel()->orderBy('id_slider')->get(),
            'sliderConfig'      => Schema::hasTable('web_slider_config') ? WebSliderConfig::first() : null,
            'promoBanner'       => Schema::hasTable('web_promo_banner') ? WebPromoBanner::find(1) : null,
            'servicios'         => WebServicios::where('Activo', 'S')->orderBy('orden')->get(),
            'serviciosSeccion'  => $serviciosRef?->seccion_titulo ?? 'Experiencias de Relajación Profunda',
            'experiencias'      => Schema::hasTable('web_experiencias')
                ? WebExperiencias::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'webAbout'          => WebAbout::where('Activo', 'S')->orderBy('id_about')->first(),
            'aboutFeatures'     => Schema::hasTable('web_about_caracteristica')
                ? WebAboutCaracteristica::where('Activo', 'S')->orderBy('orden')->limit(2)->get()
                : collect(),
            'contactoLanding'   => Schema::hasTable('web_contacto_landing') ? WebContactoLanding::find(1) : null,
            'galeriaSeccion'    => Schema::hasTable('web_pagina_galeria_seccion') ? WebPaginaGaleriaSeccion::find(1) : null,
            'galeriaItems'      => Schema::hasTable('web_pagina_galeria')
                ? WebPaginaGaleria::where('Activo', 'S')->where('contexto', 'royal_galeria')->orderBy('orden')->get()
                : collect(),
            'planes'            => Schema::hasTable('web_planes')
                ? WebPlan::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'equipo'            => Schema::hasTable('web_nuestro_equipo')
                ? WebNuestroEquipo::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'testimonios'       => WebTestimonios::where('Activo', 'S')->orderBy('orden')->get(),
            'testimonioSeccion' => WebTestimonios::where('Activo', 'S')->orderBy('orden')->first(),
            'noticias'          => Schema::hasTable('web_publicaciones')
                ? WebPublicaciones::where('Activo', 'S')->orderBy('orden')->limit(3)->get()
                : collect(),
            'paginaContacto'    => WebPaginaContacto::first(),
            'contactoColumnas'  => Schema::hasTable('web_contacto_columna')
                ? \App\Models\WebContactoColumna::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
        ]);
    }

    public static function nosotros(): array
    {
        return array_merge(self::layout('nosotros'), [
            'metaData'       => MetadatosPagina::metaVigente('web_about') ?? MetadatosPagina::metaVigente('home'),
            'pagina'         => WebPaginaNosotros::first(),
            'webAbout'       => WebAbout::where('Activo', 'S')->orderBy('id_about')->first(),
            'aboutFeatures'  => Schema::hasTable('web_about_caracteristica')
                ? WebAboutCaracteristica::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'contadores'     => Schema::hasTable('web_contadores')
                ? WebContadores::where('Activo', 'S')->where('contexto', 'about')->orderBy('orden')->get()
                : WebContadores::where('Activo', 'S')->orderBy('orden')->get(),
            'testimonios'    => WebTestimonios::where('Activo', 'S')->orderBy('orden')->get(),
            'testimonioSeccion' => WebTestimonios::where('Activo', 'S')->orderBy('orden')->first(),
        ]);
    }

    public static function masajes(): array
    {
        $porque = Schema::hasTable('web_porque_elejirnos')
            ? WebPorqueElejirnos::where('Activo', 'S')->first()
            : null;
        $pilares = collect();
        if ($porque && is_array($porque->beneficios)) {
            foreach ($porque->beneficios as $b) {
                $pilares->push((object) [
                    'titulo'      => $b['titulo'] ?? $b['label'] ?? '',
                    'descripcion' => $b['texto'] ?? $b['descripcion'] ?? '',
                ]);
            }
        }

        return array_merge(self::layout('masajes'), [
            'metaData'     => MetadatosPagina::metaVigente('web_masajes')
                ?? MetadatosPagina::metaVigente('web_servicios')
                ?? MetadatosPagina::metaVigente('home'),
            'pagMasajes'   => Schema::hasTable('web_pagina_masajes')
                ? WebPaginaMasajes::first()
                : null,
            'experiencias' => Schema::hasTable('web_experiencias')
                ? WebExperiencias::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'pilares'      => $pilares,
            'porque'       => $porque,
            'masajeFaqs'   => Schema::hasTable('web_masaje_faq')
                ? \App\Models\WebMasajeFaq::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
        ]);
    }

    public static function experiencias(): array
    {
        $all    = Schema::hasTable('web_experiencias')
            ? WebExperiencias::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        $pagina = Schema::hasTable('web_pagina_experiencias')
            ? \App\Models\WebPaginaExperiencias::first()
            : null;

        return array_merge(self::layout('experiencias'), [
            'metaData'    => MetadatosPagina::metaVigente('web_experiencias') ?? MetadatosPagina::metaVigente('home'),
            'pagExp'      => $pagina,
            'experiencias'=> $all,
            'tantrico'    => $all->where('categoria', 'tantrico')->values(),
            'bienestar'   => $all->where('categoria', 'bienestar')->values(),
            'corporal'    => $all->where('categoria', 'corporal')->values(),
            'estetica'    => $all->where('categoria', 'estetica')->values(),
        ]);
    }

    public static function galeria(): array
    {
        return array_merge(self::layout('galeria'), [
            'metaData'      => MetadatosPagina::metaVigente('web_gallery') ?? MetadatosPagina::metaVigente('home'),
            'galeriaSeccion'=> Schema::hasTable('web_pagina_galeria_seccion') ? WebPaginaGaleriaSeccion::find(1) : null,
            'galeriaItems'  => Schema::hasTable('web_pagina_galeria')
                ? WebPaginaGaleria::where('Activo', 'S')->where('contexto', 'royal_galeria')->orderBy('orden')->get()
                : collect(),
        ]);
    }

    public static function contacto(): array
    {
        return array_merge(self::layout('contacto'), [
            'metaData'       => MetadatosPagina::metaVigente('web_contact') ?? MetadatosPagina::metaVigente('home'),
            'paginaContacto' => WebPaginaContacto::first(),
            'contactoLanding'=> Schema::hasTable('web_contacto_landing') ? WebContactoLanding::find(1) : null,
            'columnas'       => Schema::hasTable('web_contacto_columna')
                ? WebContactoColumna::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'experiencias'   => Schema::hasTable('web_experiencias')
                ? \App\Models\WebExperiencias::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
        ]);
    }

    public static function legal(string $tipo): array
    {
        $docId = $tipo === 'politicas' ? 3 : 2;
        $terminosData = DB::table('web_terminos')->whereIn('id_footer_document', [$docId])->get();

        return array_merge(self::layout($tipo), [
            'metaData'     => MetadatosPagina::metaVigente($tipo === 'politicas' ? 'web_politica_privacidad' : 'web_terminos_condiciones'),
            'terminosData' => $terminosData,
            'legalTipo'    => $tipo,
        ]);
    }
}
