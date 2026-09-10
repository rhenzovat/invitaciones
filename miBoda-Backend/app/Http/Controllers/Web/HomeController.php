<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Api\BannerPopularController;
use App\Http\Controllers\Api\CategoriaPopularController;
use App\Traits\ChecksAdminRole;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\OfertaDelDia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Session;
use App\Models\Producto;
use App\Models\MetadatosPagina;
use App\Models\WebFooter;
use App\Models\WebPlan;
use App\Models\WebPorqueElejirnos;
use App\Models\WebNuestroEquipo;
use App\Models\WebHeader;
use App\Models\WebServicios;
use App\Models\WebMetodologia;
use App\Models\WebTestimonios;
use App\Models\WebPreguntasFrecuentes;
use App\Models\WebAbout;
use App\Models\WebAboutCaracteristica;
use App\Models\WebConfianzaItem;
use App\Models\WebContadores;
use App\Models\WebContadoresSeccion;
use App\Models\WebContactoLanding;
use App\Models\WebClienteEstadistica;
use App\Models\WebClienteLogo;
use App\Models\WebClienteSeccion;
use App\Models\WebLineaProducto;
use App\Models\WebLineaProductoSeccion;
use App\Models\WebProductoCatalogo;
use App\Models\WebProductoCatalogoSeccion;
use App\Models\WebProductoDestacado;
use App\Models\WebProductoDestacadoSeccion;
use App\Models\WebSlider;
use App\Models\WebSliderConfig;
use App\Models\WebVideo;
use App\Models\WebVideoSeccion;
use App\Models\WebEjemplaresSeccion;
use App\Models\WebPortafolio;
use App\Models\WebPortafolioSeccion;
use App\Models\Cotizacion\CotizacionTipoProyecto;

class HomeController extends Controller
{
    use ChecksAdminRole;

    public function web_session_login()
    {
        return view('auth.login');
    }

    // ── Customizer: guardar estilos (solo admin) ──────────────────────────
    public function customizerGuardar(Request $request)
    {
        if (! Auth::check()) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }
        if (! $this->isAdminUser()) {
            return response()->json(['success' => false, 'message' => 'Sin permisos de administrador'], 403);
        }

        $styles = $request->input('styles');
        if (empty($styles)) {
            return response()->json(['success' => false, 'message' => 'No se recibieron estilos'], 422);
        }
        $json = is_array($styles) ? json_encode($styles, JSON_UNESCAPED_UNICODE) : (string) $styles;

        try {
            $footer = WebFooter::find(1);
            if (! $footer) {
                return response()->json(['success' => false, 'message' => 'Registro de footer no encontrado. Configure el footer primero.'], 404);
            }

            $footer->customizer_styles = $json;
            $footer->save();

            return response()->json(['success' => true, 'message' => 'Estilos guardados correctamente']);
        } catch (\Exception $e) {
            Log::error('CustomizerGuardar error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al guardar en la base de datos'], 500);
        }
    }

    // ── Customizer: reset (solo admin) ───────────────────────────────────
    public function customizerReset(Request $request)
    {
        if (! Auth::check()) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }
        if (! $this->isAdminUser()) {
            return response()->json(['success' => false, 'message' => 'Sin permisos de administrador'], 403);
        }

        try {
            $footer = WebFooter::find(1);
            if (! $footer) {
                return response()->json(['success' => false, 'message' => 'Registro de footer no encontrado'], 404);
            }

            $footer->customizer_styles = null;
            $footer->save();

            return response()->json(['success' => true, 'message' => 'Estilos restablecidos al original']);
        } catch (\Exception $e) {
            Log::error('CustomizerReset error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al restablecer estilos'], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    public function Home()
    {
        $metaData = MetadatosPagina::metaVigente('home');

        $sliderData = WebSlider::where('Activo', 'S')
            ->forHeroCarousel()
            ->orderBy('id_slider')
            ->get();

        $footerData = DB::table('web_footer')
            ->where('id_footer', 1)
            ->where('Activo', 'S')
            ->get();

        $webHeader = WebHeader::where('Activo', 'S')->first();

        $contadores = Schema::hasTable('web_contadores')
            ? WebContadores::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        $servicios = WebServicios::where('Activo', 'S')->orderBy('orden')->get();

        $contactoLanding = Schema::hasTable('web_contacto_landing')
            ? WebContactoLanding::find(1)
            : null;

        $ejemplaresSecciones = Schema::hasTable('web_ejemplares_seccion')
            ? WebEjemplaresSeccion::where('Activo', 'S')
                ->orderBy('orden')
                ->with(['itemsActivos'])
                ->get()
            : collect();

        $portafolioSeccion = Schema::hasTable('web_portafolio_seccion')
            ? WebPortafolioSeccion::find(1)
            : null;

        $portafolioItems = Schema::hasTable('web_portafolio')
            ? WebPortafolio::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        $portafolioCounts = [
            'all'        => $portafolioItems->count(),
            'sistemas'   => $portafolioItems->where('categoria', 'sistemas')->count(),
            'sitios'     => $portafolioItems->where('categoria', 'sitios')->count(),
            'desarrollo' => $portafolioItems->where('categoria', 'desarrollo')->count(),
        ];

        $planesData = Schema::hasTable('cotizacion_tipo_proyecto')
            ? CotizacionTipoProyecto::where('Activo', 'S')->orderBy('orden')->get()
            : collect();

        $portafolioJson = $portafolioItems->map(function ($p) {
            $img = $p->url_imagen;
            if ($img && !str_starts_with($img, 'http')) {
                $img = 'temp02/' . ltrim(str_replace('temp02/', '', $img), '/');
            }
            return [
                'cat'      => $p->categoria,
                'type'     => $p->tipo,
                'title'    => $p->titulo,
                'desc'     => $p->descripcion,
                'tech'     => $p->tecnologias,
                'url'      => $p->url_proyecto,
                'linkText' => $p->texto_enlace,
                'img'      => $img,
            ];
        })->values();

        return response()
            ->view('web.pages.index', compact(
                'sliderData',
                'footerData',
                'webHeader',
                'contadores',
                'servicios',
                'contactoLanding',
                'ejemplaresSecciones',
                'portafolioSeccion',
                'portafolioCounts',
                'portafolioJson',
                'planesData',
                'metaData'
            ))
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            ->header('Pragma', 'no-cache');
    }

    public function web_shopDetail_lista()
    {
        return view('web.pages.web_shopDetail_lista');
    }

    public function web_gallery_list()
    {
        return view('web.pages.web_gallery_list');
    }

    public function web_gallery_2cols()
    {
        return view('web.pages.web_gallery_2cols');
    }

    public function web_gallery_4cols()
    {
        return view('web.pages.web_gallery_4cols');
    }

    public function web_ubicacion()
    {
        $metaData = MetadatosPagina::metaVigente('web_ubicacion');
        return view('web.pages.web_ubicacion',compact('metaData'));
    }


    public function searchProducts(Request $request)
    {
        try {
            $query = $request->input('query');

            // Validar que la query no esté vacía
            if (empty($query) || strlen(trim($query)) < 2) {
                return response()->json([]);
            }

            // Limpiar la query
            $query = trim($query);

            // Corregir la consulta con paréntesis para agrupar las condiciones OR
            $products = Producto::where('Activo', 'S')
                ->where(function ($q) use ($query) {
                    $q->where('nombre', 'like', "%$query%")
                        ->orWhere('descripcion', 'like', "%$query%");
                })
                ->select('id_producto', 'nombre', 'precio', 'precio_old', 'numero_estrellas', 'url_imagen', 'slug')
                ->limit(10)
                ->get();

            return response()->json($products);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error en la búsqueda'], 500);
        }
    }

    private function documentTerminos($id)
    {
        return DB::table('web_terminos')->whereIn('id_footer_document', [$id])->get();
    }

    public function web_politica_privacidad()
    {
        $metaData = MetadatosPagina::metaVigente('web_politica_privacidad');
        $terminosData = $this->documentTerminos(3);
        return view('web.pages.web_doc_politica_privacidad')->with(compact('terminosData','metaData'));
    }

    //=======================LISTA DE DOCUMENTACIONES ECOMMERCE ==========================

    public function web_terminos_condiciones()
    {
        $metaData = MetadatosPagina::metaVigente('web_terminos_condiciones');
        $terminosData = $this->documentTerminos(2);
        return view('web.pages.web_doc_terminos_condiciones')->with(compact('terminosData','metaData'));
    }

    public function web_devoluciones()
    {
        $metaData = MetadatosPagina::metaVigente('web_devoluciones');
        $terminosData = $this->documentTerminos(5);
        return view('web.pages.web_doc_garantia')->with(compact('terminosData','metaData'));
    }

    public function web_garantia()
    {
          $metaData = MetadatosPagina::metaVigente('web_garantia');
        $terminosData = $this->documentTerminos(6);
        return view('web.pages.web_doc_garantia')->with(compact('terminosData','metaData'));
    }

    public function web_servicio_cliente()
    {
        $metaData = MetadatosPagina::metaVigente('web_servicio_cliente');
        $terminosData = $this->documentTerminos(1);
        // return view('web.pages.web_doc_servicio_cliente')->with(compact('terminosData'));
        return view('web.pages.web_doc_servicio_cliente', compact('metaData', 'terminosData'));
    }

    public function web_delivery_informacion()
    {
         $metaData = MetadatosPagina::metaVigente('web_delivery_informacion');
        $terminosData = $this->documentTerminos(4);
        return view('web.pages.web_doc_delivery_informacion')->with(compact('terminosData','metaData'));
    }
}
