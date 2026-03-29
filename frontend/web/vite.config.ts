import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  // vite config debug logs to verify env variable loading
  /*
  console.log('--- VITE CONFIG DEBUG ---');
  console.log('VITE_API_URL from .env:', env.VITE_API_URL);
  console.log('Final Proxy Target:', env.VITE_API_URL || 'http://localhost:8000');
  console.log('-------------------------');
  */

  return {
    plugins: [react()],
    resolve: {
      alias: {

        'frontend-shared': resolve(__dirname, '../shared'),
      },
    },
    server: {
      proxy: {

        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
