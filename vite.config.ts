import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production API URL - единая точка хранения
const PROD_API_URL = 'https://coffee-point-api-317780828805.europe-west3.run.app'
const DEV_API_URL = 'http://0.0.0.0:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: DEV_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: PROD_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделяем большие UI библиотеки
          'mui': ['@mui/material', '@mui/icons-material'],
          // Разделяем библиотеки для графиков
          'charts': ['recharts'],
          // Разделяем локализацию
          'i18n': ['react-i18next', 'i18next'],
          // Разделяем React экосистему
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Увеличиваем лимит чтобы убрать предупреждение для основного chunk
    chunkSizeWarningLimit: 600,
  },
})
