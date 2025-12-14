import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/formOfline/',
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
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://dev.sekolahsampah.id',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Aggressively mock a server-to-server or CLI request
            console.log('Proxying API request:', req.url); // Verify in terminal that this runs

            proxyReq.setHeader('Origin', 'https://dev.sekolahsampah.id');
            proxyReq.setHeader('Referer', 'https://dev.sekolahsampah.id/');

            // Mask the User-Agent
            proxyReq.setHeader('User-Agent', 'curl/7.68.0');

            // Strip cookies and proxy fingerprints
            proxyReq.removeHeader('Cookie');
            proxyReq.removeHeader('X-Forwarded-For');
            proxyReq.removeHeader('X-Forwarded-Proto');
            proxyReq.removeHeader('X-Forwarded-Host');
            proxyReq.removeHeader('Via');
          });
        }
      }
    }
  }
})