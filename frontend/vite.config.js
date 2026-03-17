/**
 * @file Configuracion de Vite para el frontend.
 *
 * - Plugin: `@vitejs/plugin-react` para JSX y Fast Refresh.
 * - Puerto de desarrollo: 5173.
 * - Proxy: `/api` redirige al backend Express.
 *   La URL del backend se configura con `VITE_API_TARGET`
 *   (defecto: `http://localhost:3000`).
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': API_TARGET,
    },
  },
});