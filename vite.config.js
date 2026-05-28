import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'https://expense-manager-flax-phi.vercel.app', changeOrigin: true },
      '/auth': { target: 'https://expense-manager-flax-phi.vercel.app', changeOrigin: true },
      // '/api': { target: 'http://localhost:5000', changeOrigin: true },
      // '/auth': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
