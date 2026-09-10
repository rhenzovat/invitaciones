<section class="rm-page-hero">
    <div class="rm-page-hero__bg" style="background-image: url('{{ !empty($heroBg) ? $heroBg : asset('temp02/img/inicio/slider_1.jpg') }}');"></div>
    <div class="rm-page-hero__overlay"></div>
    <div class="rm-page-hero__content">
        @if(!empty($heroTag))<span class="rm-page-hero__tag">{{ $heroTag }}</span>@endif
        <h1 class="rm-page-hero__title">{{ $heroTitle ?? '' }}</h1>
        <div class="rm-page-hero__breadcrumb">
            <a href="{{ url('/') }}">Inicio</a><span>/</span><span>{{ $heroCrumb ?? $heroTitle }}</span>
        </div>
    </div>
</section>
