import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

const tlsKey  = './localhost+1-key.pem';
const tlsCert = './localhost+1.pem';
const hasTLS  = fs.existsSync(tlsKey) && fs.existsSync(tlsCert);

export default defineConfig({
  plugins: [react()],
  server: {
    ...(hasTLS ? {
      https: {
        key:  fs.readFileSync(tlsKey),
        cert: fs.readFileSync(tlsCert),
      }
    } : {}),
    proxy: {
      '/api': {
        target: 'http://localhost:8765',
        changeOrigin: true,
      },
    },
  },
})
