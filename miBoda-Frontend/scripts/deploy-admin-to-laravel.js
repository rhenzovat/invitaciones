/**
 * Copia dist/ → carpeta admin del servidor (SOLO despliegue manual en cPanel/producción).
 *
 * NO tiene destino por defecto: evita escribir en Backend/public/admin en desarrollo local.
 *
 * Uso en cPanel (ejemplo):
 *   LARAVEL_ADMIN_TARGET=/home/royalsen/public_html/admin pnpm run build:production
 *
 * Requiere:
 *   DEPLOY_LARAVEL_ADMIN=1  (lo define build:production)
 *   LARAVEL_ADMIN_TARGET    (ruta absoluta del destino en el servidor)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "../dist");

if (process.env.DEPLOY_LARAVEL_ADMIN !== "1") {
  console.error(
    "Despliegue cancelado: este script no corre en desarrollo local.\n" +
      "  • Desarrollo:  pnpm run dev        → Vite en :5173\n" +
      "  • Build local: pnpm run build      → solo systemWeb-Frontend/dist/\n" +
      "  • cPanel:      LARAVEL_ADMIN_TARGET=/ruta/public_html/admin pnpm run build:production"
  );
  process.exit(1);
}

const targetRaw = process.env.LARAVEL_ADMIN_TARGET?.trim();
if (!targetRaw) {
  console.error(
    "Falta LARAVEL_ADMIN_TARGET (ruta absoluta en el servidor).\n" +
      "  Ejemplo cPanel: LARAVEL_ADMIN_TARGET=/home/royalsen/public_html/admin pnpm run build:production\n" +
      "  En local NO se copia a systemWeb-Backend/public/admin."
  );
  process.exit(1);
}

const targetDir = path.resolve(targetRaw);
const localBackendAdmin = path.resolve(__dirname, "../systemWeb-Backend/public/admin");
const isLocalBackendPath =
  path.normalize(targetDir).toLowerCase() === path.normalize(localBackendAdmin).toLowerCase() ||
  /[\\/]xampp[\\/]/i.test(targetDir) ||
  /[\\/]htdocs_pro[\\/]/i.test(targetDir);

if (isLocalBackendPath && process.env.ALLOW_LOCAL_ADMIN_DEPLOY !== "1") {
  console.error(
    "Despliegue bloqueado: el destino parece ser desarrollo local.\n" +
      `  Destino: ${targetDir}\n` +
      "  En local use pnpm run dev (Vite :5173). No cree public/admin en el backend.\n" +
      "  Si realmente necesita copiar aquí: ALLOW_LOCAL_ADMIN_DEPLOY=1 (no recomendado)."
  );
  process.exit(1);
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

if (!fs.existsSync(distDir)) {
  console.error("No existe dist/. Ejecuta primero: pnpm run build");
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
copyRecursive(distDir, targetDir);
console.log(`Admin desplegado en: ${targetDir}`);
