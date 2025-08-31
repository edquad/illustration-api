import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test-setup.js',
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        '**/coverage/**',
        'dist/**',
        'build/**',
        'public/**',
        'vite.config.js',
        'eslint.config.js',
        'src/main.jsx' // Entry point, usually not tested
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
