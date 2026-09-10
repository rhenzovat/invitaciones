<?php
/**
 * LUCDESOFT — Mantenimiento web sin terminal (cPanel / local)
 *
 * Cada visita con la clave correcta:
 *   1. Ejecuta php artisan migrate --force (tablas nuevas y cambios de BD)
 *   2. Reintenta migraciones pendientes una por una si algo falló
 *   3. Limpia cachés de Laravel
 *
 * Local:  http://localhost:8000/artisan-clear.php?key=lucdesoft2026
 * Prod:   https://royalsensorymassage.com/artisan-clear.php?key=lucdesoft2026
 */

$KEY = 'lucdesoft2026';
if (($_GET['key'] ?? '') !== $KEY) {
    http_response_code(403);
    die('<h2 style="font-family:sans-serif;color:red">Acceso denegado — agrega ?key=lucdesoft2026 a la URL</h2>');
}

/**
 * Detecta la raíz de Laravel (local public/ o cPanel con public_html + ../laravel).
 */
function resolveLaravelRoot(): ?string
{
    $publicDir = __DIR__;
    $candidates = [];

    // 1. Ruta declarada en index.php del mismo directorio (más fiable en producción)
    $indexFile = $publicDir . DIRECTORY_SEPARATOR . 'index.php';
    if (is_file($indexFile)) {
        $indexContent = @file_get_contents($indexFile) ?: '';
        if (preg_match(
            "/require(?:_once)?\\s+__DIR__\\.\\s*['\"]([^'\"]*vendor\\/autoload\\.php)['\"]/",
            $indexContent,
            $m
        )) {
            $vendorFile = $publicDir . DIRECTORY_SEPARATOR . str_replace(
                ['/', '\\'],
                DIRECTORY_SEPARATOR,
                $m[1]
            );
            $vendorDir = realpath(dirname($vendorFile));
            if ($vendorDir && is_file($vendorDir . DIRECTORY_SEPARATOR . 'autoload.php')) {
                $candidates[] = dirname($vendorDir);
            }
        }
    }

    // 2. Laravel estándar: public/ dentro del proyecto
    $candidates[] = dirname($publicDir);

    // 3. cPanel: public_html y carpeta hermana laravel/
    $candidates[] = dirname($publicDir) . DIRECTORY_SEPARATOR . 'laravel';
    $candidates[] = dirname($publicDir, 2) . DIRECTORY_SEPARATOR . 'laravel';

    // 4. Hosts conocidos
    $candidates[] = '/home/royalsen/laravel';
    $candidates[] = '/home/lucdesof/laravel';

    // 5. Subir desde public/ hasta encontrar artisan (máx. 6 niveles)
    $dir = $publicDir;
    for ($i = 0; $i < 6; $i++) {
        $candidates[] = $dir;
        $parent = dirname($dir);
        if ($parent === $dir) {
            break;
        }
        $dir = $parent;
    }

    $seen = [];
    foreach ($candidates as $root) {
        if (! is_string($root) || $root === '') {
            continue;
        }

        $root = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $root), DIRECTORY_SEPARATOR);
        if (isset($seen[$root])) {
            continue;
        }
        $seen[$root] = true;

        $autoload = $root . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';
        $artisan  = $root . DIRECTORY_SEPARATOR . 'artisan';

        if (is_file($autoload) && is_file($artisan)) {
            return realpath($root) ?: $root;
        }
    }

    return null;
}

function formatLaravelRootProbe(): string
{
    $publicDir = __DIR__;
    $lines = [
        'Directorio del script: ' . $publicDir,
        'Probado: ' . dirname($publicDir),
        'Probado: ' . dirname($publicDir) . DIRECTORY_SEPARATOR . 'laravel',
        'Probado: /home/royalsen/laravel',
    ];

    return implode('<br>', array_map('htmlspecialchars', $lines));
}

$laravelRoot = resolveLaravelRoot();

if (!$laravelRoot) {
    http_response_code(500);
    die(
        '<h2 style="font-family:sans-serif;color:orange">No se encontró Laravel. Verifique que vendor/ y artisan existan.</h2>'
        . '<p style="font-family:sans-serif;font-size:14px;color:#555">'
        . formatLaravelRootProbe()
        . '</p>'
    );
}

define('LARAVEL_START', microtime(true));
require $laravelRoot . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

$app = require_once $laravelRoot . DIRECTORY_SEPARATOR . 'bootstrap' . DIRECTORY_SEPARATOR . 'app.php';
/** @var \Illuminate\Contracts\Console\Kernel $kernel */
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$migracionesResultados = [];
$pendingCountBefore    = 0;
$pendingCountAfter     = 0;

/**
 * Ejecuta migraciones pendientes: primero migrate --force global, luego una por una.
 */
function ejecutarMigraciones($app, $kernel, $laravelRoot): array
{
    $resultados = [];

    /** @var \Illuminate\Database\Migrations\Migrator $migrator */
    $migrator = $app->make('migrator');
    $migrationsPath = $laravelRoot . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations';

    if (!$migrator->repositoryExists()) {
        $migrator->getRepository()->createRepository();
        $resultados[] = [
            'name' => '(setup)',
            'ok'   => true,
            'note' => 'Tabla migrations creada',
        ];
    }

    $allFiles = $migrator->getMigrationFiles($migrationsPath);
    $ran      = $migrator->getRepository()->getRan();
    $pending  = array_diff_key($allFiles, array_flip($ran));

    if (empty($pending)) {
        return [[
            'name' => '(ninguna)',
            'ok'   => true,
            'note' => 'No hay migraciones pendientes — BD al día',
        ]];
    }

    $ranBefore = $migrator->getRepository()->getRan();

    // Paso 1: migrate --force (equivalente a php artisan migrate --force)
    try {
        $exitCode = $kernel->call('migrate', ['--force' => true]);
        $ranAfter = $migrator->getRepository()->getRan();
        $newlyRan = array_diff($ranAfter, $ranBefore);

        foreach ($newlyRan as $migrationName) {
            $resultados[] = [
                'name' => $migrationName,
                'ok'   => true,
                'note' => 'Ejecutada (migrate --force)',
            ];
        }

        if ($exitCode !== 0 && empty($newlyRan)) {
            $resultados[] = [
                'name'  => 'migrate --force',
                'ok'    => false,
                'error' => 'El comando terminó con código ' . $exitCode . ' — se intentará una por una',
            ];
        }
    } catch (\Throwable $e) {
        $resultados[] = [
            'name'  => 'migrate --force',
            'ok'    => false,
            'error' => substr($e->getMessage(), 0, 180),
        ];
    }

    // Paso 2: pendientes restantes, una por una (tolerante a "ya existe")
    $ran      = $migrator->getRepository()->getRan();
    $pending  = array_diff_key($allFiles, array_flip($ran));
    $lastBatch = max($migrator->getRepository()->getLastBatchNumber(), 1);

    foreach ($pending as $migrationName => $migrationPath) {
        try {
            $relPath  = 'database/migrations/' . basename($migrationPath);
            $exitCode = $kernel->call('migrate', [
                '--force' => true,
                '--path'  => $relPath,
            ]);

            $alreadyLogged = in_array($migrationName, $migrator->getRepository()->getRan(), true);

            $resultados[] = [
                'name' => $migrationName,
                'ok'   => $exitCode === 0 || $alreadyLogged,
                'note' => $alreadyLogged ? 'Ejecutada (--path)' : null,
            ];
        } catch (\Throwable $e) {
            $msg      = $e->getMessage();
            $isExists = preg_match('/already exists|Duplicate (column|key|entry|table)|1050|1060|1061|1826/i', $msg);

            if ($isExists) {
                try {
                    if (!in_array($migrationName, $migrator->getRepository()->getRan(), true)) {
                        $migrator->getRepository()->log($migrationName, $lastBatch + 1);
                    }
                    $resultados[] = [
                        'name' => $migrationName,
                        'ok'   => true,
                        'note' => 'Ya existía en BD → registrada como ejecutada',
                    ];
                } catch (\Throwable $e2) {
                    $resultados[] = [
                        'name'  => $migrationName,
                        'ok'    => false,
                        'error' => 'Ya existía pero no se pudo registrar: ' . substr($e2->getMessage(), 0, 120),
                    ];
                }
            } else {
                $resultados[] = [
                    'name'  => $migrationName,
                    'ok'    => false,
                    'error' => substr($msg, 0, 180),
                ];
            }
        }
    }

    // Verificación final
    $stillPending = array_diff_key(
        $migrator->getMigrationFiles($migrationsPath),
        array_flip($migrator->getRepository()->getRan())
    );

    if (!empty($stillPending)) {
        $resultados[] = [
            'name'  => '(verificación)',
            'ok'    => false,
            'error' => count($stillPending) . ' migración(es) aún pendiente(s): ' . implode(', ', array_slice(array_keys($stillPending), 0, 5)),
        ];
    }

    return $resultados;
}

try {
    /** @var \Illuminate\Database\Migrations\Migrator $migrator */
    $migrator = $app->make('migrator');
    $migrationsPath = $laravelRoot . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'migrations';

    if ($migrator->repositoryExists()) {
        $allFiles = $migrator->getMigrationFiles($migrationsPath);
        $ran      = $migrator->getRepository()->getRan();
        $pendingCountBefore = count(array_diff_key($allFiles, array_flip($ran)));
    } else {
        $pendingCountBefore = count($migrator->getMigrationFiles($migrationsPath));
    }

    $migracionesResultados = ejecutarMigraciones($app, $kernel, $laravelRoot);

    if ($migrator->repositoryExists()) {
        $allFiles = $migrator->getMigrationFiles($migrationsPath);
        $ran      = $migrator->getRepository()->getRan();
        $pendingCountAfter = count(array_diff_key($allFiles, array_flip($ran)));
    }
} catch (\Throwable $e) {
    $migracionesResultados[] = [
        'name'  => 'migrate (general)',
        'ok'    => false,
        'error' => substr($e->getMessage(), 0, 200),
    ];
}

// Caché
$comandos = [
    'config:clear' => 'Caché de configuración',
    'cache:clear'  => 'Caché de aplicación',
    'route:clear'  => 'Caché de rutas',
    'view:clear'   => 'Caché de vistas compiladas',
    'event:clear'  => 'Caché de eventos',
];

$resultados = [];
foreach ($comandos as $cmd => $label) {
    try {
        $exitCode = $kernel->call($cmd);
        $resultados[] = ['cmd' => $cmd, 'label' => $label, 'ok' => $exitCode === 0];
    } catch (\Throwable $e) {
        $resultados[] = ['cmd' => $cmd, 'label' => $label, 'ok' => false, 'error' => $e->getMessage()];
    }
}

$sessionPath     = $laravelRoot . DIRECTORY_SEPARATOR . 'storage' . DIRECTORY_SEPARATOR . 'framework' . DIRECTORY_SEPARATOR . 'sessions';
$sessionBorrados = 0;
if (is_dir($sessionPath)) {
    foreach (glob($sessionPath . DIRECTORY_SEPARATOR . '*') as $f) {
        if (is_file($f) && (time() - filemtime($f)) > 1800) {
            @unlink($f);
            $sessionBorrados++;
        }
    }
}

$cacheOk = false;
try {
    $cacheOk = $kernel->call('config:cache') === 0;
} catch (\Throwable $e) {
}

$elapsed = number_format((microtime(true) - LARAVEL_START) * 1000, 1);

$migTotalOk   = count(array_filter($migracionesResultados, fn ($r) => $r['ok']));
$migTotalFail = count(array_filter($migracionesResultados, fn ($r) => !($r['ok'] ?? false)));
$migMarked    = count(array_filter($migracionesResultados, fn ($r) => ($r['ok'] ?? false) && isset($r['note']) && str_contains($r['note'], 'registrada')));
$migExecuted  = count(array_filter($migracionesResultados, fn ($r) => ($r['ok'] ?? false) && isset($r['note']) && str_contains($r['note'], 'Ejecutada')));

$pageOk = $migTotalFail === 0 && $pendingCountAfter === 0;
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mantenimiento — royalsensorymassage</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
  .card{background:#1e293b;border-radius:16px;padding:32px;max-width:720px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.4)}
  .logo{font-size:12px;color:#64748b;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:18px}
  h1{font-size:1.35rem;color:#f8fafc;margin-bottom:4px}
  .sub{font-size:.80rem;color:#64748b;margin-bottom:22px}
  .hero{padding:12px 14px;border-radius:10px;margin-bottom:16px;font-size:.82rem;line-height:1.5}
  .hero.ok{background:rgba(22,163,74,.12);border:1px solid rgba(22,163,74,.35);color:#86efac}
  .hero.warn{background:rgba(234,179,8,.10);border:1px solid rgba(234,179,8,.3);color:#fde68a}
  .section-title{font-size:.70rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.1em;margin:18px 0 8px}
  .mig-summary{display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap}
  .mig-chip{font-size:.72rem;font-weight:700;padding:3px 12px;border-radius:99px}
  .mig-chip.ok{background:#166534;color:#86efac}
  .mig-chip.info{background:#1e3a5f;color:#93c5fd}
  .mig-chip.skip{background:#1e3a5f;color:#93c5fd}
  .mig-chip.fail{background:#7f1d1d;color:#fca5a5}
  .mig-row{display:flex;align-items:flex-start;gap:10px;padding:8px 12px;border-radius:8px;margin-bottom:6px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);font-size:.75rem}
  .mig-icon{flex-shrink:0;font-size:14px}
  .mig-name{font-family:monospace;color:#94a3b8;word-break:break-all;flex:1}
  .mig-note{color:#60a5fa;font-size:.70rem;margin-top:2px}
  .mig-err{color:#f87171;font-size:.70rem;margin-top:2px;font-family:monospace}
  .mig-badge{font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:99px;flex-shrink:0;white-space:nowrap}
  .mig-badge.ok{background:#166534;color:#86efac}
  .mig-badge.skip{background:#1e3a5f;color:#93c5fd}
  .mig-badge.fail{background:#7f1d1d;color:#fca5a5}
  .row{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;margin-bottom:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
  .icon{font-size:17px;flex-shrink:0}
  .lbl{flex:1}
  .desc{font-size:.83rem;color:#e2e8f0;font-weight:500}
  .cmd{font-size:.70rem;font-family:monospace;color:#94a3b8}
  .err{font-size:.70rem;font-family:monospace;color:#f87171;margin-top:2px}
  .badge{font-size:.68rem;font-weight:700;padding:3px 10px;border-radius:99px;flex-shrink:0}
  .badge.ok{background:#166534;color:#86efac}
  .badge.fail{background:#7f1d1d;color:#fca5a5}
  hr{border:none;border-top:1px solid rgba(255,255,255,.07);margin:16px 0}
  .extra{display:flex;justify-content:space-between;font-size:.82rem;color:#94a3b8;padding:5px 0;gap:12px}
  .extra span:last-child{color:#e2e8f0;font-weight:600;text-align:right}
  .cache-row{display:flex;align-items:center;gap:10px;margin-top:14px;padding:12px 14px;border-radius:10px;font-size:.82rem}
  .cache-ok{background:rgba(22,163,74,.15);border:1px solid rgba(22,163,74,.3);color:#86efac}
  .cache-fail{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5}
  .info{margin-top:18px;background:rgba(59,130,246,.10);border:1px solid rgba(59,130,246,.25);border-radius:10px;padding:13px 15px;font-size:.79rem;color:#bfdbfe;line-height:1.6}
  code{background:rgba(255,255,255,.08);padding:1px 6px;border-radius:4px;font-size:.75rem}
  details summary{cursor:pointer;font-size:.75rem;color:#64748b;margin-bottom:6px;user-select:none}
  details summary:hover{color:#94a3b8}
</style>
</head>
<body>
<div class="card">
  <div class="logo">royalsensorymassage · Mantenimiento automático</div>
  <h1><?= $pageOk ? 'BD y caché actualizadas' : 'Mantenimiento completado con avisos' ?></h1>
  <p class="sub"><?= date('d/m/Y H:i:s') ?></p>

  <div class="hero <?= $pageOk ? 'ok' : 'warn' ?>">
    <?php if ($pendingCountBefore === 0): ?>
      No había migraciones pendientes. La base de datos ya estaba al día.
    <?php elseif ($pendingCountAfter === 0): ?>
      Se detectaron <strong><?= $pendingCountBefore ?></strong> migración(es) pendiente(s) y se aplicaron correctamente
      (tablas nuevas o columnas modificadas).
    <?php else: ?>
      Quedan <strong><?= $pendingCountAfter ?></strong> migración(es) sin aplicar. Revise los errores abajo.
    <?php endif; ?>
    <br>Cada visita ejecuta automáticamente <code>php artisan migrate --force</code>.
  </div>

  <div class="section-title">Migraciones (php artisan migrate --force)</div>

  <div class="mig-summary">
    <span class="mig-chip info">Antes: <?= $pendingCountBefore ?> pendiente(s)</span>
    <span class="mig-chip info">Después: <?= $pendingCountAfter ?> pendiente(s)</span>
    <span class="mig-chip ok"><?= $migTotalOk ?> OK</span>
    <?php if ($migExecuted > 0): ?>
    <span class="mig-chip ok"><?= $migExecuted ?> ejecutada(s)</span>
    <?php endif; ?>
    <?php if ($migMarked > 0): ?>
    <span class="mig-chip skip"><?= $migMarked ?> sincronizada(s)</span>
    <?php endif; ?>
    <?php if ($migTotalFail > 0): ?>
    <span class="mig-chip fail"><?= $migTotalFail ?> error</span>
    <?php endif; ?>
  </div>

  <?php
  $nuevas   = array_filter($migracionesResultados, fn ($r) => ($r['ok'] ?? false) && !isset($r['note']));
  $ejecutadas = array_filter($migracionesResultados, fn ($r) => ($r['ok'] ?? false) && isset($r['note']) && str_contains($r['note'], 'Ejecutada'));
  $marcadas = array_filter($migracionesResultados, fn ($r) => ($r['ok'] ?? false) && isset($r['note']) && str_contains($r['note'], 'registrada'));
  $fallidas = array_filter($migracionesResultados, fn ($r) => !($r['ok'] ?? false));
  $sinPend  = array_filter($migracionesResultados, fn ($r) => ($r['ok'] ?? false) && isset($r['note']) && str_contains($r['note'], 'al día'));
  $otros    = array_filter($migracionesResultados, fn ($r) => ($r['ok'] ?? false) && isset($r['note']) && !str_contains($r['note'] ?? '', 'Ejecutada') && !str_contains($r['note'] ?? '', 'registrada') && !str_contains($r['note'] ?? '', 'al día'));
  ?>

  <?php foreach ($sinPend as $r): ?>
  <div class="mig-row">
    <span class="mig-icon">✅</span>
    <div style="flex:1"><div class="mig-name">Sin migraciones pendientes</div></div>
  </div>
  <?php endforeach; ?>

  <?php foreach ($ejecutadas as $r): ?>
  <div class="mig-row">
    <span class="mig-icon">✅</span>
    <div style="flex:1">
      <div class="mig-name"><?= htmlspecialchars($r['name']) ?></div>
      <?php if (!empty($r['note'])): ?><div class="mig-note"><?= htmlspecialchars($r['note']) ?></div><?php endif; ?>
    </div>
    <span class="mig-badge ok">APLICADA</span>
  </div>
  <?php endforeach; ?>

  <?php foreach ($nuevas as $r): ?>
  <div class="mig-row">
    <span class="mig-icon">✅</span>
    <div style="flex:1"><div class="mig-name"><?= htmlspecialchars($r['name']) ?></div></div>
    <span class="mig-badge ok">OK</span>
  </div>
  <?php endforeach; ?>

  <?php foreach ($otros as $r): ?>
  <div class="mig-row">
    <span class="mig-icon">ℹ️</span>
    <div style="flex:1">
      <div class="mig-name"><?= htmlspecialchars($r['name']) ?></div>
      <?php if (!empty($r['note'])): ?><div class="mig-note"><?= htmlspecialchars($r['note']) ?></div><?php endif; ?>
    </div>
  </div>
  <?php endforeach; ?>

  <?php if (!empty($marcadas)): ?>
  <details>
    <summary><?= count($marcadas) ?> ya existían en BD — sincronizadas</summary>
    <?php foreach ($marcadas as $r): ?>
    <div class="mig-row">
      <span class="mig-icon">🔵</span>
      <div style="flex:1">
        <div class="mig-name"><?= htmlspecialchars($r['name']) ?></div>
        <div class="mig-note"><?= htmlspecialchars($r['note'] ?? '') ?></div>
      </div>
      <span class="mig-badge skip">SYNC</span>
    </div>
    <?php endforeach; ?>
  </details>
  <?php endif; ?>

  <?php foreach ($fallidas as $r): ?>
  <div class="mig-row">
    <span class="mig-icon">❌</span>
    <div style="flex:1">
      <div class="mig-name"><?= htmlspecialchars($r['name']) ?></div>
      <?php if (isset($r['error'])): ?>
      <div class="mig-err"><?= htmlspecialchars($r['error']) ?></div>
      <?php endif; ?>
    </div>
    <span class="mig-badge fail">ERROR</span>
  </div>
  <?php endforeach; ?>

  <hr>

  <div class="section-title">Limpieza de caché</div>
  <?php foreach ($resultados as $r): ?>
  <div class="row">
    <span class="icon"><?= $r['ok'] ? '✅' : '❌' ?></span>
    <div class="lbl">
      <div class="desc"><?= htmlspecialchars($r['label']) ?></div>
      <div class="cmd">php artisan <?= htmlspecialchars($r['cmd']) ?></div>
      <?php if (!$r['ok'] && isset($r['error'])): ?>
      <div class="err"><?= htmlspecialchars(substr($r['error'], 0, 120)) ?></div>
      <?php endif; ?>
    </div>
    <span class="badge <?= $r['ok'] ? 'ok' : 'fail' ?>"><?= $r['ok'] ? 'OK' : 'FALLO' ?></span>
  </div>
  <?php endforeach; ?>

  <hr>
  <div class="extra"><span>Sesiones antiguas eliminadas</span><span><?= $sessionBorrados ?> archivos</span></div>
  <div class="extra"><span>Tiempo de ejecución</span><span><?= $elapsed ?> ms</span></div>
  <div class="extra"><span>Laravel root</span><span><code><?= htmlspecialchars($laravelRoot) ?></code></span></div>
  <div class="extra"><span>Public web root</span><span><code><?= htmlspecialchars(function_exists('public_path') ? public_path() : '—') ?></code></span></div>

  <div class="cache-row <?= $cacheOk ? 'cache-ok' : 'cache-fail' ?>">
    <?= $cacheOk ? '✅' : '⚠️' ?>
    <div><strong>config:cache</strong> — <?= $cacheOk ? 'Configuración recompilada' : 'No se pudo recompilar' ?></div>
  </div>

  <div class="info">
    <strong>Uso:</strong> Suba el código nuevo (incluidas migraciones en <code>database/migrations/</code>) y abra este enlace.
    Las tablas nuevas y cambios de columnas se aplican solos. Protegido con <code>?key=…</code>.
    <br>Local: <code>http://localhost:8000/artisan-clear.php?key=lucdesoft2026</code>
    <br>Producción: <code>https://royalsensorymassage.com/artisan-clear.php?key=lucdesoft2026</code>
  </div>
</div>
</body>
</html>
