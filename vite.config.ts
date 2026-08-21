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
      // El plugin generará el SW con hash único en cada build
      strategies: 'generateSW',
      workbox: {
        // Patrones de archivos a cachear
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // NO cachear estas peticiones externas
        navigateFallbackDenylist: [/^\/api\//],
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