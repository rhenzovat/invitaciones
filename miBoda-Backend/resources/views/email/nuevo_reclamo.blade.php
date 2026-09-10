<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuevo Registro - royalsensorymassage</title>
    @include('email.partials.styles')
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header con Logo -->
            <div class="header">
                <img src="{{ config('app.url') }}/imagenes/logo_lucdesoft.svg" alt="royalsensorymassage Logo">
            </div>

            <div class="content">
                <h1>Nuevo Registro Recibido</h1>
                <p>Se ha registrado un nuevo <strong>{{ $tipo_solicitud == 'complaint' ? 'Queja' : 'Reclamo' }}</strong>.</p>

                <div class="code-section">
                    <div class="code-label">EXPEDIENTE</div>
                    <div class="code-value">{{ $numero_reclamo }}</div>
                </div>

                <div style="text-align: left; background-color: #f8f9fa; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 8px;">
                    <p><strong>De:</strong> {{ $nombres }} {{ $apellidos }}</p>
                    <p><strong>Doc:</strong> {{ $tipo_documento }} {{ $numero_documento }}</p>
                </div>

                <a href="{{ config('app.url') }}/admin/reclamos" class="button">GESTIONAR →</a>
            </div>

            <div class="footer">
                <table class="footer-grid">
                    <tr class="footer-row">
                        <td class="footer-item">
                            <a href="https://royalsensorymassage.com/login">
                                <img src="{{ config('app.url') }}/imagenes/Login.svg" alt="Login">
                                <div>Iniciar sesión</div>
                            </a>
                        </td>
                        <td class="footer-item">
                            <a href="https://royalsensorymassage.com/portafolio">
                                <img src="{{ config('app.url') }}/imagenes/home.svg" alt="Portafolio">
                                <div>Portafolio</div>
                            </a>
                        </td>
                    </tr>
                </table>

                <div class="footer-info">
                    <p style="font-weight: bold; color: #ffffff;">royalsensorymassage - Software a medida</p>
                    <p style="opacity: 0.6; font-size: 11px;">Notificación automática.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
