import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  base: "/",
  optimizeDeps: {
    include: ['socket.io-client']
  },
  // Configure server settings
  server: {
    port: 3001, // Use port 3001 instead of 3000
    strictPort: false, // Allow Vite to use another port if 3001 is in use
    host: true,
    open: true // Automatically open browser when starting dev server
  }
})
