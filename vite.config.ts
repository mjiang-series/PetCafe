import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  base: './', // Use relative paths for all assets
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    },
    // Optimize for mobile performance
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true
      }
    },
    // Asset handling
    assetsInlineLimit: 4096, // 4kb - inline smaller assets as base64
    assetsDir: 'assets'
  },
  server: {
    port: 3000,
    host: true, // Allow external connections for mobile testing
    open: true,
    cors: true
  },
  preview: {
    port: 3000,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@models': resolve(__dirname, 'src/models'),
      '@systems': resolve(__dirname, 'src/systems'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@data': resolve(__dirname, 'src/data'),
      '@assets': resolve(__dirname, 'assets')
    }
  },
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      }
    }
  },
  optimizeDeps: {
    include: ['howler']
  },
  // Asset handling
  assetsInclude: ['**/*.svg', '**/*.webp', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  // JSON imports
  json: {
    namedExports: true,
    stringify: false
  },
  // PWA configuration for mobile
  plugins: []
});
