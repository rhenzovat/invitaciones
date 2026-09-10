<!DOCTYPE html>
<html lang="es" prefix="og: https://ogp.me/ns#">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <meta name="description" content="{{ $description }}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ $siteName }}">
    <meta property="og:title" content="{{ $title }}">
    <meta property="og:description" content="{{ $description }}">
    <meta property="og:url" content="{{ $url }}">
    <meta property="og:image" content="{{ $image }}">
    <meta property="og:image:secure_url" content="{{ $image }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{{ $siteName }}">
    <meta property="og:locale" content="es_PE">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $title }}">
    <meta name="twitter:description" content="{{ $description }}">
    <meta name="twitter:image" content="{{ $image }}">
    <link rel="canonical" href="{{ $url }}">
    <link rel="image_src" href="{{ $image }}">
    <link rel="icon" href="{{ $favicon }}" type="image/x-icon">
    <link rel="apple-touch-icon" href="{{ $appleTouch }}">
</head>
<body>{{ $siteName }}</body>
</html>
