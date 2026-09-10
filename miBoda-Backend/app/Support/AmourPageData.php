<?php

namespace App\Support;

use App\Models\MetadatosPagina;
use App\Models\WebAbout;
use App\Models\WebAboutCaracteristica;
use App\Models\WebContactoColumna;
use App\Models\WebContactoLanding;
use App\Models\WebExperiencias;
use App\Models\WebMasajeFaq;
use App\Models\WebNuestroEquipo;
use App\Models\WebPaginaContacto;
use App\Models\WebPaginaFaq;
use App\Models\WebPaginaMasajes;
use App\Models\WebPaginaNosotros;
use App\Models\WebPlan;
use App\Models\WebSlider;
use App\Models\WebSliderConfig;
use App\Models\WebTestimonios;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AmourPageData extends SparlexPageData
{
    public static function home(): array
    {
        $metaData = MetadatosPagina::metaVigente('home') ?? MetadatosPagina::metaVigente('web_home');
        $expRef     = Schema::hasTable('web_experiencias')
            ? WebExperiencias::where('Activo', 'S')->orderBy('orden')->first()
            : null;
        $planRef    = Schema::hasTable('web_planes')
            ? WebPlan::where('Activo', 'S')->orderBy('orden')->first()
            : null;
        $faqRef     = Schema::hasTable('web_masaje_faq')
            ? WebMasajeFaq::where('Activo', 'S')->orderBy('orden')->first()
            : null;
        $pagServicios = Schema::hasTable('web_pagina_masajes')
            ? WebPaginaMasajes::first()
            : null;
        $equipoRef  = Schema::hasTable('web_nuestro_equipo')
            ? WebNuestroEquipo::where('Activo', 'S')->orderBy('orden')->first()
            : null;

        return array_merge(self::layout('home'), [
            'metaData'           => $metaData,
            'sliderData'         => WebSlider::where('Activo', 'S')->forHeroCarousel()->orderBy('id_slider')->get(),
            'sliderConfig'       => Schema::hasTable('web_slider_config') ? WebSliderConfig::first() : null,
            'experiencias'       => Schema::hasTable('web_experiencias')
                ? self::experienciasDestacadas()
                : collect(),
            'expSeccion'         => $pagServicios ?? $expRef,
            'pagServicios'       => $pagServicios,
            'planes'             => Schema::hasTable('web_planes')
                ? WebPlan::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'planesSeccion'      => $pagServicios ?? $planRef,
            'webAbout'           => WebAbout::where('Activo', 'S')->orderBy('id_about')->first(),
            'aboutFeatures'      => Schema::hasTable('web_about_caracteristica')
                ? WebAboutCaracteristica::where('Activo', 'S')->orderBy('orden')->limit(2)->get()
                : collect(),
            'contactoLanding'    => Schema::hasTable('web_contacto_landing') ? WebContactoLanding::find(1) : null,
            'equipo'             => Schema::hasTable('web_nuestro_equipo')
                ? WebNuestroEquipo::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'equipoSeccion'      => $equipoRef,
            'testimonios'        => WebTestimonios::where('Activo', 'S')->orderBy('orden')->get(),
            'testimonioSeccion'  => WebTestimonios::where('Activo', 'S')->orderBy('orden')->first(),
            'masajeFaqs'         => Schema::hasTable('web_masaje_faq')
                ? WebMasajeFaq::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'faqSeccion'         => $faqRef,
            'paginaFaq'          => Schema::hasTable('web_pagina_faq') ? WebPaginaFaq::first() : null,
            'paginaContacto'     => WebPaginaContacto::first(),
            'amourRitualesFull'  => false,
        ]);
    }

    public static function nosotros(): array
    {
        return array_merge(self::layout('nosotros'), [
            'metaData'      => MetadatosPagina::metaVigente('web_about') ?? MetadatosPagina::metaVigente('home'),
            'pagina'        => WebPaginaNosotros::first(),
            'webAbout'      => WebAbout::where('Activo', 'S')->orderBy('id_about')->first(),
            'aboutFeatures' => Schema::hasTable('web_about_caracteristica')
                ? WebAboutCaracteristica::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
        ]);
    }

    public static function servicios(): array
    {
        $pagServicios = Schema::hasTable('web_pagina_masajes')
            ? WebPaginaMasajes::first()
            : null;
        $expRef  = Schema::hasTable('web_experiencias')
            ? WebExperiencias::where('Activo', 'S')->orderBy('orden')->first()
            : null;
        $planRef = Schema::hasTable('web_planes')
            ? WebPlan::where('Activo', 'S')->orderBy('orden')->first()
            : null;

        return array_merge(self::layout('servicios'), [
            'metaData'          => MetadatosPagina::metaVigente('web_servicios')
                ?? MetadatosPagina::metaVigente('home'),
            'pagServicios'      => $pagServicios,
            'experiencias'      => Schema::hasTable('web_experiencias')
                ? WebExperiencias::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'expSeccion'        => $pagServicios ?? $expRef,
            'planes'            => Schema::hasTable('web_planes')
                ? WebPlan::where('Activo', 'S')->orderBy('orden')->get()
                : collect(),
            'planesSeccion'     => $pagServicios ?? $planRef,
            'amourRitualesFull' => true,
        ]);
    }

    /**
     * Experiencias mostradas en la sección de servicios del INICIO:
     * solo las marcadas como destacadas. Si aún no hay ninguna marcada,
     * se muestran las primeras 4 (para no dejar la sección vacía).
     */
    protected static function experienciasDestacadas()
    {
        $base = WebExperiencias::where('Activo', 'S');
        $tieneDestacado = Schema::hasColumn('web_experiencias', 'destacado');

        if ($tieneDestacado) {
            $destacadas = (clone $base)->where('destacado', 1)->orderBy('orden')->get();
            if ($destacadas->isNotEmpty()) {
                return $destacadas;
            }
        }

        return $base->orderBy('orden')->limit(4)->get();
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
                ? WebExperiencias::where('Activo', 'S')->orderBy('orden')->get()
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
