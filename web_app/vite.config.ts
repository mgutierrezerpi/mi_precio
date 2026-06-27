/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Custom service worker (src/sw.ts) so we can add Web Push handlers on top
      // of Workbox precaching. The plugin injects the precache manifest into it.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'miprecio-favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'MiPrecio - Tu catálogo online',
        short_name: 'MiPrecio',
        description: 'Gestioná tu catálogo, precios y pedidos desde un solo lugar.',
        lang: 'es',
        theme_color: '#7C3AED',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/admin',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Let the SW work when running `vite dev` so push can be tested locally.
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    // Reliable HMR file watching inside Docker on Windows/macOS.
    watch: { usePolling: true },
  },
  build: {
    assetsDir: 'app_assets',
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
