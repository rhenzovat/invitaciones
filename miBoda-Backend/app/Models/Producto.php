<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProductoCategoria;
use App\Models\ProductoCategoriaSub;
use Illuminate\Support\Str;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'administracion_producto';
    protected $primaryKey = 'id_producto';
    protected $guarded = [];
    protected $appends = ['rating_summary'];

    protected static function booted()
    {
        static::saving(function ($producto) {
            if (empty($producto->slug) || $producto->isDirty('nombre')) {
                $slug = Str::slug($producto->nombre);
                
                // Verificar unicidad
                $count = static::where('slug', 'like', $slug . '%')
                    ->where('id_producto', '!=', $producto->id_producto)
                    ->count();
                
                $producto->slug = $count > 0 ? "{$slug}-{$count}" : $slug;
            }
        });
    }

    public function userRatings()
    {
        return $this->hasMany(ProductUserRating::class, 'id_producto', 'id_producto');
    }

    public function getRatingSummaryAttribute()
    {
        if (!$this->ratings_enabled) {
            return (object) [
                'promedio' => (float) $this->admin_rating,
                'total' => 0,
                'estrellas' => (object) []
            ];
        }

        $ratings = $this->userRatings;
        $total = $ratings->count();

        $estrellas = [];
        foreach ([1, 2, 3, 4, 5] as $s) {
            $estrellas[$s] = (object) ['cantidad' => 0, 'porcentaje' => 0];
        }

        if ($total === 0) {
            return (object) [
                'promedio' => 0,
                'total' => 0,
                'estrellas' => (object) $estrellas
            ];
        }

        $sum = 0;
        foreach ($ratings as $rating) {
            $sum += $rating->rating;
            $estrellas[$rating->rating]->cantidad++;
        }

        $average = round($sum / $total, 1);

        foreach ($estrellas as $s => $data) {
            $data->porcentaje = round(($data->cantidad / $total) * 100, 1);
        }

        return (object) [
            'promedio' => $average,
            'total' => $total,
            'estrellas' => (object) $estrellas
        ];
    }

    public function ofertasDelDia()
    {
        return $this->hasMany(OfertaDelDia::class, 'id_producto');
    }

    public function categoria()
    {
        return $this->belongsTo(ProductoCategoria::class, 'id_producto_categoria', 'id_producto_categoria');
    }

    public function subcategoria()
    {
        return $this->belongsTo(ProductoCategoriaSub::class, 'id_producto_categoria_sub', 'id_producto_categoria_sub');
    }

    /**
     * ⭐ ENRIQUECER LISTAS DE PRODUCTOS (Desde Stored Procedures)
     */
    public static function enhanceList($products)
    {
        if (empty($products))
            return $products;

        $ids = collect($products)->pluck('id_producto')->filter()->unique()->toArray();
        if (empty($ids))
            return $products;

        $ratingsData = \Illuminate\Support\Facades\DB::table('administracion_producto')
            ->whereIn('id_producto', $ids)
            ->select('id_producto', 'ratings_enabled', 'admin_rating', 'numero_estrellas', 'codigo_producto', 'slug')
            ->get()
            ->keyBy('id_producto');

        $userAverages = \Illuminate\Support\Facades\Schema::hasTable('product_user_ratings')
            ? \Illuminate\Support\Facades\DB::table('product_user_ratings')
                ->whereIn('id_producto', $ids)
                ->select('id_producto', \Illuminate\Support\Facades\DB::raw('AVG(rating) as average'), \Illuminate\Support\Facades\DB::raw('COUNT(*) as total'))
                ->groupBy('id_producto')
                ->get()
                ->keyBy('id_producto')
            : collect();

        $activeOffersPrimary = collect();
        $activeOffersSecondary = collect();
        if (\Illuminate\Support\Facades\Schema::hasTable('oferta_del_dia')) {
            $activeOffersPrimary = \App\Models\OfertaDelDia::whereIn('id_producto', $ids)
                ->where('Activo', 'S')
                ->where('start_time', '<=', now())
                ->where('end_time', '>=', now())
                ->whereRaw('cantidad_disponible > cantidad_vendida')
                ->get()->keyBy('id_producto');

            $activeOffersSecondary = \App\Models\OfertaDelDia::whereIn('segundo_id_producto', $ids)
                ->where('Activo', 'S')
                ->where('start_time', '<=', now())
                ->where('end_time', '>=', now())
                ->whereRaw('cantidad_disponible > cantidad_vendida')
                ->get()->keyBy('segundo_id_producto');
        }

        foreach ($products as $p) {
            $data = $ratingsData->get($p->id_producto);
            if ($data) {
                $p->codigo_producto = $data->codigo_producto;
                $p->slug = $data->slug;
                $p->ratings_enabled = (bool) $data->ratings_enabled;
                $p->admin_rating = $data->admin_rating;

                if ($p->ratings_enabled) {
                    $ratingInfo = $userAverages->get($p->id_producto);
                    $p->display_rating = $ratingInfo ? round($ratingInfo->average, 1) : 0;
                    $p->total_ratings = $ratingInfo ? $ratingInfo->total : 0;
                } else {
                    $p->display_rating = $data->admin_rating ?? (float) ($data->numero_estrellas ?? 0);
                    $p->total_ratings = $data->numero_estrellas ?? 0;
                }
            } else {
                $p->ratings_enabled = false;
                $p->display_rating = (float) ($p->numero_estrellas ?? 0);
                $p->total_ratings = 0;
            }

            //OFERTA DEL DÍA GLOBAL (Sobreescribir precios)
            if ($activeOffersPrimary->has($p->id_producto)) {
                $offer = $activeOffersPrimary->get($p->id_producto);
                $p->precio_old = $offer->precio_original;
                $p->precio = $offer->precio_oferta;
            } elseif ($activeOffersSecondary->has($p->id_producto)) {
                $offer = $activeOffersSecondary->get($p->id_producto);
                $p->precio_old = $p->precio;
                $p->precio = $offer->segundo_precio_oferta;
            }
        }

        return $products;
    }

}