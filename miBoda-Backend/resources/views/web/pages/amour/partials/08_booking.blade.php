@php
    $cl = $contactoLanding ?? null;
    $wa = $urlWhatsapp ?? Helpers::landingWhatsappUrl($footerCorp ?? null);
    $rituales = $experiencias ?? collect();
@endphp
<section class="booking-section pt-120 pb-120">
    <div class="container">
        <div class="section-title text-center w636 mx-auto">
            <h4 class="sub-heading fade_up_anim">{{ $cl->subtitulo ?? 'Réservez maintenant · Reserva tu cita' }}</h4>
            <h2 class="mb-2 mb-xl-3 fade_up_anim text-uppercase">{{ $cl->titulo ?? 'Un rituel te espera en Miraflores' }}</h2>
            <p class="fade_up_anim" data-delay=".3">{{ $cl->descripcion ?? 'Completa tus datos y elige tu ritual: te confirmamos por WhatsApp.' }}</p>
        </div>
        <div class="booking-form">
            <div class="d-flex flex-column flex-xl-row gap-3 align-items-center">
                <div class="row g-3">
                    <div class="col-md-4 col-xl-2"><input class="salonix-input" name="user_name" type="text" placeholder="Tu nombre..." required></div>
                    <div class="col-md-4 col-xl-2"><input class="salonix-input" name="email" type="email" placeholder="Tu correo..." required></div>
                    <div class="col-md-4 col-xl-2"><input class="salonix-input" name="phone" type="tel" placeholder="977 807 314" required></div>
                    <div class="col-md-4 col-xl-2">
                        <select name="service" class="sort idRef44545 clsListReservation">
                            <option value="">Elegir rituel</option>
                            @foreach($rituales as $r)
                                <option value="{{ $r->subtitulo ?? $r->titulo }}">{{ $r->subtitulo ?? $r->titulo }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="col-md-4 col-xl-2"><input class="salonix-input" name="date" type="date" required></div>
                    <div class="col-md-4 col-xl-2"><input class="salonix-input" name="time" type="time" required></div>
                </div>
                <a href="{{ $wa }}" class="primary-btn flex-shrink-0 px-4" target="_blank" rel="noopener" style="border-radius:2rem">Réserver</a>
            </div>
        </div>
    </div>
</section>
