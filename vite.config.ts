import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        terminos: resolve(__dirname, 'terminos.html'),
        privacidad: resolve(__dirname, 'privacidad.html')
      }
    }
  }
})