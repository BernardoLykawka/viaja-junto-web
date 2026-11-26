import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // O Firebase não é carregado nos testes: lib/auth é simulado onde preciso.
    env: { VITE_API_URL: 'http://api.test' },
  },
});
