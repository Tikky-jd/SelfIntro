<script setup>
import { ref, onMounted } from 'vue'
import { getProfileContent } from '../api/content'

const profile = ref(null)
const loading = ref(true)
const labels = { EDUCATION: '教育经历', EXPERIENCE: '工作经历', PROJECT: '项目经历', SKILL: '技能', CERT: '证书' }
const order = ['EDUCATION', 'EXPERIENCE', 'PROJECT', 'SKILL', 'CERT']

onMounted(async () => {
  try {
    profile.value = await getProfileContent()
  } catch (e) {
    profile.value = null
  } finally {
    loading.value = false
  }
})

function groups() {
  if (!profile.value || !profile.value.resumeItems) return []
  const map = {}
  for (const it of profile.value.resumeItems) {
    ;(map[it.category] ||= []).push(it)
  }
  return order
    .filter((c) => map[c])
    .map((c) => ({ category: c, items: map[c] }))
}

function skillChips(desc) {
  if (!desc) return []
  return desc.split(/[,，、]/).map((s) => s.trim()).filter(Boolean)
}
</script>

<template>
  <div class="container section">
    <h1 class="section-title">简历</h1>
    <p class="section-sub">{{ profile?.headline }}</p>

    <div v-if="loading" class="spinner"></div>

    <div v-else>
      <section v-if="profile?.about" style="margin-bottom:36px">
        <h2 class="section-title" style="font-size:1.25rem">关于我</h2>
        <p style="color:var(--text-soft);max-width:760px">{{ profile.about }}</p>
      </section>

      <div v-for="g in groups()" :key="g.category" class="resume-group">
        <h3>{{ labels[g.category] }}</h3>
        <div v-for="it in g.items" :key="it.id" class="resume-item">
          <div class="years">
            {{ it.startYear }}<span v-if="it.endYear"> – {{ it.endYear }}</span>
          </div>
          <div>
            <div class="title">{{ it.title }}</div>
            <div class="org">{{ it.org }}</div>
            <div v-if="g.category === 'SKILL'" class="chips" style="margin-top:8px">
              <span class="chip" v-for="(c, i) in skillChips(it.description)" :key="i">{{ c }}</span>
            </div>
            <div v-else class="desc" style="margin-top:6px">{{ it.description }}</div>
          </div>
        </div>
      </div>

      <div class="socials" v-if="profile?.socials?.length">
        <a v-for="s in profile.socials" :key="s.label" class="btn btn-ghost btn-sm"
           :href="s.url" target="_blank" rel="noopener">{{ s.label }}</a>
      </div>
    </div>
  </div>
</template>
