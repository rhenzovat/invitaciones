<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\AmourPageData;
use Illuminate\Http\Response;

class AmourController extends Controller
{
    private function view(string $blade, array $data): Response
    {
        return response()
            ->view($blade, $data)
            ->header('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
    }

    public function index()
    {
        return $this->view('web.pages.amour.index', AmourPageData::home());
    }

    public function nosotros()
    {
        return $this->view('web.pages.amour.nosotros', AmourPageData::nosotros());
    }

    public function servicios()
    {
        return $this->view('web.pages.amour.servicios', AmourPageData::servicios());
    }

    public function contacto()
    {
        return $this->view('web.pages.amour.contacto', AmourPageData::contacto());
    }

    public function politicas()
    {
        return $this->view('web.pages.amour.legal', AmourPageData::legal('politicas'));
    }

    public function terminos()
    {
        return $this->view('web.pages.amour.legal', AmourPageData::legal('terminos'));
    }
}
