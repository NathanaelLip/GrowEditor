import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // This proxies API requests to the backend server during development.
    // This avoids CORS issues when the frontend (e.g., on localhost:5173)
    // needs to talk to the backend (on localhost:3000).
    proxy: {
      '/api': 'http://localhost:3000',
    }
  }
})
