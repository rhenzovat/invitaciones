<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebPaginaMasajes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class WebPaginaMasajesController extends Controller
{
    public function show()
    {
        $pag = WebPaginaMasajes::first();
        if (! $pag) {
            $pag = WebPaginaMasajes::create([
                'hero_tag'        => 'Royal Sensory Experience',
                'hero_titulo'     => 'Nuestros Masajes Tántricos',
                'intro_label'     => 'Conocimiento & Bienestar',
                'intro_titulo'    => 'Masaje Tántrico —',
                'intro_titulo2'   => 'Todo lo que necesitas saber',
                'intro_subtitulo' => 'Descubre la filosofía, los beneficios y la experiencia del masaje tántrico auténtico para mujeres en Lima.',
                'cta_texto'       => '¿Tienes más preguntas? Escríbenos directamente',
                'cta_btn'         => 'Chatear por WhatsApp',
            ]);
        }
        return response()->json($pag);
    }

    public function update(Request $request)
    {
        $pag = WebPaginaMasajes::first() ?? new WebPaginaMasajes();
        $pag->fill($request->except(['hero_url_imagen']));
        $pag->save();
        return response()->json($pag);
    }

    public function uploadHero(Request $request)
    {
        $request->validate(['imagen' => 'required|image|max:4096']);
        $pag = WebPaginaMasajes::first() ?? new WebPaginaMasajes();
        if ($pag->hero_url_imagen && Storage::disk('public')->exists($pag->hero_url_imagen)) {
            Storage::disk('public')->delete($pag->hero_url_imagen);
        }
        $path = $request->file('imagen')->store('pagina_masajes', 'public');
        $pag->hero_url_imagen = 'storage/' . $path;
        $pag->save();
        return response()->json(['url' => $pag->hero_url_imagen, 'pagina' => $pag]);
    }
}
