<script setup>
import { ref, nextTick } from 'vue'
import { AI_API_BASE, AI_MODELS, AI_SITE_KEY } from '../config.js'

const models = AI_MODELS
const selected = ref(models[0].id)
const input = ref('')
const messages = ref([])
const loading = ref(false)
const error = ref('')
const box = ref(null)

const current = () => models.find(m => m.id === selected.value)

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return
  const m = current()
  if (m.type === 'video') {
    error.value = '视频生成模型暂未接入，敬请期待～'
    return
  }
  error.value = ''
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  await nextTick(); scroll()
  loading.value = true
  try {
    if (m.type === 'image') {
      const img = await genImage(m, text)
      messages.value.push({ role: 'assistant', image: img })
    } else {
      const reply = await chat(m, text)
      messages.value.push({ role: 'assistant', content: (reply || '(空回复)').trim() })
    }
  } catch (e) {
    error.value = e.message || '调用失败，请确认代理函数已部署且 AI_API_BASE 配置正确。'
  } finally {
    loading.value = false
    await nextTick(); scroll()
  }
}

async function postChat(m, payload) {
  const res = await fetch(`${AI_API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-site-key': AI_SITE_KEY },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`调用失败 (${res.status}) ${t.slice(0, 160)}`)
  }
  return res.json()
}

async function chat(m, text) {
  const data = await postChat(m, {
    provider: m.provider,
    model: m.model,
    messages: messages.value.map(x => ({ role: x.role, content: x.content })),
    stream: false,
  })
  return data?.choices?.[0]?.message?.content
}

async function genImage(m, prompt) {
  const data = await postChat(m, {
    provider: m.provider,
    model: m.model,
    messages: [{ role: 'user', content: prompt }],
  })
  if (!data || !data.image) throw new Error('未返回图片：' + JSON.stringify(data).slice(0, 160))
  return data.image
}

function scroll() {
  if (box.value) box.value.scrollTop = box.value.scrollHeight
}
function reset() { messages.value = []; error.value = '' }
function onKey(e) {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send() }
}
</script>

<template>
  <section class="section ai-page">
    <div class="container">
      <h1 class="section-title">AI 应用</h1>
      <p class="section-sub">你的小帮手随时待命！</p>

      <div class="ai-card card">
        <div class="ai-head">
          <div class="field" style="margin:0;flex:1">
            <label>选择模型</label>
            <select v-model="selected">
              <option v-for="m in models" :key="m.id" :value="m.id">{{ m.label }}</option>
            </select>
          </div>
          <button class="btn btn-ghost btn-sm" @click="reset">清除对话</button>
        </div>

        <div class="chat" ref="box">
          <div v-if="!messages.length" class="chat-empty">
            <template v-if="current().type === 'image'">描述你想生成的画面，例如「一座雪山下的湛蓝湖泊」（Ctrl/⌘ + Enter 发送）</template>
            <template v-else>和 {{ current().label }} 聊聊吧～（Ctrl/⌘ + Enter 发送）</template>
          </div>
          <div v-for="(msg, i) in messages" :key="i" class="bubble" :class="msg.role">
            <div class="who">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
            <div v-if="msg.image" class="text"><img :src="msg.image" alt="生成结果" class="gen-img" /></div>
            <div v-else class="text">{{ msg.content }}</div>
          </div>
          <div v-if="loading" class="bubble assistant">
            <div class="who">AI</div><div class="text">思考中…</div>
          </div>
        </div>

        <div v-if="error" class="banner">{{ error }}</div>

        <div class="ai-input">
          <textarea v-model="input" @keydown="onKey" :placeholder="current().type === 'image' ? '描述想要的画面…' : '输入你的问题…'"></textarea>
          <button class="btn btn-primary" :disabled="loading || !input.trim()" @click="send">
            {{ loading ? '发送中…' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-card { padding: 18px; max-width: 820px; margin: 0 auto; }
.ai-head { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 14px; }
.chat {
  height: 460px; overflow-y: auto; background: var(--surface-2);
  border-radius: var(--radius-sm); padding: 16px; margin-bottom: 14px;
}
.chat-empty { color: var(--muted); text-align: center; padding: 60px 0; }
.bubble { max-width: 82%; margin-bottom: 14px; padding: 12px 14px; border-radius: 16px; }
.bubble .who { font-size: .72rem; font-weight: 700; opacity: .7; margin-bottom: 4px; }
.bubble.user { margin-left: auto; background: var(--grad-warm); color: #fff; }
.bubble.assistant { background: #fff; border: 1px solid var(--border); }
.bubble.assistant .text { white-space: pre-wrap; }
.ai-input {
  display: flex; gap: 10px; align-items: flex-end;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 18px;
  padding: 8px 8px 8px 16px;
  box-shadow: 0 6px 20px rgba(124, 58, 237, .08);
  transition: border-color .15s ease, box-shadow .15s ease;
}
.ai-input:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-soft), 0 8px 24px rgba(255, 46, 126, .12);
}
.ai-input textarea {
  flex: 1; min-height: 46px; max-height: 160px;
  border: none; outline: none; resize: none;
  background: transparent;
  font-family: inherit; font-size: .95rem; line-height: 1.6; color: var(--text);
  padding: 10px 0;
}
.ai-input textarea::placeholder { color: var(--muted); }
.ai-input .btn { margin-bottom: 2px; }
.gen-img { max-width: 100%; border-radius: 12px; display: block; margin-top: 2px; }
@media (max-width: 560px) {
  .chat { height: 380px; }
  .ai-head { flex-direction: column; align-items: stretch; }
}
</style>
