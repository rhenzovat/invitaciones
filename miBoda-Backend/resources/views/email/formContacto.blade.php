<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <title>{{ config('app.name', 'Amour Spa') }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="color-scheme" content="dark">
    <style>
        @media only screen and (max-width: 600px) {
            .inner-body {
                width: 100% !important;
            }
            .footer {
                width: 100% !important;
            }
        }
    </style>
</head>

<body style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative; -webkit-text-size-adjust: none; background-color: #1a050b; color: #e2d7d9; height: 100%; line-height: 1.5; margin: 0; padding: 0; width: 100% !important;">

    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative; background-color: #1a050b; margin: 0; padding: 20px 0; width: 100%;">
        <tbody>
            <tr>
                <td align="center" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative;">
                    
                    <!-- Tarjeta Principal Oscura -->
                    <table class="inner-body" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative; background-color: #270c14; border: 1px solid #3d1421; border-radius: 12px; margin: 0 auto; padding: 0; width: 570px;">
                        
                        <tbody>
                            <tr>
                                <td class="content-cell" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative; padding: 35px 30px;">
                                    
                                    <!-- Header / Logo de Amour Spa -->
                                    <div style="text-align: center; margin-bottom: 25px;">
                                        <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 2px;">
                                            Amour <span style="color: #e63946;">♥</span>
                                        </h1>
                                        <div style="font-size: 11px; font-weight: 600; color: #d4af37; letter-spacing: 4px; margin-top: 4px;">SPA</div>
                                        <p style="font-size: 10px; color: #d4af37; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 12px; margin-bottom: 0;">
                                            UN SANTUARIO DONDE EL CUERPO SE ESCRIBE CON DELICADEZA
                                        </p>
                                    </div>

                                    <!-- Saludo Principal -->
                                    <h2 style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; font-size: 20px; font-weight: bold; margin-top: 20px; text-align: center;">
                                        ¡Hola, {{ $txt_nombre }}!
                                    </h2>
                                    
                                    <p style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; margin-top: 10px; color: #cccccc; text-align: center; max-width: 480px; margin-left: auto; margin-right: auto;">
                                        Gracias por contactar a <strong style="color: #ffffff;">Amour Spa</strong>. Hemos recibido tu consulta y muy pronto una de nuestras terapeutas se pondrá en contacto contigo para asistirte.
                                    </p>

                                    <!-- Cuadro Cita / Eslogan -->
                                    <div style="background-color: #1e070e; border: 1px solid #4a1928; border-radius: 8px; padding: 15px; margin: 25px 0; text-align: center;">
                                        <div style="color: #d4af37; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">
                                            SOIN DÉDIÉ · ATENCIÓN CON RESERVA
                                        </div>
                                        <p style="color: #e2d7d9; font-size: 12px; font-style: italic; margin: 0; line-height: 1.4;">
                                            "Un atelier del tacto: masajes relajantes y terapias corporales pensadas para soltar el ruido de Lima, aliviar la tensión y devolver a la piel su douceur."
                                        </p>
                                    </div>

                                    <!-- Caja Resumen de Tu Consulta -->
                                    <div style="background-color: #1e070e; border: 1px solid #36101c; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                                        <h3 style="color: #d4af37; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 0; margin-bottom: 15px;">
                                            RESUMEN DE TU CONSULTA
                                        </h3>
                                        
                                        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #e2d7d9;">
                                            <tbody>
                                                <tr>
                                                    <td style="width: 100px; font-weight: bold; color: #d4af37; vertical-align: top;">Nombre:</td>
                                                    <td style="color: #ffffff;">{{ $txt_nombre }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="font-weight: bold; color: #d4af37; vertical-align: top;">Email:</td>
                                                    <td style="color: #ffffff;"><a href="mailto:{{ $txt_email }}" style="color: #ffffff; text-decoration: underline;">{{ $txt_email }}</a></td>
                                                </tr>
                                                @if(!empty($txt_telefono))
                                                <tr>
                                                    <td style="font-weight: bold; color: #d4af37; vertical-align: top;">Teléfono:</td>
                                                    <td style="color: #ffffff;">{{ $txt_telefono }}</td>
                                                </tr>
                                                @endif
                                                <tr>
                                                    <td style="font-weight: bold; color: #d4af37; vertical-align: top;">Asunto:</td>
                                                    <td style="color: #ffffff;">{{ $txt_asunto }}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <!-- Caja del Mensaje -->
                                        <div style="margin-top: 15px; background-color: #150308; padding: 12px; border-radius: 4px; border-left: 3px solid #d4af37;">
                                            <p style="font-size: 11px; font-weight: bold; color: #d4af37; margin: 0 0 5px 0; text-transform: uppercase;">Tu Mensaje:</p>
                                            <div style="color: #dddddd; font-size: 12px; font-style: italic; line-height: 1.5; white-space: pre-line;">
                                                "{{ $txt_mensaje }}"
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Seccion ¿Qué sigue ahora? -->
                                    <div style="text-align: center; margin-bottom: 20px;">
                                        <h4 style="color: #d4af37; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; margin: 0;">
                                            ¿QUÉ SIGUE AHORA?
                                        </h4>
                                    </div>

                                    <!-- Bloque 1 -->
                                    <div style="background-color: #1e070e; border: 1px solid #36101c; border-left: 3px solid #d4af37; border-radius: 6px; padding: 12px 15px; margin-bottom: 12px;">
                                        <div style="color: #ffffff; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
                                            ✨ Manos Expertas
                                        </div>
                                        <p style="color: #b3a2a5; font-size: 12px; margin: 0;">
                                            Terapeutas formados en el arte del masaje y la presencia consciente para brindarte una atención 100% profesional.
                                        </p>
                                    </div>

                                    <!-- Bloque 2 -->
                                    <div style="background-color: #1e070e; border: 1px solid #36101c; border-left: 3px solid #d4af37; border-radius: 6px; padding: 12px 15px; margin-bottom: 25px;">
                                        <div style="color: #ffffff; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
                                            🧘 Armonía Corporal en Miraflores
                                        </div>
                                        <p style="color: #b3a2a5; font-size: 12px; margin: 0;">
                                            Un ambiente cómodo, discreto y relajante en el corazón de Miraflores para tu máxima desconexión.
                                        </p>
                                    </div>

                                    <!-- Firma -->
                                    <div style="text-align: center; margin-top: 30px; border-top: 1px solid #36101c; padding-top: 20px;">
                                        <p style="font-size: 13px; font-weight: bold; color: #ffffff; margin: 0;">
                                            Equipo Amour Spa
                                        </p>
                                        <p style="font-size: 11px; color: #d4af37; margin: 4px 0 0 0;">
                                            Atención 100% Profesional · Solo con Reserva Previa
                                        </p>
                                    </div>

                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Footer Exterior -->
                    <table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative; margin: 0 auto; padding: 0; text-align: center; width: 570px;">
                        <tbody>
                            <tr>
                                <td class="content-cell" align="center" style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative; padding: 20px 32px;">
                                    <p style="box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI romantic', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5em; margin-top: 0; color: #7a5c63; font-size: 11px; text-align: center;">
                                        © {{ date('Y') }} Amour Spa. Todos los derechos reservados.
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </td>
            </tr>
        </tbody>
    </table>

</body>

</html>