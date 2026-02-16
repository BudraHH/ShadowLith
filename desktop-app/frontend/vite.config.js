import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Use relative paths for assets (essential for loading from file://)
  build: {
    outDir: '../backend/ui', // Output directly to backend's serve directory
    emptyOutDir: true,       // Clean old files
  },
  server: {
    port: 5174,
    strictPort: true,
  },
})
