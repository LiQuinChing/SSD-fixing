import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Custom plugin to strip suspicious comments
const stripSuspiciousComments = () => {
  return {
    name: 'strip-suspicious-comments',
    generateBundle(options, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName]
        if (file.type === 'chunk' && file.code) {
          // Remove comments containing suspicious patterns
          file.code = file.code.replace(
            /\/\/.*?\b(WHERE|SELECT|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER)\b.*$/gmi,
            ''
          )
          // Remove multi-line comments with suspicious patterns
          file.code = file.code.replace(
            /\/\*[\s\S]*?\b(WHERE|SELECT|INSERT|DELETE|UPDATE|DROP|CREATE|ALTER)\b[\s\S]*?\*\//gmi,
            ''
          )
        }
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), stripSuspiciousComments()],
  build: {
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      }
    }
  },
  server: {
    cors: {
      origin: [
        'http://localhost:5173'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
})
