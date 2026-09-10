<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebMasajeFaq;
use Illuminate\Http\Request;

class WebMasajeFaqController extends Controller
{
    public function index()
    {
        return response()->json(
            WebMasajeFaq::orderBy('orden')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titulo'    => 'required|string|max:300',
            'contenido' => 'required|string',
            'icono'     => 'nullable|string|max:80',
            'orden'     => 'nullable|integer',
            'Activo'    => 'nullable|in:S,N',
        ]);

        $faq = WebMasajeFaq::create($data);
        return response()->json($faq, 201);
    }

    public function show($id)
    {
        return response()->json(WebMasajeFaq::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $faq = WebMasajeFaq::findOrFail($id);

        $data = $request->validate([
            'titulo'    => 'sometimes|required|string|max:300',
            'contenido' => 'sometimes|required|string',
            'icono'     => 'nullable|string|max:80',
            'orden'     => 'nullable|integer',
            'Activo'    => 'nullable|in:S,N',
        ]);

        $faq->update($data);
        return response()->json($faq);
    }

    public function destroy($id)
    {
        WebMasajeFaq::findOrFail($id)->delete();
        return response()->json(['ok' => true]);
    }

    public function reorder(Request $request)
    {
        // $request->items = [{id, orden}, ...]
        foreach ($request->items ?? [] as $item) {
            WebMasajeFaq::where('id', $item['id'])->update(['orden' => $item['orden']]);
        }
        return response()->json(['ok' => true]);
    }
}
