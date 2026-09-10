<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPaginaExperiencias;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WebPaginaExperienciasController extends Controller
{
    /** Obtiene (o crea) el registro único de configuración */
    public function show()
    {
        $pagina = WebPaginaExperiencias::first();
        if (! $pagina) {
            $pagina = WebPaginaExperiencias::create([
                'hero_tag'            => 'Royal Sensory Experience Massage',
                'hero_titulo'         => 'Nuestras Experiencias',
                'stat1_valor'         => '16', 'stat1_label' => 'Experiencias únicas',
                'stat2_valor'         => '4',  'stat2_label' => 'Categorías',
                'stat3_valor'         => '100%','stat3_label' => 'Privado & Confidencial',
                'stat4_valor'         => 'Solo','stat4_label' => 'Para Mujeres',
                'intro_label'         => 'Elige tu Experiencia',
                'intro_titulo'        => 'Royal Sensory Experience',
                'intro_titulo2'       => 'Diseñado para ti',
                'cat_tantrico_titulo' => 'Tántricas & Sensoriales',
                'cat_tantrico_desc'   => 'Viajes de reconexión interior y despertar sensorial diseñados exclusivamente para mujeres.',
                'cat_bienestar_titulo'=> 'Bienestar Femenino',
                'cat_bienestar_desc'  => 'Rituales y masajes que nutren el cuerpo, calman la mente y restauran tu energía vital.',
                'cat_corporal_titulo' => 'Renovación Corporal',
                'cat_corporal_desc'   => 'Técnicas avanzadas que trabajan los tejidos más profundos para aliviar dolencias y liberar tensiones.',
                'cat_estetica_titulo' => 'Modelación & Estética',
                'cat_estetica_desc'   => 'Tratamientos de última generación para moldear, tonificar y embellecer tu figura.',
                'cta_titulo'          => '¿Lista para tu experiencia Royal Sensory?',
                'cta_texto'           => 'Cada sesión es única, privada y diseñada para ti. Solo para mujeres. Solo con reserva previa.',
                'cta_btn'             => 'Reservar por WhatsApp',
            ]);
        }
        return response()->json($pagina);
    }

    /** Actualiza el registro (texto) */
    public function update(Request $request)
    {
        $pagina = WebPaginaExperiencias::first() ?? new WebPaginaExperiencias();
        $pagina->fill($request->except(['hero_url_imagen']));
        $pagina->save();
        return response()->json($pagina);
    }

    /** Sube imagen hero */
    public function uploadHero(Request $request)
    {
        $request->validate(['imagen' => 'required|image|max:4096']);

        $pagina = WebPaginaExperiencias::first() ?? new WebPaginaExperiencias();

        // Borrar imagen anterior
        if ($pagina->hero_url_imagen && Storage::disk('public')->exists($pagina->hero_url_imagen)) {
            Storage::disk('public')->delete($pagina->hero_url_imagen);
        }

        $path = $request->file('imagen')->store('pagina_experiencias', 'public');
        $pagina->hero_url_imagen = 'storage/' . $path;
        $pagina->save();

        return response()->json(['url' => $pagina->hero_url_imagen, 'pagina' => $pagina]);
    }
}
