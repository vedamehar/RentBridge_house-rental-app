import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({
    // Remove the babel plugin configuration - let Vite handle it automatically
    jsxRuntime: 'automatic'
  })],
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  server: {
    hmr: {
      // Explicitly set the HMR WebSocket port
      clientPort: 5173
    },
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});