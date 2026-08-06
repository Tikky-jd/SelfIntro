<script setup>
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import { useRoute } from 'vue-router'
import { onMounted, watch, nextTick } from 'vue'

// 浏览量统计（不蒜子 busuanzi，纯前端、无需后端）。
// 本站用 hash 路由（SPA），busuanzi 只在脚本加载时按当前 URL 计数一次；
// 因此在每次路由切换后重新注入脚本，使其按新路由 URL 重新计数。
const route = useRoute()
function loadBusuanzi() {
  const old = document.getElementById('busuanzi-script')
  if (old && old.parentNode) old.parentNode.removeChild(old)
  const s = document.createElement('script')
  s.id = 'busuanzi-script'
  s.async = true
  s.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js'
  document.body.appendChild(s)
}
onMounted(loadBusuanzi)
watch(() => route.fullPath, () => nextTick(loadBusuanzi))
</script>

<template>
  <div class="app">
    <NavBar />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <div class="page-wrap" :key="$route.path">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </main>
    <Footer />
  </div>
</template>

<style>
/* 页面切换载入动画：旧页淡出上移，新页淡入上滑 */
.page-wrap {
  will-change: opacity, transform;
}
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(18px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
