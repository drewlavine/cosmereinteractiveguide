/// <reference types="vitest/config" />
import { copyFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * GitHub Pages knows nothing of the app's routes, so a link straight to
 * /characters/kaladin gets its 404 page; make that page the app too.
 */
const spaFallback = (): Plugin => ({
  name: 'spa-404-fallback',
  apply: 'build',
  writeBundle({ dir }) {
    copyFileSync(`${dir}/index.html`, `${dir}/404.html`)
  },
})

export default defineConfig({
  // GitHub Pages serves the site under /<repo>/; the deploy workflow sets it.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), spaFallback()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Whole character pages render slowly on CI runners.
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
})
