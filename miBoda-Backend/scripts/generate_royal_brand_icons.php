<?php
/**
 * Genera iconos Royal (mandala) para favicon, apple-touch y OG.
 * Uso: php scripts/generate_royal_brand_icons.php
 */
$src = __DIR__ . '/../public/temp02/img/inicio/logo-header.png';
$public = __DIR__ . '/../public';

if (!extension_loaded('gd')) {
    fwrite(STDERR, "GD no disponible\n");
    exit(1);
}

$info = getimagesize($src);
if (!$info) {
    fwrite(STDERR, "No se pudo leer: $src\n");
    exit(1);
}

[$w, $h] = $info;
$srcImg = imagecreatefrompng($src);
if (!$srcImg) {
    fwrite(STDERR, "No se pudo cargar PNG fuente\n");
    exit(1);
}

imagealphablending($srcImg, true);
imagesavealpha($srcImg, true);

function resizeSquare($srcImg, int $size, int $srcW, int $srcH)
{
    $out = imagecreatetruecolor($size, $size);
    imagealphablending($out, false);
    imagesavealpha($out, true);
    $transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
    imagefill($out, 0, 0, $transparent);
    imagecopyresampled($out, $srcImg, 0, 0, 0, 0, $size, $size, $srcW, $srcH);
    return $out;
}

function saveJpeg($img, string $path, int $quality = 90): void
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    imagejpeg($img, $path, $quality);
    imagedestroy($img);
}

function savePng($img, string $path): void
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    imagepng($img, $path, 6);
    imagedestroy($img);
}

function gdToIco($img, string $path): bool
{
    $w = imagesx($img);
    $h = imagesy($img);
    $bmp = '';
    for ($y = $h - 1; $y >= 0; $y--) {
        for ($x = 0; $x < $w; $x++) {
            $rgb = imagecolorat($img, $x, $y);
            $a = ($rgb >> 24) & 0x7F;
            $r = ($rgb >> 16) & 0xFF;
            $g = ($rgb >> 8) & 0xFF;
            $b = $rgb & 0xFF;
            if ($a > 0) {
                $alpha = (127 - $a) / 127;
                $r = (int) ($r * (1 - $alpha));
                $g = (int) ($g * (1 - $alpha));
                $b = (int) ($b * (1 - $alpha));
            }
            $bmp .= chr($b) . chr($g) . chr($r) . chr(0);
        }
    }
    $imageDataLength = strlen($bmp);
    $offset = 6 + 16;
    $header = pack('vvv', 0, 1, 1);
    $entry = pack('CCCCvvVV', $w, $h, 0, 0, 1, 32, $imageDataLength, $offset);

    return file_put_contents($path, $header . $entry . $bmp) !== false;
}

$outputs = [];

// OG WhatsApp/Facebook 1200×630 (sin query string — robots.txt bloquea URLs con ?)
$ogWide = imagecreatetruecolor(1200, 630);
imagealphablending($ogWide, false);
imagesavealpha($ogWide, true);
$bg = imagecolorallocate($ogWide, 0, 0, 0);
imagefill($ogWide, 0, 0, $bg);
$logoSize = 480;
$logo = resizeSquare($srcImg, $logoSize, $w, $h);
$x = (int) ((1200 - $logoSize) / 2);
$y = (int) ((630 - $logoSize) / 2);
imagecopy($ogWide, $logo, $x, $y, 0, 0, $logoSize, $logoSize);
imagedestroy($logo);
$ogWidePath = $public . '/imagenes/royal-whatsapp-share.jpg';
if (!is_dir(dirname($ogWidePath))) {
    mkdir(dirname($ogWidePath), 0755, true);
}
imagejpeg($ogWide, $ogWidePath, 88);
imagedestroy($ogWide);
$outputs[] = $ogWidePath;

copy($ogWidePath, $public . '/og-share.jpg');
copy($ogWidePath, $public . '/imagenes/royal-share-og-v3.jpg');
$outputs[] = $public . '/og-share.jpg';
$outputs[] = $public . '/imagenes/royal-share-og-v3.jpg';

// OG cuadrado (respaldo)
$og = resizeSquare($srcImg, 512, $w, $h);
$ogPath = $public . '/imagenes/royal-mandala-og.jpg';
saveJpeg($og, $ogPath, 88);
$outputs[] = $ogPath;

// Apple touch (raíz — WhatsApp lo pide automáticamente)
$apple = resizeSquare($srcImg, 180, $w, $h);
$applePath = $public . '/apple-touch-icon.png';
savePng($apple, $applePath);
$outputs[] = $applePath;

// Favicons ICO
foreach ([16 => 'favicon-16px.ico', 32 => 'favicon-32px.ico', 48 => 'favicon-48px.ico'] as $size => $name) {
    $icoImg = resizeSquare($srcImg, $size, $w, $h);
    $icoPath = $public . '/' . $name;
    gdToIco($icoImg, $icoPath);
    imagedestroy($icoImg);
    $outputs[] = $icoPath;
}

$mainIco = resizeSquare($srcImg, 32, $w, $h);
$mainIcoPath = $public . '/favicon.ico';
gdToIco($mainIco, $mainIcoPath);
imagedestroy($mainIco);
$outputs[] = $mainIcoPath;

// PNG auxiliar para <link rel="icon">
$png32 = resizeSquare($srcImg, 32, $w, $h);
$png32Path = $public . '/imagenes/royal-favicon-32.png';
savePng($png32, $png32Path);
$outputs[] = $png32Path;

// Manifest icon
$icon512 = resizeSquare($srcImg, 512, $w, $h);
$icon512Path = $public . '/icon/royal-icon-512.png';
savePng($icon512, $icon512Path);
$outputs[] = $icon512Path;

imagedestroy($srcImg);

foreach ($outputs as $file) {
    $kb = round(filesize($file) / 1024, 1);
    echo basename($file) . " — {$kb} KB\n";
}

echo "Listo.\n";
