<script setup>
import { ref, onMounted, computed } from 'vue'
import { getWorksContent } from '../api/content'
import WorkCard from '../components/WorkCard.vue'

const works = ref([])
const typeFilter = ref('ALL') // ALL | IMAGE | VIDEO
const skillFilter = ref([]) // 选中的技能 tag（多选）
const loading = ref(true)

onMounted(async () => {
  try {
    works.value = await getWorksContent()
  } catch (e) {
    works.value = []
  } finally {
    loading.value = false
  }
})

const TYPE_FILTERS = [
  { key: 'ALL', label: '全部' },
  { key: 'IMAGE', label: '图片' },
  { key: 'VIDEO', label: '视频' }
]
// 技能标签池（与 content.mjs work:add --tags 一致）
const SKILL_TAGS = ['三维动画', '动态设计', '摄影', '摄像', '剪辑', '三维模型', '调色', '修图']

function toggleSkill(t) {
  const i = skillFilter.value.indexOf(t)
  if (i >= 0) skillFilter.value.splice(i, 1)
  else skillFilter.value.push(t)
}
function resetFilters() {
  typeFilter.value = 'ALL'
  skillFilter.value = []
}

const filtered = computed(() =>
  works.value.filter((w) => {
    const okType = typeFilter.value === 'ALL' || w.mediaType === typeFilter.value
    const okSkill =
      skillFilter.value.length === 0 ||
      skillFilter.value.some((s) => (w.tags || []).includes(s))
    return okType && okSkill
  })
)
</script>

<template>
  <div class="container section works-page">
    <h1 class="section-title">作品集</h1>
    <p class="section-sub">图片与视频作品展示</p>
    <div class="works-head-stat">
      <span id="busuanzi_container_page_pv" class="view-stat">👁 本页浏览 <span id="busuanzi_value_page_pv">—</span> 次</span>
    </div>

    <!-- 按类型筛选（保留原位置） -->
    <div class="row" style="margin-bottom:20px;gap:8px">
      <button
        v-for="t in TYPE_FILTERS"
        :key="t.key"
        class="btn btn-sm"
        :class="typeFilter === t.key ? 'btn-primary' : 'btn-ghost'"
        @click="typeFilter = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-if="loading" class="spinner"></div>
    <div v-else-if="!filtered.length" class="empty">没有符合条件的作品。</div>
    <div v-else class="grid grid-3">
      <WorkCard v-for="w in filtered" :key="w.id" :work="w" />
    </div>
  </div>

  <!-- 技能筛选（固定在视口右侧，页面之外） -->
  <aside class="works-side">
    <h4>按技能筛选</h4>
    <p class="side-tip">可多选，命中任一技能即显示</p>
    <div class="side-btns">
      <button
        class="btn btn-sm"
        :class="skillFilter.length === 0 ? 'btn-primary' : 'btn-ghost'"
        @click="skillFilter = []"
      >
        全部技能
      </button>
      <button
        v-for="s in SKILL_TAGS"
        :key="s"
        class="btn btn-sm"
        :class="skillFilter.includes(s) ? 'btn-primary' : 'btn-ghost'"
        @click="toggleSkill(s)"
      >
        {{ s }}
      </button>
      <button
        v-if="typeFilter !== 'ALL' || skillFilter.length"
        class="btn btn-sm btn-ghost side-clear"
        @click="resetFilters"
      >
        清除筛选
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* 作品内容区右侧留出空间，避免被固定的技能侧栏遮挡 */
.works-page {
  padding-right: 232px;
}
.works-head-stat { margin-bottom: 16px; }
.works-side {
  position: fixed;
  top: 92px;
  right: 18px;
  width: 188px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px 16px;
  z-index: 30;
}
.works-side h4 {
  margin: 0 0 6px;
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--text);
}
.side-tip {
  font-size: 0.76rem;
  color: var(--muted);
  margin: 0 0 14px;
  line-height: 1.5;
}
.side-btns {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.side-btns .btn {
  width: 100%;
  text-align: center;
}
.side-clear {
  margin-top: 4px;
}

/* 中等屏及以下：侧栏回到正常流，不再固定悬浮 */
@media (max-width: 980px) {
  .works-page {
    padding-right: 0;
  }
  .works-side {
    position: static;
    width: 100%;
    margin-top: 22px;
  }
  .side-btns {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .side-btns .btn {
    width: auto;
  }
}
</style>
