import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // NO generar manifest propio: usamos el que ya tienes en public/
      manifest: false,
      strategies: 'generateSW',
      workbox: {
        // El nuevo SW toma el control inmediatamente sin esperar a cerrar la app
        skipWaiting: true,
        // El nuevo SW reclama todas las pestañas/ventanas abiertas
        clientsClaim: true,
        // Patrones de archivos a cachear
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // No usar fallback de navegación para rutas de API
        navigateFallbackDenylist: [/^\/api\//],
        // Peticiones externas que NO se cachean
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('duckduckgo.com') ||
              url.hostname.includes('google.com/s2') ||
              url.hostname.includes('api.pwnedpasswords.com'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: ['chrome120', 'firefox120', 'safari17'],
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});