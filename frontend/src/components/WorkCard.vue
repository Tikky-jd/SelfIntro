<script setup>
defineProps({
  work: { type: Object, required: true }
})
</script>

<template>
  <router-link :to="`/works/${work.id}`" class="work-card">
    <img
      v-if="work.coverUrl"
      class="card-media"
      :src="work.coverUrl"
      :alt="work.title"
      loading="lazy"
    />
    <video
      v-else-if="work.mediaType === 'VIDEO'"
      class="card-media"
      :src="work.url"
      muted
      playsinline
      preload="metadata"
    ></video>
    <div v-else class="card-media" style="display:flex;align-items:center;justify-content:center;color:#8b93a3">无封面</div>
    <div class="card-body">
      <h3>{{ work.title }}</h3>
      <p v-if="work.description">{{ work.description }}</p>
      <span class="badge" :class="{ video: work.mediaType === 'VIDEO' }">
        {{ work.mediaType === 'VIDEO' ? '视频' : '图片' }}
      </span>
    </div>
  </router-link>
</template>
