import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {    
    port: Number(process.env.PORT) ||3000,
    proxy: {
      '/api': { target: 'https://expense-manager-flax-phi.vercel.app', changeOrigin: true },
      '/auth': { target: 'https://expense-manager-flax-phi.vercel.app', changeOrigin: true },
    },
  },
});
