<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\AmourController;
use App\Http\Controllers\Web\MiBodaController;
use App\Http\Controllers\Web\WebPaginasController;
use App\Http\Controllers\Web\AboutController;
use App\Http\Controllers\Web\TerminosController;
use App\Http\Controllers\Web\ShopDetailController;
use App\Http\Controllers\Web\GaleriaController;
use App\Http\Controllers\Web\WishlistController;
use App\Http\Controllers\Web\PedidosController;
use App\Http\Controllers\Web\ContactoController;
use App\Http\Controllers\Web\CheckoutController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Web\PaymentController;
use App\Http\Controllers\Web\LibroReclamosController;
use App\Http\Controllers\Web\CalcularEnvioController;
use App\Http\Controllers\Web\FileController;
use App\Http\Controllers\Web\SuscriptoresController;
use App\Models\Producto;
use App\Models\ProductoCategoria;
use App\Models\ProductoCategoriaSub;
use Illuminate\Http\Response;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;

if (! function_exists('adminSpaResponse')) {
    /**
     * Local (APP_ENV=local): redirige a Vite :5173 — no usa public/admin.
     * Probar build local: ADMIN_DIST_PATH=C:/.../systemWeb-Frontend/dist
     * Producción: public/admin/index.html
     */
    function adminSpaResponse(?string $any = null)
    {
        if (app()->environment('local') && ! env('ADMIN_DIST_PATH')) {
            $frontend = rtrim(env('APP_URL_FROND', 'http://localhost:5173'), '/');
            $path = '/admin' . ($any ? '/'.$any : '');
            $qs = request()->getQueryString();

            return redirect()->away($frontend . $path . ($qs ? '?'.$qs : ''));
        }

        $devPath = env('ADMIN_DIST_PATH');
        $indexHtml = $devPath
            ? rtrim($devPath, '/\\') . '/index.html'
            : public_path('admin/index.html');

        if (! file_exists($indexHtml)) {
            if (app()->environment('local')) {
                $frontend = rtrim(env('APP_URL_FROND', 'http://localhost:5173'), '/');
                $path = '/admin' . ($any ? '/'.$any : '');
                $qs = request()->getQueryString();

                return redirect()->away($frontend . $path . ($qs ? '?'.$qs : ''));
            }
            abort(404, 'Panel admin no encontrado. Suba el build a public_html/admin en el servidor.');
        }

        return response(file_get_contents($indexHtml), 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

//::::::::::::::::::::::: WEB : HOME ::::::::::::::::::::::::::
Route::get('/',                                       [MiBodaController::class, 'index'])->name('home');
Route::get('/galeria',                                [MiBodaController::class, 'galeria'])->name('galeria');
Route::get('/servicios',                              [AmourController::class, 'servicios'])->name('amour.servicios');
Route::get('/buscar',                                 \App\Http\Controllers\Web\SiteSearchController::class)->name('site.search');


/*
|--------------------------------------------------------------------------
| Onboarding público — redirige al SPA React (/admin/onboarding/...)
| Los enlaces enviados por WhatsApp usaban /onboarding/ sin el prefijo /admin.
|--------------------------------------------------------------------------
*/



Route::get('/nosotros',                               [AmourController::class, 'nosotros'])->name('nosotros');
Route::get('/productos',                              [WebPaginasController::class, 'productos'])->name('productos');
Route::get('/videos',                                 [WebPaginasController::class, 'videos'])->name('videos');
Route::get('/maquinarias',                            [WebPaginasController::class, 'maquinarias'])->name('maquinarias');
Route::get('/publicaciones',                          [WebPaginasController::class, 'publicaciones'])->name('publicaciones');
Route::get('/publicaciones/{slug}',                   [WebPaginasController::class, 'publicacionDetalle'])->name('publicacion.detalle');
Route::get('/contacto',                               [AmourController::class, 'contacto'])->name('contacto.pagina');
Route::post('/contacto',                              [ContactoController::class, 'submitPagina'])->name('contacto.pagina.submit');
Route::redirect('/contact', '/contacto', 301);
Route::redirect('/about', '/nosotros', 301);
// Route::get('/home',                                   [HomeController::class, 'Home']);
//::::::::::::::::::::::: WEB: LOGEO ::::::::::::::::::::::::::
Auth::routes();
Route::get('/web_session_login',                    [HomeController::class, 'web_session_login']);

//::::::::::::::::::::::: WEB: LOGEO ::::::::::::::::::::::::::
// Route::get('login',                              [AuthController::class, 'index'])->name('login');
Route::post('login',                                [AuthController::class, 'postLogin'])->name('login');
Route::get('registration',                          [AuthController::class, 'registration'])->name('register');
Route::post('post-registration',                    [AuthController::class, 'postRegistration'])->name('register.post');
// Route::get('home',                                  [AuthController::class, 'dashboard']);
Route::get('logout',                                [AuthController::class, 'logout'])->name('logout');

// VERIFICARCION POR CORREO
Route::get('home',                                    [AuthController::class, 'dashboard'])->middleware(['auth', 'is_verify_email']);
Route::get('account/verify/{token}',                  [AuthController::class, 'verifyAccount'])->name('user.verify');

// RECUPERAR CONTRASEÑA
Route::get('forget-password',                         [ForgotPasswordController::class, 'showForgetPasswordForm'])->name('forget.password.get');
Route::post('forget-password',                        [ForgotPasswordController::class, 'submitForgetPasswordForm'])->name('forget.password.post');
Route::get('reset-password/{token}',                  [ForgotPasswordController::class, 'showResetPasswordForm'])->name('reset.password.get');
Route::post('reset-password',                         [ForgotPasswordController::class, 'submitResetPasswordForm'])->name('reset.password.post');

//::::::::::::::::::::::: WEB: HOME ::::::::::::::::::::::::::
Route::get('/web_about',                            [AboutController::class, 'web_about']);
Route::get('/web_gallery_list',                     [HomeController::class, 'web_gallery_list']);
Route::get('/web_gallery_2cols',                    [HomeController::class, 'web_gallery_2cols']);
Route::get('/web_gallery_4cols',                    [HomeController::class, 'web_gallery_4cols']);
Route::get('/web_ubicacion',                        [HomeController::class, 'web_ubicacion']);
Route::get('/web_buscar_productos',                 [HomeController::class, 'searchProducts'])->name('products.search');
Route::post('/web_customizer_guardar',              [HomeController::class, 'customizerGuardar'])->name('customizer.guardar');
Route::post('/web_customizer_reset',                [HomeController::class, 'customizerReset'])->name('customizer.reset');

//::::::::::::::::::::::: WEB: CONTACTO ::::::::::::::::::::::::::
Route::get('/web_contact',                                          [ContactoController::class, 'web_contact']);
Route::post('/web_contact_submit',                                  [ContactoController::class, 'submitForm'])->name('contact.submit');
Route::post('/contacto-landing',                                    [ContactoController::class, 'submitLanding'])->name('contact.landing.submit');

//===== DETALLE TERMINOS CONDICIONES ======
Route::get('/web_terminos',                                         [TerminosController::class, 'web_terminos']);


//===== AGRAGAR LISTA DE DESEOS ======
Route::get('/web_wishlist',                                         [WishlistController::class, 'web_wishlist']);
Route::post('/web_wishlist_agregar',                                [WishlistController::class, 'web_wishlist_agregar']);
Route::post('/web_wishlist_eliminar',                               [WishlistController::class, 'web_wishlist_eliminar']);

//===== DETALLE GALERIA ======
Route::get('/web_gallery/{category?}/{subcategory?}',               [GaleriaController::class, 'web_galeria_listar'])->name('web_gallery');

// Callback / Webhook
// Izipay puede notificarte cuando el pago se complete. Configura una ruta en web.php:
Route::controller(GoogleController::class)->group(function () {
  Route::get('auth/google', 'redirectToGoogle')->name('auth.google');
  Route::get('auth/google/callback', 'handleGoogleCallback');
});

//::::::::::::::::::::::: WEB: LIBRO DE RECLAMOS ::::::::::::::::::::::::::
Route::get('/web_libro_reclamos',                                   [LibroReclamosController::class, 'web_libro_reclamos']);
Route::post('/web_libro_reclamos_enviar',                           [LibroReclamosController::class, 'web_libro_reclamos_enviar'])->name('libro_reclamos.enviar');


// ========= Panel admin SPA (React) ============================================
// Local: APP_ENV=local → siempre Vite :5173 (no usar public/admin)
// Prod:  public/admin/index.html (subido manualmente a public_html/admin)
// Opcional: ADMIN_DIST_PATH=ruta/a/systemWeb-Frontend/dist (probar build sin copiar)
Route::get('/admin/{any?}', function () {
    return adminSpaResponse(request()->route('any'));
})->where('any', '.*');

Route::get('/admin', function () {
    return adminSpaResponse();
})->name('admin.spa');

//=============================== PROCESOS DE PAGO CULQUI===============================
//***************************************************************************** */
Auth::routes(["verify" => true]);



//===== WEB: TERMINOS Y CONDICIONES ======
Route::get('/web_politica_privacidad',                      [HomeController::class, 'web_politica_privacidad']);
Route::get('/web_terminos_condiciones',                     [HomeController::class, 'web_terminos_condiciones']);
Route::get('/web_servicio_cliente',                         [HomeController::class, 'web_servicio_cliente']);
Route::get('/web_delivery_informacion',                     [HomeController::class, 'web_delivery_informacion']);
Route::get('/web_garantia',                                 [HomeController::class, 'web_garantia']);
Route::get('/web_devoluciones',                             [HomeController::class, 'web_devoluciones']);

//===== SUSCRIPTORES ======
Route::post('/subscribe',                                   [SuscriptoresController::class, 'crear_suscriptores'])->name('subscribe');
Route::get('/unsuscribe',                                   [SuscriptoresController::class, 'showUnsubscribeForm'])->name('unsubscribe.form');
Route::post('/unsuscribe',                                  [SuscriptoresController::class, 'unsubscribe'])->name('unsubscribe');



Route::get('/robots.txt', function () {
  $content = "User-agent: *\n";
  $content .= "Disallow: /admin/\n";
  $content .= "Disallow: /storage/\n";
  $content .= "Disallow: /vendor/\n";
  $content .= "Disallow: /node_modules/\n";
  $content .= "Allow: /public/storage/\n";
  $content .= "Allow: /uploads/\n";
  $content .= "Sitemap: " . url('/sitemap.xml') . "\n";

  return Response::make($content, 200, ['Content-Type' => 'text/plain']);
});


// ===================PARA EL SEO ==================
Route::get('/sitemap.xml', function () {

    $sitemap = Sitemap::create();

    // ===== Home =====
    $sitemap->add(
        Url::create('/')
            ->setPriority(1.0)
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
    );

    // ===== Static Pages (SEO URLs) =====
    $staticPages = [
        '/about' => 0.8,
        '/contact' => 0.7,
        '/servicio-cliente' => 0.6,
        '/politica-privacidad' => 0.3,
        '/terminos-condiciones' => 0.3,
        '/libro-reclamos' => 0.3,
        '/ubicacion' => 0.3,
        '/shop-detail-lista' => 0.3
    ];

    foreach ($staticPages as $url => $priority) {
        $sitemap->add(
            Url::create($url)
                ->setPriority($priority)
                ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
        );
    }



    // ===== Gallery / Categories =====
    if (class_exists('App\Models\ProductoCategoria')) {
        $galerias = ProductoCategoria::where('Activo', 'S')->get();

        foreach ($galerias as $galeria) {
            $sitemap->add(
                Url::create("/web_gallery/{$galeria->id_producto_categoria}")
                    ->setLastModificationDate($galeria->updated_at)
                    ->setPriority(0.6)
                    ->setChangeFrequency(Url::CHANGE_FREQUENCY_MONTHLY)
            );
        }
    }
    return response($sitemap->render(), 200)->header('Content-Type', 'application/xml');

});

Route::get('/comprobantes/{filename}',                              [FileController::class, 'show'])->name('comprobante.show');


//Redirect urls
Route::get('/about', [AboutController::class, 'web_about'])->name('about');
Route::get('/web_about', function () {
    return redirect('/about', 301);
});


/*
|--------------------------------------------------------------------------
| SEO Friendly Contact URL
|--------------------------------------------------------------------------
*/
Route::get('/contact', [ContactoController::class, 'web_contact'])
    ->name('contact');
/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/
Route::get('/web_contact', function () {
    return redirect('/contact', 301);
});

/*
|--------------------------------------------------------------------------
| SEO Friendly Servicio Cliente URL
|--------------------------------------------------------------------------
*/
Route::get('/servicio-cliente', [HomeController::class, 'web_servicio_cliente'])
    ->name('servicio.cliente');
/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/
Route::get('/web_servicio_cliente', function () {
    return redirect('/servicio-cliente', 301);
});
/*
|--------------------------------------------------------------------------
| SEO Friendly Términos y Condiciones URL
|--------------------------------------------------------------------------
*/
Route::get('/terminos-condiciones', [AmourController::class, 'terminos'])
    ->name('royal.terminos');
/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/
Route::get('/web_terminos_condiciones', function () {
    return redirect('/terminos-condiciones', 301);
});

/*
|--------------------------------------------------------------------------
| SEO Friendly Política de Privacidad URL
|--------------------------------------------------------------------------
*/
Route::get('/politica-privacidad', [AmourController::class, 'politicas'])
    ->name('royal.politicas');
/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/
Route::get('/web_politica_privacidad', function () {
    return redirect('/politica-privacidad', 301);
});
/*
|--------------------------------------------------------------------------
| SEO Friendly Delivery Información URL
|--------------------------------------------------------------------------
*/
Route::get('/delivery-informacion', [HomeController::class, 'web_delivery_informacion'])
    ->name('delivery.informacion');
/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| SEO Friendly Ubicación URL
|--------------------------------------------------------------------------
*/
Route::get('/ubicacion', [HomeController::class, 'web_ubicacion'])
    ->name('ubicacion');
/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/
Route::get('/web_ubicacion', function () {
    return redirect('/ubicacion', 301);
});

/*
|--------------------------------------------------------------------------
| SEO Friendly Shop Detail Lista URL
|--------------------------------------------------------------------------
*/





/*
|--------------------------------------------------------------------------
| SEO Friendly Libro de Reclamos URL
|--------------------------------------------------------------------------
*/
Route::get('/libro-reclamos', [LibroReclamosController::class, 'web_libro_reclamos'])
    ->name('libro.reclamos');

Route::match(['get','post'], '/libro-reclamos/estado', [LibroReclamosController::class, 'web_libro_reclamos_estado'])
    ->name('libro.reclamos.estado');

/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/
Route::get('/web_libro_reclamos', function () {
    return redirect('/libro-reclamos', 301);
});


/*
|--------------------------------------------------------------------------
| SEO Friendly Garantía URL
|--------------------------------------------------------------------------
*/
Route::get('/garantia', [HomeController::class, 'web_garantia'])
    ->name('garantia');


/*
|--------------------------------------------------------------------------
| Old URL Redirect (301)
|--------------------------------------------------------------------------
*/
Route::get('/web_garantia', function () {
    return redirect('/garantia', 301);
});