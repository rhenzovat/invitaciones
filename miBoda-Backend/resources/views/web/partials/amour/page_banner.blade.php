@php
    use App\Support\AmourPageData;
    $bg = AmourPageData::img($bannerImagen ?? null, 'temp02/assets/images/inicio/amour-nosotros.jpeg');
@endphp
<section class="page-banner" style="background-image: url({{ $bg }})">
    <span class="line"></span>
    <span class="line two"></span>
    <span class="line three"></span>
    <span class="line four"></span>
    <div class="container">
        <div class="row">
            <div class="col-lg-8 col-xxl-7 col-3xl-6 z-2 banner-content px-3">
                @if(!empty($bannerEyebrow))
                    <h4 class="sub-heading primary fade_up_anim">{{ $bannerEyebrow }}</h4>
                @endif
                <h2 class="display-4 text-white mb-3 fade_up_anim">{{ $bannerTitulo ?? 'Amour Spa' }}</h2>
                @if(!empty($breadcrumbs))
                    <ul class="list-unstyled d-flex align-items-center gap-2 fade_up_anim mb-0" data-delay=".3">
                        @foreach($breadcrumbs as $crumb)
                            @if(!$loop->first)<i class="ph ph-caret-right"></i>@endif
                            <li>
                                @if(!empty($crumb['url']))
                                    <a href="{{ $crumb['url'] }}" class="{{ !empty($crumb['active']) ? 'active' : '' }}">{{ $crumb['label'] }}</a>
                                @else
                                    <span>{{ $crumb['label'] }}</span>
                                @endif
                            </li>
                        @endforeach
                    </ul>
                @endif
            </div>
        </div>
    </div>
</section>
