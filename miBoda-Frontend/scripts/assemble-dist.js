import { existsSync, mkdirSync, renameSync, cpSync, rmSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const distAdmin = path.join(dist, "admin");
const publicSite = path.join(root, "public-site");
const tmp = path.join(root, ".dist-admin-tmp");

/**
 * `vite build` ya compilo el panel (con base "/admin/") en dist/. Este paso
 * reorganiza la salida para que un solo despliegue estatico sirva ambas cosas:
 *   dist/            -> invitacion publica (copia directa de public-site/)
 *   dist/admin/      -> panel React ya compilado (lo que vite build genero)
 * Necesario porque Vite siempre escribe su index.html compilado en la raiz
 * de dist/, que chocaria con el index.html de la invitacion si convivieran
 * en la misma carpeta sin mover uno de los dos.
 */
if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
renameSync(dist, tmp);
mkdirSync(dist, { recursive: true });
renameSync(tmp, distAdmin);
cpSync(publicSite, dist, { recursive: true });

console.log("dist/ listo: invitacion en la raiz, panel admin en dist/admin/");
