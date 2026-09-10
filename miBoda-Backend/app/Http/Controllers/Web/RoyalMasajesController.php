<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\SparlexPageData;
use Illuminate\Http\Response;

class RoyalMasajesController extends Controller
{
    private function view(string $blade, array $data): Response
    {
        return response()
            ->view($blade, $data)
            ->header('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    }

    public function index()
    {
        return $this->view('web.pages.sparlex.index', SparlexPageData::home());
    }

    public function nosotros()
    {
        return $this->view('web.pages.sparlex.nosotros', SparlexPageData::nosotros());
    }

    public function masajes()
    {
        return $this->view('web.pages.sparlex.masajes', SparlexPageData::masajes());
    }

    public function experiencias()
    {
        return $this->view('web.pages.sparlex.experiencias', SparlexPageData::experiencias());
    }

    public function galeria()
    {
        return $this->view('web.pages.sparlex.galeria', SparlexPageData::galeria());
    }

    public function contacto()
    {
        return $this->view('web.pages.sparlex.contacto', SparlexPageData::contacto());
    }

    public function politicas()
    {
        return $this->view('web.pages.sparlex.legal', SparlexPageData::legal('politicas'));
    }

    public function terminos()
    {
        return $this->view('web.pages.sparlex.legal', SparlexPageData::legal('terminos'));
    }
}
