<script setup>
import { ref, onMounted, computed } from 'vue'
import { listWorks } from '../api/works'
import WorkCard from '../components/WorkCard.vue'

const works = ref([])
const filter = ref('ALL')
const loading = ref(true)

onMounted(async () => {
  try {
    works.value = await listWorks()
  } catch (e) {
    works.value = []
  } finally {
    loading.value = false
  }
})

const filtered = computed(() =>
  filter.value === 'ALL' ? works.value : works.value.filter((w) => w.mediaType === filter.value)
)
</script>

<template>
  <div class="container section">
    <h1 class="section-title">作品集</h1>
    <p class="section-sub">图片与视频作品展示</p>

    <div class="row" style="margin-bottom:24px;gap:8px">
      <button class="btn btn-sm" :class="filter === 'ALL' ? 'btn-primary' : 'btn-ghost'" @click="filter = 'ALL'">全部</button>
      <button class="btn btn-sm" :class="filter === 'IMAGE' ? 'btn-primary' : 'btn-ghost'" @click="filter = 'IMAGE'">图片</button>
      <button class="btn btn-sm" :class="filter === 'VIDEO' ? 'btn-primary' : 'btn-ghost'" @click="filter = 'VIDEO'">视频</button>
    </div>

    <div v-if="loading" class="spinner"></div>
    <div v-else-if="!filtered.length" class="empty">还没有作品，去后台上传吧。</div>
    <div v-else class="grid grid-3">
      <WorkCard v-for="w in filtered" :key="w.id" :work="w" />
    </div>
  </div>
</template>
