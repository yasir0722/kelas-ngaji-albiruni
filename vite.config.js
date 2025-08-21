import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/kelas-ngaji-albiruni/', // Keep this for GitHub Pages subdirectory
  build: {
    outDir: 'docs', // GitHub Pages can serve from /docs folder on main branch
    assetsDir: 'assets',
    sourcemap: false,
    emptyOutDir: true
  }
})
