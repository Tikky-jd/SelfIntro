<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPostContent } from '../api/content'
import MarkdownView from '../components/MarkdownView.vue'
import BackToTop from '../components/BackToTop.vue'
import { formatDate } from '../utils/format'

const route = useRoute()
const post = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    post.value = await getPostContent(route.params.id)
  } catch (e) {
    post.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container section" style="max-width:760px">
    <router-link to="/dynamics" class="btn btn-ghost btn-sm">← 返回动态</router-link>

    <div v-if="loading" class="spinner"></div>

    <article v-else-if="post">
      <img v-if="post.coverUrl" :src="post.coverUrl" style="width:100%;border-radius:14px;margin:18px 0" />
      <h1>{{ post.title }}</h1>
      <div class="card-meta" style="margin-bottom:18px">{{ formatDate(post.createdAt) }}</div>
      <MarkdownView :source="post.content || ''" />

      <div v-if="post.images && post.images.length" class="grid grid-2" style="margin-top:24px">
        <img v-for="(img, i) in post.images" :key="i" :src="img" style="border-radius:10px" />
      </div>

      <div class="tags" v-if="post.tags && post.tags.length" style="margin-top:24px">
        <span class="tag" v-for="t in post.tags" :key="t">{{ t }}</span>
      </div>
    </article>

    <div v-else class="empty">笔记不存在或已被删除。</div>

    <BackToTop />
  </div>
</template>
