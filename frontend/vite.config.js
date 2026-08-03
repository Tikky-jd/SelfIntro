import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 纯静态站配置：只构建展示站 index.html，无任何后端 / 后台入口。
// 开发态（npm run dev）base 用 '/'，本地预览直接 http://localhost:5173/，public 资源在根；
// 生产态（GitHub Pages 子路径 /SelfIntro/）base 用 '/SelfIntro/'。
const isProd = process.env.NODE_ENV === 'production'
export default defineConfig({
  base: isProd ? '/SelfIntro/' : '/',
  plugins: [vue()],
  server: {
    port: 5173
  }
})
