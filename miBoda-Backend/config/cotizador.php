<?php

return [
    'developer_email' => env('COTIZADOR_DEV_EMAIL', 'ghiovani666@gmail.com'),
    'from_email'      => env('COTIZADOR_FROM_EMAIL', 'noreply@royalsensorymassage.com'),
    'from_name'       => env('COTIZADOR_FROM_NAME', 'royalsensorymassage Cotizador'),
    'whatsapp_number' => env('COTIZADOR_WHATSAPP', '51970048451'),
    'quotes_path'     => storage_path('app/cotizador/quotes'),
];
