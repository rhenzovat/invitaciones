@php
    $lista = $redes ?? [];
    $waUrl = $wa ?? '#';
    $variant = $variant ?? 'inline';
    $iconos = [
        'facebook'  => 'fab fa-facebook-f',
        'instagram' => 'fab fa-instagram',
        'whatsapp'  => 'fab fa-whatsapp',
        'tiktok'    => 'fab fa-tiktok',
        'youtube'   => 'fab fa-youtube',
        'linkedin'  => 'fab fa-linkedin-in',
        'twitter'   => 'fab fa-twitter',
        'link'      => 'fas fa-link',
    ];
@endphp
@foreach($lista as $red)
    @php
        $tipo = $red['tipo'] ?? 'link';
        $urlRaw = trim((string) ($red['url'] ?? ''));
        $redUrl = ($tipo === 'whatsapp' && $urlRaw === '') ? $waUrl : ($urlRaw !== '' ? $urlRaw : '#');
        $icon = $iconos[$tipo] ?? 'fas fa-link';
        $title = trim((string) ($red['etiqueta'] ?? '')) !== '' ? $red['etiqueta'] : ucfirst($tipo);
    @endphp
    @if($variant === 'circles-lg')
        <a href="{{ $redUrl }}" target="_blank" rel="noopener" title="{{ $title }}"
           class="btn btn-light btn-light-outline-0 btn-square rounded-circle"
           style="width:46px;height:46px;">
            <i class="{{ $icon }}"></i>
        </a>
    @else
        <a href="{{ $redUrl }}" target="_blank" rel="noopener" title="{{ $title }}">
            <i class="{{ $icon }}"></i>
        </a>
    @endif
@endforeach
