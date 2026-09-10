<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reclamo - royalsensorymassage</title>
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
                <img src="{{ config('app.url') }}/imagenes/lucdesoft01.svg" alt="Reclamo royalsensorymassage">
            </div>

            <div class="content">
                <h1>¡Hola, {{ $nombres }}!</h1>
                <p>Hemos recibido tu solicitud en <strong>royalsensorymassage</strong>. Tu tranquilidad es nuestra prioridad.</p>

                <div class="code-section">
                    <div class="code-label">TU CÓDIGO DE SEGUIMIENTO</div>
                    <div class="code-value">{{ $numero_reclamo }}</div>
                </div>

                <p>Tu solicitud ha sido registrada correctamente. Un especialista de nuestro equipo revisará los detalles y te responderá lo antes posible.</p>

                <table class="grid">
                    <tr>
                        <td class="grid-item">
                            <img src="https://cdn-icons-png.flaticon.com/512/1067/1067555.png" alt="Tipo">
                            <h4>TIPO</h4>
                            <p>{{ $tipo_solicitud == 'complaint' ? 'Queja' : 'Reclamo' }}</p>
                        </td>
                        <td class="grid-item">
                            <img src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png" alt="Fecha">
                            <h4>FECHA</h4>
                            <p>{{ $fecha_registro }}</p>
                        </td>
                    </tr>
                </table>

                <a href="https://royalsensorymassage.com/libro-reclamos/estado" class="button">SEGUIR MI RECLAMO →</a>
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
