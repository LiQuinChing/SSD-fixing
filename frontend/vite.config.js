import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    cors: {
      origin: [
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'http://localhost:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
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
    }
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
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      format: {
        comments: false
      },
      mangle: {
        toplevel: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios', 'jspdf']
        }
      }
    },
    sourcemap: false
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  },
  optimizeDeps: {
    exclude: ['node_modules']
  }
})
