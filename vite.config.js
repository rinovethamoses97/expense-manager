import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': { target: 'https://expense-manager-flax-phi.vercel.app:5000', changeOrigin: true },
      '/auth': { target: 'https://expense-manager-flax-phi.vercel.app:5000', changeOrigin: true },
    },
  },
});
