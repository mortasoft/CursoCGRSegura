import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../',
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'gondor-linux.tail0310b2.ts.net'
    ],
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://backend:5000',
        changeOrigin: true
      }
    }
  }
})
