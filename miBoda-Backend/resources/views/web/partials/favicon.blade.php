{{-- Favicons Amour Spa --}}
@php
    $amourIcon = Helpers::siteFaviconUrl('icon/favicon-96x96.png');
@endphp
<link rel="icon" href="{{ $amourIcon }}" sizes="96x96" type="image/png">
<link rel="shortcut icon" href="{{ $amourIcon }}">
<link rel="apple-touch-icon" sizes="180x180" href="{{ $amourIcon }}">
<link rel="manifest" href="{{ Helpers::cmsAbsoluteUrl('icon/site.webmanifest') }}">
<meta name="apple-mobile-web-app-title" content="Amor Spa">
<meta name="application-name" content="Amor Spa">
<meta name="theme-color" content="#ffffff">
