import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' ? './' : '/', // Use relative paths for build, root for dev
  build: {
    outDir: '../backend/ui',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    strictPort: true,
    host: true,
  },
}))
