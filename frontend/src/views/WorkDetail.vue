<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getWorkContent } from '../api/content'
import MarkdownView from '../components/MarkdownView.vue'
import BackToTop from '../components/BackToTop.vue'

const route = useRoute()
const work = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    work.value = await getWorkContent(route.params.id)
  } catch (e) {
    work.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container section" style="max-width:860px; position:relative; padding-bottom:64px">
    <router-link to="/works" class="btn btn-ghost btn-sm">← 返回作品</router-link>

    <div v-if="loading" class="spinner"></div>

    <div v-else-if="work">
      <h1 style="margin-top:16px">{{ work.title }}</h1>
      <p style="color:var(--text-soft)">{{ work.description }}</p>
      <img v-if="work.mediaType === 'IMAGE'" :src="work.url" style="width:100%;border-radius:14px;margin-top:16px" />
      <video v-else :src="work.url" :poster="work.coverUrl || undefined" controls style="width:100%;border-radius:14px;margin-top:16px"></video>
      <MarkdownView v-if="work.content" :source="work.content" class="work-content" style="margin-top:22px; display:block;" />
    </div>

    <div v-else class="empty">作品不存在或已被删除。</div>

    <BackToTop />
  </div>
</template>
