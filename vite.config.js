import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/kelas-ngaji-albiruni/', // Replace with your GitHub repo name
  build: {
    outDir: 'dist'
  }
})
