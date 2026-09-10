<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@yield('title', $metaData->titulo_pagina ?? 'Política de Privacidad | royalsensorymassage')</title>
  <meta name="description" content="{{ $metaData->descripcion_pagina ?? 'Política de privacidad de royalsensorymassage — empresa de servicios tecnológicos en Lima, Perú.' }}">
  @cookieconsentscripts
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  @include('web.partials.favicon')
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; min-height: 100vh; }

    /* ── NAV ── */
    .ld-nav {
      background: linear-gradient(135deg, #060d1f 0%, #0d1b3e 60%, #1a1040 100%);
      padding: 0 24px;
      height: 62px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 20px rgba(0,0,0,.35);
    }
    .ld-nav__logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .ld-nav__logo-icon {
      width: 36px; height: 36px; border-radius: 9px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; color: #fff;
    }
    .ld-nav__logo-text { font-size: 1.1rem; font-weight: 700; color: #fff; letter-spacing: -.3px; }
    .ld-nav__logo-text span { color: #60a5fa; }
    .ld-nav__links { display: flex; align-items: center; gap: 6px; }
    .ld-nav__link {
      color: rgba(255,255,255,.65); font-size: .82rem; font-weight: 500;
      text-decoration: none; padding: 6px 12px; border-radius: 8px; transition: all .15s;
    }
    .ld-nav__link:hover { color: #fff; background: rgba(255,255,255,.1); }
    .ld-nav__cta {
      background: #3b82f6; color: #fff; font-size: .80rem; font-weight: 600;
      text-decoration: none; padding: 7px 16px; border-radius: 8px;
      transition: background .15s;
    }
    .ld-nav__cta:hover { background: #2563eb; }

    /* ── HERO ── */
    .ld-hero {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e1b4b 100%);
      padding: 52px 24px 48px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .ld-hero::before {
      content: '🔒';
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      font-size: 220px; opacity: .04;
      pointer-events: none; user-select: none;
    }
    .ld-hero__badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(59,130,246,.15); border: 1px solid rgba(59,130,246,.3);
      color: #93c5fd; font-size: .72rem; font-weight: 600;
      padding: 4px 14px; border-radius: 99px; margin-bottom: 16px;
      letter-spacing: .05em; text-transform: uppercase;
    }
    .ld-hero__title { font-size: 2rem; font-weight: 800; color: #f8fafc; margin-bottom: 10px; line-height: 1.2; }
    .ld-hero__sub { font-size: .88rem; color: rgba(255,255,255,.55); max-width: 500px; margin: 0 auto 20px; line-height: 1.6; }
    .ld-hero__meta {
      display: inline-flex; align-items: center; gap: 18px;
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px; padding: 8px 20px; font-size: .78rem; color: rgba(255,255,255,.5);
    }
    .ld-hero__meta strong { color: rgba(255,255,255,.8); font-weight: 600; }

    /* ── LAYOUT ── */
    .ld-layout {
      max-width: 1100px; margin: 0 auto;
      display: grid; grid-template-columns: 260px 1fr;
      gap: 28px; padding: 36px 24px 60px;
    }
    @media (max-width: 768px) {
      .ld-layout { grid-template-columns: 1fr; }
      .ld-sidebar { display: none; }
    }

    /* ── SIDEBAR ── */
    .ld-sidebar { position: relative; }
    .ld-toc {
      position: sticky; top: 82px;
      background: #fff; border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 12px rgba(0,0,0,.06);
      overflow: hidden;
    }
    .ld-toc__header {
      background: linear-gradient(135deg, #0f172a, #1e3a5f);
      padding: 14px 18px;
    }
    .ld-toc__header p { font-size: .70rem; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: .1em; }
    .ld-toc__header h3 { font-size: .92rem; font-weight: 700; color: #f8fafc; margin-top: 2px; }
    .ld-toc__list { padding: 10px 0; }
    .ld-toc__item a {
      display: block; padding: 7px 18px;
      font-size: .78rem; color: #64748b; font-weight: 500;
      text-decoration: none; transition: all .15s;
      border-left: 3px solid transparent;
    }
    .ld-toc__item a:hover { color: #2563eb; background: #eff6ff; border-left-color: #3b82f6; }

    .ld-back {
      display: flex; align-items: center; gap: 6px;
      color: #64748b; font-size: .78rem; font-weight: 500;
      text-decoration: none; margin-top: 14px; padding: 10px 14px;
      background: #fff; border-radius: 10px; border: 1px solid #e2e8f0;
      transition: all .15s;
    }
    .ld-back:hover { color: #2563eb; border-color: #bfdbfe; }

    /* ── CARD ── */
    .ld-card {
      background: #fff; border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 16px rgba(0,0,0,.06);
      overflow: hidden;
    }
    .ld-card__top {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
      padding: 22px 28px;
      display: flex; align-items: center; gap: 14px;
    }
    .ld-card__top-icon {
      width: 46px; height: 46px; border-radius: 12px;
      background: rgba(255,255,255,.12);
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; flex-shrink: 0;
    }
    .ld-card__top h2 { font-size: 1.1rem; font-weight: 700; color: #f8fafc; }
    .ld-card__top p { font-size: .78rem; color: rgba(255,255,255,.5); margin-top: 2px; }
    .ld-card__body { padding: 32px 36px; }
    @media (max-width: 640px) { .ld-card__body { padding: 20px 18px; } }

    /* ── CONTENT STYLES ── */
    .ld-content h2 { font-size: 1.4rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .ld-content h3 {
      font-size: .95rem; font-weight: 700; color: #1e40af;
      margin: 28px 0 10px; padding-bottom: 6px;
      border-bottom: 2px solid #dbeafe;
      display: flex; align-items: center; gap: 8px;
    }
    .ld-content h3::before {
      content: ''; width: 4px; height: 16px;
      background: linear-gradient(#3b82f6, #8b5cf6);
      border-radius: 2px; flex-shrink: 0;
    }
    .ld-content p {
      font-size: .88rem; color: #374151; line-height: 1.85;
      margin-bottom: 14px;
    }
    .ld-content ul, .ld-content ol {
      padding-left: 20px; margin-bottom: 14px;
    }
    .ld-content li {
      font-size: .88rem; color: #374151; line-height: 1.85; margin-bottom: 6px;
    }
    .ld-content a { color: #2563eb; font-weight: 500; }
    .ld-content a:hover { text-decoration: underline; }
    .ld-content strong { color: #0f172a; font-weight: 600; }
    .ld-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }

    /* ── INFO CHIPS ── */
    .ld-chips {
      display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px;
    }
    .ld-chip {
      display: inline-flex; align-items: center; gap: 5px;
      background: #eff6ff; border: 1px solid #bfdbfe;
      color: #1d4ed8; font-size: .73rem; font-weight: 600;
      padding: 4px 12px; border-radius: 99px;
    }

    /* ── CONTACT BOX ── */
    .ld-contact-box {
      background: linear-gradient(135deg, #eff6ff, #f0fdf4);
      border: 1px solid #bfdbfe; border-radius: 12px;
      padding: 20px 24px; margin-top: 28px;
    }
    .ld-contact-box h4 { font-size: .88rem; font-weight: 700; color: #1e40af; margin-bottom: 12px; }
    .ld-contact-box a {
      display: inline-flex; align-items: center; gap: 6px;
      color: #2563eb; font-size: .85rem; font-weight: 500; text-decoration: none;
      margin-bottom: 6px; margin-right: 20px;
    }
    .ld-contact-box a:hover { text-decoration: underline; }

    /* ── FOOTER ── */
    .ld-footer {
      background: #0f172a;
      padding: 28px 24px;
      text-align: center;
    }
    .ld-footer__links { display: flex; justify-content: center; gap: 20px; margin-bottom: 14px; flex-wrap: wrap; }
    .ld-footer__link { color: rgba(255,255,255,.45); font-size: .78rem; text-decoration: none; transition: color .15s; }
    .ld-footer__link:hover { color: #60a5fa; }
    .ld-footer__copy { font-size: .75rem; color: rgba(255,255,255,.25); }
  </style>
</head>
<body>

{{-- ── NAV ── --}}
<nav class="ld-nav">
  <a href="{{ route('home') }}" class="ld-nav__logo">
    <div class="ld-nav__logo-icon">L</div>
    <span class="ld-nav__logo-text">Luc<span>desoft</span></span>
  </a>
  <div class="ld-nav__links">
    <a href="{{ route('home') }}" class="ld-nav__link">Inicio</a>
    <a href="{{ route('home') }}#portafolio" class="ld-nav__link">Portafolio</a>
    <a href="{{ url('/cotizador') }}" class="ld-nav__link">Cotizador</a>
    <a href="https://web.whatsapp.com/send?phone=51970048451&text=Hola%2C%20quiero%20cotizar%20un%20proyecto" onclick="window.open(this.href,'lucdesoft_wa');return false;" rel="noopener" class="ld-nav__cta">WhatsApp</a>
  </div>
</nav>

{{-- ── HERO ── --}}
<section class="ld-hero">
  <div class="ld-hero__badge">🔒 Legal &amp; Privacidad</div>
  <h1 class="ld-hero__title">Política de Privacidad</h1>
  <p class="ld-hero__sub">Cómo recopilamos, usamos y protegemos tu información personal en royalsensorymassage.</p>
  <div class="ld-hero__meta">
    <span>📅 Última actualización: <strong>Mayo 2026</strong></span>
    <span>🏛️ Ley N.º 29733 — Perú</span>
  </div>
</section>

{{-- ── LAYOUT ── --}}
<div class="ld-layout">

  {{-- SIDEBAR --}}
  <aside class="ld-sidebar">
    <div class="ld-toc">
      <div class="ld-toc__header">
        <p>Contenido</p>
        <h3>Política de Privacidad</h3>
      </div>
      <ul class="ld-toc__list" style="list-style:none">
        <li class="ld-toc__item"><a href="#s1">1. Responsable</a></li>
        <li class="ld-toc__item"><a href="#s2">2. Información que recopilamos</a></li>
        <li class="ld-toc__item"><a href="#s3">3. Finalidad</a></li>
        <li class="ld-toc__item"><a href="#s4">4. Base legal</a></li>
        <li class="ld-toc__item"><a href="#s5">5. Cookies</a></li>
        <li class="ld-toc__item"><a href="#s6">6. Compartición de datos</a></li>
        <li class="ld-toc__item"><a href="#s7">7. Plazos de conservación</a></li>
        <li class="ld-toc__item"><a href="#s8">8. Tus derechos (ARCO)</a></li>
        <li class="ld-toc__item"><a href="#s9">9. Seguridad</a></li>
        <li class="ld-toc__item"><a href="#s10">10. Transferencias</a></li>
        <li class="ld-toc__item"><a href="#s11">11. Cambios</a></li>
        <li class="ld-toc__item"><a href="#s12">12. Contacto</a></li>
      </ul>
    </div>
    <a href="{{ route('home') }}" class="ld-back">← Volver al inicio</a>
  </aside>

  {{-- MAIN --}}
  <main>
    <div class="ld-card">
      <div class="ld-card__top">
        <div class="ld-card__top-icon">🔐</div>
        <div>
          <h2>Política de Privacidad</h2>
          <p>royalsensorymassage · Lima, Perú · Mayo 2026</p>
        </div>
      </div>
      <div class="ld-card__body">

        <div class="ld-chips">
          <span class="ld-chip">🏛️ Ley 29733 Perú</span>
          <span class="ld-chip">🔒 HTTPS/TLS</span>
          <span class="ld-chip">⏱️ Respuesta en 20 días hábiles</span>
          <span class="ld-chip">🚫 No vendemos tus datos</span>
        </div>

        <div class="ld-content">
          @if(count($terminosData) > 0 && !empty($terminosData[0]->descripcion))
            {!! $terminosData[0]->descripcion !!}
          @else
            <p style="color:#94a3b8;text-align:center;padding:40px 0">Contenido no disponible. Por favor vuelve pronto.</p>
          @endif
        </div>

        <div class="ld-contact-box">
          <h4>¿Preguntas sobre tu privacidad?</h4>
          <a href="mailto:contacto@royalsensorymassage.com">📧 contacto@royalsensorymassage.com</a>
          <a href="https://web.whatsapp.com/send?phone=51970048451" onclick="window.open(this.href,'lucdesoft_wa');return false;" rel="noopener">💬 WhatsApp +51 970 048 451</a>
          <a href="https://royalsensorymassage.com" target="_blank" rel="noopener">🌐 royalsensorymassage.com</a>
        </div>

      </div>
    </div>

    {{-- Also see --}}
    <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap">
      <a href="{{ url('/terminos-condiciones') }}"
         style="flex:1;min-width:200px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:box-shadow .15s"
         onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.1)'" onmouseout="this.style.boxShadow='none'">
        <span style="font-size:24px">📋</span>
        <div>
          <p style="font-size:.80rem;font-weight:700;color:#0f172a">Términos y Condiciones</p>
          <p style="font-size:.73rem;color:#64748b;margin-top:2px">Ver condiciones del servicio</p>
        </div>
        <span style="margin-left:auto;color:#94a3b8;font-size:.85rem">→</span>
      </a>
      <a href="{{ url('/cotizador') }}"
         style="flex:1;min-width:200px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 20px;text-decoration:none;display:flex;align-items:center;gap:12px;transition:box-shadow .15s"
         onmouseover="this.style.boxShadow='0 4px 16px rgba(59,130,246,.15)'" onmouseout="this.style.boxShadow='none'">
        <span style="font-size:24px">🚀</span>
        <div>
          <p style="font-size:.80rem;font-weight:700;color:#1d4ed8">Cotizar mi proyecto</p>
          <p style="font-size:.73rem;color:#3b82f6;margin-top:2px">Respuesta en menos de 24 h</p>
        </div>
        <span style="margin-left:auto;color:#3b82f6;font-size:.85rem">→</span>
      </a>
    </div>
  </main>

</div>

{{-- ── FOOTER ── --}}
<footer class="ld-footer">
  <div class="ld-footer__links">
    <a href="{{ route('home') }}" class="ld-footer__link">Inicio</a>
    <a href="{{ url('/terminos-condiciones') }}" class="ld-footer__link">Términos y Condiciones</a>
    <a href="{{ url('/politica-privacidad') }}" class="ld-footer__link">Política de Privacidad</a>
    <a href="{{ url('/cotizador') }}" class="ld-footer__link">Cotizador</a>
    <a href="mailto:contacto@royalsensorymassage.com" class="ld-footer__link">contacto@royalsensorymassage.com</a>
  </div>
  <p class="ld-footer__copy">© {{ date('Y') }} royalsensorymassage — Todos los derechos reservados · Lima, Perú</p>
</footer>

@cookieconsentview
</body>
</html>
