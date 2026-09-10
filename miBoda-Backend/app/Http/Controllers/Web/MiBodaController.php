<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\MiBodaPageData;
use Illuminate\Http\Response;

class MiBodaController extends Controller
{
    private function view(string $blade, array $data): Response
    {
        return response()
            ->view($blade, $data)
            ->header('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    }

    public function index()
    {
        return $this->view('web.pages.miboda.index', MiBodaPageData::home());
    }

    public function galeria()
    {
        return $this->view('web.pages.miboda.galeria', MiBodaPageData::galeria());
    }
}
