import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'logo.svg', '**/*.svg'],
      manifest: {
        name: 'AgroConnect GH',
        short_name: 'AgroGH',
        description: "Ghana's digital agricultural marketplace",
        theme_color: '#0B5D3B',
        background_color: '#F8F7F2',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: 'icon.svg', sizes: '72x72', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '96x96', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '128x128', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '144x144', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '152x152', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'icon.svg', sizes: '384x384', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
