<script setup>
import { ref, nextTick } from 'vue'
import { AI_API_BASE, AI_MODELS } from '../config.js'

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
    const res = await fetch(`${AI_API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: m.provider,
        model: m.model,
        messages: messages.value.map(x => ({ role: x.role, content: x.content })),
        stream: false,
      }),
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(`调用失败 (${res.status}) ${t.slice(0, 160)}`)
    }
    const data = await res.json()
    const reply = data?.choices?.[0]?.message?.content
    messages.value.push({ role: 'assistant', content: (reply || '(空回复)').trim() })
  } catch (e) {
    error.value = e.message || '调用失败，请确认代理函数已部署且 AI_API_BASE 配置正确。'
  } finally {
    loading.value = false
    await nextTick(); scroll()
  }
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
      <p class="section-sub">调用各类大模型，密钥全程留在服务端代理，前端不暴露。所有请求经你自己的 Cloudflare Worker 转发。</p>

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
            和 {{ current().label }} 聊聊吧～（Ctrl/⌘ + Enter 发送）
          </div>
          <div v-for="(msg, i) in messages" :key="i" class="bubble" :class="msg.role">
            <div class="who">{{ msg.role === 'user' ? '我' : 'AI' }}</div>
            <div class="text">{{ msg.content }}</div>
          </div>
          <div v-if="loading" class="bubble assistant">
            <div class="who">AI</div><div class="text">思考中…</div>
          </div>
        </div>

        <div v-if="error" class="banner">{{ error }}</div>

        <div class="ai-input">
          <textarea v-model="input" @keydown="onKey" placeholder="输入你的问题…"></textarea>
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
.ai-input { display: flex; gap: 10px; align-items: flex-end; }
.ai-input textarea { flex: 1; min-height: 64px; }
@media (max-width: 560px) {
  .chat { height: 380px; }
  .ai-head { flex-direction: column; align-items: stretch; }
}
</style>
