import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))
export default defineConfig({
  resolve: {
    alias: {
      '@': srcPath,
    },
  },
  plugins: [
    react(),
  ]
})
