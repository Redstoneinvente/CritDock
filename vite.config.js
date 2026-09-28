import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      input: resolve(process.cwd(), 'app.html')
    }
  }
})
