import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键配置：设置为你的 GitHub 仓库名 (前后都要加斜杠)
  base: '/tree/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})