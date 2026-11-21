import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Recompresses every bundled image at build time (sources in src/assets
    // stay untouched). Cloudinary images are optimised at delivery instead —
    // see src/lib/image.ts.
    ViteImageOptimizer({
      test: /\.(jpe?g|png|webp)$/i,
      jpeg: { quality: 78, mozjpeg: true },
      jpg: { quality: 78, mozjpeg: true },
      png: { quality: 80, palette: true, compressionLevel: 9 },
      webp: { quality: 78 },
      logStats: false,
    }),
  ],
})
