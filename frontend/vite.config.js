import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',            // avoid exposure on 192.168.* (LAN)
    port: 5173,
    strictPort: true,
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Allow only the Vite React preamble inline script via hash (no unsafe-inline)
      'Content-Security-Policy':
        "default-src 'self'; " +
        "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; " +
        "script-src 'self' https://accounts.google.com https://apis.google.com 'sha256-8ZgGo/nOlaDknQkDUYiedLuFRSGJwIz6LAzsOrNxhmU='; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob: https:; " +
        "connect-src 'self' https: http: ws: wss: https://accounts.google.com https://apis.google.com; " +
        "font-src 'self' data:; " +
        "frame-src https://accounts.google.com",
    },
  },
  preview: {
    headers: {
      // mirror headers in preview for consistency
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy':
        "default-src 'self'; " +
        "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; " +
        "script-src 'self' https://accounts.google.com https://apis.google.com 'sha256-8ZgGo/nOlaDknQkDUYiedLuFRSGJwIz6LAzsOrNxhmU='; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob: https:; " +
        "connect-src 'self' https: http: ws: wss: https://accounts.google.com https://apis.google.com; " +
        "font-src 'self' data:; " +
        "frame-src https://accounts.google.com",
    },
  },
})
