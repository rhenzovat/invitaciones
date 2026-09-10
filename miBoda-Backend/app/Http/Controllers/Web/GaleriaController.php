<?php

namespace App\Http\Controllers\Web;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Log;
use Session;
use Illuminate\Support\Collection;
use App\Models\MetadatosPagina;
use App\Helpers\CategoryHelper;
class GaleriaController extends Controller
{
    public function web_galeria_listar(Request $request, $category = null, $subcategory = null)
    {
        $filtros = $request->input('filtros', []);
        $filtros = is_array($filtros) ? $filtros : explode(',', $filtros);
        $page = $request->input('page', 1);
        $view = $request->input('view', 'grid3');
        $orden = $request->input('orden', 'relevancia');
        $busqueda = $request->input('busqueda', $request->input('q', ''));


        // dd($filtros);
        // exit;
        // Procesar filtros de categoría/subcategoría de la URL
        if ($category) {
            $this->procesarFiltrosURL($category, $subcategory, $filtros);
        }

        // Obtener estructura de filtros con conteo de productos
        $estructura = $this->generarEstructuraFiltros($filtros,$busqueda);
        //   dd($estructura);exit;
        // Obtener productos filtrados
        $productos = $this->obtenerProductosFiltrados($filtros, $page, $orden, $busqueda);
        $metaData = MetadatosPagina::metaVigente('web_gallery');
        $productosView = 'web.pages.galeria.ajax.productos_' . $view;
        
        if ($request->ajax()) {
            return response()->json([
                'productosDeGaleria' => view($productosView, ['productosDeGaleria' => $productos])->render(),
                'pagination' => $productos->appends([
                    'filtros' => $filtros,
                    'view' => $view,
                    'orden' => $orden,
                    'busqueda' => $busqueda,
                    'metaData' => $metaData
                ])->links()->toHtml(),
                'from' => $productos->firstItem(),
                'to' => $productos->lastItem(),
                'total' => $productos->total()
            ]);
        }
        
        return view('web.pages.web_gallery', [
            'estructuraGaleriaCategoria' => $estructura,
            'productosDeGaleria' => $productos,
            'filtrosSeleccionados' => $filtros,
            'currentView' => $view,
            'ordenSeleccionado' => $orden,
            'busqueda' => $busqueda,
             'metaData' => $metaData
        ]);
    }

    /**
     * Procesa los filtros que vienen por URL.
     * Si solo se pasa categoría (sin subcategoría), incluye toda la rama: productos con y sin subcategoría.
     */
    private function procesarFiltrosURL($category, $subcategory, &$filtros)
    {
        if (!$category) {
            return;
        }

        if ($subcategory) {
            $filtros[] = "{$category}-{$subcategory}";
        } else {
            // Categoría sola: mostrar todos los productos de la rama (con y sin subcategoría)
            $filtros[] = "{$category}-null";
            $subcategorias = CategoryHelper::getSubcategories($category);
            foreach ($subcategorias as $sub) {
                $filtros[] = "{$category}-{$sub->id_producto_categoria_sub}";
            }
        }

        $filtros = array_unique($filtros);
    }

    //======================= START: FILTROS CON CATEGORIA Y SUBCATEGORIA =======================

    private function generarEstructuraFiltros(array $filtrosActivos = [],string $busqueda = '')
    {
        //  Log::channel('stderr')->info("test" . json_encode($filtrosActivos));
        // dd($filtrosActivos);exit;

        // Tiene los siguientes casos:
        // [] . No selecciono ninguno
        // ["4-null"] . Cuando hay productos con categoria y no con Subcategoria
        // ["3-13","4-null"] .Cuando hay un producto con categoria y subcategoria y otro con categoria y no subcategoria
        // ["3-13","3-14","4-null"] .Hay 2 que tienen un producto con categoria y subcategoria y otro con categoria y no subcategoria

        //Se suspende temporariamente el filtro de búsqueda - Esto es para columnas de filtros
       // $categorias = DB::select('(?)', [null]);
        
        // Procesar filtros activos para extraer categorías y subcategorías
    $filtrosParseados = $this->parsearFiltrosActivos($filtrosActivos);
    
    // Obtener categorías con filtrado aplicado
    $categorias = $this->obtenerCategoriasFiltradas($filtrosParseados, $busqueda);
    
    // Log::channel('stderr')->info("test" . json_encode($categorias));
    
        // Procesar filtros activos
        $filtrosActivosMap = [];
        foreach ($filtrosActivos as $filtro) {
            list($categoriaId, $subcategoriaId) = explode('-', $filtro);
            $filtrosActivosMap[$categoriaId][$subcategoriaId] = true;
        }
        
        return collect($categorias)
            ->groupBy('id_producto_categoria')
            ->map(function ($itemsCategoria, $categoriaId) use ($filtrosActivosMap) {
                $categoria = $itemsCategoria->first();
                
                $subcategorias = $itemsCategoria
                    ->filter(function ($item) {
                        return $item->id_producto_categoria_sub !== null;
                    })
                    ->map(function ($item) use ($categoriaId, $filtrosActivosMap) {
                        return [
                            'id' => $item->id_producto_categoria_sub,
                            'nombre' => $item->nombre_categoria_sub,
                            'total_productos' => $item->total_productos,
                            'activo' => isset($filtrosActivosMap[$categoriaId][$item->id_producto_categoria_sub])
                        ];
                    })
                    ->values();
                
                $totalCategoria = $itemsCategoria->sum('total_productos');
              
                return [
                    'categoria' => [
                        'id' => $categoriaId,
                        'nombre' => $categoria->nombre_categoria,
                        'total_productos' => $totalCategoria,
                        'activo' => isset($filtrosActivosMap[$categoriaId])
                    ],
                    'subcategorias' => $subcategorias
                ];
            })
            ->values();
    }

    /**
 * Parsear los filtros activos en un formato estructurado
 */
private function parsearFiltrosActivos(array $filtrosActivos): array
{
    $categoriasSeleccionadas = [];
    $subcategoriasSeleccionadas = [];
    $categoriasSinSubcategoria = [];
    
    foreach ($filtrosActivos as $filtro) {
        if (strpos($filtro, '-') !== false) {
            [$categoria, $subcategoria] = explode('-', $filtro, 2);
            
            if ($subcategoria === 'null' || $subcategoria === null) {
                // Categoría sin subcategoría
                $categoriasSinSubcategoria[] = (int)$categoria;
            } else {
                // Categoría con subcategoría
                $categoriasSeleccionadas[] = (int)$categoria;
                $subcategoriasSeleccionadas[] = (int)$subcategoria;
            }
        }
    }
    
    // Eliminar duplicados
    $categoriasSeleccionadas = array_unique($categoriasSeleccionadas);
    $subcategoriasSeleccionadas = array_unique($subcategoriasSeleccionadas);
    $categoriasSinSubcategoria = array_unique($categoriasSinSubcategoria);
    
    return [
        'categorias_con_sub' => $categoriasSeleccionadas,
        'subcategorias' => $subcategoriasSeleccionadas,
        'categorias_sin_sub' => $categoriasSinSubcategoria,
        'tiene_filtros' => !empty($filtrosActivos)
    ];
}

/**
 * Obtener categorías aplicando los filtros
 */
private function obtenerCategoriasFiltradas(array $filtrosParseados, string $busqueda)
{
    // Construir parámetros para el stored procedure
    $parametrosFiltros = [
        'categorias_con_sub' => implode(',', $filtrosParseados['categorias_con_sub']),
        'subcategorias' => implode(',', $filtrosParseados['subcategorias']),
        'categorias_sin_sub' => implode(',', $filtrosParseados['categorias_sin_sub']),
        'tiene_filtros' => $filtrosParseados['tiene_filtros'] ? 1 : 0
    ];
    
    // Llamar al stored procedure con filtros
    $categorias = DB::select('CALL USP_WEB_PRODUCTO_LISTAR_GALERIA_CATEGORIA_FILTRADO(?, ?, ?, ?, ?)', [
        $busqueda,
        $parametrosFiltros['categorias_con_sub'],
        $parametrosFiltros['subcategorias'],
        $parametrosFiltros['categorias_sin_sub'],
        $parametrosFiltros['tiene_filtros']
    ]);
    
    return $categorias;
}
//======================= END: FILTROS CON CATEGORIA Y SUBCATEGORIA =======================
    private function obtenerProductosFiltrados($filtros, $page, $orden = 'relevancia', string $busqueda = '')
    {

       
        $idUsuario = Auth::id() ?? 0;
        $pageSize = 12;
        
        // Procesar los filtros
        $categoriasIds = [];
        $subcategoriasIds = [];
        $soloCategorias = [];
        
        foreach ($filtros as $filtro) {
            list($categoriaId, $subcategoriaId) = explode('-', $filtro);
            
            if ($subcategoriaId === 'null') {
                $soloCategorias[] = $categoriaId;
            } else {
                $categoriasIds[] = $categoriaId;
                $subcategoriasIds[] = $subcategoriaId;
            }
        }
        
        // Convertir a cadenas para el procedimiento almacenado
        $categoriasStr = implode(',', array_unique($categoriasIds));
        $subcategoriasStr = implode(',', array_unique($subcategoriasIds));
        $soloCategoriasStr = implode(',', array_unique($soloCategorias));
        
        // Llamar al procedimiento almacenado con todos los parámetros
        $productosRaw = DB::select('CALL USP_WEB_PRODUCTO_LISTAR_GALERIA(?,?,?,?,?,?,?,?)', [
            $page, 
            $pageSize, 
            $idUsuario,
            $categoriasStr,
            $subcategoriasStr,
            $soloCategoriasStr,
            $orden,
            $busqueda
        ]);

        // ⭐ ENRIQUECER CON DATOS DE CALIFICACIÓN
        $productosEnriquecidos = \App\Models\Producto::enhanceList($productosRaw);

        // ⭐ MARCAR FAVORITOS DEL USUARIO ACTUAL
        if (Auth::check() && Schema::hasTable('web_favoritos')) {
            $idProductos = collect($productosEnriquecidos)->pluck('id_producto')->toArray();
            $favoritosIds = DB::table('web_favoritos')
                ->where('id_usuario', Auth::id())
                ->whereIn('id_producto', $idProductos)
                ->pluck('id_producto')
                ->toArray();
            foreach ($productosEnriquecidos as $producto) {
                $producto->es_favorito = in_array($producto->id_producto, $favoritosIds);
            }
        } else {
            foreach ($productosEnriquecidos as $producto) {
                $producto->es_favorito = false;
            }
        }
      
        // Contar el total alineado con USP_WEB_PRODUCTO_LISTAR_GALERIA (Activo=S + join categoría + mismos filtros)
        $total = $this->contarProductosFiltrados($categoriasStr, $subcategoriasStr, $soloCategoriasStr, $busqueda);
        
        return new \Illuminate\Pagination\LengthAwarePaginator(
            collect($productosEnriquecidos),
            $total,
            $pageSize,
            $page,
            [
                'path' => \Illuminate\Pagination\Paginator::resolveCurrentPath(),
                'query' => [
                    'filtros' => $filtros,
                    'orden' => $orden,
                    'busqueda' => $busqueda
                ]
            ]
        );
    }

    /**
     * Cuenta productos con la misma lógica que USP_WEB_PRODUCTO_LISTAR_GALERIA:
     * INNER JOIN categoría, P.Activo = 'S', ramas de filtro por cadenas como el SP.
     */
    private function contarProductosFiltrados(string $categoriasStr, string $subcategoriasStr, string $soloCategoriasStr, string $busqueda): int
    {
        $query = DB::table('administracion_producto as P')
            ->join('administracion_producto_categoria as PC', 'P.id_producto_categoria', '=', 'PC.id_producto_categoria')
            ->where('P.Activo', 'S');

        if ($categoriasStr !== '') {
            $cats = array_values(array_filter(array_map('intval', explode(',', $categoriasStr))));
            $query->whereIn('P.id_producto_categoria', $cats);
            if ($subcategoriasStr !== '') {
                $subs = array_values(array_filter(array_map('intval', explode(',', $subcategoriasStr))));
                $query->whereIn('P.id_producto_categoria_sub', $subs);
            } else {
                $query->whereNull('P.id_producto_categoria_sub');
            }
        } elseif ($soloCategoriasStr !== '') {
            $solo = array_values(array_filter(array_map('intval', explode(',', $soloCategoriasStr))));
            $query->whereIn('P.id_producto_categoria', $solo)
                ->whereNull('P.id_producto_categoria_sub');
        }

        if ($busqueda !== '') {
            $query->where(function ($q) use ($busqueda) {
                $q->where('P.nombre', 'LIKE', "%{$busqueda}%")
                    ->orWhere('P.descripcion', 'LIKE', "%{$busqueda}%")
                    ->orWhere('P.codigo_producto', 'LIKE', "%{$busqueda}%");
            });
        }

        return (int) $query->count();
    }
}