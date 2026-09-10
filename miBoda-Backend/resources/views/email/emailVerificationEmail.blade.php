<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu Correo - royalsensorymassage</title>
    @include('email.partials.styles')
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header con Logo -->
            <div class="header" style="background-color: #0f172a; padding: 22px 25px; text-align: left;">
                <img src="{{ config('app.url') }}/imagenes/logo_lucdesoft.svg" alt="royalsensorymassage Logo" style="height: 35px; vertical-align: middle;">
            </div>

            <!-- Imagen Principal (Hero) -->
            <div class="hero">
                <img src="{{ config('app.url') }}/imagenes/lucdesoft01.svg" alt="Bienvenido a royalsensorymassage">
            </div>

            <div class="content">
                <h1>¡Bienvenido a royalsensorymassage!</h1>
                <p>Hola,</p>
                <p>¡Gracias por registrarte! Estamos muy emocionados de tenerte con nosotros.</p>
                <p>Para completar tu registro y asegurar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>

                <div style="text-align: center;">
                    <a href="{{ route('user.verify', $token) }}" class="button">VERIFICAR CORREO ELECTRÓNICO →</a>
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #666;">Este enlace de verificación es necesario para activar todas las funcionalidades de tu cuenta. Si no has creado una cuenta en royalsensorymassage, puedes ignorar este correo.</p>
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
