<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Actualización de Reclamo - royalsensorymassage</title>
    @include('email.partials.styles')
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header con Logo -->
            <div class="header">
                <img src="{{ config('app.url') }}/imagenes/logo_lucdesoft.svg" alt="royalsensorymassage Logo">
            </div>

            <!-- Imagen Principal (Hero) -->
            <div class="hero">
                <img src="{{ config('app.url') }}/imagenes/lucdesoft01.svg" alt="Actualización royalsensorymassage">
            </div>

            <div class="content">
                <h1>¡Novedades en tu solicitud!</h1>
                <p>Hola <strong>{{ $nombres }}</strong>,</p>
                <p>Te informamos que el estado de tu reclamo <strong>{{ $numero_reclamo }}</strong> ha sido actualizado.</p>

                <div class="status-badge status-{{ $estado }}">
                    {{ str_replace('_', ' ', $estado) }}
                </div>

                @if(!empty($comentario_atencion))
                <div style="text-align: left; background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin-top: 30px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #0284c7; font-size: 14px; text-transform: uppercase;">Respuesta de royalsensorymassage:</h4>
                    <p style="margin: 0; font-style: italic; color: #444;">{!! nl2br(e($comentario_atencion)) !!}</p>
                </div>
                @endif

                <a href="https://royalsensorymassage.com/libro-reclamos/estado" class="button">VER ESTADO ACTUAL →</a>
            </div>

            <div class="footer">
                <table class="footer-grid">
                    <tr class="footer-row">
                        <!-- Columna 1: Iniciar Sesión y Sobre Nosotros -->
                        <td class="footer-item">
                            <a href="https://royalsensorymassage.com/login">
                                <img src="{{ config('app.url') }}/imagenes/Login.svg" alt="Login">
                                <div>Iniciar sesión en<br>royalsensorymassage</div>
                            </a>
                            <div style="height: 25px;"></div>
                            <a href="https://royalsensorymassage.com/about">
                                <img src="{{ config('app.url') }}/imagenes/nosotros.svg" alt="Nosotros">
                                <div>Sobre<br>Nosotros</div>
                            </a>
                        </td>
                        <!-- Columna 2: Portafolio -->
                        <td class="footer-item">
                            <a href="https://royalsensorymassage.com/portafolio">
                                <img src="{{ config('app.url') }}/imagenes/home.svg" alt="Portafolio">
                                <div>Nuestro<br>Portafolio</div>
                            </a>
                        </td>
                    </tr>
                </table>

                <div class="footer-info">
                    <p style="font-weight: bold; font-size: 16px; color: #ffffff;">royalsensorymassage - Software a medida</p>
                    <p>Lima, PERÚ</p>

                    <div class="social">
                        <a href="https://www.facebook.com/royalsensorymassage">
                            <img src="{{ config('app.url') }}/imagenes/facebook-.svg" alt="Facebook">
                        </a>
                        <a href="https://wa.me/51970048451">
                            <img src="{{ config('app.url') }}/imagenes/whatsap.svg" alt="WhatsApp">
                        </a>
                        <a href="https://www.tiktok.com/@royalsensorymassage">
                            <img src="{{ config('app.url') }}/imagenes/tiktok.svg" alt="TikTok">
                        </a>
                    </div>
                </div>

                <div class="footer-links">
                    <a href="https://royalsensorymassage.com/servicio-cliente">Atención al Cliente</a>
                    <a href="https://royalsensorymassage.com/politica-privacidad">Privacidad</a>
                    <a href="https://royalsensorymassage.com/terminos-condiciones">Términos</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
