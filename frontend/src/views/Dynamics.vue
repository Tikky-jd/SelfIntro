<script setup>
import { ref, onMounted } from 'vue'
import { getPostsContent } from '../api/content'
import PostCard from '../components/PostCard.vue'

const all = ref([])
const posts = ref([])
const pageSize = 12
const page = ref(0)
const loading = ref(false)
const done = ref(false)

async function load() {
  if (loading.value || done.value) return
  loading.value = true
  try {
    if (page.value === 0) {
      all.value = await getPostsContent()
    }
    const start = page.value * pageSize
    const slice = all.value.slice(start, start + pageSize)
    posts.value.push(...slice)
    page.value += 1
    if (start + pageSize >= all.value.length) done.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="container section">
    <h1 class="section-title">个人动态</h1>
    <p class="section-sub">笔记、想法与日常记录</p>

    <div v-if="!posts.length && !loading" class="empty">还没有内容，去发布第一篇吧。</div>

    <div class="grid grid-3">
      <PostCard v-for="p in posts" :key="p.id" :post="p" />
    </div>

    <div class="center" style="margin-top:30px">
      <button v-if="!done" class="btn btn-ghost" @click="load" :disabled="loading">
        {{ loading ? '加载中…' : '加载更多' }}
      </button>
    </div>
  </div>
</template>
