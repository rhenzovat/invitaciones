@extends('web.base')

@section('head_page')
<style>
/* ========================================
   LOGIN - DISEÑO MINIMARKET PROFESIONAL
   ======================================== */

:root {
    --primary: #fd0505;
    --primary-dark: #a82024;
    --primary-light: #e04347;
    --success: #28a745;
    --danger: #dc3545;
    --warning: #ffc107;
    --text-dark: #2c2c2c;
    --text-medium: #555555;
    --text-light: #888888;
    --bg-light: #f8f9fa;
    --bg-white: #ffffff;
    --border-color: #e8e8e8;
}

.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fdf5f5 0%, #fff 50%, #fdf5f5 100%);
    padding: 40px 20px;
    position: relative;
    overflow: hidden;
}

/* Patrón de fondo decorativo */
.login-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        radial-gradient(circle at 10% 20%, rgba(204, 41, 46, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, rgba(204, 41, 46, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(255, 193, 7, 0.02) 0%, transparent 30%);
    pointer-events: none;
}

/* Iconos flotantes decorativos */
.floating-icons {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
}

.floating-icon {
    position: absolute;
    color: var(--primary);
    opacity: 0.06;
    font-size: 60px;
}

.floating-icon:nth-child(1) { top: 10%; left: 5%; animation: float1 8s ease-in-out infinite; }
.floating-icon:nth-child(2) { top: 70%; left: 10%; animation: float2 10s ease-in-out infinite; font-size: 45px; }
.floating-icon:nth-child(3) { top: 20%; right: 8%; animation: float3 9s ease-in-out infinite; font-size: 50px; }
.floating-icon:nth-child(4) { top: 80%; right: 5%; animation: float4 7s ease-in-out infinite; }
.floating-icon:nth-child(5) { top: 50%; left: 3%; animation: float5 11s ease-in-out infinite; font-size: 40px; }
.floating-icon:nth-child(6) { top: 30%; right: 3%; animation: float6 8s ease-in-out infinite; font-size: 35px; }

@keyframes float1 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
@keyframes float2 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-8deg); } }
@keyframes float3 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-25px) rotate(15deg); } }
@keyframes float4 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(-12deg); } }
@keyframes float5 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-22px) rotate(8deg); } }
@keyframes float6 { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(-5deg); } }

/* Contenedor del login */
.login-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 460px;
}

/* Tarjeta principal */
.login-card {
    background: var(--bg-white);
    border-radius: 24px;
    box-shadow:
        0 20px 60px rgba(204, 41, 46, 0.1),
        0 8px 24px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    border: 1px solid rgba(204, 41, 46, 0.08);
}

/* Header de la tarjeta */
.login-header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    padding: 40px 40px 50px;
    text-align: center;
    position: relative;
}

.login-header::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    background: var(--bg-white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}

.logo-icon-wrapper {
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
}

.logo-icon-wrapper i {
    font-size: 32px;
    color: white;
}

.logo-text {
    color: white;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.logo-version {
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    font-weight: 500;
}

/* Avatar del usuario */
.user-avatar {
    position: absolute;
    bottom: -35px;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(204, 41, 46, 0.3);
    border: 4px solid white;
    z-index: 2;
}

.user-avatar i {
    font-size: 28px;
    color: white;
}

/* Cuerpo del formulario */
.login-body {
    padding: 60px 40px 40px;
}

.welcome-text {
    text-align: center;
    margin-bottom: 30px;
}

.welcome-text h2 {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 8px 0;
}

.welcome-text p {
    font-size: 15px;
    color: var(--text-light);
    margin: 0;
}

/* Alertas */
.alert {
    padding: 14px 18px;
    border-radius: 12px;
    margin-bottom: 24px;
    font-size: 14px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.alert-success {
    background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
    border: 1px solid rgba(40, 167, 69, 0.2);
    color: #1e7e34;
}

.alert-danger {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
    border: 1px solid rgba(220, 53, 69, 0.2);
    color: #c82333;
}

/* Grupos de input */
.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 8px;
}

.input-wrapper {
    position: relative;
}

.input-wrapper i {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
    font-size: 18px;
    transition: color 0.3s ease;
}

.input-wrapper input {
    width: 100%;
    padding: 16px 16px 16px 50px;
    font-size: 15px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    background: var(--bg-light);
    color: var(--text-dark);
    transition: all 0.3s ease;
}

.input-wrapper input:focus {
    outline: none;
    border-color: var(--primary);
    background: var(--bg-white);
    box-shadow: 0 0 0 4px rgba(204, 41, 46, 0.1);
}

.input-wrapper input:focus + i,
.input-wrapper:focus-within i {
    color: var(--primary);
}

.input-wrapper input::placeholder {
    color: var(--text-light);
}

.toggle-password {
    left: auto !important;
    right: 16px;
    cursor: pointer;
    z-index: 2;
}

.toggle-password:hover {
    color: var(--primary) !important;
}

.input-error {
    font-size: 13px;
    color: var(--danger);
    margin-top: 6px;
    display: block;
}

/* Opciones del formulario */
.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
}

.remember-me input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: var(--primary);
    cursor: pointer;
}

.remember-me span {
    font-size: 14px;
    color: var(--text-medium);
}

.forgot-link {
    font-size: 14px;
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}

.forgot-link:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

/* Botón principal */
.btn-login {
    width: 100%;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 700;
    color: white;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 4px 16px rgba(204, 41, 46, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
}

.btn-login::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
}

.btn-login:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(204, 41, 46, 0.4);
}

.btn-login:hover::before {
    left: 100%;
}

.btn-login:active {
    transform: translateY(0);
}

/* Divisor */
.divider {
    display: flex;
    align-items: center;
    margin: 28px 0;
    gap: 16px;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
}

.divider span {
    font-size: 13px;
    color: var(--text-light);
    white-space: nowrap;
}

/* Botón de Google */
.btn-google {
    width: 100%;
    padding: 14px 24px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-dark);
    background: var(--bg-white);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-decoration: none;
}

.btn-google:hover {
    border-color: var(--primary);
    background: rgba(204, 41, 46, 0.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.btn-google img {
    width: 22px;
    height: 22px;
}

/* Link de registro */
.register-link {
    text-align: center;
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
}

.register-link p {
    font-size: 15px;
    color: var(--text-medium);
    margin: 0;
}

.register-link a {
    color: var(--primary);
    font-weight: 700;
    text-decoration: none;
    transition: color 0.3s ease;
}

.register-link a:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

/* Footer de la tarjeta */
.login-footer {
    background: var(--bg-light);
    padding: 20px 40px;
    text-align: center;
    border-top: 1px solid var(--border-color);
}

.login-footer p {
    font-size: 13px;
    color: var(--text-light);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.login-footer i {
    color: var(--primary);
}

/* Responsive */
@media (max-width: 576px) {
    .login-page {
        padding: 20px 16px;
    }

    .login-header {
        padding: 30px 24px 45px;
    }

    .logo-icon-wrapper {
        width: 60px;
        height: 60px;
    }

    .logo-icon-wrapper i {
        font-size: 26px;
    }

    .logo-text {
        font-size: 20px;
    }

    .user-avatar {
        width: 60px;
        height: 60px;
        bottom: -30px;
    }

    .user-avatar i {
        font-size: 24px;
    }

    .login-body {
        padding: 50px 24px 30px;
    }

    .welcome-text h2 {
        font-size: 22px;
    }

    .input-wrapper input {
        padding: 14px 14px 14px 46px;
    }

    .login-footer {
        padding: 16px 24px;
    }

    .floating-icons {
        display: none;
    }
}
</style>
@endsection

@section('content')
<div class="login-page">
    <!-- Iconos flotantes decorativos -->
    <div class="floating-icons">
        <i class="floating-icon fas fa-shopping-cart"></i>
        <i class="floating-icon fas fa-apple-alt"></i>
        <i class="floating-icon fas fa-shopping-basket"></i>
        <i class="floating-icon fas fa-carrot"></i>
        <i class="floating-icon fas fa-lemon"></i>
        <i class="floating-icon fas fa-pepper-hot"></i>
    </div>

    <div class="login-container">
        <div class="login-card">
            <!-- Header -->
            <div class="login-header">
                <div class="logo-container">
                    <div class="logo-icon-wrapper">
                        <i class="fas fa-store"></i>
                    </div>
                    <span class="logo-text">{{ config('app.name') }}</span>
                    <span class="logo-version">v{{ config('app.version') }}</span>
                </div>
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
            </div>

            <!-- Cuerpo -->
            <div class="login-body">
                <div class="welcome-text">
                    <h2>¡Bienvenido!</h2>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>

                @if(session('success'))
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <span>{{ session('success') }}</span>
                </div>
                @endif

                @if ($errors->any())
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle"></i>
                    <div>
                        @foreach ($errors->all() as $error)
                        <div>{{ $error }}</div>
                        @endforeach
                    </div>
                </div>
                @endif

                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <div class="form-group">
                        <label for="email">Correo Electrónico</label>
                        <div class="input-wrapper">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value="{{ old('email') }}"
                                placeholder="ejemplo@correo.com"
                                required
                                autocomplete="email"
                                autofocus
                            >
                            <i class="fas fa-envelope"></i>
                        </div>
                        @if ($errors->has('email'))
                        <span class="input-error">{{ $errors->first('email') }}</span>
                        @endif
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <div class="input-wrapper">
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                required
                                autocomplete="current-password"
                            >
                            <i class="fas fa-lock"></i>
                            <i class="fas fa-eye toggle-password" id="togglePassword" title="Ver contraseña"></i>
                        </div>
                        @if ($errors->has('password'))
                        <span class="input-error">{{ $errors->first('password') }}</span>
                        @endif
                    </div>

                    <div class="form-options">
                        <label class="remember-me">
                            <input type="checkbox" name="remember">
                            <span>Recordarme</span>
                        </label>
                        @if (Route::has('forget.password.get'))
                        <a href="{{ route('forget.password.get') }}" class="forgot-link">¿Olvidaste tu contraseña?</a>
                        @endif
                    </div>

                    <button type="submit" class="btn-login">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Iniciar Sesión</span>
                    </button>

                    <div class="divider">
                        <span>o continúa con</span>
                    </div>

                    <a href="{{ route('auth.google') }}" class="btn-google">
                        <img src="https://api.iconify.design/flat-color-icons:google.svg" alt="Google">
                        <span>Continuar con Google</span>
                    </a>

                    <div class="register-link">
                        <p>¿No tienes una cuenta? <a href="/registration">Regístrate aquí</a></p>
                    </div>
                </form>
            </div>

            <!-- Footer -->
            <div class="login-footer">
                <p>
                    <i class="fas fa-shield-alt"></i>
                    <span>Conexión segura y encriptada</span>
                </p>
            </div>
        </div>
    </div>
</div>
@endsection

@section('footer_page')
@if(session('messageOlvidoContrasena'))
<script>
    toastr.success("{{ session('messageOlvidoContrasena') }}");
</script>
@endif
<script>
    document.getElementById('togglePassword').addEventListener('click', function () {
        const input = document.getElementById('password');
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        this.classList.toggle('fa-eye', !isPassword);
        this.classList.toggle('fa-eye-slash', isPassword);
    });
</script>
@endsection
