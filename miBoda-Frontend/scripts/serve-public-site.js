import { createServer } from "http";
import { createReadStream, existsSync, statSync } from "fs";
import { extname, join, normalize } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = normalize(join(__dirname, "..", "public-site"));
const PORT = Number(process.env.PUBLIC_SITE_PORT || 5174);

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".webmanifest": "application/manifest+json",
};

/**
 * Servidor estatico minimo para la invitacion publica (miBoda-Frontend/public-site),
 * independiente del backend Nest. Lo levanta invitacionPublicaPlugin (vite.config.js)
 * junto con `pnpm run dev`; Vite le hace proxy desde localhost:5173/.
 */
createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const relPath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const filePath = normalize(join(ROOT, relPath));

  if (!filePath.startsWith(ROOT) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "Content-Type": MIME[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`[public-site] sirviendo ${ROOT} en http://localhost:${PORT}`);
});
