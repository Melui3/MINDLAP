/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // VITE_BASE_PATH is set by CI for GitHub Pages (/MINDLAP/), empty in dev
  base: process.env.VITE_BASE_PATH ?? '/',
})
