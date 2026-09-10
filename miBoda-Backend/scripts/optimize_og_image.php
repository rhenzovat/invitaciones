<?php
/**
 * Genera imagen OG optimizada (<300 KB) para WhatsApp/Facebook.
 * Uso: php scripts/optimize_og_image.php
 */
$src = __DIR__ . '/../public/temp02/img/inicio/logo-header.png';
$dst = __DIR__ . '/../public/imagenes/og-royal-share.jpg';

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
$img = imagecreatefrompng($src);
if (!$img) {
    fwrite(STDERR, "No se pudo cargar PNG\n");
    exit(1);
}

imagealphablending($img, true);
imagesavealpha($img, true);

$targetW = 512;
$targetH = 512;
$out = imagecreatetruecolor($targetW, $targetH);
imagealphablending($out, false);
imagesavealpha($out, true);
$transparent = imagecolorallocatealpha($out, 0, 0, 0, 127);
imagefill($out, 0, 0, $transparent);
imagecopyresampled($out, $img, 0, 0, 0, 0, $targetW, $targetH, $w, $h);
imagedestroy($img);

if (!is_dir(dirname($dst))) {
    mkdir(dirname($dst), 0755, true);
}

imagejpeg($out, $dst, 88);
imagedestroy($out);

$kb = round(filesize($dst) / 1024, 1);
echo "OK: $dst ({$kb} KB, {$targetW}x{$targetH})\n";
