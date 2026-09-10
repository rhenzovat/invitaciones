<?php

namespace App\Http\Controllers\Api;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\ClienteResource;
use App\Models\Producto;
use App\Models\ProductoImagen;
use App\Models\ProductoFichaTecnica;
use App\Exports\ProductosExport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

/**
 * @OA\Get(
 *     path="/producto/obtener",
 *     tags={"Productos"},
 *     summary="Obtener producto por ID",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="id", in="query", required=true, @OA\Schema(type="integer"), example=5),
 *     @OA\Response(response=200, description="Producto encontrado",
 *         @OA\JsonContent(ref="#/components/schemas/SuccessResponse")
 *     )
 * )
 *
 * @OA\Get(
 *     path="/producto/listar",
 *     tags={"Productos"},
 *     summary="Listar todos los productos activos",
 *     security={{"bearerAuth":{}}},
 *     @OA\Response(response=200, description="Lista de productos",
 *         @OA\JsonContent(ref="#/components/schemas/PaginatedListResponse")
 *     )
 * )
 *
 * @OA\Get(
 *     path="/producto/listar_filtro",
 *     tags={"Productos"},
 *     summary="Listar productos filtrados por tipo",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="id_producto_tipo", in="query", @OA\Schema(type="integer"), example=1),
 *     @OA\Response(response=200, description="Lista filtrada",
 *         @OA\JsonContent(ref="#/components/schemas/PaginatedListResponse")
 *     )
 * )
 *
 * @OA\Get(
 *     path="/producto/listar_por_fechas",
 *     tags={"Productos"},
 *     summary="Listar productos por rango de fechas de creación",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="fecha_inicio", in="query", @OA\Schema(type="string", format="date"), example="2024-01-01"),
 *     @OA\Parameter(name="fecha_fin", in="query", @OA\Schema(type="string", format="date"), example="2024-12-31"),
 *     @OA\Response(response=200, description="Productos encontrados",
 *         @OA\JsonContent(ref="#/components/schemas/PaginatedListResponse")
 *     )
 * )
 *
 * @OA\Get(
 *     path="/producto/exportar",
 *     tags={"Productos"},
 *     summary="Exportar productos a Excel",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="fecha_inicio", in="query", @OA\Schema(type="string", format="date")),
 *     @OA\Parameter(name="fecha_fin", in="query", @OA\Schema(type="string", format="date")),
 *     @OA\Response(response=200, description="Archivo Excel en base64",
 *         @OA\JsonContent(
 *             @OA\Property(property="success", type="boolean", example=true),
 *             @OA\Property(property="result", type="object",
 *                 @OA\Property(property="fileName", type="string", example="productos_2024-01-01.xlsx"),
 *                 @OA\Property(property="fileBase64", type="string", description="Excel codificado en base64")
 *             )
 *         )
 *     ),
 *     @OA\Response(response=500, description="Error al exportar")
 * )
 *
 * @OA\Post(
 *     path="/producto/crear",
 *     tags={"Productos"},
 *     summary="Crear producto (soporta multipart con imagen)",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\MediaType(mediaType="multipart/form-data",
 *             @OA\Schema(
 *                 required={"nombre","precio","stock","id_producto_categoria","Activo"},
 *                 @OA\Property(property="nombre", type="string", example="Maleta de Viaje"),
 *                 @OA\Property(property="descripcion", type="string"),
 *                 @OA\Property(property="precio", type="number", example=99.90),
 *                 @OA\Property(property="precio_old", type="number", example=129.90),
 *                 @OA\Property(property="stock", type="integer", example=50),
 *                 @OA\Property(property="id_producto_categoria", type="integer", example=1),
 *                 @OA\Property(property="id_producto_categoria_sub", type="integer"),
 *                 @OA\Property(property="id_producto_tipo", type="integer"),
 *                 @OA\Property(property="Activo", type="string", enum={"S","N"}, example="S"),
 *                 @OA\Property(property="peso_kilogramo", type="number"),
 *                 @OA\Property(property="precio_mayorista", type="number"),
 *                 @OA\Property(property="precio_mayorista_old", type="number"),
 *                 @OA\Property(property="precio_yape", type="number"),
 *                 @OA\Property(property="numero_estrellas", type="integer"),
 *                 @OA\Property(property="ratings_enabled", type="boolean", example=false),
 *                 @OA\Property(property="admin_rating", type="number"),
 *                 @OA\Property(property="meta_titulo_producto", type="string"),
 *                 @OA\Property(property="meta_descripcion_producto", type="string"),
 *                 @OA\Property(property="pro_imagen", type="string", format="binary", description="Imagen principal (max 15MB)")
 *             )
 *         )
 *     ),
 *     @OA\Response(response=200, description="Producto creado",
 *         @OA\JsonContent(ref="#/components/schemas/SuccessResponse")
 *     ),
 *     @OA\Response(response=422, description="Imagen inválida")
 * )
 *
 * @OA\Post(
 *     path="/producto/actualizar",
 *     tags={"Productos"},
 *     summary="Actualizar producto principal",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\MediaType(mediaType="multipart/form-data",
 *             @OA\Schema(
 *                 required={"id_producto"},
 *                 @OA\Property(property="id_producto", type="integer", example=5),
 *                 @OA\Property(property="nombre", type="string", example="Maleta de Viaje Premium"),
 *                 @OA\Property(property="precio", type="number", example=89.90),
 *                 @OA\Property(property="stock", type="integer", example=30),
 *                 @OA\Property(property="Activo", type="string", enum={"S","N"}, example="S"),
 *                 @OA\Property(property="pro_imagen", type="string", format="binary")
 *             )
 *         )
 *     ),
 *     @OA\Response(response=200, description="Producto actualizado")
 * )
 *
 * @OA\Delete(
 *     path="/producto/eliminar",
 *     tags={"Productos"},
 *     summary="Eliminar producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\JsonContent(
 *             required={"id"},
 *             @OA\Property(property="id", type="integer", example=5)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Producto eliminado")
 * )
 *
 * @OA\Get(
 *     path="/producto/listar_imagen",
 *     tags={"Productos"},
 *     summary="Listar sub-imágenes de un producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="id_producto", in="query", required=true, @OA\Schema(type="integer"), example=5),
 *     @OA\Response(response=200, description="Lista de imágenes")
 * )
 *
 * @OA\Post(
 *     path="/producto/crear_imagen",
 *     tags={"Productos"},
 *     summary="Agregar sub-imagen (sub-producto) a un producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\MediaType(mediaType="multipart/form-data",
 *             @OA\Schema(
 *                 required={"id_producto","Activo"},
 *                 @OA\Property(property="id_producto", type="integer", example=5),
 *                 @OA\Property(property="titulo", type="string"),
 *                 @OA\Property(property="precio", type="number"),
 *                 @OA\Property(property="descripcion", type="string"),
 *                 @OA\Property(property="stock", type="integer"),
 *                 @OA\Property(property="Activo", type="string", enum={"S","N"}, example="S"),
 *                 @OA\Property(property="image", type="string", format="binary")
 *             )
 *         )
 *     ),
 *     @OA\Response(response=200, description="Sub-imagen creada")
 * )
 *
 * @OA\Delete(
 *     path="/producto/eliminar_imagen",
 *     tags={"Productos"},
 *     summary="Eliminar sub-imagen de producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\JsonContent(
 *             required={"id_producto_imagen"},
 *             @OA\Property(property="id_producto_imagen", type="integer", example=10)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Imagen eliminada")
 * )
 *
 * @OA\Post(
 *     path="/producto/actualizar_ficha_tecnica",
 *     tags={"Productos"},
 *     summary="Crear o actualizar ficha técnica del producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\JsonContent(
 *             required={"id_producto"},
 *             @OA\Property(property="id_producto", type="integer", example=5),
 *             @OA\Property(property="titulo1", type="string", example="Descripción"),
 *             @OA\Property(property="titulo2", type="string", example="Especificaciones"),
 *             @OA\Property(property="editorValue1", type="string"),
 *             @OA\Property(property="editorValue2", type="object"),
 *             @OA\Property(property="Activo", type="boolean", example=true)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Ficha técnica guardada"),
 *     @OA\Response(response=500, description="Error interno")
 * )
 *
 * @OA\Get(
 *     path="/producto/obtener_ficha_tecnica",
 *     tags={"Productos"},
 *     summary="Obtener ficha técnica del producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="id_producto", in="query", required=true, @OA\Schema(type="integer"), example=5),
 *     @OA\Response(response=200, description="Ficha técnica")
 * )
 *
 * @OA\Get(
 *     path="/producto/listar_fotos",
 *     tags={"Productos"},
 *     summary="Listar galería de fotos del producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\Parameter(name="id_producto", in="query", required=true, @OA\Schema(type="integer"), example=5),
 *     @OA\Response(response=200, description="Galería de fotos")
 * )
 *
 * @OA\Post(
 *     path="/producto/crear_fotos",
 *     tags={"Productos"},
 *     summary="Agregar foto a la galería del producto",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\MediaType(mediaType="multipart/form-data",
 *             @OA\Schema(
 *                 required={"id_producto"},
 *                 @OA\Property(property="id_producto", type="integer", example=5),
 *                 @OA\Property(property="image", type="string", format="binary")
 *             )
 *         )
 *     ),
 *     @OA\Response(response=200, description="Foto agregada")
 * )
 *
 * @OA\Delete(
 *     path="/producto/eliminar_fotos",
 *     tags={"Productos"},
 *     summary="Eliminar foto de galería",
 *     security={{"bearerAuth":{}}},
 *     @OA\RequestBody(required=true,
 *         @OA\JsonContent(
 *             required={"id_producto_foto"},
 *             @OA\Property(property="id_producto_foto", type="integer", example=3)
 *         )
 *     ),
 *     @OA\Response(response=200, description="Foto eliminada")
 * )
 */
class ProductoController extends Controller
{
    /**
     * FormData desde JS puede enviar el string "undefined"; MySQL rechaza eso en columnas DECIMAL.
     */
    private function nullableDecimal($value): ?float
    {
        if ($value === null || $value === '' || $value === 'null' || $value === 'undefined') {
            return null;
        }
        if (is_string($value)) {
            $value = trim($value);
            if ($value === '' || $value === 'null' || $value === 'undefined') {
                return null;
            }
        }
        if (!is_numeric($value)) {
            return null;
        }

        return (float) $value;
    }

    private function nullableInt($value): ?int
    {
        $f = $this->nullableDecimal($value);

        return $f === null ? null : (int) round($f);
    }

    /**
     * Solo límites técnicos: tipo imagen y tamaño máximo. Las medidas son recomendación en el front (modal).
     *
     * @return string|null null si es válida, mensaje de error en español si no
     */
    private function isEmptyCode(?string $val): bool
    {
        return $val === null || $val === '' || $val === 'null' || $val === 'undefined';
    }

    private function validateProImagenBasico(?UploadedFile $file): ?string
    {
        if (!$file || !$file->isValid()) {
            return 'Archivo de imagen no válido.';
        }
        $maxBytes = 15 * 1024 * 1024;
        if ($file->getSize() > $maxBytes) {
            return 'La imagen no debe superar 15 MB.';
        }
        $mime = strtolower((string) $file->getMimeType());
        if (! str_starts_with($mime, 'image/')) {
            return 'Debe ser un archivo de imagen (JPG, PNG, WebP, GIF, etc.).';
        }

        return null;
    }

    public function verificarCodigo(Request $request): JsonResponse
    {
        $campo     = $request->input('campo');
        $valor     = $request->input('valor');
        $excluirId = $request->input('id_producto');

        $camposPermitidos = ['codigo_producto_new', 'codigo_barra'];
        if (!in_array($campo, $camposPermitidos) || $this->isEmptyCode($valor)) {
            return response()->json(['duplicado' => false]);
        }

        $query = Producto::where($campo, $valor);
        if ($excluirId) {
            $query->where('id_producto', '!=', (int) $excluirId);
        }

        return response()->json(['duplicado' => $query->exists()]);
    }

    public function obtener(Request $request): JsonResponse
    {
        $id = $request->id;
        $result = DB::select('select * from administracion_producto where id_producto = ?', [$id]);
        return response()->json([
            'success' => true,
            'message' => 'Obtener registros!',
            'result' => $result
        ]);
    }

    public function listar()
    {
        $result = DB::select('CALL USP_ADMINISTRACION_PRODUCTO_LISTAR()');
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result
        ]);
    }

    public function listar_filtro(Request $request)
    {
        $query = Producto::query()
            ->leftJoin('administracion_producto_categoria as cat', 'administracion_producto.id_producto_categoria', '=', 'cat.id_producto_categoria')
            ->leftJoin('administracion_producto_categoria_sub as sub', 'administracion_producto.id_producto_categoria_sub', '=', 'sub.id_producto_categoria_sub')
            ->select('administracion_producto.*', 'cat.nombre as nombre_categoria', 'sub.nombre as nombre_subcategoria')
            ->orderBy('administracion_producto.id_producto', 'desc');

        $tipo = $request->input('id_producto_tipo');
        if ($tipo !== null && $tipo !== '' && $tipo !== '0' && $tipo !== 0 && $tipo !== 'null') {
            $query->where('administracion_producto.id_producto_tipo', $tipo);
        }
        $result = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result,
        ]);
    }

    /**
     * Listar productos filtrados por rango de fechas (created_at).
     */
    public function listar_por_fechas(Request $request): JsonResponse
    {
        $fechaInicio = $request->input('fecha_inicio');
        $fechaFin = $request->input('fecha_fin');

        $query = Producto::query()
            ->with(['categoria', 'subcategoria'])
            ->orderBy('created_at', 'desc');

        if ($fechaInicio) {
            $query->whereDate('created_at', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->whereDate('created_at', '<=', $fechaFin);
        }

        $result = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result
        ]);
    }

    /**
     * Exportar productos a Excel por rango de fechas.
     */
    public function exportar(Request $request): JsonResponse
    {
        $fechaInicio = $request->input('fecha_inicio');
        $fechaFin = $request->input('fecha_fin');

        try {
            $fileName = 'reportes/productos_' . date('Y-m-d_His') . '.xlsx';
            Excel::store(new ProductosExport($fechaInicio, $fechaFin), $fileName);

            $file = Storage::disk('local')->get($fileName);
            if ($file) {
                $fileLink = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' . base64_encode($file);
            } else {
                return response()->json(['success' => false, 'message' => 'Error al generar el archivo'], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Exportación exitosa',
                'result' => [
                    'fileName' => basename($fileName),
                    'fileBase64' => $fileLink,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar: ' . $e->getMessage()
            ], 500);
        }
    }

    public function crear(Request $request): JsonResponse
    {
        $filename = null;
        $message = null;

        if ($request->hasFile('pro_imagen')) {
            $errImg = $this->validateProImagenBasico($request->file('pro_imagen'));
            if ($errImg) {
                return response()->json([
                    'success' => false,
                    'message' => $errImg,
                    'result' => [
                        'message' => $errImg,
                    ],
                ], 422);
            }
        }

        //============= UNICIDAD: codigo_producto_new y codigo_barra ============
        $codigoNew = $request->codigo_producto_new;
        if (!$this->isEmptyCode($codigoNew)) {
            if (Producto::where('codigo_producto_new', $codigoNew)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "El código de producto «{$codigoNew}» ya está registrado en otro producto.",
                    'result'  => ['message' => "El código de producto «{$codigoNew}» ya está registrado en otro producto."],
                ]);
            }
        }
        $codigoBarra = $request->codigo_barra;
        if (!$this->isEmptyCode($codigoBarra)) {
            if (Producto::where('codigo_barra', $codigoBarra)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "El código de barra «{$codigoBarra}» ya está registrado en otro producto.",
                    'result'  => ['message' => "El código de barra «{$codigoBarra}» ya está registrado en otro producto."],
                ]);
            }
        }
        //============= CODIGO DE PRODUCTO ===============
        do {
            $codigo_producto = 'P-' . Str::upper(Str::random(6));
        } while (DB::table('administracion_producto')->where('codigo_producto', $codigo_producto)->exists());

        DB::beginTransaction();

        try {
            if ($request->hasFile('pro_imagen')) {
                $file       = $request->file("pro_imagen");
                $ext        = $file->getClientOriginalExtension();
                $filename_  = time() . '.' . $ext;
                $filename   = $file->storeAs('storage_/producto_principal', $filename_, ['disk' => 'public_imagenes']);
            }

            $dataToCreate = [
                'codigo_producto'               => $codigo_producto,
                'nombre'                        => $request->nombre,
                'descripcion'                   => ($request->descripcion !== null && $request->descripcion !== '' && $request->descripcion !== 'null') ? $request->descripcion : null,
                'precio'                        => $request->precio,
                'stock'                         => $request->stock,
                'id_producto_categoria'         => $request->id_producto_categoria,
                'id_producto_categoria_sub'     => ($request->id_producto_categoria_sub === null || $request->id_producto_categoria_sub === '' || $request->id_producto_categoria_sub === 'undefined' || $request->id_producto_categoria_sub === 'null') ? null : $request->id_producto_categoria_sub,
                'id_producto_tipo'              => ($request->id_producto_tipo === null || $request->id_producto_tipo === '' || $request->id_producto_tipo === 'undefined' || $request->id_producto_tipo === 'null') ? null : $request->id_producto_tipo,
                'url_imagen'                    => $filename,
                'created_at'                    => date("Y-m-d H:i:s"),
                'updated_at'                    => date("Y-m-d H:i:s"),
                'Activo'                        => $request->Activo,

                'precio_old'                    => $this->nullableDecimal($request->precio_old),
                'peso_kilogramo'                => $this->nullableDecimal($request->peso_kilogramo),
                'corte_tiempo_promocion'        => $request->corte_tiempo_promocion,
                'corte_tiempo_sabado'           => $request->corte_tiempo_sabado,
                'numero_estrellas'              => $this->nullableInt($request->input('numero_estrellas')),
                'precio_yape'                   => $this->nullableDecimal($request->precio_yape),

                'paquete_medidas'               => $request->paquete_medidas !== null && $request->paquete_medidas !== '' && $request->paquete_medidas !== 'null' && $request->paquete_medidas !== 'undefined' ? $request->paquete_medidas : null,
                'paquete_dimencion'             => $request->paquete_dimencion !== null && $request->paquete_dimencion !== '' && $request->paquete_dimencion !== 'null' && $request->paquete_dimencion !== 'undefined' ? $request->paquete_dimencion : null,
                'meta_titulo_producto'          => $request->meta_titulo_producto !== 'null' && $request->meta_titulo_producto !== 'undefined' ? $request->meta_titulo_producto : null,
                'meta_descripcion_producto'     => $request->meta_descripcion_producto !== 'null' && $request->meta_descripcion_producto !== 'undefined' ? $request->meta_descripcion_producto : null,
                'codigo_producto_new'           => $request->codigo_producto_new !== 'null' && $request->codigo_producto_new !== 'undefined' ? $request->codigo_producto_new : null,
                'codigo_barra'                  => $request->codigo_barra !== 'null' && $request->codigo_barra !== 'null' && $request->codigo_barra !== 'undefined' ? $request->codigo_barra : null,
                'ratings_enabled'               => $request->ratings_enabled === 'true' || $request->ratings_enabled === true || $request->ratings_enabled === 1 || $request->ratings_enabled === '1' ? 1 : 0,
                'admin_rating'                  => $this->nullableDecimal($request->admin_rating),
                'precio_mayorista'              => $this->nullableDecimal($request->precio_mayorista),
                'precio_mayorista_old'          => $this->nullableDecimal($request->precio_mayorista_old),
            ];

            if (Schema::hasColumn('administracion_producto', 'oferta_maxima_cantidad')) {
                $dataToCreate['oferta_maxima_cantidad'] = $this->nullableInt($request->input('oferta_maxima_cantidad'));
            }
            if (Schema::hasColumn('administracion_producto', 'oferta_maxima_cantidad_por_precio')) {
                $dataToCreate['oferta_maxima_cantidad_por_precio'] = $this->nullableDecimal($request->input('oferta_maxima_cantidad_por_precio'));
            }

            Producto::create($dataToCreate);

            DB::commit();
            $message = 'Registro insertado';
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            $message = $e->getMessage();
            DB::rollback();
        }

        return response()->json([
            'success' => $message != null ? true : false,
            'message' => 'Procesos exitosos.',
            'result' => [
                'message' => $message,
            ]
        ], 200);
    }

    public function actualizar(Request $request): JsonResponse
    {
        $filename = null;
        $message = null;

        if ($request->hasFile('pro_imagen')) {
            $errImg = $this->validateProImagenBasico($request->file('pro_imagen'));
            if ($errImg) {
                return response()->json([
                    'success' => false,
                    'message' => $errImg,
                    'result' => [
                        'message' => $errImg,
                    ],
                ], 422);
            }
        }

        if ($request->hasFile('pro_imagen')) {
            $result = Producto::where('id_producto', $request->id_producto)->get();

            // CORREGIDO: Usar getPublicHtmlPath()
            if (isset($result) && !empty($result[0]->url_imagen) && $result[0]->url_imagen != null) {
                $filePath = Helper::getPublicHtmlPath($result[0]->url_imagen);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            $file = $request->file("pro_imagen");
            $ext = $file->getClientOriginalExtension();
            $filename_ = time() . '.' . $ext;
            $filename = $file->storeAs('storage_/producto_principal', $filename_, ['disk' => 'public_imagenes']);
        }

        //============= UNICIDAD: codigo_producto_new y codigo_barra ============
        $idProducto = $request->input('id_producto');
        $codigoNew  = $request->codigo_producto_new;
        if (!$this->isEmptyCode($codigoNew)) {
            if (Producto::where('codigo_producto_new', $codigoNew)->where('id_producto', '!=', $idProducto)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "El código de producto «{$codigoNew}» ya está en uso por otro producto.",
                    'result'  => ['message' => "El código de producto «{$codigoNew}» ya está en uso por otro producto."],
                ]);
            }
        }
        $codigoBarra = $request->codigo_barra;
        if (!$this->isEmptyCode($codigoBarra)) {
            if (Producto::where('codigo_barra', $codigoBarra)->where('id_producto', '!=', $idProducto)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "El código de barra «{$codigoBarra}» ya está en uso por otro producto.",
                    'result'  => ['message' => "El código de barra «{$codigoBarra}» ya está en uso por otro producto."],
                ]);
            }
        }
        DB::beginTransaction();

        try {
            $datos = [];

            if ($request->hasFile('pro_imagen')) {
                $datos['nombre']                            = $request->nombre;
                $datos['descripcion']                       = ($request->descripcion !== null && $request->descripcion !== '' && $request->descripcion !== 'null') ? $request->descripcion : null;
                $datos['stock']                             = $request->stock;
                $datos['id_producto_categoria']             = $request->id_producto_categoria;
                $datos['id_producto_categoria_sub']         = ($request->id_producto_categoria_sub === null || $request->id_producto_categoria_sub === '' || $request->id_producto_categoria_sub === 'undefined' || $request->id_producto_categoria_sub === 'null') ? null : $request->id_producto_categoria_sub;
                $datos['id_producto_tipo']                  = ($request->id_producto_tipo === null || $request->id_producto_tipo === '' || $request->id_producto_tipo === 'undefined' || $request->id_producto_tipo === 'null') ? null : $request->id_producto_tipo;
                $datos['url_imagen']                        = $filename;
                $datos['updated_at']                        = date("Y-m-d H:i:s");
                $datos['Activo']                            = $request->Activo;
                $datos['numero_estrellas']                  = $request->numero_estrellas!==null?$request->numero_estrellas:null;
                $datos['peso_kilogramo']                    = $request->peso_kilogramo;
                $datos['corte_tiempo_promocion']            = $request->corte_tiempo_promocion;
                $datos['corte_tiempo_sabado']               = $request->corte_tiempo_sabado;
                
                $datos['paquete_medidas']                   = $request->paquete_medidas!== 'null' ? $request->paquete_medidas : null;
                $datos['paquete_dimencion']                 = $request->paquete_dimencion!== 'null' ? $request->paquete_dimencion : null;
                $datos['meta_titulo_producto']                 = $request->meta_titulo_producto!== 'null' ? $request->meta_titulo_producto : null;
                $datos['meta_descripcion_producto']                 = $request->meta_descripcion_producto!== 'null' ? $request->meta_descripcion_producto : null;
                $datos['codigo_producto_new']               = $request->codigo_producto_new!== 'null' ? $request->codigo_producto_new : null;
                $datos['codigo_barra']                      = $request->codigo_barra!== 'null' ? $request->codigo_barra : null;
                $datos['ratings_enabled']                   = $request->ratings_enabled === 'true' || $request->ratings_enabled === true || $request->ratings_enabled === 1 || $request->ratings_enabled === '1' ? 1 : 0;
                $datos['admin_rating']                      = $request->admin_rating !== 'null' ? $request->admin_rating : null;
                //=========== PRECIO AL PUBLICO =============
                $datos['precio_old']                        = $request->precio_old;
                $datos['precio']                            = $request->precio;

                //=========== PRECIO AL MAYORISTA =============
                $datos['precio_mayorista']                  = $this->nullableDecimal($request->precio_mayorista);
                $datos['precio_mayorista_old']              = $this->nullableDecimal($request->precio_mayorista_old);

                $datos['precio_yape']                       = $this->nullableDecimal($request->precio_yape);
                $datos['oferta_maxima_cantidad']            = $this->nullableInt($request->input('oferta_maxima_cantidad'));
                $datos['oferta_maxima_cantidad_por_precio'] = $this->nullableDecimal($request->input('oferta_maxima_cantidad_por_precio'));
            } else {
                $datos['nombre']                            = $request->nombre;
                $datos['descripcion']                       = ($request->descripcion !== null && $request->descripcion !== '' && $request->descripcion !== 'null') ? $request->descripcion : null;
                $datos['stock']                             = $request->stock;
                $datos['id_producto_categoria']             = $request->id_producto_categoria;
                $datos['id_producto_categoria_sub']         = ($request->id_producto_categoria_sub === null || $request->id_producto_categoria_sub === '' || $request->id_producto_categoria_sub === 'undefined' || $request->id_producto_categoria_sub === 'null') ? null : $request->id_producto_categoria_sub;
                $datos['id_producto_tipo']                  = ($request->id_producto_tipo === null || $request->id_producto_tipo === '' || $request->id_producto_tipo === 'undefined' || $request->id_producto_tipo === 'null') ? null : $request->id_producto_tipo;
                $datos['updated_at']                        = date("Y-m-d H:i:s");
                $datos['Activo']                            = $request->Activo;
                $datos['numero_estrellas']                  = $request->numero_estrellas;
                $datos['peso_kilogramo']                    = $request->peso_kilogramo;
                $datos['corte_tiempo_promocion']            = $request->corte_tiempo_promocion;
                $datos['corte_tiempo_sabado']               = $request->corte_tiempo_sabado;
                
                $datos['paquete_medidas']                   = $request->paquete_medidas!== 'null' ? $request->paquete_medidas : null;
                $datos['paquete_dimencion']                 = $request->paquete_dimencion!== 'null' ? $request->paquete_dimencion : null;
                $datos['meta_titulo_producto']              = $request->meta_titulo_producto!== 'null' ? $request->meta_titulo_producto : null;
                $datos['meta_descripcion_producto']         = $request->meta_descripcion_producto!== 'null' ? $request->meta_descripcion_producto : null;
                $datos['codigo_producto_new']               = $request->codigo_producto_new!== 'null' ? $request->codigo_producto_new : null;
                $datos['codigo_barra']                      = $request->codigo_barra!== 'null' ? $request->codigo_barra : null;
                $datos['ratings_enabled']                   = $request->ratings_enabled === 'true' || $request->ratings_enabled === true || $request->ratings_enabled === 1 || $request->ratings_enabled === '1' ? 1 : 0;
                $datos['admin_rating']                      = $request->admin_rating !== 'null' ? $request->admin_rating : null;
                
                //=========== PRECIO AL PUBLICO =============
                $datos['precio']                            = $request->precio;
                $datos['precio_old']                        = $request->precio_old;
                //=========== PRECIO AL MAYORISTA =============
                $datos['precio_mayorista']                  = $this->nullableDecimal($request->precio_mayorista);
                $datos['precio_mayorista_old']              = $this->nullableDecimal($request->precio_mayorista_old);

                $datos['precio_yape']                       = $this->nullableDecimal($request->precio_yape);
                
                if (Schema::hasColumn('administracion_producto', 'oferta_maxima_cantidad')) {
                    $datos['oferta_maxima_cantidad'] = $this->nullableInt($request->input('oferta_maxima_cantidad'));
                }
                if (Schema::hasColumn('administracion_producto', 'oferta_maxima_cantidad_por_precio')) {
                    $datos['oferta_maxima_cantidad_por_precio'] = $this->nullableDecimal($request->input('oferta_maxima_cantidad_por_precio'));
                }
                }

            $id_producto = $request->input('id_producto');
            Producto::where('id_producto', $id_producto)->update($datos);

            DB::commit();
            $message = 'Se ha actualizado correctamente!';
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            $message = $e->getMessage();
            DB::rollback();
        }

        return response()->json([
            'success' => $message != null ? true : false,
            'message' => 'Payroll are successfully.',
            'result' => [
                'message' => $message,
            ]
        ], 200);
    }

    public function eliminar(Request $request): JsonResponse
    {
        $id = $request->input('id');
        if ($id === null || $id === '' || $id === 'null') {
            return response()->json([
                'success' => false,
                'message' => 'Identificador de producto requerido.',
            ], 422);
        }

        $producto = Producto::query()->where('id_producto', $id)->first();
        if (!$producto) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado.',
            ], 404);
        }

        $nGaleriaFotos = (int) DB::table('administracion_producto_fotos')->where('id_producto', $id)->count();
        $nSubimagenes = 0;
        if (Schema::hasTable('administracion_producto_imagen') && Schema::hasColumn('administracion_producto_imagen', 'id_producto')) {
            $nSubimagenes = (int) DB::table('administracion_producto_imagen')->where('id_producto', $id)->count();
        }

        if ($nGaleriaFotos > 0 || $nSubimagenes > 0) {
            return response()->json([
                'success' => false,
                'code'    => 'TIENE_SUBIMAGENES',
                'message' => 'No se puede eliminar el producto mientras tenga imágenes en la galería o subimágenes. Elimine primero todas las fotos secundarias y subimágenes desde la edición del producto (galería / lista de imágenes) y vuelva a intentar.',
                'result'  => [
                    'galeria_fotos' => $nGaleriaFotos,
                    'subimagenes'   => $nSubimagenes,
                ],
            ], 409);
        }

        $urlsArchivo = [];
        if (!empty($producto->url_imagen)) {
            $urlsArchivo[] = (string) $producto->url_imagen;
        }

        $fotosUrls = DB::table('administracion_producto_fotos')
            ->where('id_producto', $id)
            ->pluck('url_imagen');
        foreach ($fotosUrls as $u) {
            if ($u !== null && trim((string) $u) !== '') {
                $urlsArchivo[] = (string) $u;
            }
        }

        if (Schema::hasTable('administracion_producto_imagen') && Schema::hasColumn('administracion_producto_imagen', 'id_producto')) {
            $subUrls = DB::table('administracion_producto_imagen')
                ->where('id_producto', $id)
                ->pluck('url_imagen');
            foreach ($subUrls as $u) {
                if ($u !== null && trim((string) $u) !== '') {
                    $urlsArchivo[] = (string) $u;
                }
            }
        }

        $urlsArchivo = array_values(array_unique($urlsArchivo));

        try {
            DB::transaction(function () use ($id) {
                DB::table('administracion_producto_fotos')->where('id_producto', $id)->delete();

                if (Schema::hasTable('administracion_producto_imagen') && Schema::hasColumn('administracion_producto_imagen', 'id_producto')) {
                    DB::table('administracion_producto_imagen')->where('id_producto', $id)->delete();
                }

                Producto::where('id_producto', $id)->delete();
            });
        } catch (\Throwable $e) {
            Log::channel('stderr')->error('Producto eliminar BD: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'No se pudo eliminar el producto.',
            ], 500);
        }

        foreach ($urlsArchivo as $ruta) {
            $this->eliminarArchivoProductoDesdeDisco($ruta);
        }

        return response()->json([
            'success' => true,
            'message' => 'Registro eliminado!',
            'result'  => 1,
        ]);
    }

    public function listar_imagen(Request $request): JsonResponse
    {
        $result = DB::select('CALL USP_ADMINISTRACION_PRODUCTO_LISTAR_IMAGEN(?)', [$request->id_producto]);
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result
        ]);
    }

    public function actualizar_imagen_orden(Request $request): JsonResponse
    {
        $message = null;
        DB::beginTransaction();
        try {
            $items = $request->input('items');

            foreach ($items as $item) {
                DB::table('administracion_producto_imagen')
                    ->where('id_producto_imagen', $item['id_producto_imagen'])
                    ->update(['orden' => $item['orden']]);
            }

            DB::commit();
            $message = 'Procesos exitosos.';
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            DB::rollback();
        }

        return response()->json([
            'success' => $message != null ? true : false,
            'message' => 'Mesaje de procesos exitosos.',
            'result' => [
                'message' => $message,
            ]
        ], 200);
    }

    public function eliminar_imagen(Request $request): JsonResponse
    {
        $id = $request->input('id_producto_imagen', $request->query('id_producto_imagen'));
        if ($id === null || $id === '' || $id === 'null') {
            return response()->json([
                'success' => false,
                'message' => 'Identificador de imagen requerido.',
            ], 422);
        }

        $fila = ProductoImagen::where('id_producto_imagen', $id)->first();
        if (!$fila) {
            return response()->json([
                'success' => false,
                'message' => 'Imagen no encontrada.',
            ], 404);
        }

        $urlRelativa = $fila->url_imagen ?? null;

        try {
            DB::transaction(function () use ($id) {
                ProductoImagen::where('id_producto_imagen', $id)->delete();
            });
        } catch (\Throwable $e) {
            Log::channel('stderr')->error('eliminar_imagen BD: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'No se pudo eliminar la imagen.',
            ], 500);
        }

        $this->eliminarArchivoProductoDesdeDisco($urlRelativa !== null ? (string) $urlRelativa : null);

        return response()->json([
            'success' => true,
            'message' => 'Registro eliminado!',
            'result'  => 1,
        ]);
    }

    public function actualizar_ficha_tecnica(Request $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $id_producto = $request->input('id_producto');
            $titulo1 = $request->input('titulo1');
            $titulo2 = $request->input('titulo2');
            $editorValue1 = $request->input('editorValue1');
            $editorValue2 = $request->input('editorValue2');
            $Activo = $request->input('Activo', true);
            $ficha_principal_orden = (int) $request->input('ficha_principal_orden', 1);

            $dataResult = ProductoFichaTecnica::where('id_producto', $id_producto)->get();

            if (!empty($dataResult[0]->id_producto)) {
                if (Schema::hasColumn('administracion_producto_ficha_tecnica', 'es_principal')) {
                    DB::table('administracion_producto_ficha_tecnica')
                        ->where('id_producto', $id_producto)
                        ->update(['es_principal' => 'N']);
                    DB::table('administracion_producto_ficha_tecnica')
                        ->where('id_producto', $id_producto)
                        ->where('orden', $ficha_principal_orden)
                        ->update(['es_principal' => 'S']);
                }

                DB::table('administracion_producto_ficha_tecnica')
                    ->where('id_producto', $id_producto)
                    ->where('orden', 1)
                    ->update([
                        'titulo' => $titulo1,
                        'descripcion' => $editorValue1,
                        'Activo' => $Activo,
                        'updated_at' => now()
                    ]);

                if ($editorValue2 && is_array($editorValue2)) {
                    $caracteristicas_array = isset($editorValue2['caracteristicas']) ?
                        json_encode($editorValue2['caracteristicas']) : null;

                    $nuevo_titulo = isset($editorValue2['titulo']) ? $editorValue2['titulo'] : $titulo2;
                    $nueva_descripcion = isset($editorValue2['descripcion']) ? $editorValue2['descripcion'] : '';

                    DB::table('administracion_producto_ficha_tecnica')
                        ->where('id_producto', $id_producto)
                        ->where('orden', 2)
                        ->update([
                            'titulo' => $titulo2,
                            'nuevo_caracteristicas' => $caracteristicas_array,
                            'nuevo_titulo' => $nuevo_titulo,
                            'nuevo_descripcion' => $nueva_descripcion,
                            'Activo' => $Activo,
                            'updated_at' => now()
                        ]);
                }

                $result = "Actualizado correctamente!";
            } else {
                $createAttrs1 = [
                    'id_producto'      => $id_producto,
                    'titulo'           => $titulo1,
                    'descripcion'      => $editorValue1,
                    'orden'            => 1,
                    'Activo'           => $Activo,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
                if (Schema::hasColumn('administracion_producto_ficha_tecnica', 'es_principal')) {
                    $createAttrs1['es_principal'] = $ficha_principal_orden === 1 ? 'S' : 'N';
                }
                ProductoFichaTecnica::create($createAttrs1);

                $caracteristicas_array = null;
                $nuevo_titulo = $titulo2;
                $nueva_descripcion = '';

                if ($editorValue2 && is_array($editorValue2)) {
                    $caracteristicas_array = isset($editorValue2['caracteristicas']) ?
                        json_encode($editorValue2['caracteristicas']) : null;

                    $nuevo_titulo = isset($editorValue2['titulo']) ? $editorValue2['titulo'] : $titulo2;
                    $nueva_descripcion = isset($editorValue2['descripcion']) ? $editorValue2['descripcion'] : '';
                }

                $createAttrs2 = [
                    'id_producto'      => $id_producto,
                    'titulo'           => $titulo2,
                    'nuevo_caracteristicas' => $caracteristicas_array,
                    'nuevo_titulo'     => $nuevo_titulo,
                    'nuevo_descripcion' => $nueva_descripcion,
                    'orden'            => 2,
                    'Activo'           => $Activo,
                    'created_at'       => now(),
                    'updated_at'       => now(),
                ];
                if (Schema::hasColumn('administracion_producto_ficha_tecnica', 'es_principal')) {
                    $createAttrs2['es_principal'] = $ficha_principal_orden === 2 ? 'S' : 'N';
                }
                ProductoFichaTecnica::create($createAttrs2);

                $result = "Se registr贸 correctamente!";
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Operaci贸n completada correctamente',
                'result'  => $result
            ]);
        } catch (\Exception $e) {
            Log::channel('stderr')->error('Error en actualizar_ficha_tecnica: ' . $e->getMessage());
            Log::channel('stderr')->error($e->getTraceAsString());

            DB::rollback();

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud: ' . $e->getMessage(),
                'result'  => 'Error'
            ], 500);
        }
    }

    public function obtener_ficha_tecnica(Request $request): JsonResponse
    {
        $id_producto = $request->id_producto;
        $result = DB::select('select * from administracion_producto_ficha_tecnica where id_producto = ? ORDER BY orden ASC', [$id_producto]);
        return response()->json([
            'success' => true,
            'message' => 'Obtener registros!',
            'result' => $result
        ]);
    }

    public function obtener_imagen(Request $request): JsonResponse
    {
        $id = $request->id;
        $result = DB::select('select * from administracion_producto_imagen where id_producto_imagen = ?', [$id]);
        return response()->json([
            'success' => true,
            'message' => 'Obtener registros!',
            'result' => $result
        ]);
    }

    //=========== GALERIA DE FOTOS ==================
    public function listar_fotos(Request $request): JsonResponse
    {
        $result = DB::select('CALL USP_ADMINISTRACION_PRODUCTO_LISTAR_FOTOS(?)', [$request->id_producto]);
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result
        ]);
    }

    public function eliminar_fotos(Request $request): JsonResponse
    {
        $id = $request->input('id_producto_foto', $request->query('id_producto_foto'));
        if ($id === null || $id === '' || $id === 'null') {
            return response()->json([
                'success' => false,
                'message' => 'Identificador de foto (id_producto_foto) requerido.',
            ], 422);
        }

        $fila = DB::table('administracion_producto_fotos')
            ->where('id_producto_foto', $id)
            ->first();

        if (!$fila) {
            return response()->json([
                'success' => false,
                'message' => 'Foto de galería no encontrada.',
            ], 404);
        }

        $urlRelativa = $fila->url_imagen ?? null;

        try {
            DB::transaction(function () use ($id) {
                DB::table('administracion_producto_fotos')
                    ->where('id_producto_foto', $id)
                    ->delete();
            });
        } catch (\Throwable $e) {
            Log::channel('stderr')->error('eliminar_fotos BD: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'No se pudo eliminar el registro de la galería.',
            ], 500);
        }

        $this->eliminarArchivoProductoDesdeDisco($urlRelativa !== null ? (string) $urlRelativa : null);

        return response()->json([
            'success' => true,
            'message' => 'Registro eliminado!',
            'result'  => [],
        ]);
    }

    public function crear_fotos(Request $request): JsonResponse
    {
        $filename = null;
        $message = null;

        if ($request->hasFile('image')) {
            $file = $request->file("image");
            $ext = $file->getClientOriginalExtension();
            $filename_ = time() . '.' . $ext;
            $filename = $file->storeAs('storage_/producto_principal_fotos', $filename_, ['disk' => 'public_imagenes']);
        }
        
        DB::beginTransaction();

        try {
            $id_producto = $request->input('id_producto');
            DB::select('CALL USP_ADMINISTRACION_PRODUCTO_CREAR_FOTOS(?,?)', [
                $id_producto,
                $filename,
            ]);

            DB::commit();
            $message = 'Registro insertado';
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            $message = $e->getMessage();
            DB::rollback();
        }

        return response()->json([
            'success' => $message != null ? true : false,
            'message' => 'Procesos exitosos.',
            'result' => [
                'message' => $message,
            ]
        ], 200);
    }

    public function actualizar_foto_orden(Request $request): JsonResponse
    {
        $message = null;
        DB::beginTransaction();
        try {
            $items = $request->input('items');

            foreach ($items as $item) {
                DB::table('administracion_producto_fotos')
                    ->where('id_producto_foto', $item['id_producto_foto'])
                    ->update(['orden' => $item['orden']]);
            }

            DB::commit();
            $message = 'Procesos exitosos.';
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            DB::rollback();
        }

        return response()->json([
            'success' => $message != null ? true : false,
            'message' => 'Mesaje de procesos exitosos.',
            'result' => [
                'message' => $message,
            ]
        ], 200);
    }

    //================  LISTA DE SUBIMAGENES  DE PRODUCTOS    ==================
    public function crear_imagen(Request $request): JsonResponse
    {
        $filename = null;
        $message = null;
        
        //============= CODIGO DE SUB PRODUCTO ===============
        do {
            $codigo_producto = 'S-' . Str::upper(Str::random(6));
        } while (DB::table('administracion_producto_imagen')->where('codigo_producto', $codigo_producto)->exists());

        if ($request->hasFile('image')) {
            $errImg = $this->validateProImagenBasico($request->file('image'));
            if ($errImg) {
                return response()->json([
                    'success' => false,
                    'message' => $errImg,
                    'result' => [
                        'message' => $errImg,
                    ],
                ], 422);
            }
            $file = $request->file("image");
            $ext = $file->getClientOriginalExtension();
            $filename_ = time() . '.' . $ext;
            $filename = $file->storeAs('storage_/producto_principal_imagen', $filename_, ['disk' => 'public_imagenes']);
        }

        DB::beginTransaction();

        try {
            $id_producto = $request->input('id_producto');
            DB::select('CALL USP_ADMINISTRACION_PRODUCTO_CREAR_IMAGEN(?,?,?, ?,?,?,?,? ,?,?,?,?,?,?)', [
                $id_producto,
                $filename,
                $request->input('Activo'),
                $request->titulo,
                $request->precio,
                $request->descripcion,
                $codigo_producto,
                $request->stock,
                $request->precio_old,
                $request->peso_kilogramo,
                $request->corte_tiempo_promocion,
                $request->corte_tiempo_sabado,
                $request->numero_estrellas,
                $request->precio_yape,
            ]);

            DB::commit();
            $message = 'Registro insertado';
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            $message = $e->getMessage();
            DB::rollback();
        }

        return response()->json([
            'success' => $message != null ? true : false,
            'message' => 'Procesos exitosos.',
            'result' => [
                'message' => $message,
            ]
        ], 200);
    }

    public function actualizar_subproducto(Request $request): JsonResponse
    {
        $filename = null;
        $message = null;

        if ($request->hasFile('pro_imagen')) {
            $errImg = $this->validateProImagenBasico($request->file('pro_imagen'));
            if ($errImg) {
                return response()->json([
                    'success' => false,
                    'message' => $errImg,
                    'result' => [
                        'message' => $errImg,
                    ],
                ], 422);
            }
        }
        
        if ($request->hasFile('pro_imagen')) {
            $result = DB::table('administracion_producto_imagen')
                ->where('id_producto_imagen', $request->id_producto_imagen)
                ->get();

            // CORREGIDO: Usar getPublicHtmlPath()
            if (isset($result) && !empty($result[0]->url_imagen) && $result[0]->url_imagen != null) {
                $filePath = Helper::getPublicHtmlPath($result[0]->url_imagen);
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }

            $file = $request->file("pro_imagen");
            $ext = $file->getClientOriginalExtension();
            $filename_ = time() . '.' . $ext;
            $filename = $file->storeAs('storage_/producto_principal_imagen', $filename_, ['disk' => 'public_imagenes']);
        }

        DB::beginTransaction();

        try {
            $datos = [];

            if ($request->hasFile('pro_imagen')) {
                $datos['titulo']                = $request->titulo;
                $datos['precio']                = $request->precio;
                $datos['stock']                 = $request->stock;
                $datos['descripcion']           = $request->descripcion;
                $datos['url_imagen']            = $filename;
                $datos['updated_at']            = date("Y-m-d H:i:s");
                $datos['Activo']                = $request->Activo;
                $datos['numero_estrellas']      = $request->numero_estrellas;
                $datos['precio_old']            = $request->precio_old;
                $datos['peso_kilogramo']        = $request->peso_kilogramo;
                $datos['corte_tiempo_promocion'] = $request->corte_tiempo_promocion;
                $datos['corte_tiempo_sabado']   = $request->corte_tiempo_sabado;
                $datos['precio_yape']           = $request->precio_yape;
            } else {
                $datos['titulo']                = $request->titulo;
                $datos['precio']                = $request->precio;
                $datos['stock']                 = $request->stock;
                $datos['descripcion']           = $request->descripcion;
                $datos['updated_at']            = date("Y-m-d H:i:s");
                $datos['Activo']                = $request->Activo;
                $datos['numero_estrellas']      = $request->numero_estrellas;
                $datos['precio_old']            = $request->precio_old;
                $datos['peso_kilogramo']        = $request->peso_kilogramo;
                $datos['corte_tiempo_promocion'] = $request->corte_tiempo_promocion;
                $datos['corte_tiempo_sabado']   = $request->corte_tiempo_sabado;
                $datos['precio_yape']           = $request->precio_yape;
            }

            $id_producto_imagen = $request->input('id_producto_imagen');
            DB::table('administracion_producto_imagen')
                ->where('id_producto_imagen', $id_producto_imagen)
                ->update($datos);

            DB::commit();
            $message = 'Se ha actualizado correctamente!';
        } catch (\Exception $e) {
            Log::channel('stderr')->info($e);
            $message = $e->getMessage();
            DB::rollback();
        }

        return response()->json([
            'success' => $message != null ? true : false,
            'message' => 'Payroll are successfully.',
            'result' => [
                'message' => $message,
            ]
        ], 200);
    }

    public function actualizar_imagen_principal(Request $request): JsonResponse
    {
        $idProducto = $request->input('id_producto');
        if (!$idProducto) {
            return response()->json(['success' => false, 'result' => ['message' => 'id_producto requerido']], 422);
        }
        if (!$request->hasFile('pro_imagen')) {
            return response()->json(['success' => false, 'result' => ['message' => 'Imagen requerida']], 422);
        }
        $errImg = $this->validateProImagenBasico($request->file('pro_imagen'));
        if ($errImg) {
            return response()->json(['success' => false, 'result' => ['message' => $errImg]], 422);
        }

        $producto = Producto::find($idProducto);
        if ($producto && !empty($producto->url_imagen)) {
            $filePath = Helper::getPublicHtmlPath($producto->url_imagen);
            if (file_exists($filePath)) unlink($filePath);
        }

        $file     = $request->file('pro_imagen');
        $ext      = $file->getClientOriginalExtension();
        $filename = $file->storeAs('storage_/producto_principal', time() . '.' . $ext, ['disk' => 'public_imagenes']);

        Producto::where('id_producto', $idProducto)->update(['url_imagen' => $filename]);

        return response()->json([
            'success' => true,
            'result'  => ['message' => 'Imagen actualizada correctamente', 'url_imagen' => $filename],
        ], 200);
    }

    public function crear_imagen_HtmlEditor(Request $request)
    {
        if ($request->hasFile('image')) {
            $file       = $request->file("image");
            $ext        = $file->getClientOriginalExtension();
            $filename_  = time() . '.' . $ext;
            $filename   = $file->storeAs('storage_/ckeditor', $filename_, ['disk' => 'public_imagenes']);

            return response()->json([
                'filename' => $filename_,
                'url' => $filename,
                'message' => 'Imagen subida con 茅xito',
            ], 200);
        }

        return response()->json([
            'message' => 'No se encontr贸 el archivo de imagen.',
        ], 400);
    }

    public function obtener_dimension_producto()
    {
        $result = DB::select('CALL USP_ADMINISTRACION_PRODUCTO_OBTENER_DIMENSION()');
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result
        ]);
    }

    /**
     * Borra un archivo de imagen relativo si existe (disco public_imagenes o ruta legacy). Ignora rutas vacías o URL absolutas.
     */
    private function eliminarArchivoProductoDesdeDisco(?string $relativePath): void
    {
        if ($relativePath === null) {
            return;
        }
        $relativePath = trim(str_replace('\\', '/', (string) $relativePath));
        if ($relativePath === '') {
            return;
        }
        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            return;
        }
        $relativePath = ltrim($relativePath, '/');

        try {
            $disk = Storage::disk('public_imagenes');
            if ($disk->exists($relativePath)) {
                $disk->delete($relativePath);

                return;
            }
        } catch (\Throwable $e) {
            Log::channel('stderr')->info('eliminarArchivoProductoDesdeDisco storage: ' . $e->getMessage());
        }

        try {
            $legacy = Helper::getPublicHtmlPath($relativePath);
            if ($legacy !== '' && @is_file($legacy)) {
                @unlink($legacy);
            }
        } catch (\Throwable $e) {
            Log::channel('stderr')->info('eliminarArchivoProductoDesdeDisco legacy: ' . $e->getMessage());
        }
    }
}