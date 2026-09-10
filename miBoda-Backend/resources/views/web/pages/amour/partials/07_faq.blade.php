@php
    use App\Support\AmourPageData;
    $pf = $paginaFaq ?? null;
    $faqImg = AmourPageData::img($pf->url_imagen ?? 'temp02/assets/images/inicio/preguntas.jfif', 'temp02/assets/images/inicio/preguntas.jfif');
    $faqs = $masajeFaqs ?? collect();
    $faqEyebrow  = $pf->intro_label ?? 'Antes de su visita';
    $faqTitulo   = $pf->titulo      ?? 'Preguntas frecuentes · Amour Spa';
    $faqSubtitulo= $pf->subtitulo   ?? 'Todo lo esencial antes de cruzar nuestro umbral en Diez Canseco.';
@endphp
<section class="faq-2 home-5">
    <div class="container-fluid overflow-x-hidden">
        <div class="row align-items-center">
            <div class="d-none d-md-block col-md-5 px-0 position-relative">
                <div class="reveal reveal--right">
                    <img src="{{ $faqImg }}" class="img-fluid testimonial-img" alt="FAQ Amour Spa">
                </div>
            </div>
            <div class="col-md-7 px-0 d-flex align-items-center">
                <div class="row px-3 py-5 py-xl-0">
                    <div class="col-12">
                        <div class="faq-content no-cta">
                            <h4 class="sub-heading fade_up_anim">{{ $faqEyebrow }}</h4>
                            <h2 class="fade_up_anim">{{ $faqTitulo }}</h2>
                            <p class="pb-lg-2 mb-3 mb-xl-4 fade_up_anim" data-delay=".3">{{ $faqSubtitulo }}</p>
                            <div class="accordion d-flex flex-column gap-3 gap-xxl-4" id="accordionExample">
                                @foreach($faqs as $faq)
                                    @php $collapseId = 'collapseFaq' . $faq->id; @endphp
                                    <div class="accordion-item">
                                        <div class="accordion-header">
                                            <button class="accordion-button {{ $loop->first ? '' : 'collapsed' }}" type="button" data-bs-toggle="collapse" data-bs-target="#{{ $collapseId }}" aria-expanded="{{ $loop->first ? 'true' : 'false' }}">
                                                {{ $faq->titulo }}
                                            </button>
                                        </div>
                                        <div id="{{ $collapseId }}" class="accordion-collapse collapse {{ $loop->first ? 'show' : '' }}" data-bs-parent="#accordionExample">
                                            <div class="accordion-body"><p>{!! nl2br(e(strip_tags($faq->contenido))) !!}</p></div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
