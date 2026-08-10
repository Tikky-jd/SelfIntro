<script setup>
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  source: { type: String, default: '' }
})

// GitHub 风格的标题 slug：删除中英文标点，空白转连字符。
// 与文档内「目录」锚点（#1-蓝图概述 等）保持一致，才能正确跳转。
function slugify(raw) {
  return String(raw)
    .replace(/<[^>]*>/g, '')
    .replace(/[.,;:!?'"‘’“”（）()\[\]【】{}<>《》·、，。；：？！…—–]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

marked.setOptions({ breaks: true, gfm: true })
// 给标题加上 id，供页内锚点跳转
marked.use({
  renderer: {
    heading(text, level, raw) {
      const id = slugify(raw)
      const open = id ? `<h${level} id="${id}">` : `<h${level}>`
      return `${open}${text}</h${level}>`
    }
  }
})

const html = computed(() => marked.parse(props.source || ''))

// 拦截页内锚点点击：本项目用 hash 路由（createWebHashHistory），
// 直接点 <a href="#xxx"> 会被当成路由变化 -> 404。
// 这里改为页内平滑滚动，且不修改地址栏 hash（避免刷新后再次 404）。
function onAnchorClick(e) {
  const a = e.target.closest && e.target.closest('a')
  if (!a) return
  const href = a.getAttribute('href') || ''
  if (!href.startsWith('#')) return
  const id = decodeURIComponent(href.slice(1))
  const el = document.getElementById(id)
  if (el) {
    e.preventDefault()
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <div class="markdown" v-html="html" @click="onAnchorClick"></div>
</template>
