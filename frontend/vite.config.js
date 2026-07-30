import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages base path.
//  - Project site (username.github.io/<repo>):  set to '/<repo>/'
//  - User/Org site (username.github.io):        set to '/'
// Change the value below to match your repository name.
export default defineConfig({
  base: '/SELFIntro/',
  plugins: [vue()],
  server: {
    port: 5173
  }
})
