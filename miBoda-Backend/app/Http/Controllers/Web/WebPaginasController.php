<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MetadatosPagina;
use App\Models\WebAbout;
use App\Models\WebAboutContador;
use App\Models\WebNosotrosProducto;
use App\Models\WebNosotrosProductoSeccion;
use App\Models\WebNosotrosQuienes;
use App\Models\WebNosotrosQuienesBeneficio;
use App\Models\WebContactoColumna;
use App\Models\WebContactoLanding;
use App\Models\WebFooter;
use App\Models\WebHeader;
use App\Models\WebPaginaContacto;
use App\Models\WebPaginaNosotros;
use App\Models\WebPaginaProductos;
use App\Models\WebPaginaMaquinarias;
use App\Models\WebMaquinariasItem;
use App\Models\WebPaginaVideos;
use App\Models\WebVideos;
use App\Models\WebProductosPaginaGaleria;
use App\Models\WebProductosPaginaGaleriaSeccion;
use App\Models\WebPublicaciones;
use App\Models\WebPaginaPublicacionesBanner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WebPaginasController extends Controller
{
    private function bannerAsset(?string $path, array $fallbacks = []): string
    {
        return \Helpers::cmsBannerUrl($path, $fallbacks);
    }

    private function layoutData(string $paginaActiva = ''): array
    {
        $footerData = DB::table('web_footer')->where('id_footer', 1)->where('Activo', 'S')->get();
        $footerCorp = $footerData->first();
        $urlWhatsapp = \Helpers::landingWhatsappUrl($footerCorp);

        return [
            'webHeader'    => WebHeader::where('Activo', 'S')->first(),
            'footerData'   => $footerData,
            'urlWhatsapp'  => $urlWhatsapp,
            'paginaActiva' => $paginaActiva,
        ];
    }

    public function nosotros()
    {
        $metaData = MetadatosPagina::metaVigente('web_about') ?? MetadatosPagina::metaVigente('home');
        $pagina = WebPaginaNosotros::first() ?? new WebPaginaNosotros([
            'banner_titulo'    => 'Nosotros',
            'banner_subtitulo' => 'J&H Importaciones',
            'banner_url_imagen'=> 'temp02/assets/img/jh_importaciones/inicio/seccion%202.jpg',
        ]);

        $webAbout = WebAbout::where('Activo', 'S')->orderBy('id_about')->first();

        $nosotrosQuienes = Schema::hasTable('web_nosotros_quienes')
            ? WebNosotrosQuienes::where('Activo', 'S')->first()
            : null;

        $nosotrosQuienesBeneficios = Schema::hasTable('web_nosotros_quienes_beneficio')
            ? WebNosotrosQuienesBeneficio::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        $nosotrosContadores = $webAbout && Schema::hasTable('web_about_contador')
            ? WebAboutContador::where('id_about', $webAbout->id_about)->where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        $nosotrosProductoSeccion = Schema::hasTable('web_nosotros_producto_seccion')
            ? WebNosotrosProductoSeccion::first()
            : null;

        $nosotrosProductos = Schema::hasTable('web_nosotros_producto')
            ? WebNosotrosProducto::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        $bannerImagenUrl = $this->bannerAsset($pagina->banner_url_imagen ?? null, array_filter([
            $pagina->catalogo_url_imagen ?? null,
            $nosotrosQuienes?->url_imagen ?? null,
        ]));

        return view('web.pages.nosotros', array_merge($this->layoutData('nosotros'), compact(
            'metaData',
            'pagina',
            'bannerImagenUrl',
            'nosotrosQuienes',
            'nosotrosQuienesBeneficios',
            'nosotrosContadores',
            'nosotrosProductoSeccion',
            'nosotrosProductos'
        )));
    }

    public function videos()
    {
        $metaData = MetadatosPagina::metaVigente('web_videos') ?? MetadatosPagina::metaVigente('home');
        $pagina = WebPaginaVideos::first() ?? new WebPaginaVideos([
            'banner_titulo'       => 'Videos',
            'seccion_titulo'      => 'Creando Espirales',
            'seccion_descripcion' => 'Descubre cómo nuestras espirales de alta calidad pueden transformar tus proyectos.',
        ]);

        $videos = Schema::hasTable('web_videos')
            ? WebVideos::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        return view('web.pages.videos', array_merge($this->layoutData('videos'), compact(
            'metaData',
            'pagina',
            'videos'
        )));
    }

    public function maquinarias()
    {
        $metaData = MetadatosPagina::metaVigente('web_maquinarias') ?? MetadatosPagina::metaVigente('home');
        $pagina = (Schema::hasTable('web_pagina_maquinarias') ? WebPaginaMaquinarias::first() : null) ?? new WebPaginaMaquinarias([
            'banner_titulo'  => 'Máquinarias',
            'seccion_titulo' => 'Nuestras máquinarias',
        ]);

        $maquinariasItems = Schema::hasTable('web_maquinarias_item')
            ? WebMaquinariasItem::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        return view('web.pages.maquinarias', array_merge($this->layoutData('maquinarias'), compact(
            'metaData',
            'pagina',
            'maquinariasItems'
        )));
    }

    public function productos()
    {
        $metaData = MetadatosPagina::metaVigente('web_productos') ?? MetadatosPagina::metaVigente('home');
        $pagina = WebPaginaProductos::first() ?? new WebPaginaProductos([
            'banner_titulo' => 'Productos',
            'intro_titulo'  => 'Nuestros Productos',
        ]);

        $productosGaleriaSeccion = Schema::hasTable('web_productos_pagina_galeria_seccion')
            ? WebProductosPaginaGaleriaSeccion::first()
            : null;

        $productosGaleria = Schema::hasTable('web_productos_pagina_galeria')
            ? WebProductosPaginaGaleria::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        return view('web.pages.productos', array_merge($this->layoutData('productos'), compact(
            'metaData',
            'pagina',
            'productosGaleriaSeccion',
            'productosGaleria'
        )));
    }

    public function publicaciones(Request $request)
    {
        $metaData = MetadatosPagina::metaVigente('blogs') ?? MetadatosPagina::metaVigente('home');
        $pagina = max(1, (int) $request->input('page', 1));
        $porPagina = 8;
        $query = WebPublicaciones::where('Activo', 'S')->orderByDesc('fecha_publicacion')->orderBy('orden');
        $total = $query->count();
        $publicaciones = (clone $query)->skip(($pagina - 1) * $porPagina)->take($porPagina)->get();
        $first = $publicaciones->first();
        $seccionTitulo = $first->seccion_titulo ?? 'Publicaciones';
        $seccionSub = $first->seccion_subtitulo ?? '';
        $bannerPag = Schema::hasTable('web_pagina_publicaciones_banner')
            ? WebPaginaPublicacionesBanner::first()
            : null;
        $bannerTitulo = $bannerPag->listado_banner_titulo ?? 'Publicaciones';
        $bannerImagenUrl = $this->bannerAsset($bannerPag->listado_banner_url_imagen ?? null);

        if ($request->ajax()) {
            return response()->json(['html' => view('web.pages.partials.publicaciones_grid', compact('publicaciones'))->render()]);
        }

        return view('web.pages.sparlex.publicaciones', array_merge($this->layoutData('publicaciones'), compact(
            'metaData', 'publicaciones', 'seccionTitulo', 'seccionSub', 'pagina', 'total', 'porPagina',
            'bannerTitulo', 'bannerImagenUrl'
        )));
    }

    public function publicacionDetalle(string $slug)
    {
        $publicacion = WebPublicaciones::where('Activo', 'S')->where('slug', $slug)->firstOrFail();
        $metaData = (object) [
            'titulo_pagina'      => $publicacion->titulo,
            'descripcion_pagina' => strip_tags($publicacion->resumen ?? ''),
        ];
        $recientes = WebPublicaciones::where('Activo', 'S')
            ->where('id_publicacion', '!=', $publicacion->id_publicacion)
            ->orderByDesc('fecha_publicacion')
            ->limit(3)
            ->get();

        $bannerPag = Schema::hasTable('web_pagina_publicaciones_banner')
            ? WebPaginaPublicacionesBanner::first()
            : null;
        $bannerTitulo = $publicacion->titulo;
        $bannerPath = $publicacion->banner_url_imagen
            ?: ($bannerPag->detalle_banner_url_imagen ?? null);
        $bannerImagenUrl = $this->bannerAsset($bannerPath);

        return view('web.pages.sparlex.publicacion_detalle', array_merge($this->layoutData('publicaciones'), compact(
            'metaData', 'publicacion', 'recientes', 'bannerTitulo', 'bannerImagenUrl'
        )));
    }

    public function contacto()
    {
        $metaData = MetadatosPagina::metaVigente('web_contact') ?? MetadatosPagina::metaVigente('home');
        $paginaContacto = WebPaginaContacto::first() ?? new WebPaginaContacto([
            'banner_titulo'    => 'Contáctanos',
            'banner_subtitulo' => 'Estamos para ayudarte',
            'banner_url_imagen'=> 'temp02/assets/img/jh_importaciones/inicio/jh_importaciones_img_5.jpg',
        ]);

        $contactoColumnas = Schema::hasTable('web_contacto_columna')
            ? WebContactoColumna::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        return view('web.pages.contacto', array_merge($this->layoutData('contacto'), compact(
            'metaData',
            'paginaContacto',
            'contactoColumnas'
        )));
    }
}
