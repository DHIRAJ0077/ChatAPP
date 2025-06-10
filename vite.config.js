import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate source maps for better debugging
    sourcemap: true,
  },
  // Ensure proper base path for production
  base: '/',
  // Optimize dependencies
  optimizeDeps: {
    include: ['socket.io-client']
  },
  // Configure server settings
  server: {
    port: 3000,
    strictPort: true,
    host: true
  }
})
