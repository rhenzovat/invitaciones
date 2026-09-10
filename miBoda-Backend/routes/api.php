<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerPopularController;
use App\Http\Controllers\Api\ClientesController;
use App\Http\Controllers\Api\EmpleadosController;
use App\Http\Controllers\Api\PerfilesController;
use App\Http\Controllers\Api\RolesController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VendedorController;
use App\Http\Controllers\Api\CategoriaPopularController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\ProductoImportController;
use App\Http\Controllers\Api\ProductoCategoriaController;
use App\Http\Controllers\Api\ProductoCategoriaSubController;
use App\Http\Controllers\Api\WebFooterController;
use App\Http\Controllers\Api\WebWhatsappConfigController;
use App\Http\Controllers\Api\WebSliderController;
use App\Http\Controllers\Api\WebPlanesController;
use App\Http\Controllers\Api\WebPorqueElejirnosController;
use App\Http\Controllers\Api\WebNuestroEquipoController;
use App\Http\Controllers\Api\WebHeaderController;
use App\Http\Controllers\Api\WebMasVendidoController;
use App\Http\Controllers\Api\WebAboutController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\MetadatosPaginaController;
use App\Http\Controllers\Api\AppFaviconController;
use App\Http\Controllers\Api\SistemaMenuController;
use App\Http\Controllers\Api\SistemaMenuTreeviewController;
use App\Http\Controllers\Api\SistemaObjetosController;
use App\Http\Controllers\Api\WebReclamosController;
use App\Http\Controllers\Api\SeguridadAuthProveedorController;
use App\Http\Controllers\Api\SeguridadAuthOAuthController;
use App\Http\Controllers\Api\SeguridadAuth2faController;
use App\Http\Controllers\Api\SeguridadUsuarioAuthConfigController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\BeneficioController;
use App\Http\Controllers\Api\WebMetodologiaController;
use App\Http\Controllers\Api\WebServiciosController;
use App\Http\Controllers\Api\WebPreguntasFrecuentesController;
use App\Http\Controllers\Api\WebTestimoniosController;
use App\Http\Controllers\Api\WebCarruselController;
use App\Http\Controllers\Api\WebPublicacionesController;
use App\Http\Controllers\Api\WebContadoresController;
use App\Http\Controllers\Api\WebPaginaNosotrosController;
use App\Http\Controllers\Api\WebPaginaProductosController;
use App\Http\Controllers\Api\WebPaginaContactoController;
use App\Http\Controllers\Api\WebAboutCaracteristicaController;
use App\Http\Controllers\Api\WebConfianzaItemController;
use App\Http\Controllers\Api\WebContadoresSeccionController;
use App\Http\Controllers\Api\WebProductoDestacadoController;
use App\Http\Controllers\Api\WebProductoCatalogoController;
use App\Http\Controllers\Api\WebLineaProductoController;
use App\Http\Controllers\Api\WebVideoController;
use App\Http\Controllers\Api\WebVideosController;
use App\Http\Controllers\Api\WebClienteController;
use App\Http\Controllers\Api\WebContactoLandingController;
use App\Http\Controllers\Api\WebPromoBannerController;
use App\Http\Controllers\Api\WebExperienciasController;
use App\Http\Controllers\Api\WebPaginaGaleriaController;
use App\Http\Controllers\Api\WebContactoMensajeController;
 

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/ 

Route::get('/', function () {
    return response()->json([
        'message' => 'Bienvenido a la API de royalsensorymassage',
        'documentation' => url('/api/documentation'),
        'status' => 'Operativo'
    ]);
});



// Ruta corregida para usar JWT
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return auth()->user(); // Cambiado a auth() en lugar de $request->user()
});

    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
    Route::post('/auth/olvido-contrasena', [AuthController::class, 'olvido_contrasena']);
    Route::post('/auth/restablecer-contrasena', [AuthController::class, 'restablecer_contrasena']);

    Route::get('/auth/metodos-login', [SeguridadAuthProveedorController::class, 'metodosLogin']);
    Route::get('/auth/oauth/redirect/{proveedor}', [SeguridadAuthOAuthController::class, 'redirect'])
        ->where('proveedor', 'microsoft|google')
        ->middleware('throttle:20,1');
    Route::get('/auth/oauth/callback/{proveedor}', [SeguridadAuthOAuthController::class, 'callback'])
        ->where('proveedor', 'microsoft|google')
        ->middleware('throttle:30,1');
    Route::post('/auth/oauth/exchange', [SeguridadAuthOAuthController::class, 'exchange'])
        ->middleware('throttle:15,1');

    Route::post('/auth/2fa/verify', [SeguridadAuth2faController::class, 'verify'])
        ->middleware('throttle:10,1');
    Route::post('/auth/2fa/mandatory/init', [SeguridadAuth2faController::class, 'mandatoryInit'])
        ->middleware('throttle:10,1');
    Route::post('/auth/2fa/mandatory/confirm', [SeguridadAuth2faController::class, 'mandatoryConfirm'])
        ->middleware('throttle:10,1');

    Route::post('/auth/metodos-por-email', [SeguridadUsuarioAuthConfigController::class, 'metodosPorEmail'])
        ->middleware('throttle:20,1');

    // Ruta pública para servir archivos de reclamos (sin auth, necesario para previsualización en iframe)
    Route::get('/storage_reclamo/{filename}', [FileController::class, 'show_reclamo']);

    //Stripe no envía token de autenticación, solo firma el payload con el Webhook Secret
    Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle'])
    ->name('stripe.webhook');

Route::get('/config/favicon', [AppFaviconController::class, 'obtener']);

// Mensaje de contacto público (formulario del sitio) — sin auth, con throttle anti-spam
Route::post('/web_contacto_mensaje/crear', [WebContactoMensajeController::class, 'crear'])
    ->middleware('throttle:10,1')
    ->name('web_contacto_mensaje.crear');

// Invitación miBoda — formularios públicos (RSVP, canción, galería) — sin auth, con throttle anti-spam
Route::post('/miboda/rsvp', [\App\Http\Controllers\Api\MiBodaPublicController::class, 'rsvp'])
    ->middleware('throttle:10,1')
    ->name('miboda.rsvp');
Route::post('/miboda/cancion', [\App\Http\Controllers\Api\MiBodaPublicController::class, 'cancion'])
    ->middleware('throttle:10,1')
    ->name('miboda.cancion');
Route::post('/miboda/galeria-foto', [\App\Http\Controllers\Api\MiBodaPublicController::class, 'galeriaUpload'])
    ->middleware('throttle:10,1')
    ->name('miboda.galeria_foto');


Route::group(['middleware' => ['auth:api']], function () {
    //Cuando se carga la pagina, valida de que siga conectado o entodo caso se redirecciona al login:Profile
    //await axios.post(`${API_URL}/api/usuario/obtener`, { id: userId }); - React
    Route::post('/perfil/validar_conexion',       [AuthController::class, 'validar_conexion']);
    Route::post('/perfil/validar_perfil',         [AuthController::class, 'validar_perfil']);

    Route::get('/auth/2fa/status', [SeguridadAuth2faController::class, 'status']);
    Route::post('/auth/2fa/setup', [SeguridadAuth2faController::class, 'setup'])->middleware('throttle:5,1');
    Route::post('/auth/2fa/confirm', [SeguridadAuth2faController::class, 'confirm'])->middleware('throttle:10,1');
    Route::post('/auth/2fa/disable', [SeguridadAuth2faController::class, 'disable'])->middleware('throttle:5,1');
    Route::post('/auth/2fa/recovery/regenerate', [SeguridadAuth2faController::class, 'regenerateRecovery'])
        ->middleware('throttle:3,1');

    //Clientes
    Route::get('/clientes/obtener',               [ClientesController::class, 'obtener']);
    Route::get('/clientes/listar',                [ClientesController::class, 'listar']);
    Route::post('/clientes/crear',                [ClientesController::class, 'crear']);
    Route::put('/clientes/actualizar',            [ClientesController::class, 'actualizar']);
    Route::delete('/clientes/eliminar',           [ClientesController::class, 'eliminar']);

    //Empleados
    Route::get('/empleados/obtener',              [EmpleadosController::class, 'obtener']);
    Route::get('/empleados/listar',               [EmpleadosController::class, 'listar']);
    Route::post('/empleados/crear',               [EmpleadosController::class, 'crear']);
    Route::put('/empleados/actualizar',           [EmpleadosController::class, 'actualizar']);
    Route::delete('/empleados/eliminar',          [EmpleadosController::class, 'eliminar']);

    //Perfiles
    Route::get('/perfiles/obtener',               [PerfilesController::class, 'obtener']);
    Route::get('/perfiles/listar',                [PerfilesController::class, 'listar']);
    Route::post('/perfiles/crear',                [PerfilesController::class, 'crear']);
    Route::put('/perfiles/actualizar',            [PerfilesController::class, 'actualizar']);
    Route::delete('/perfiles/eliminar',           [PerfilesController::class, 'eliminar']);

    Route::post('/perfiles/obtener_asignar',      [PerfilesController::class, 'obtener_asignar']);
    Route::get('/perfiles/obtener_lista',         [PerfilesController::class, 'obtener_lista']);
    Route::get('/perfiles/obtener_check',         [PerfilesController::class, 'obtener_check']);
    Route::delete('/perfiles/obtener_eliminar',   [PerfilesController::class, 'obtener_eliminar']);
    Route::delete('/perfiles/eliminar_multiple',  [PerfilesController::class, 'eliminar_multiple']);

    //Roles-1
    Route::get('/roles/obtener',                  [RolesController::class, 'obtener']);
    Route::get('/roles/listar',                   [RolesController::class, 'listar']);
    Route::post('/roles/crear',                   [RolesController::class, 'crear']);
    Route::put('/roles/actualizar',               [RolesController::class, 'actualizar']);
    Route::delete('/roles/eliminar',              [RolesController::class, 'eliminar']);
    Route::get('/roles/listar_treeview',          [SistemaMenuTreeviewController::class, 'listar']);
    Route::post('/roles/agregar_permisos',        [SistemaMenuTreeviewController::class, 'guardar']);
    Route::post('/roles/copiar_permisos',         [SistemaMenuTreeviewController::class, 'copiar_permisos']);
    
    Route::get('/menu_treeview/listar',           [SistemaMenuTreeviewController::class, 'listar']);
    Route::post('/menu_treeview/guardar',         [SistemaMenuTreeviewController::class, 'guardar']);
    
    Route::post('/roles/obtener_asignar',         [RolesController::class, 'obtener_asignar']);
    Route::get('/roles/obtener_lista',            [RolesController::class, 'obtener_lista']);
    Route::get('/roles/obtener_check',            [RolesController::class, 'obtener_check']);
    Route::delete('/roles/obtener_eliminar',      [RolesController::class, 'obtener_eliminar']);
    Route::delete('/roles/eliminar_multiple',     [RolesController::class, 'eliminar_multiple']);

    // Menús y objetos (gestión)
    Route::get('/menu/listar_rutas_sistema',      [SistemaMenuController::class, 'listarRutasSistema']);
    Route::get('/menu/resolver_modulo_ruta',       [SistemaMenuController::class, 'resolver_modulo_ruta']);
    Route::post('/menu/desactivar_modulo_rol',     [SistemaMenuController::class, 'desactivar_modulo_rol']);
    Route::get('/menu/favoritos/listar',           [SistemaMenuController::class, 'listar_favoritos']);
    Route::post('/menu/favoritos/toggle',          [SistemaMenuController::class, 'toggle_favorito']);
    Route::post('/menu/favoritos/registrar_visita', [SistemaMenuController::class, 'registrar_visita_favorito']);
    Route::get('/menu/listar',                    [SistemaMenuController::class, 'listar']);
    Route::get('/menu/listar_modulos',            [SistemaMenuController::class, 'listar_modulos']);
    Route::post('/menu/crear_modulo',             [SistemaMenuController::class, 'crear_modulo']);
    Route::post('/menu/convertir_sin_modulo',     [SistemaMenuController::class, 'convertir_sin_modulo']);
    Route::put('/menu/actualizar_modulo',         [SistemaMenuController::class, 'actualizar_modulo']);
    Route::delete('/menu/eliminar_modulo',        [SistemaMenuController::class, 'eliminar_modulo']);
    Route::post('/menu/reordenar_modulos',       [SistemaMenuController::class, 'reordenar_modulos']);
    Route::get('/menu/listar_orden_sidebar',      [SistemaMenuController::class, 'listar_orden_sidebar']);
    Route::post('/menu/reordenar_sidebar',        [SistemaMenuController::class, 'reordenar_sidebar']);
    Route::get('/menu/mi_orden_sidebar',              [SistemaMenuController::class, 'listar_mi_orden_sidebar']);
    Route::post('/menu/guardar_mi_orden_sidebar',    [SistemaMenuController::class, 'guardar_mi_orden_sidebar']);
    Route::post('/menu/guardar_mi_etiqueta_sidebar', [SistemaMenuController::class, 'guardar_mi_etiqueta_sidebar']);
    Route::post('/menu/guardar_etiqueta_sidebar',    [SistemaMenuController::class, 'guardar_etiqueta_sidebar']);
    Route::get('/menu/listar_sidebar',            [SistemaMenuController::class, 'listar_sidebar']);
    Route::post('/menu/crear',                    [SistemaMenuController::class, 'crear']);
    Route::put('/menu/actualizar',                 [SistemaMenuController::class, 'actualizar']);
    Route::post('/menu/reordenar',                 [SistemaMenuController::class, 'reordenar']);
    Route::delete('/menu/eliminar',               [SistemaMenuController::class, 'eliminar']);
    Route::get('/menu/listar_objetos_menu',      [SistemaMenuController::class, 'listar_objetos_menu']);
    Route::post('/menu/asignar_objeto',           [SistemaMenuController::class, 'asignar_objeto']);
    Route::delete('/menu/quitar_objeto',         [SistemaMenuController::class, 'quitar_objeto']);
    Route::get('/menu/listar_objetos_modulo',    [SistemaMenuController::class, 'listar_objetos_modulo']);
    Route::post('/menu/asignar_objeto_modulo',   [SistemaMenuController::class, 'asignar_objeto_modulo']);
    Route::delete('/menu/quitar_objeto_modulo',  [SistemaMenuController::class, 'quitar_objeto_modulo']);

    Route::get('/administracion_etiquetas/listar',          [\App\Http\Controllers\Api\AdministracionEtiquetasController::class, 'listar']);
    Route::get('/administracion_etiquetas/listar_opciones', [\App\Http\Controllers\Api\AdministracionEtiquetasController::class, 'listar_opciones']);
    Route::post('/administracion_etiquetas/crear',          [\App\Http\Controllers\Api\AdministracionEtiquetasController::class, 'crear']);
    Route::put('/administracion_etiquetas/actualizar',      [\App\Http\Controllers\Api\AdministracionEtiquetasController::class, 'actualizar']);
    Route::delete('/administracion_etiquetas/eliminar',     [\App\Http\Controllers\Api\AdministracionEtiquetasController::class, 'eliminar']);

    Route::get('/objetos/listar',                 [SistemaObjetosController::class, 'listar']);
    Route::post('/objetos/crear',                 [SistemaObjetosController::class, 'crear']);
    Route::put('/objetos/actualizar',            [SistemaObjetosController::class, 'actualizar']);
    Route::delete('/objetos/eliminar',            [SistemaObjetosController::class, 'eliminar']);

    //Usuarios
    Route::post('/usuario/obtener',               [UserController::class, 'obtener']);
    Route::get('/usuario/listar',                 [UserController::class, 'listar']);
    Route::post('/usuario/crear',                 [UserController::class, 'crear']);
    Route::post('/usuario/actualizar',            [UserController::class, 'actualizar']);
    Route::delete('/usuario/eliminar',            [UserController::class, 'eliminar']);
    Route::get('/usuario/admin-principal',        [UserController::class, 'adminPrincipal']);
    Route::post('/usuario/transferir-admin-principal', [UserController::class, 'transferirAdminPrincipal']);
    Route::post('/usuario/auth-config/obtener', [SeguridadUsuarioAuthConfigController::class, 'obtener']);
    Route::post('/usuario/auth-config/guardar', [SeguridadUsuarioAuthConfigController::class, 'guardar']);
    Route::post('/usuario/auth-config/resetear-2fa', [SeguridadUsuarioAuthConfigController::class, 'resetear2fa']);
    Route::get('/usuario/listar_repartidores', [UserController::class, 'listar_repartidores']);

    //Vendedor
    Route::get('/vendedor/obtener',               [VendedorController::class, 'obtener']);
    Route::get('/vendedor/listar',                [VendedorController::class, 'listar']);
    Route::post('/vendedor/crear',                [VendedorController::class, 'crear']);
    Route::put('/vendedor/actualizar',            [VendedorController::class, 'actualizar']);
    Route::delete('/vendedor/eliminar',           [VendedorController::class, 'eliminar']);

    //Backup
    Route::get('/backup/listar',           [BackupController::class, 'listar']);
    Route::post('/backup/generar',         [BackupController::class, 'generar']);
    Route::get('/backup/descargar',        [BackupController::class, 'descargar']);
    Route::delete('/backup/eliminar',      [BackupController::class, 'eliminar']);


     
     //Productos
    Route::get('/producto/obtener',                         [ProductoController::class, 'obtener']);
    Route::get('/producto/listar',                          [ProductoController::class, 'listar']);
    Route::get('/producto/listar_filtro',                   [ProductoController::class, 'listar_filtro']);
    Route::get('/producto/verificar_codigo',                [ProductoController::class, 'verificarCodigo']);

    Route::post('/producto/crear',                          [ProductoController::class, 'crear']);
    Route::post('/producto/actualizar',                     [ProductoController::class, 'actualizar']);
    Route::post('/producto/actualizar_subproducto',         [ProductoController::class, 'actualizar_subproducto']);
    Route::post('/producto/actualizar_imagen_principal',    [ProductoController::class, 'actualizar_imagen_principal']);

    Route::delete('/producto/eliminar',                     [ProductoController::class, 'eliminar']);
    Route::get('/producto/listar_imagen',                   [ProductoController::class, 'listar_imagen']);
    Route::post('/producto/crear_imagen',                   [ProductoController::class, 'crear_imagen']);
    Route::delete('/producto/eliminar_imagen',              [ProductoController::class, 'eliminar_imagen']);
    Route::put('/producto/actualizar_imagen_orden',         [ProductoController::class, 'actualizar_imagen_orden']);
    Route::post('/producto/actualizar_ficha_tecnica',       [ProductoController::class, 'actualizar_ficha_tecnica']);
    Route::get('/producto/obtener_ficha_tecnica',           [ProductoController::class, 'obtener_ficha_tecnica']);
    Route::get('/producto/obtener_imagen',                  [ProductoController::class, 'obtener_imagen']);
    
    Route::get('/producto/listar_fotos',                    [ProductoController::class, 'listar_fotos']);
    Route::post('/producto/crear_fotos',                    [ProductoController::class, 'crear_fotos']);
    Route::delete('/producto/eliminar_fotos',               [ProductoController::class, 'eliminar_fotos']);
    Route::put('/producto/actualizar_foto_orden',           [ProductoController::class, 'actualizar_foto_orden']);
    Route::get('/producto/obtener_dimension_producto',      [ProductoController::class, 'obtener_dimension_producto']);
    Route::get('/producto/listar_por_fechas',                 [ProductoController::class, 'listar_por_fechas']);
    Route::get('/producto/exportar',                           [ProductoController::class, 'exportar']);
    Route::post('/producto/importar',                         [ProductoImportController::class, 'importar']);
    Route::post('/producto/importar-imagenes',               [ProductoImportController::class, 'importarImagenes']);


    //Producto Categoria
    Route::get('/producto_categoria/obtener',               [ProductoCategoriaController::class, 'obtener']);
    Route::get('/producto_categoria/listar',                [ProductoCategoriaController::class, 'listar']);
    Route::post('/producto_categoria/crear',                [ProductoCategoriaController::class, 'crear']);
    Route::put('/producto_categoria/actualizar',            [ProductoCategoriaController::class, 'actualizar']);
    Route::delete('/producto_categoria/eliminar',           [ProductoCategoriaController::class, 'eliminar']);
    Route::get('/producto_categoria/listar_tipo',           [ProductoCategoriaController::class, 'listar_tipo']);

    //Producto Categoria Sub
    Route::get('/producto_categoria_sub/obtener',               [ProductoCategoriaSubController::class, 'obtener']);
    Route::get('/producto_categoria_sub/listar',                [ProductoCategoriaSubController::class, 'listar']);
    Route::post('/producto_categoria_sub/crear',                [ProductoCategoriaSubController::class, 'crear']);
    Route::put('/producto_categoria_sub/actualizar',            [ProductoCategoriaSubController::class, 'actualizar']);
    Route::delete('/producto_categoria_sub/eliminar',           [ProductoCategoriaSubController::class, 'eliminar']);
    Route::get('/producto_categoria_sub/listar_tipo',           [ProductoCategoriaSubController::class, 'listar_tipo']);
    Route::get('/producto_categoria_sub/listar_obtener',        [ProductoCategoriaSubController::class, 'listar_obtener']);

    //Web Header
    Route::get('/web_header/obtener',    [WebHeaderController::class, 'obtener']);
    Route::post('/web_header/actualizar',[WebHeaderController::class, 'actualizar']);

    //Web Nuestro Equipo
    Route::get('/web_nuestro_equipo/listar',            [WebNuestroEquipoController::class, 'listar']);
    Route::post('/web_nuestro_equipo/crear',             [WebNuestroEquipoController::class, 'crear']);
    Route::post('/web_nuestro_equipo/actualizar',        [WebNuestroEquipoController::class, 'actualizar']);
    Route::post('/web_nuestro_equipo/actualizar_seccion',[WebNuestroEquipoController::class, 'actualizar_seccion']);
    Route::delete('/web_nuestro_equipo/eliminar',        [WebNuestroEquipoController::class, 'eliminar']);

    //Web Porque Elejirnos
    Route::get('/web_porque_elejirnos/obtener',    [WebPorqueElejirnosController::class, 'obtener']);
    Route::post('/web_porque_elejirnos/actualizar',[WebPorqueElejirnosController::class, 'actualizar']);

    //Web Planes
    Route::get('/web_planes/listar',                               [WebPlanesController::class, 'listar']);
    Route::get('/web_planes/obtener',                              [WebPlanesController::class, 'obtener']);
    Route::post('/web_planes/crear',                               [WebPlanesController::class, 'crear']);
    Route::post('/web_planes/actualizar',                          [WebPlanesController::class, 'actualizar']);
    Route::delete('/web_planes/eliminar',                          [WebPlanesController::class, 'eliminar']);

    //Web Footer
    Route::get('/web_footer/obtener',                             [WebFooterController::class, 'obtener']);
    Route::get('/web_footer/listar',                              [WebFooterController::class, 'listar']);
    Route::post('/web_footer/crear',                              [WebFooterController::class, 'crear']);
    Route::post('/web_footer/actualizar',                         [WebFooterController::class, 'actualizar']);
    Route::post('/web_footer/actualizar_logos',                   [WebFooterController::class, 'actualizar_logos']);
    Route::delete('/web_footer/eliminar',                         [WebFooterController::class, 'eliminar']);
    Route::get('/web_footer/obtener_document',                    [WebFooterController::class, 'obtener_document']);
    Route::post('/web_footer/actualizar_document',                [WebFooterController::class, 'actualizar_document']);

    // WhatsApp flotante (singleton)
    Route::get('/web_whatsapp_config/obtener',                    [WebWhatsappConfigController::class, 'obtener']);
    Route::post('/web_whatsapp_config/actualizar',                [WebWhatsappConfigController::class, 'actualizar']);
       
    //Web About
    Route::get('/web_slider/obtener',                             [WebSliderController::class, 'obtener']);
    Route::get('/web_slider/listar',                              [WebSliderController::class, 'listar']);
    Route::get('/web_slider/configuracion',                       [WebSliderController::class, 'configuracion']);
    Route::post('/web_slider/actualizar_configuracion',           [WebSliderController::class, 'actualizarConfiguracion']);
    Route::post('/web_slider/actualizar',                         [WebSliderController::class, 'actualizar']);
    Route::post('/web_slider/crear',                              [WebSliderController::class, 'crear']);
    Route::delete('/web_slider/eliminar',                          [WebSliderController::class, 'eliminar']);

    //Web About
    Route::get('/web_about/obtener',                             [WebAboutController::class, 'obtener']);
    Route::get('/web_about/listar',                              [WebAboutController::class, 'listar']);
    Route::post('/web_about/actualizar',                         [WebAboutController::class, 'actualizar']);
    
    //Web Metodología
    Route::get('/web_metodologia/listar',                         [WebMetodologiaController::class, 'listar']);
    Route::post('/web_metodologia/actualizar',                    [WebMetodologiaController::class, 'actualizar']);

    //Web Servicios
    Route::get('/web_servicios/listar',                           [WebServiciosController::class, 'listar']);
    Route::post('/web_servicios/crear',                           [WebServiciosController::class, 'crear']);
    Route::post('/web_servicios/actualizar',                      [WebServiciosController::class, 'actualizar']);
    Route::delete('/web_servicios/eliminar',                      [WebServiciosController::class, 'eliminar']);

    //Web Masaje FAQ (Masajes Tántricos — secciones informativas)
    Route::get('/web_masaje_faq',                                 [\App\Http\Controllers\Api\WebMasajeFaqController::class, 'index']);
    Route::post('/web_masaje_faq',                                [\App\Http\Controllers\Api\WebMasajeFaqController::class, 'store']);
    Route::get('/web_masaje_faq/{id}',                            [\App\Http\Controllers\Api\WebMasajeFaqController::class, 'show']);
    Route::put('/web_masaje_faq/{id}',                            [\App\Http\Controllers\Api\WebMasajeFaqController::class, 'update']);
    Route::delete('/web_masaje_faq/{id}',                         [\App\Http\Controllers\Api\WebMasajeFaqController::class, 'destroy']);
    Route::post('/web_masaje_faq/reorder',                        [\App\Http\Controllers\Api\WebMasajeFaqController::class, 'reorder']);

    // Página FAQ (encabezado + imagen de la sección)
    Route::get('/web_pagina_faq',                                 [\App\Http\Controllers\Api\WebPaginaFaqController::class, 'obtener']);
    Route::post('/web_pagina_faq',                                [\App\Http\Controllers\Api\WebPaginaFaqController::class, 'actualizar']);

    //Web Página Experiencias (configuración de la página)
    Route::get('/web_pagina_experiencias',                        [\App\Http\Controllers\Api\WebPaginaExperienciasController::class, 'show']);
    Route::put('/web_pagina_experiencias',                        [\App\Http\Controllers\Api\WebPaginaExperienciasController::class, 'update']);
    Route::post('/web_pagina_experiencias/upload_hero',           [\App\Http\Controllers\Api\WebPaginaExperienciasController::class, 'uploadHero']);

    Route::get('/web_pagina_masajes',                             [\App\Http\Controllers\Api\WebPaginaMasajesController::class, 'show']);
    Route::put('/web_pagina_masajes',                             [\App\Http\Controllers\Api\WebPaginaMasajesController::class, 'update']);
    Route::post('/web_pagina_masajes/upload_hero',                [\App\Http\Controllers\Api\WebPaginaMasajesController::class, 'uploadHero']);

    //Web Preguntas Frecuentes (FAQ)
    Route::get('/web_faq/listar',                                 [WebPreguntasFrecuentesController::class, 'listar']);
    Route::post('/web_faq/crear',                                 [WebPreguntasFrecuentesController::class, 'crear']);
    Route::post('/web_faq/actualizar',                            [WebPreguntasFrecuentesController::class, 'actualizar']);
    Route::post('/web_faq/eliminar',                              [WebPreguntasFrecuentesController::class, 'eliminar']);
    Route::post('/web_faq/actualizar_seccion',                    [WebPreguntasFrecuentesController::class, 'actualizarSeccion']);

    //Web Testimonios
    Route::get('/web_testimonios/listar',                         [WebTestimoniosController::class, 'listar']);
    Route::post('/web_testimonios/crear',                         [WebTestimoniosController::class, 'crear']);
    Route::post('/web_testimonios/actualizar',                    [WebTestimoniosController::class, 'actualizar']);
    Route::delete('/web_testimonios/eliminar',                    [WebTestimoniosController::class, 'eliminar']);
    Route::post('/web_testimonios/actualizar_seccion',            [WebTestimoniosController::class, 'actualizarSeccion']);

    Route::get('/web_carrusel/listar',                            [WebCarruselController::class, 'listar']);
    Route::post('/web_carrusel/crear',                            [WebCarruselController::class, 'crear']);
    Route::post('/web_carrusel/actualizar',                       [WebCarruselController::class, 'actualizar']);
    Route::delete('/web_carrusel/eliminar',                       [WebCarruselController::class, 'eliminar']);
    Route::post('/web_carrusel/reordenar',                        [WebCarruselController::class, 'reordenar']);

    Route::get('/web_promo_banner/obtener',                       [WebPromoBannerController::class, 'obtener']);
    Route::post('/web_promo_banner/actualizar',                   [WebPromoBannerController::class, 'actualizar']);

    Route::get('/web_experiencias/listar',                        [WebExperienciasController::class, 'listar']);
    Route::post('/web_experiencias/crear',                        [WebExperienciasController::class, 'crear']);
    Route::post('/web_experiencias/actualizar',                   [WebExperienciasController::class, 'actualizar']);
    Route::delete('/web_experiencias/eliminar',                  [WebExperienciasController::class, 'eliminar']);

    Route::get('/web_pagina_galeria/listar',                      [WebPaginaGaleriaController::class, 'listar']);
    Route::post('/web_pagina_galeria/actualizar_seccion',        [WebPaginaGaleriaController::class, 'actualizar_seccion']);
    Route::post('/web_pagina_galeria/crear',                      [WebPaginaGaleriaController::class, 'crear']);
    Route::post('/web_pagina_galeria/actualizar',                 [WebPaginaGaleriaController::class, 'actualizar']);
    Route::delete('/web_pagina_galeria/eliminar',                 [WebPaginaGaleriaController::class, 'eliminar']);
    Route::post('/web_pagina_galeria/crear_categoria',            [WebPaginaGaleriaController::class, 'crear_categoria']);
    Route::post('/web_pagina_galeria/actualizar_categoria',       [WebPaginaGaleriaController::class, 'actualizar_categoria']);
    Route::delete('/web_pagina_galeria/eliminar_categoria',        [WebPaginaGaleriaController::class, 'eliminar_categoria']);



    

    // Web Publicaciones
    Route::get('/web_publicaciones/listar',                       [WebPublicacionesController::class, 'listar']);
    Route::post('/web_publicaciones/crear',                       [WebPublicacionesController::class, 'crear']);
    Route::post('/web_publicaciones/actualizar',                  [WebPublicacionesController::class, 'actualizar']);
    Route::post('/web_publicaciones/actualizar_seccion',          [WebPublicacionesController::class, 'actualizar_seccion']);
    Route::post('/web_publicaciones/actualizar_paginas_banner',   [WebPublicacionesController::class, 'actualizar_paginas_banner']);
    Route::delete('/web_publicaciones/eliminar',                  [WebPublicacionesController::class, 'eliminar']);

    // Web Contadores (banda estadísticas)
    Route::get('/web_contadores/listar',                          [WebContadoresController::class, 'listar']);
    Route::post('/web_contadores/crear',                          [WebContadoresController::class, 'crear']);
    Route::post('/web_contadores/actualizar',                     [WebContadoresController::class, 'actualizar']);
    Route::delete('/web_contadores/eliminar',                     [WebContadoresController::class, 'eliminar']);

    // Web About Características
    Route::get('/web_about_caracteristica/listar',                [WebAboutCaracteristicaController::class, 'listar']);
    Route::post('/web_about_caracteristica/crear',                [WebAboutCaracteristicaController::class, 'crear']);
    Route::post('/web_about_caracteristica/actualizar',           [WebAboutCaracteristicaController::class, 'actualizar']);
    Route::delete('/web_about_caracteristica/eliminar',           [WebAboutCaracteristicaController::class, 'eliminar']);

    // Web Confianza Items
    Route::get('/web_confianza_item/listar',                      [WebConfianzaItemController::class, 'listar']);
    Route::post('/web_confianza_item/crear',                      [WebConfianzaItemController::class, 'crear']);
    Route::post('/web_confianza_item/actualizar',                 [WebConfianzaItemController::class, 'actualizar']);
    Route::delete('/web_confianza_item/eliminar',                 [WebConfianzaItemController::class, 'eliminar']);

    // Web Contadores Sección
    Route::get('/web_contadores_seccion/obtener',                 [WebContadoresSeccionController::class, 'obtener']);
    Route::post('/web_contadores_seccion/actualizar',             [WebContadoresSeccionController::class, 'actualizar']);

    // Web Producto Destacado
    Route::get('/web_producto_destacado/listar',                  [WebProductoDestacadoController::class, 'listar']);
    Route::post('/web_producto_destacado/crear',                  [WebProductoDestacadoController::class, 'crear']);
    Route::post('/web_producto_destacado/actualizar',             [WebProductoDestacadoController::class, 'actualizar']);
    Route::post('/web_producto_destacado/actualizar_seccion',     [WebProductoDestacadoController::class, 'actualizar_seccion']);
    Route::delete('/web_producto_destacado/eliminar',             [WebProductoDestacadoController::class, 'eliminar']);

    // Web Producto Catálogo
    Route::get('/web_producto_catalogo/listar',                 [WebProductoCatalogoController::class, 'listar']);
    Route::post('/web_producto_catalogo/crear',                   [WebProductoCatalogoController::class, 'crear']);
    Route::post('/web_producto_catalogo/actualizar',              [WebProductoCatalogoController::class, 'actualizar']);
    Route::post('/web_producto_catalogo/actualizar_seccion',      [WebProductoCatalogoController::class, 'actualizar_seccion']);
    Route::delete('/web_producto_catalogo/eliminar',              [WebProductoCatalogoController::class, 'eliminar']);

    // Web Línea Producto
    Route::get('/web_linea_producto/listar',                      [WebLineaProductoController::class, 'listar']);
    Route::post('/web_linea_producto/crear',                      [WebLineaProductoController::class, 'crear']);
    Route::post('/web_linea_producto/actualizar',                 [WebLineaProductoController::class, 'actualizar']);
    Route::post('/web_linea_producto/actualizar_seccion',         [WebLineaProductoController::class, 'actualizar_seccion']);
    Route::delete('/web_linea_producto/eliminar',                 [WebLineaProductoController::class, 'eliminar']);

    // Web Videos (legacy web_video)
    Route::get('/web_video/listar',                               [WebVideoController::class, 'listar']);
    Route::get('/web_video/obtener_seccion',                      [WebVideoController::class, 'obtener_seccion']);
    Route::post('/web_video/crear',                               [WebVideoController::class, 'crear']);
    Route::post('/web_video/actualizar',                          [WebVideoController::class, 'actualizar']);
    Route::post('/web_video/actualizar_seccion',                  [WebVideoController::class, 'actualizar_seccion']);
    Route::delete('/web_video/eliminar',                          [WebVideoController::class, 'eliminar']);

    // Web Videos galería (web_videos)
    Route::get('/web_videos/obtener',                             [WebVideosController::class, 'obtener']);
    Route::get('/web_videos/listar',                              [WebVideosController::class, 'listar']);
    Route::post('/web_videos/actualizar_pagina',                  [WebVideosController::class, 'actualizar_pagina']);
    Route::post('/web_videos/crear',                              [WebVideosController::class, 'crear']);
    Route::post('/web_videos/actualizar',                         [WebVideosController::class, 'actualizar']);
    Route::delete('/web_videos/eliminar',                          [WebVideosController::class, 'eliminar']);

    // Web Clientes
    Route::get('/web_cliente/obtener_seccion',                    [WebClienteController::class, 'obtener_seccion']);
    Route::post('/web_cliente/actualizar_seccion',                [WebClienteController::class, 'actualizar_seccion']);
    Route::get('/web_cliente/listar_estadisticas',                [WebClienteController::class, 'listar_estadisticas']);
    Route::post('/web_cliente/crear_estadistica',                 [WebClienteController::class, 'crear_estadistica']);
    Route::post('/web_cliente/actualizar_estadistica',            [WebClienteController::class, 'actualizar_estadistica']);
    Route::delete('/web_cliente/eliminar_estadistica',            [WebClienteController::class, 'eliminar_estadistica']);
    Route::get('/web_cliente/listar_logos',                       [WebClienteController::class, 'listar_logos']);
    Route::post('/web_cliente/crear_logo',                        [WebClienteController::class, 'crear_logo']);
    Route::post('/web_cliente/actualizar_logo',                   [WebClienteController::class, 'actualizar_logo']);
    Route::delete('/web_cliente/eliminar_logo',                   [WebClienteController::class, 'eliminar_logo']);

    // Web Contacto Landing
    Route::get('/web_contacto_landing/obtener',                   [WebContactoLandingController::class, 'obtener']);
    Route::post('/web_contacto_landing/actualizar',               [WebContactoLandingController::class, 'actualizar']);

    // Web Contacto Mensajes (solo lectura admin)
    Route::get('/web_contacto_mensaje/listar',                    [WebContactoMensajeController::class, 'listar']);
    Route::get('/web_contacto_mensaje/obtener',                   [WebContactoMensajeController::class, 'obtener']);

    // Invitación miBoda — bandejas admin (RSVP, canción, galería)
    Route::get('/web_rsvp_respuestas/listar',                     [\App\Http\Controllers\Api\WebRsvpRespuestaController::class, 'listar']);
    Route::delete('/web_rsvp_respuestas/eliminar',                [\App\Http\Controllers\Api\WebRsvpRespuestaController::class, 'eliminar']);

    Route::get('/web_cancion_sugerencias/listar',                 [\App\Http\Controllers\Api\WebCancionSugerenciaController::class, 'listar']);
    Route::delete('/web_cancion_sugerencias/eliminar',            [\App\Http\Controllers\Api\WebCancionSugerenciaController::class, 'eliminar']);

    Route::get('/web_galeria_fotos/listar',                       [\App\Http\Controllers\Api\WebGaleriaFotoController::class, 'listar']);
    Route::delete('/web_galeria_fotos/eliminar',                  [\App\Http\Controllers\Api\WebGaleriaFotoController::class, 'eliminar']);

    Route::get('/web_evento/obtener',                             [\App\Http\Controllers\Api\WebEventoController::class, 'obtener']);
    Route::post('/web_evento/actualizar',                         [\App\Http\Controllers\Api\WebEventoController::class, 'actualizar']);
    Route::post('/web_evento/subir_imagen',                       [\App\Http\Controllers\Api\WebEventoController::class, 'subirImagen']);

    Route::get('/web_invitados/listar',                           [\App\Http\Controllers\Api\WebInvitadoController::class, 'listar']);
    Route::post('/web_invitados/crear',                           [\App\Http\Controllers\Api\WebInvitadoController::class, 'crear']);
    Route::post('/web_invitados/actualizar',                      [\App\Http\Controllers\Api\WebInvitadoController::class, 'actualizar']);
    Route::delete('/web_invitados/eliminar',                      [\App\Http\Controllers\Api\WebInvitadoController::class, 'eliminar']);

    // Página Nosotros (banner, marcas, galería)
    Route::get('/web_pagina_nosotros/obtener',                    [WebPaginaNosotrosController::class, 'obtener']);
    Route::post('/web_pagina_nosotros/actualizar_pagina',         [WebPaginaNosotrosController::class, 'actualizar_pagina']);
    Route::post('/web_pagina_nosotros/actualizar_quienes',        [WebPaginaNosotrosController::class, 'actualizar_quienes']);
    Route::post('/web_pagina_nosotros/crear_beneficio',           [WebPaginaNosotrosController::class, 'crear_beneficio']);
    Route::post('/web_pagina_nosotros/actualizar_beneficio',      [WebPaginaNosotrosController::class, 'actualizar_beneficio']);
    Route::delete('/web_pagina_nosotros/eliminar_beneficio',      [WebPaginaNosotrosController::class, 'eliminar_beneficio']);
    Route::post('/web_pagina_nosotros/crear_contador',            [WebPaginaNosotrosController::class, 'crear_contador']);
    Route::post('/web_pagina_nosotros/actualizar_contador',       [WebPaginaNosotrosController::class, 'actualizar_contador']);
    Route::delete('/web_pagina_nosotros/eliminar_contador',       [WebPaginaNosotrosController::class, 'eliminar_contador']);
    Route::post('/web_pagina_nosotros/actualizar_producto_seccion',[WebPaginaNosotrosController::class, 'actualizar_producto_seccion']);
    Route::post('/web_pagina_nosotros/crear_producto',            [WebPaginaNosotrosController::class, 'crear_producto']);
    Route::post('/web_pagina_nosotros/actualizar_producto',       [WebPaginaNosotrosController::class, 'actualizar_producto']);
    Route::delete('/web_pagina_nosotros/eliminar_producto',       [WebPaginaNosotrosController::class, 'eliminar_producto']);

    // Página Productos
    Route::get('/web_pagina_productos/obtener',                   [WebPaginaProductosController::class, 'obtener']);
    Route::post('/web_pagina_productos/actualizar_pagina',        [WebPaginaProductosController::class, 'actualizar_pagina']);
    Route::post('/web_pagina_productos/actualizar_galeria_seccion',[WebPaginaProductosController::class, 'actualizar_galeria_seccion']);
    Route::post('/web_pagina_productos/crear_galeria',            [WebPaginaProductosController::class, 'crear_galeria']);
    Route::post('/web_pagina_productos/actualizar_galeria',      [WebPaginaProductosController::class, 'actualizar_galeria']);
    Route::delete('/web_pagina_productos/eliminar_galeria',       [WebPaginaProductosController::class, 'eliminar_galeria']);


    // Página Contacto
    Route::get('/web_pagina_contacto/obtener',                    [WebPaginaContactoController::class, 'obtener']);
    Route::post('/web_pagina_contacto/actualizar',                [WebPaginaContactoController::class, 'actualizar']);
    Route::post('/web_pagina_contacto/crear_columna',             [WebPaginaContactoController::class, 'crear_columna']);
    Route::post('/web_pagina_contacto/actualizar_columna',        [WebPaginaContactoController::class, 'actualizar_columna']);
    Route::delete('/web_pagina_contacto/eliminar_columna',        [WebPaginaContactoController::class, 'eliminar_columna']);

    //Web Lo más vendido
    Route::get('/web_masvendido/listar',                         [WebMasVendidoController::class, 'listar']);
    Route::post('/web_masvendido/actualizar',                    [WebMasVendidoController::class, 'actualizar']);




    Route::get('/storage/{filename}',                            [FileController::class, 'show']);
    Route::get('/storage_ckeditor/{filename}',                   [FileController::class, 'show_ckeditor']);//PARA DARLE PERSMISOS A LAS IMAGENES DE SUBIDA DE IMAGENES CKEDITO
    //=========== PARA ALMACENAR TODAS LAS IMAGENES DEL EDITOR DE TEXTO CKEDITOR====
    Route::post('/producto/crear_imagen_HtmlEditor',             [ProductoController::class, 'crear_imagen_HtmlEditor']);



    
    // Metadatos del día
    Route::get('/metadatospagina/obtener',                             [MetadatosPaginaController::class, 'obtener']);
    Route::get('/metadatospagina/listar',                              [MetadatosPaginaController::class, 'listar']);
    Route::post('/metadatospagina/crear',                              [MetadatosPaginaController::class, 'crear']);
    Route::put('/metadatospagina/actualizar',                          [MetadatosPaginaController::class, 'actualizar']);
    Route::put('/metadatospagina/desactivar',                          [MetadatosPaginaController::class, 'desactivar']);
    Route::put('/metadatospagina/restaurar',                           [MetadatosPaginaController::class, 'restaurar']);
    

    // Rutas para Categorías Populares
     Route::get('/categoria-popular/listar',                         [CategoriaPopularController::class, 'listar']);
     Route::get('/categoria-popular/obtener/{id}',                   [CategoriaPopularController::class, 'obtener']);
     Route::post('/categoria-popular/crear',                         [CategoriaPopularController::class, 'crear']);
     Route::post('/categoria-popular/actualizar/{id}',                [CategoriaPopularController::class, 'actualizar']);
     Route::delete('/categoria-popular/eliminar/{id}',               [CategoriaPopularController::class, 'eliminar']);

     // Rutas para Banners Populares
     Route::get('/banner-popular/listar',                            [BannerPopularController::class, 'listar']);
     Route::get('/banner-popular/obtener/{id}',                      [BannerPopularController::class, 'obtener']);
     Route::post('/banner-popular/crear',                            [BannerPopularController::class, 'crear']);
     Route::post('/banner-popular/actualizar/{id}',                   [BannerPopularController::class, 'actualizar']);
     Route::delete('/banner-popular/eliminar/{id}',                  [BannerPopularController::class, 'eliminar']);

     // Pasarelas de Pago
     Route::get('/auth-proveedor/listar',                    [SeguridadAuthProveedorController::class, 'listar']);
     Route::post('/auth-proveedor/habilitar',                [SeguridadAuthProveedorController::class, 'habilitar']);
     Route::post('/auth-proveedor/predeterminado',           [SeguridadAuthProveedorController::class, 'predeterminado']);
     Route::post('/auth-proveedor/actualizar-config',       [SeguridadAuthProveedorController::class, 'actualizarConfig']);


     // Libro de Reclamos
     Route::get('/web_reclamos/listar',                     [WebReclamosController::class, 'listar']);
     Route::get('/web_reclamos/obtener',                    [WebReclamosController::class, 'obtener']);
     Route::put('/web_reclamos/actualizar',                 [WebReclamosController::class, 'actualizar']);
     Route::delete('/web_reclamos/eliminar',                [WebReclamosController::class, 'eliminar']);



    Route::get('/beneficio/listar', [BeneficioController::class, 'listar']);
    Route::put('/beneficio/actualizar', [BeneficioController::class, 'actualizar']);

    // Favicon panel / web (archivos en public/)
    Route::post('/config/favicon', [AppFaviconController::class, 'actualizar']);



   

});

// Route::get('/programacion/export_excel',           [ProgramacionController::class, 'export_excel']);

