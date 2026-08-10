<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 滚动超过该像素值后显示「返回顶部」按钮（出现后常驻右下角）
const THRESHOLD = 200
const visible = ref(false)

function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
}

function onScroll() {
  visible.value = getScrollY() > THRESHOLD
}

function scrollToTop() {
  // 点击时立即触发淡出，不等待滚动事件
  visible.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <transition name="btt-fade">
    <button
      v-if="visible"
      class="back-to-top"
      type="button"
      aria-label="返回顶部"
      title="返回顶部"
      @click="scrollToTop"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M12 5l-7 7h4v7h6v-7h4z"
          fill="currentColor"
        />
      </svg>
    </button>
  </transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 22px;
  bottom: 26px;
  z-index: 60;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #fff;
  background: var(--accent, #4f7cff);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
  transition: transform 0.15s ease, background 0.15s ease;
}

.back-to-top:hover {
  transform: translateY(-2px);
  background: var(--accent-strong, #3a63d8);
}

.back-to-top:active {
  transform: translateY(0);
}

.btt-fade-enter-active,
.btt-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.btt-fade-enter-from,
.btt-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
