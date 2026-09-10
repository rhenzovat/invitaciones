<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pedido;

    public function __construct($pedido)
    {
        $this->pedido = $pedido;
    }

    public function build()
    {
       return $this->from('no-reply@amourspamiraflores.com', 'Amour Spa') // Línea agregada para definir el remitente
                    ->subject('Confirmacion de tu pedido #' . $this->pedido['codigo_pedido'])
                    ->view('email.order_confirmation')
                    ->with(['pedido' => $this->pedido]);
    }
}