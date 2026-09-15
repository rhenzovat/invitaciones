import path from "path";
import { spawn } from "child_process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const normalizeBasePath = (value) => {
  const raw = (value ?? "").trim();
  if (!raw) return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
};

const PUBLIC_SITE_PORT = 5174;

// Levanta el servidor estatico propio de la invitacion (scripts/serve-public-site.js,
// independiente del backend Nest) junto con `vite dev`, para que "pnpm run dev"
// siga siendo un solo comando. Vite no puede servir la invitacion directo en su
// propio dev server porque `base: "/admin/"` reescribe/redirige cualquier ruta
// que no empiece con esa base (probado: rompia /admin en vez de separarlos) -
// por eso se corre aparte y se llega a el via `server.proxy` mas abajo.
function invitacionPublicaPlugin() {
  return {
    name: "invitacion-publica-dev-server",
    configureServer(server) {
      const child = spawn(process.execPath, [path.resolve(__dirname, "scripts/serve-public-site.js")], {
        stdio: "inherit",
        env: { ...process.env, PUBLIC_SITE_PORT: String(PUBLIC_SITE_PORT) },
      });
      server.httpServer?.on("close", () => child.kill());
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    server: {
      port: 5173,

      hmr: {
        overlay: false
      },
      cors: {
        // origin: 'http://localhost:8000',//desarrollo
        origin: 'https://amourspamiraflores.com',//produccion
        credentials: false
      },
      // Proxy SOLO para desarrollo local: vite dev sirve en :5173 y reenvia
      // /api hacia el backend que apunte VITE_AUTHJWT_DOMAIN (antes era un
      // puerto fijo a Laravel; ahora sigue el mismo .env que usa el resto
      // del panel, asi no hay que editar este archivo cada vez que cambias
      // de backend). El navegador ve un unico origen (localhost:5173),
      // evitando CORS y los cortes de POST/archivos que daba pasar por el
      // vhost de Apache. `server.proxy` no se usa en `vite build`, asi que
      // no afecta produccion.
      proxy: mode === 'development' ? {
        '/api': {
          // 127.0.0.1 (no 'localhost') evita que Node intente IPv6 (::1)
          // y falle con ECONNREFUSED cuando el backend solo escucha en IPv4.
          target: (env.VITE_AUTHJWT_DOMAIN || 'http://127.0.0.1:8000').replace('localhost', '127.0.0.1'),
          changeOrigin: true,
        },
        // Cualquier ruta que no sea del panel (/admin) ni de la API (/api) es
        // la invitacion publica -> se reenvia al servidor estatico propio
        // (scripts/serve-public-site.js, ver invitacionPublicaPlugin arriba),
        // asi ambas conviven en localhost:5173 sin que el "base: /admin/" de
        // Vite las pise entre si.
        '^/(?!admin|api).*': {
          target: `http://127.0.0.1:${PUBLIC_SITE_PORT}`,
          changeOrigin: true,
        },
      } : undefined,
    },
    plugins: [
      react(),
      invitacionPublicaPlugin(),
      VitePWA({
        injectRegister: "auto",
        registerType: "autoUpdate",
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 7000000,
          importScripts: ['push-handler.js'],
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 2000
    },
    resolve: {
      alias: {
        app: path.resolve(__dirname, "src/app")
      }
    },
    optimizeDeps: {
      include: ["@excalidraw/excalidraw"],
    },
    rollupOptions: {
      output: {
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`
      }
    },
    manifest: true,
  };
});
