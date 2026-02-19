import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargamos el archivo .env ubicado en la raíz (../)
  const env = loadEnv(mode, '../', '');

  // Convertimos la cadena de hosts permitidos en un array
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',').map(h => h.trim())
    : ['localhost'];

  return {
    plugins: [
      react(),
      basicSsl()
    ],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    },
    envDir: '../',
    server: {
      port: 3000,
      host: true,
      allowedHosts,
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
  }
})
