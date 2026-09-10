<?php

namespace App\Providers;

use App\View\Composers\CustomizerComposer;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\App;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Inyecta isAdmin y customizerStyles en el layout base de todas las páginas web.
        // El composer se ejecuta una sola vez por request, al renderizar web.base.
        View::composer('web.base', CustomizerComposer::class);
    }
}
