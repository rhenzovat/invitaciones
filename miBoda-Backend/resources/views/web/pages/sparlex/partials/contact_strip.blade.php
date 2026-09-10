@php
    $pc = $paginaContacto ?? null;
    $wa = $urlWhatsapp ?? '#';
    $mapa = $pc->mapa_embed_url ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.77!2d-77.042793!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c6f84ad473ef%3A0x8e4e6b6c8c8c8c8c!2sLima%2C%20Peru!5e0!3m2!1ses!2spe!4v1694259649153!5m2!1ses!2spe';
@endphp
<div class="container-fluid py-5" id="contacto">
    <div class="container py-5">
        <div class="row g-4 align-items-center">
            <div class="col-12">
                <div class="row g-4">
                    <div class="col-lg-4">
                        <div class="d-inline-flex bg-light w-100 border border-primary p-4 rounded">
                            <i class="fas fa-map-marker-alt fa-2x text-primary me-4"></i>
                            <div><h4>Ubicación</h4><p class="mb-0">{{ $pc->ubicacion ?? '📍 Atención privada en Lima, Perú' }}</p></div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="d-inline-flex bg-light w-100 border border-primary p-4 rounded">
                            <i class="fab fa-whatsapp fa-2x text-primary me-4"></i>
                            <div><h4>WhatsApp</h4><p class="mb-0"><a href="{{ $wa }}">{{ $pc->telefono ?? '982 311 335' }}</a></p></div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="d-inline-flex bg-light w-100 border border-primary p-4 rounded">
                            <i class="fa fa-phone-alt fa-2x text-primary me-4"></i>
                            <div><h4>Teléfono</h4><p class="mb-0"><a href="tel:+51{{ preg_replace('/\D/','', $pc->telefono ?? '982311335') }}">{{ $pc->telefono ?? '982 311 335' }}</a></p></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12">
                <iframe class="rounded-top w-100" style="height:450px;margin-bottom:-6px;" src="{{ $mapa }}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                <div class="text-center p-4 rounded-bottom bg-primary">
                    <h4 class="text-white fw-bold">Síguenos</h4>
                    <div class="d-flex align-items-center justify-content-center">
                        <a href="{{ $wa }}" class="btn btn-light btn-light-outline-0 btn-square rounded-circle me-3"><i class="fab fa-whatsapp"></i></a>
                        <a href="#" class="btn btn-light btn-light-outline-0 btn-square rounded-circle me-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="btn btn-light btn-light-outline-0 btn-square rounded-circle"><i class="fab fa-instagram"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
