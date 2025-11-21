import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}']
      },
      manifest: {
        name: 'Waste Data Entry',
        short_name: 'WasteApp',
        description: 'PWA for waste data entry in harsh environments',
        theme_color: '#10b981',
        background_color: '#f8fafc',
        display: 'standalone',
        icon: 'src/assets/icon.png',
        start_url: '/',
        scope: '/',
        categories: ['productivity', 'utilities'],
        lang: 'id',
        dir: 'ltr'
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'qr-vendor': ['html5-qrcode']
        }
      }
    }
  },
  preview: {
    allowedHosts: [
      'ayesha-adynamic-eclectically.ngrok-free.dev'
    ]
  },
  server: {
    host: true,
    port: 5173
  }
})