import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 纯静态站配置：只构建展示站 index.html，无任何后端 / 后台入口。
// GitHub Pages base path 为 /SelfIntro/（与仓库名一致）。
export default defineConfig({
  base: '/SelfIntro/',
  plugins: [vue()],
  server: {
    port: 5173
  }
})
