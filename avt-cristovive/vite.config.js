import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa' // Importamos el motor oficial de PWAs

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // INYECCIÓN MAESTRA: Configuración de la App Instalable para Celular
    VitePWA({
      registerType: 'autoUpdate', // Actualiza la aplicación de forma automática al detectar cambios
      injectRegister: 'inline',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Talita Kum - Asistente Clínico',
        short_name: 'TalitaKum',
        description: 'Asistente clínico de terreno asistido por Inteligencia Artificial diseñado por CyberForge.',
        theme_color: '#134e5e',      // Sincroniza la barra del celular con el color de tu fondo
        background_color: '#141e28', // Color de carga inicial al abrir la aplicación
        display: 'standalone',       // ELIMINA LA BARRA DE CHROME: Hace que se vea como app nativa
        orientation: 'portrait',     // Mantiene la visualización vertical fija en móviles
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable' // Permite que Android recorte el ícono según la marca del celular
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
})