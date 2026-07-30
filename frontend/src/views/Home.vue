<script setup>
import { ref, onMounted } from 'vue'
import { getProfile } from '../api/profile'
import { listPosts } from '../api/posts'
import { listWorks } from '../api/works'
import PostCard from '../components/PostCard.vue'
import WorkCard from '../components/WorkCard.vue'

const profile = ref(null)
const posts = ref([])
const works = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const [p, postsResp, w] = await Promise.all([
      getProfile(),
      listPosts(0, 3),
      listWorks()
    ])
    profile.value = p
    posts.value = postsResp.content || []
    works.value = (w || []).slice(0, 3)
  } catch (e) {
    profile.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container">
    <section class="hero" v-if="profile">
      <div>
        <div class="headline">{{ profile.headline }}</div>
        <h1>{{ profile.name || '你好' }}</h1>
        <p>{{ profile.about }}</p>
        <div class="socials">
          <a v-for="s in (profile.socials || [])" :key="s.label" class="btn btn-ghost btn-sm"
             :href="s.url" target="_blank" rel="noopener">{{ s.label }}</a>
        </div>
        <div style="margin-top:22px;display:flex;gap:12px;flex-wrap:wrap">
          <router-link to="/works" class="btn btn-primary">查看作品</router-link>
          <router-link to="/resume" class="btn btn-ghost">我的简历</router-link>
        </div>
      </div>
      <div>
        <img v-if="profile.avatarUrl" class="hero-avatar" :src="profile.avatarUrl" :alt="profile.name" />
        <div v-else class="hero-avatar" style="display:flex;align-items:center;justify-content:center;color:#8b93a3">头像</div>
      </div>
    </section>

    <div v-if="loading" class="spinner"></div>

    <section class="section" v-if="posts.length">
      <h2 class="section-title">最新动态</h2>
      <p class="section-sub">我最近写的笔记与想法</p>
      <div class="grid grid-3">
        <PostCard v-for="p in posts" :key="p.id" :post="p" />
      </div>
      <div style="margin-top:24px">
        <router-link to="/dynamics" class="btn btn-ghost">查看全部 →</router-link>
      </div>
    </section>

    <section class="section" v-if="works.length">
      <h2 class="section-title">精选作品</h2>
      <p class="section-sub">图片与视频作品</p>
      <div class="grid grid-3">
        <WorkCard v-for="w in works" :key="w.id" :work="w" />
      </div>
      <div style="margin-top:24px">
        <router-link to="/works" class="btn btn-ghost">查看全部 →</router-link>
      </div>
    </section>
  </div>
</template>
