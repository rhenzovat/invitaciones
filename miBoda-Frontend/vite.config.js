import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const normalizeBasePath = (value) => {
  const raw = (value ?? "").trim();
  if (!raw) return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
};

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
      // /api hacia el backend Laravel (php artisan serve) en :8000.
      // El navegador ve un unico origen (localhost:5173), evitando CORS y
      // los cortes de POST/archivos que daba pasar por el vhost de Apache.
      // `server.proxy` no se usa en `vite build`, asi que no afecta produccion.
      proxy: mode === 'development' ? {
        '/api': {
          // 127.0.0.1 (no 'localhost') evita que Node intente IPv6 (::1)
          // y falle con ECONNREFUSED cuando `php artisan serve` solo
          // escucha en IPv4.
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      } : undefined,
    },
    plugins: [
      react(),
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
