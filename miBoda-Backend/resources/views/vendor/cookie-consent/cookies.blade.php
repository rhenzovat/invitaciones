<aside id="cookies-policy" class="cookies cookies--no-js">
    <div class="cookies__banner">
        <div class="cookies__content">
            <!-- Contenido Principal -->
            <div class="cookies__main" id="cookies-main-view">
                <div class="cookies__icon">
                    <i class="fas fa-cookie-bite"></i>
                </div>
                <div class="cookies__info">
                    <h2 class="cookies__title">Politica general sobre cookies</h2>
                    <p class="cookies__text">Al hacer clic en "Aceptar", usted acepta que las cookies se guarden en su dispositivo para mejorar la navegacion del sitio, analizar el uso del mismo, y colaborar con nuestros estudios para marketing.</p>
                </div>
                <div class="cookies__actions">
                    <button type="button" class="cookies__btn-accept" id="cookies-accept-btn" data-accept-url="{{ route('cookieconsent.accept.all') }}">Aceptar</button>
                    <a href="#" class="cookies__btn-config" id="cookies-show-config">Configurar cookies</a>
                    @if(isset($policy) && $policy)
                        <a href="{{ $policy }}" class="cookies__policy-link">Politicas de Cookies</a>
                    @endif
                </div>
            </div>

            <!-- Panel de Configuracion -->
            <div class="cookies__config" id="cookies-config-view" style="display: none;">
                <div class="cookies__config-header">
                    <button type="button" class="cookies__back" id="cookies-back-main">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2 class="cookies__title">Configurar cookies</h2>
                </div>

                <form action="{{ route('cookieconsent.accept.configuration') }}" method="post" class="cookies__form">
                    @csrf
                    <div class="cookies__categories">
                        @foreach($cookies->getCategories() as $category)
                        <div class="cookies__category">
                            <label class="cookies__category-label">
                                <div class="cookies__category-info">
                                    <span class="cookies__category-name">
                                        @if($category->key() === 'essentials')
                                            <i class="fas fa-cog"></i> Cookies esenciales
                                        @elseif($category->key() === 'analytics')
                                            <i class="fas fa-chart-bar"></i> Cookies de analisis
                                        @elseif($category->key() === 'marketing')
                                            <i class="fas fa-bullhorn"></i> Cookies de marketing
                                        @else
                                            <i class="fas fa-cookie-bite"></i> Cookies
                                        @endif
                                    </span>
                                    <p class="cookies__category-desc">
                                        @if($category->key() === 'essentials')
                                            Necesarias para el funcionamiento basico del sitio. No requieren consentimiento.
                                        @elseif($category->key() === 'analytics')
                                            Permiten analizar el comportamiento de los usuarios para mejorar nuestros servicios.
                                        @elseif($category->key() === 'marketing')
                                            Utilizadas para mostrar publicidad personalizada segun tus intereses.
                                        @endif
                                    </p>
                                </div>
                                <div class="cookies__toggle">
                                    @if ($category->key() === 'essentials')
                                        <input type="hidden" name="categories[]" value="{{ $category->key() }}" />
                                        <input type="checkbox" name="categories[]" value="{{ $category->key() }}" id="cookies-check-{{ $category->key() }}" checked="checked" disabled="disabled" />
                                        <span class="cookies__toggle-slider cookies__toggle-slider--disabled"></span>
                                    @else
                                        <input type="checkbox" name="categories[]" value="{{ $category->key() }}" id="cookies-check-{{ $category->key() }}" />
                                        <span class="cookies__toggle-slider"></span>
                                    @endif
                                </div>
                            </label>
                        </div>
                        @endforeach
                    </div>

                    <div class="cookies__form-actions">
                        <button type="submit" class="cookies__btn-save">
                            <i class="fas fa-check"></i> Guardar preferencias
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</aside>

{{-- STYLES & SCRIPT --}}
<script data-cookie-consent>
    try { {!! file_get_contents(LCC_ROOT . '/dist/script.js') !!} } catch (e) {}
</script>
<script>
(function() {
    var COOKIE_CONSENT_STORAGE_KEY = 'prestomart_cookie_consent_accepted';
    var banner = document.getElementById('cookies-policy');
    var acceptBtn = document.getElementById('cookies-accept-btn');
    if (!banner || !acceptBtn) return;

    if (localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)) {
        banner.style.display = 'none';
        return;
    }

    function hideBanner() {
        localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, '1');
        banner.classList.add('cookies--closing');
        setTimeout(function() {
            banner.style.display = 'none';
            var nodes = document.querySelectorAll('[data-cookie-consent]');
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
            }
        }, 250);
    }

    acceptBtn.addEventListener('click', function() {
        var url = acceptBtn.getAttribute('data-accept-url');
        var token = document.querySelector('meta[name="csrf-token"]') && document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        acceptBtn.disabled = true;
        acceptBtn.textContent = '...';
        hideBanner();
        if (url) {
            var opts = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: token ? '_token=' + encodeURIComponent(token) : ''
            };
            if (token) opts.headers['X-CSRF-TOKEN'] = token;
            fetch(url, opts).catch(function() {});
        }
    });
})();
</script>

<style data-cookie-consent>
    {!! file_get_contents(LCC_ROOT . '/dist/style.css') !!}

    /* ========================================
       COOKIES BANNER - ESTILO MINIMARKET
       Banner flotante en la parte inferior
       ======================================== */

    /* Posicion del banner flotante */
    #cookies-policy.cookies {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        padding: 0;
    }

    #cookies-policy.cookies--closing {
        opacity: 0;
        transform: translateY(100%);
    }

    /* Banner principal */
    .cookies__banner {
        background: #ffffff;
        box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.15);
        width: 100%;
        animation: cookieSlideUp 0.4s ease;
    }

    @keyframes cookieSlideUp {
        from {
            opacity: 0;
            transform: translateY(100%);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .cookies__content {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px 40px;
    }

    /* Ocultar elementos por defecto del paquete */
    #cookies-policy .cookies__alert,
    #cookies-policy .cookies__container,
    #cookies-policy .cookies__wrapper,
    #cookies-policy .cookies__btn--customize,
    #cookies-policy .cookies__expandable--custom {
        display: none !important;
    }

    /* ========== VISTA PRINCIPAL ========== */
    .cookies__main {
        display: flex;
        align-items: center;
        gap: 24px;
    }

    .cookies__icon {
        width: 50px;
        height: 50px;
        min-width: 50px;
        background: linear-gradient(135deg, #fd0505 0%, #a82024 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .cookies__icon i {
        font-size: 24px;
        color: #fff;
    }

    .cookies__info {
        flex: 1;
    }

    .cookies__title {
        font-size: 16px;
        font-weight: 700;
        color: #2c2c2c;
        margin: 0 0 6px 0;
        line-height: 1.3;
    }

    .cookies__text {
        font-size: 14px;
        color: #666666;
        line-height: 1.5;
        margin: 0;
    }

    .cookies__actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-shrink: 0;
    }

    .cookies__btn-accept {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 32px;
        font-size: 15px;
        font-weight: 700;
        color: #ffffff !important;
        background: #fd0505 !important;
        background: linear-gradient(135deg, #fd0505 0%, #a82024 100%) !important;
        border: none !important;
        border-radius: 8px !important;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(204, 41, 46, 0.3);
        text-decoration: none !important;
        white-space: nowrap;
        -webkit-appearance: none;
        appearance: none;
    }

    .cookies__btn-accept:hover {
        color: #ffffff !important;
        background: #a82024 !important;
        background: linear-gradient(135deg, #b82428 0%, #8f1b1f 100%) !important;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(204, 41, 46, 0.4);
    }

    .cookies__btn-accept:disabled {
        opacity: 0.85;
        cursor: not-allowed;
    }

    .cookies__btn-config {
        font-size: 14px;
        color: #555555;
        text-decoration: underline;
        font-weight: 500;
        transition: color 0.3s ease;
        white-space: nowrap;
    }

    .cookies__btn-config:hover {
        color: #fd0505;
    }

    .cookies__policy-link {
        font-size: 13px;
        color: #fd0505;
        text-decoration: underline;
        font-weight: 500;
        transition: color 0.3s ease;
        white-space: nowrap;
    }

    .cookies__policy-link:hover {
        color: #a82024;
    }

    /* ========== VISTA DE CONFIGURACION ========== */
    .cookies__config {
        padding: 10px 0;
    }

    .cookies__config-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }

    .cookies__back {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border: none;
        border-radius: 50%;
        color: #555;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .cookies__back:hover {
        background: #fd0505;
        color: white;
    }

    .cookies__config-header .cookies__title {
        margin: 0;
        font-size: 18px;
    }

    /* Categorias en fila */
    .cookies__categories {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 20px;
    }

    .cookies__category {
        flex: 1;
        min-width: 280px;
        background: #f8f9fa;
        border-radius: 10px;
        padding: 16px;
        border: 1px solid #e8e8e8;
        transition: all 0.3s ease;
    }

    .cookies__category:hover {
        border-color: rgba(204, 41, 46, 0.3);
    }

    .cookies__category-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        cursor: pointer;
    }

    .cookies__category-info {
        flex: 1;
    }

    .cookies__category-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 600;
        color: #2c2c2c;
        margin-bottom: 4px;
    }

    .cookies__category-name i {
        color: #fd0505;
        font-size: 14px;
    }

    .cookies__category-desc {
        font-size: 12px;
        color: #777;
        line-height: 1.4;
        margin: 0;
    }

    /* Toggle Switch */
    .cookies__toggle {
        position: relative;
        flex-shrink: 0;
    }

    .cookies__toggle input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
    }

    .cookies__toggle-slider {
        display: block;
        width: 46px;
        height: 26px;
        background: #ddd;
        border-radius: 26px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .cookies__toggle-slider::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .cookies__toggle input:checked + .cookies__toggle-slider {
        background: linear-gradient(135deg, #fd0505 0%, #a82024 100%);
    }

    .cookies__toggle input:checked + .cookies__toggle-slider::after {
        transform: translateX(20px);
    }

    .cookies__toggle-slider--disabled {
        background: linear-gradient(135deg, #fd0505 0%, #a82024 100%);
        opacity: 0.6;
        cursor: not-allowed;
    }

    .cookies__toggle-slider--disabled::after {
        transform: translateX(20px);
    }

    /* Boton guardar */
    .cookies__form-actions {
        display: flex;
        justify-content: flex-end;
    }

    .cookies__btn-save {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 28px;
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        background: linear-gradient(135deg, #fd0505 0%, #a82024 100%);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(204, 41, 46, 0.3);
    }

    .cookies__btn-save:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(204, 41, 46, 0.4);
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 992px) {
        .cookies__content {
            padding: 20px 24px;
        }

        .cookies__main {
            flex-wrap: wrap;
        }

        .cookies__info {
            flex: 1 1 100%;
            order: 2;
        }

        .cookies__icon {
            order: 1;
        }

        .cookies__actions {
            order: 3;
            width: 100%;
            margin-top: 16px;
            justify-content: flex-start;
        }
    }

    @media (max-width: 768px) {
        .cookies__content {
            padding: 16px 20px;
        }

        .cookies__main {
            gap: 16px;
        }

        .cookies__icon {
            width: 44px;
            height: 44px;
            min-width: 44px;
        }

        .cookies__icon i {
            font-size: 20px;
        }

        .cookies__title {
            font-size: 15px;
        }

        .cookies__text {
            font-size: 13px;
        }

        .cookies__actions {
            flex-wrap: wrap;
            gap: 12px;
        }

        .cookies__btn-accept {
            padding: 10px 24px;
            font-size: 14px;
        }

        .cookies__category {
            min-width: 100%;
            padding: 14px;
        }

        .cookies__categories {
            max-height: 200px;
            overflow-y: auto;
        }
    }

    @media (max-width: 480px) {
        .cookies__content {
            padding: 14px 16px;
        }

        .cookies__main {
            gap: 12px;
        }

        .cookies__icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
            border-radius: 10px;
        }

        .cookies__icon i {
            font-size: 18px;
        }

        .cookies__title {
            font-size: 14px;
        }

        .cookies__text {
            font-size: 12px;
        }

        .cookies__actions {
            flex-direction: column;
            align-items: stretch;
        }

        .cookies__btn-accept {
            width: 100%;
            justify-content: center;
        }

        .cookies__btn-config,
        .cookies__policy-link {
            text-align: center;
        }
    }
</style>
