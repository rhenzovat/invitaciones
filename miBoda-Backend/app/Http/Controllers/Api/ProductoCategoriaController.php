<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\ProductoCategoria;
use Illuminate\Support\Facades\DB;

class ProductoCategoriaController extends Controller
{

    /**
     * @OA\Get(
     *     path="/producto_categoria/obtener",
     *     tags={"Categorías"},
     *     summary="Obtener categoría de producto por ID",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="query", required=true, @OA\Schema(type="integer"), example=1),
     *     @OA\Response(response=200, description="Categoría encontrada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse")),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function obtener(Request $request): JsonResponse
    {
        $id = $request->id;
        $result = DB::select('select * from administracion_producto_categoria where id_producto_categoria = ?', [$id]);
        return response()->json([
            'success' => true,
            'message' => 'Obtener registros!',
            'result' => $result
        ]);
    }

    /**
     * @OA\Get(
     *     path="/producto_categoria/listar",
     *     tags={"Categorías"},
     *     summary="Listar todas las categorías de productos",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de categorías", @OA\JsonContent(ref="#/components/schemas/PaginatedListResponse"))
     * )
     */
    public function listar()
    {
        $result = DB::select('CALL USP_ADMINISTRACION_PRODUCTO_CATEGORIA_LISTAR()');
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result
        ]);
    }

    /**
     * @OA\Post(
     *     path="/producto_categoria/crear",
     *     tags={"Categorías"},
     *     summary="Crear nueva categoría de producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"nombre","Activo"},
     *         @OA\Property(property="nombre", type="string", example="Electrónica"),
     *         @OA\Property(property="Activo", type="string", enum={"S","N"}, example="S")
     *     )),
     *     @OA\Response(response=200, description="Categoría creada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse")),
     *     @OA\Response(response=422, description="Categoría ya existe")
     * )
     */
    public function crear(Request $request): JsonResponse
    {
        try {
            // Validar si ya existe la categoría
            $existe = DB::table('administracion_producto_categoria')
                ->where('nombre', $request->nombre)
                ->exists();

            if ($existe) {
                return response()->json([
                    'success' => false,
                    'message' => 'La categoría "' . $request->nombre . '" ya existe',
                    'result'  => null
                ], 422);
            }
            // Log::channel('stderr')->info($request->Activo);
            $result = ProductoCategoria::create([
                'nombre'            => $request->nombre,
                'created_at'        => date("Y-m-d H:i:s"),
                'updated_at'        => date("Y-m-d H:i:s"),
                'Activo'            => $request->Activo,

            ]);

            return response()->json([
                'success' => true,
                'message' => 'Registro insertado',
                'result'  =>  $result
            ]);
            } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la categoría: ' . $e->getMessage(),
                'result'  => null
            ], 500);
        }
    }

    /**
     * @OA\Put(
     *     path="/producto_categoria/actualizar",
     *     tags={"Categorías"},
     *     summary="Actualizar categoría de producto existente",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"id","nombre","Activo"},
     *         @OA\Property(property="id", type="integer", example=1),
     *         @OA\Property(property="nombre", type="string"),
     *         @OA\Property(property="Activo", type="string", enum={"S","N"})
     *     )),
     *     @OA\Response(response=200, description="Categoría actualizada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse"))
     * )
     */
    public function actualizar(Request $request): JsonResponse
    {
        $id = $request->input('id');

        $result = ProductoCategoria::where('id_producto_categoria', $id)
            ->update([
                'nombre'          => $request->nombre,
                'updated_at'      => date("Y-m-d H:i:s"),
                'Activo'          => $request->Activo,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Registro actualizado',
            'result'  => $result
        ]);
    }

    /**
     * @OA\Delete(
     *     path="/producto_categoria/eliminar",
     *     tags={"Categorías"},
     *     summary="Eliminar categoría de producto",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(required=true, @OA\JsonContent(
     *         required={"id"},
     *         @OA\Property(property="id", type="integer", example=1)
     *     )),
     *     @OA\Response(response=200, description="Categoría eliminada", @OA\JsonContent(ref="#/components/schemas/SuccessResponse")),
     *     @OA\Response(response=422, description="No se puede eliminar (tiene productos o subcategorías)")
     * )
     */
    public function eliminar(Request $request): JsonResponse
    {
        $id = $request->input('id');

        // Validar si la categoría tiene productos asociados
        $tieneProductos = DB::table('administracion_producto')
            ->where('id_producto_categoria', $id)
            ->where('Activo', 'S') // Solo productos activos si aplica
            ->exists();

        if ($tieneProductos) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la categoría porque tiene productos asociados',
                'result' => null
            ], 422); // Código 422 para indicar que no se puede procesar
        }

        // Validar también si tiene subcategorías (opcional)
        $tieneSubcategorias = DB::table('administracion_producto_categoria_sub')
            ->where('id_producto_categoria', $id)
            ->exists();

        if ($tieneSubcategorias) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar la categoría porque tiene subcategorías asociadas',
                'result' => null
            ], 422);
        }


        $result = ProductoCategoria::where('id_producto_categoria', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Registro eliminado!',
            'result'  => $result
        ]);
    }

    /**
     * @OA\Get(
     *     path="/producto_categoria/listar_tipo",
     *     tags={"Categorías"},
     *     summary="Listar tipos de categorías de productos",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Lista de tipos", @OA\JsonContent(ref="#/components/schemas/PaginatedListResponse"))
     * )
     */
    public function listar_tipo()
    {
        $result = DB::table('administracion_producto_tipo')->get();
        return response()->json([
            'success' => true,
            'message' => 'Listar registros',
            'result' => $result
        ]);
    }
}
