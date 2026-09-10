<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$files = [];
$h = \App\Models\WebHeader::first();
if ($h && $h->url_logo) $files[] = $h->url_logo;

$f = \App\Models\WebFooter::first();
if ($f && $f->url_imagen_central) $files[] = $f->url_imagen_central;
if ($f && $f->logo_footer) $files[] = $f->logo_footer;

foreach (\App\Models\WebSlider::all() as $s) {
    if ($s->url_imagen) $files[] = $s->url_imagen;
}

foreach (array_filter($files) as $file) {
    $localPath = public_path($file);
    if (file_exists($localPath)) {
        echo "Exists: $file\n";
        continue;
    }

    $dir = dirname($localPath);
    if (! is_dir($dir)) {
        mkdir($dir, 0777, true);
    }

    $remoteUrl = 'https://royalsensorymassage.com/' . ltrim($file, '/');
    echo "Downloading $remoteUrl...\n";
    $content = @file_get_contents($remoteUrl);
    if ($content) {
        file_put_contents($localPath, $content);
        echo "Saved $file\n";
    } else {
        echo "Failed to download $remoteUrl\n";
    }
}
echo "Done.\n";
