const { resolve } = require('path')
const { defineConfig, externalizeDepsPlugin } = require('electron-vite')
const react = require('@vitejs/plugin-react')

module.exports = defineConfig({
  main: {
    build: {
      lib: {
        entry: 'main.js'
      }
    },
    plugins: [externalizeDepsPlugin()],
    external: [
      'crypto',
      'node:crypto'
    ]
  },
  preload: {
    build: {
      lib: {
        entry: 'preload.js'
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    // --- THIS IS THE FIX ---
    // Tell the dev server that the root is the project folder
    root: '.', 
    // --- END FIX ---
    build: {
      rollupOptions: {
        // This is for the production build
        input: resolve(__dirname, 'index.html') 
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src')
      }
    },
    plugins: [react()],
    server: {
      fs: {
        // This setting allows Vite to serve files from parent directories,
        // which fixes the 404 errors for Tldraw's assets.
        strict: false 
      }
    }
  }
})