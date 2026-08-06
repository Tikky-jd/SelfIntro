<script setup>
import { ref, computed, nextTick } from 'vue'
import { AI_API_BASE, AI_MODELS } from '../config.js'
import MarkdownView from '../components/MarkdownView.vue'

const TOKEN_KEY = 'selfintro_ai_token'

const models = AI_MODELS
const selected = ref(models[0].id)
const input = ref('')
const messages = ref([])
const loading = ref(false)
const error = ref('')
const box = ref(null)

// 访问令牌：登录后从 FC 拿到，存 localStorage，7 天内免重复输入
const token = ref(localStorage.getItem(TOKEN_KEY) || '')
const locked = computed(() => !token.value)

const pwdInput = ref('')
const loginErr = ref('')
const loggingIn = ref(false)

const current = () => models.find(m => m.id === selected.value)

async function unlock() {
  const pwd = pwdInput.value
  if (!pwd || loggingIn.value) return
  loggingIn.value = true
  loginErr.value = ''
  try {
    const res = await fetch(`${AI_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.token) throw new Error(data.error || '登录失败')
    token.value = data.token
    localStorage.setItem(TOKEN_KEY, data.token)
    pwdInput.value = ''
  } catch (e) {
    loginErr.value = e.message || '登录失败，请重试'
  } finally {
    loggingIn.value = false
  }
}

function lock() {
  token.value = ''
  localStorage.removeItem(TOKEN_KEY)
}

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
      // 流式打字机：先占位空气泡（streaming 标记播放中显示纯文本），拿到完整回复后逐段渲染（FC 内置运行时不支持真 SSE 流式）
      messages.value.push({ role: 'assistant', content: '', streaming: true })
      await nextTick(); scroll()
      const idx = messages.value.length - 1
      await chatStream(m, messages.value.slice(0, -1), idx)
    }
  } catch (e) {
    error.value = e.message || '调用失败，请确认代理函数已部署且 AI_API_BASE 配置正确。'
    if (String(e.message).includes('未授权')) lock() // 令牌失效，退回登录
  } finally {
    loading.value = false
    await nextTick(); scroll()
  }
}

async function postChat(m, payload) {
  const res = await fetch(`${AI_API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.value}` },
    body: JSON.stringify(payload),
  })
  if (res.status === 401) throw new Error('未授权：请先在页面输入访问口令')
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`调用失败 (${res.status}) ${t.slice(0, 160)}`)
  }
  return res.json()
}

// 一次性拿到完整回复后，用打字机效果逐段渲染（FC 内置运行时不支持真·SSE 流式）
// 关键：必须用 messages.value[idx] 这个响应式代理更新，直接改外部对象引用不会触发视图刷新
async function chatStream(m, history, idx) {
  const data = await postChat(m, {
    provider: m.provider,
    model: m.model,
    messages: history.map(x => ({ role: x.role, content: x.content })),
    stream: false,
  })
  const full = data?.choices?.[0]?.message?.content || ''
  if (!full) { messages.value[idx].content = '(空回复)'; messages.value[idx].streaming = false; return }
  const step = Math.max(1, Math.round(full.length / 180)) // 约 180 帧播完，长文也不拖沓
  for (let i = 0; i < full.length; i += step) {
    if (idx >= messages.value.length) return // 对话已被清除，停止播放
    messages.value[idx].content += full.slice(i, i + step)
    scroll()
    await new Promise(r => setTimeout(r, 14))
  }
  messages.value[idx].streaming = false // 播放完成，切到 Markdown 渲染
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

// 复制消息文本（优先 Clipboard API，失败回退 execCommand）
async function copyMsg(msg) {
  const text = msg.content || ''
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch {}
    document.body.removeChild(ta)
  }
}
</script>

<template>
  <section class="section ai-page">
    <div class="container">
      <h1 class="section-title">AI 应用</h1>
      <p class="section-sub">你的小帮手随时待命！</p>

      <!-- 口令闸门：未登录时覆盖在卡片之上 -->
      <div v-if="locked" class="gate">
        <div class="gate-card">
          <h2>🔒 访问受限</h2>
          <p>本页 AI 功能需输入访问口令</p>
          <input
            v-model="pwdInput" type="password" @keyup.enter="unlock"
            placeholder="请输入访问口令" :disabled="loggingIn" />
          <button class="btn btn-primary" :disabled="loggingIn || !pwdInput" @click="unlock">
            {{ loggingIn ? '验证中…' : '进入' }}
          </button>
          <div v-if="loginErr" class="gate-err">{{ loginErr }}</div>
        </div>
      </div>

      <div class="ai-card card" :class="{ blurred: locked }">
        <div class="ai-head">
          <div class="field" style="margin:0;flex:1">
            <label>选择模型</label>
            <select v-model="selected">
              <option v-for="m in models" :key="m.id" :value="m.id">{{ m.label }}</option>
            </select>
          </div>
          <button class="btn btn-ghost btn-sm" @click="reset">清除对话</button>
          <button v-if="!locked" class="btn btn-ghost btn-sm" @click="lock">退出</button>
        </div>

        <div class="chat" ref="box">
          <div v-if="!messages.length" class="chat-empty">
            <template v-if="current().type === 'image'">描述你想生成的画面，例如「一座雪山下的湛蓝湖泊」（Ctrl/⌘ + Enter 发送）</template>
            <template v-else>和 {{ current().label }} 聊聊吧～（Ctrl/⌘ + Enter 发送）</template>
          </div>
          <div v-for="(msg, i) in messages" :key="i" class="bubble" :class="msg.role">
            <div class="who">
              <span>{{ msg.role === 'user' ? '我' : 'AI' }}</span>
              <button class="copy-btn" v-if="msg.content" @click="copyMsg(msg)" title="复制内容">复制</button>
            </div>
            <div v-if="msg.image" class="text"><img :src="msg.image" alt="生成结果" class="gen-img" /></div>
            <div v-else-if="msg.streaming" class="text">{{ msg.content || '思考中…' }}</div>
            <div v-else class="text md"><MarkdownView :source="msg.content || ''" /></div>
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
.ai-card.blurred { filter: blur(6px); pointer-events: none; user-select: none; opacity: .5; }
.ai-head { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 14px; }
.chat {
  height: 460px; overflow-y: auto; background: var(--surface-2);
  border-radius: var(--radius-sm); padding: 16px; margin-bottom: 14px;
}
.chat-empty { color: var(--muted); text-align: center; padding: 60px 0; }
.bubble { max-width: 82%; margin-bottom: 14px; padding: 12px 14px; border-radius: 16px; }
.bubble .who { display: flex; align-items: center; gap: 8px; font-size: .72rem; font-weight: 700; opacity: .7; margin-bottom: 4px; }
.copy-btn { margin-left: auto; font-size: .68rem; font-weight: 600; color: var(--muted); background: none; border: none; cursor: pointer; opacity: .6; padding: 2px 6px; border-radius: 6px; transition: color .15s, background .15s, opacity .15s; }
.copy-btn:hover { color: var(--primary); opacity: 1; background: var(--surface-2); }
.bubble.assistant .text.md { white-space: normal; }
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

/* 口令闸门 */
.gate { position: sticky; top: 0; min-height: 56vh; display: flex; align-items: center; justify-content: center; }
.gate-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 18px;
  padding: 28px 26px; width: min(360px, 90vw); text-align: center;
  box-shadow: 0 10px 40px rgba(124, 58, 237, .12);
}
.gate-card h2 { margin: 0 0 6px; font-size: 1.25rem; }
.gate-card p { color: var(--muted); margin: 0 0 18px; }
.gate-card input {
  width: 100%; padding: 11px 14px; border: 1.5px solid var(--border);
  border-radius: 12px; font-size: 1rem; outline: none; margin-bottom: 12px;
}
.gate-card input:focus { border-color: var(--primary); }
.gate-card .btn { width: 100%; }
.gate-err { color: #e11d48; font-size: .85rem; margin-top: 10px; }

@media (max-width: 560px) {
  .chat { height: 380px; }
  .ai-head { flex-direction: column; align-items: stretch; }
}
</style>
