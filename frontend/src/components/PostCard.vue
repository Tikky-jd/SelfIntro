<script setup>
import { formatDate } from '../utils/format'

defineProps({
  post: { type: Object, required: true }
})
</script>

<template>
  <router-link :to="`/dynamics/${post.id}`" class="post-card">
    <img
      v-if="post.coverUrl"
      class="card-media"
      :src="post.coverUrl"
      :alt="post.title"
      loading="lazy"
    />
    <div v-else class="card-media" style="display:flex;align-items:center;justify-content:center;color:#8b93a3">无封面</div>
    <div class="card-body">
      <h3>{{ post.title }}</h3>
      <p v-if="post.summary">{{ post.summary }}</p>
      <div class="card-meta">{{ formatDate(post.createdAt) }}</div>
      <div class="tags" v-if="post.tags && post.tags.length">
        <span class="tag" v-for="t in post.tags" :key="t">{{ t }}</span>
      </div>
    </div>
  </router-link>
</template>
