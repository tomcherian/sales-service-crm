import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Mirrors the "@/*" path in tsconfig.app.json; "/src" is resolved from the project root.
  resolve: { alias: { '@': '/src' } },
  server: { port: 5173 }
});
