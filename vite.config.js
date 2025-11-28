import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This makes the server listen on all network interfaces
    // You can also specify a port if needed, e.g., port: 3000
  }
})
