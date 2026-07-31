<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getProfileContent, getPostsContent, getWorksContent } from '../api/content'
import PostCard from '../components/PostCard.vue'
import WorkCard from '../components/WorkCard.vue'

const profile = ref(null)
const posts = ref([])
const works = ref([])
const loading = ref(true)

const name = computed(() => profile.value?.name || '陈家栋')
const headline = computed(() => profile.value?.headline || '它会告诉你，我的故事。')

// 大标题按中文逗号拆成两行
const headlineLines = computed(() => {
  const h = headline.value
  const idx = h.indexOf('，')
  if (idx !== -1) return [h.slice(0, idx + 1), h.slice(idx + 1)]
  return [h, '']
})

// 打字机动画
const typed1 = ref('')
const typed2 = ref('')
const caretLine = ref(1)
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }
async function typewriter() {
  const [l1, l2] = headlineLines.value
  for (const ch of l1) { typed1.value += ch; await sleep(130) }
  caretLine.value = 2
  for (const ch of l2) { typed2.value += ch; await sleep(130) }
}

onMounted(async () => {
  document.body.classList.add('home-dark')
  typewriter()
  try {
    const [p, postsList, w] = await Promise.all([
      getProfileContent(),
      getPostsContent(),
      getWorksContent()
    ])
    profile.value = p
    posts.value = (postsList || []).slice(0, 3)
    works.value = (w || []).slice(0, 3)
  } catch (e) {
    profile.value = null
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  document.body.classList.remove('home-dark')
})

function scrollDown() {
  const el = document.getElementById('home-content')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <!-- 开屏 Banner：占据整个浏览器窗口 -->
  <section class="hero-banner">
    <div class="hero-blob hero-blob-1"></div>
    <div class="hero-blob hero-blob-2"></div>
    <div class="hero-blob hero-blob-3"></div>

    <div class="hero-content">
      <p class="hero-eyebrow">PORTFOLIO · 个人作品集</p>
      <h1 class="hero-title">
        <span class="title-line"><span class="type-line">{{ typed1 }}</span><span v-if="caretLine === 1" class="caret"></span></span>
        <span class="title-line title-line--indent"><span class="type-line">{{ typed2 }}</span><span v-if="caretLine === 2" class="caret"></span></span>
      </h1>
      <div class="hero-actions">
        <router-link to="/works" class="btn btn-primary">查看作品</router-link>
        <router-link to="/resume" class="btn btn-ghost">我的简历</router-link>
      </div>
    </div>

    <button class="scroll-cue" @click="scrollDown" aria-label="向下浏览">
      <span>向下浏览</span>
      <span class="scroll-arrow">↓</span>
    </button>
  </section>

  <!-- 第二小节：AboutMe + 介绍段落（占满整屏） -->
  <section class="about-section">
    <!-- 承上启下的长方形过渡带 -->
    <div class="transition-band">
      <span class="band-eyebrow">ABOUT ME</span>
      <h2 class="transition-text">我是一个怎样的人？</h2>
    </div>

    <!-- 介绍段落：三段（横向长条，文字单行） -->
    <div class="intro-grid">
      <div class="intro-item">
        <span class="intro-num">01</span>
        <h3 class="intro-cn">专注技术，构筑数字艺术</h3>
        <p class="intro-en">Skillful in tech, build fantasy worlds</p>
      </div>
      <div class="intro-item">
        <span class="intro-num">02</span>
        <h3 class="intro-cn">雕琢画面，传递影像情绪</h3>
        <p class="intro-en">Refine visuals, convey cinematic emotions</p>
      </div>
      <div class="intro-item">
        <span class="intro-num">03</span>
        <h3 class="intro-cn">洞悉所想，携手落地创意</h3>
        <p class="intro-en">Understand your vision, realize creative ideas</p>
      </div>
    </div>
  </section>

  <!-- 下方内容 -->
  <div id="home-content" class="container">
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

<style scoped>
/* ===== 开屏 Banner ===== */
.hero-banner {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  padding: 24px;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.55;
  animation: blobFloat 16s ease-in-out infinite;
  pointer-events: none;
}
.hero-blob-1 {
  width: 420px; height: 420px;
  background: linear-gradient(135deg, #ff3fb8, #ff7a45);
  top: -80px; left: -60px;
}
.hero-blob-2 {
  width: 380px; height: 380px;
  background: linear-gradient(135deg, #7850ff, #00d6c4);
  bottom: -100px; right: -40px;
  animation-delay: -5s;
}
.hero-blob-3 {
  width: 300px; height: 300px;
  background: linear-gradient(135deg, #ffd23f, #ff3fb8);
  top: 40%; right: 12%;
  animation-delay: -9s;
}
@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.1); }
  66% { transform: translate(-30px, 25px) scale(0.95); }
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}
.hero-eyebrow {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: 0.32em;
  font-size: clamp(0.7rem, 1.6vw, 0.95rem);
  font-weight: 600;
  color: #ffd23f;
  text-transform: uppercase;
  margin: 0 0 18px;
}
.hero-title {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
  font-size: clamp(2.6rem, 8.5vw, 6.5rem);
  margin: 0;
  text-align: center;
}
.title-line {
  display: block;
}
.title-line--indent {
  transform: translateX(1.5em);
}
.type-line {
  display: inline-block;
  background: linear-gradient(100deg, #ff3fb8 0%, #ffd23f 45%, #00d6c4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.caret {
  display: inline-block;
  width: 0.09em;
  height: 0.92em;
  margin-left: 0.06em;
  vertical-align: -0.08em;
  background: #ffd23f;
  border-radius: 2px;
  box-shadow: 0 0 14px rgba(255, 210, 63, 0.8);
  animation: caretBlink 1s steps(1) infinite;
}
@keyframes caretBlink {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}

/* 进场淡入（标题打完后再出现） */
.hero-eyebrow { animation: fadeUp 0.7s ease both; }
.hero-actions { animation: fadeUp 0.7s ease both 1.6s; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .caret { animation: none; }
  .hero-eyebrow, .hero-actions { animation: none; }
}
.hero-actions {
  margin-top: 38px;
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
}

.scroll-cue {
  position: absolute;
  bottom: 26px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.75);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.78rem;
  letter-spacing: 0.18em;
}
.scroll-arrow {
  font-size: 1.3rem;
  animation: bounce 1.8s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

/* ===== 承上启下过渡带 ===== */
.transition-band {
  position: relative;
  width: 100%;
  min-height: clamp(150px, 22vw, 230px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 30px 24px;
  overflow: hidden;
  text-align: center;
  animation: bandIn 0.9s ease both;
}
@keyframes bandIn {
  from { opacity: 0; transform: translateY(-24px); }
  to { opacity: 1; transform: translateY(0); }
}
.band-eyebrow {
  position: relative;
  z-index: 2;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  letter-spacing: 0.34em;
  font-size: clamp(0.66rem, 1.6vw, 0.92rem);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.72);
  text-transform: uppercase;
}
.transition-text {
  position: relative;
  z-index: 2;
  margin: 0;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  line-height: 1.15;
  font-size: clamp(1.7rem, 5.2vw, 3.4rem);
  letter-spacing: -0.01em;
  color: #fff;
  text-shadow: 0 6px 28px rgba(0, 0, 0, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .transition-band { animation: none; }
}

/* 第二小节：占满整屏，居中布局 */
.about-section {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(36px, 6vw, 72px);
  padding: clamp(60px, 9vw, 120px) 24px;
  box-sizing: border-box;
}

/* 三段介绍：横向长条，文字单行显示 */
.intro-grid {
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 2.6vw, 26px);
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}
.intro-item {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: clamp(18px, 3vw, 34px);
  text-align: left;
  padding: 22px clamp(22px, 3vw, 34px);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.10);
  transition: transform 0.35s cubic-bezier(.2,.8,.2,1), background 0.35s ease, border-color 0.35s ease;
}
.intro-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 18%;
  bottom: 18%;
  width: 4px;
  border-radius: 4px;
  background: linear-gradient(180deg, #ff3fb8, #00d6c4);
}
.intro-item:hover {
  transform: translateX(8px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.22);
}
.intro-num {
  flex: 0 0 auto;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1;
  background: linear-gradient(100deg, #ff3fb8 0%, #ffd23f 50%, #00d6c4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.intro-cn {
  flex: 0 0 auto;
  margin: 0;
  white-space: nowrap;
  font-family: 'Manrope', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(1.1rem, 2.2vw, 1.55rem);
  color: #fff;
  letter-spacing: 0.01em;
}
.intro-en {
  flex: 1 1 auto;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Manrope', system-ui, sans-serif;
  font-size: clamp(0.8rem, 1.5vw, 1rem);
  color: rgba(255, 255, 255, 0.66);
}

@media (max-width: 760px) {
  .intro-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .intro-cn, .intro-en { white-space: normal; }
}

@media (max-width: 600px) {
  .hero-actions { flex-direction: column; align-items: center; }
  .hero-actions .btn { width: 100%; max-width: 280px; }
}
</style>
