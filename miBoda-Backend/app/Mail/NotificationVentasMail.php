<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NotificationVentasMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pedido;

    public function __construct($pedido)
    {
        $this->pedido = $pedido;
    }

    public function build()
    {
        return $this->from('no-reply@amourspamiraflores.com', 'Amour Spa')
            ->subject('Nuevo Pedido Recibido #' . $this->pedido['codigo_pedido'])
            ->view('email.order_confirmation') // Considera una vista diferente si el contenido es distinto
            ->with(['pedido' => $this->pedido]);
    }
}
