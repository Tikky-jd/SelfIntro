// Cloudflare Worker：大模型代理
// 作用：前端只调这个 Worker，由 Worker 保管各厂商 API Key 并转发请求。
//       密钥从 Worker Secret（环境变量）读取，永不进入前端 / 仓库。
//
// 部署：见 README.md。密钥用 `wrangler secret put <NAME>` 或 Dashboard 添加。
//       每个 provider 的密钥变量名 = 大写 provider 名 + _KEY，例如 DEEPSEEK_KEY。

const PROVIDERS = {
  openai:  { type: 'openai', base: 'https://api.openai.com/v1' },
  deepseek:{ type: 'openai', base: 'https://api.deepseek.com/v1' },
  kimi:    { type: 'openai', base: 'https://api.moonshot.cn/v1' },
  qwen:    { type: 'openai', base: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  groq:    { type: 'openai', base: 'https://api.groq.com/openai/v1' },
  gemini:  { type: 'gemini', base: 'https://generativelanguage.googleapis.com/v1beta' },
  // 讯飞星辰 MaaS（OpenAI 兼容接口，Bearer 鉴权；服务创建于 2026-01-10 后用 /v2）
  xfyun:   { type: 'openai', base: 'https://maas-api.cn-huabei-1.xf-yun.com/v2' },
}

// 允许调用的来源（生产建议改成你的站点域名，如 https://tikky-jd.github.io）
const ALLOWED_ORIGIN = '*'

// 简单限流：每 IP 每分钟最多 20 次（免费方案够用；生产可用 KV / Durable Objects）
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 20
const hits = new Map()

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }))
    }

    if (url.pathname === '/chat' && request.method === 'POST') {
      const ip = request.headers.get('cf-connecting-ip') || 'unknown'
      if (!rateOK(ip)) {
        return cors(json({ error: '请求过于频繁，请稍后再试' }, 429))
      }
      try {
        const body = await request.json()
        const provider = PROVIDERS[body.provider]
        if (!provider) return cors(json({ error: `未知 provider: ${body.provider}` }, 400))
        if (!body.model) return cors(json({ error: '缺少 model' }, 400))

        const key = env[`${body.provider.toUpperCase()}_KEY`]
        if (!key) return cors(json({ error: `未配置 ${body.provider} 的密钥` }, 500))

        let upstreamUrl, upstreamBody, headers
        if (provider.type === 'openai') {
          upstreamUrl = `${provider.base}/chat/completions`
          upstreamBody = JSON.stringify({
            model: body.model,
            messages: body.messages || [],
            stream: false,
          })
          headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
        } else if (provider.type === 'gemini') {
          upstreamUrl = `${provider.base}/models/${body.model}:generateContent?key=${key}`
          const contents = (body.messages || []).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          }))
          upstreamBody = JSON.stringify({ contents })
          headers = { 'Content-Type': 'application/json' }
        } else {
          return cors(json({ error: '不支持的 provider 类型' }, 400))
        }

        const upstream = await fetch(upstreamUrl, { method: 'POST', headers, body: upstreamBody })
        const data = await upstream.json().catch(() => ({}))

        // 统一成 OpenAI 聊天格式返回，前端无需关心厂商差异
        let reply
        if (provider.type === 'openai') {
          reply = data
        } else {
          const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || ''
          reply = { choices: [{ message: { role: 'assistant', content: text } }] }
        }
        return cors(json(reply, upstream.status))
      } catch (e) {
        return cors(json({ error: String(e && e.message ? e.message : e) }, 500))
      }
    }

    return cors(json({ error: 'not found' }, 404))
  },
}

function rateOK(ip) {
  const now = Date.now()
  const rec = hits.get(ip)
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 })
    return true
  }
  if (rec.count >= MAX_PER_WINDOW) return false
  rec.count++
  return true
}

function cors(res) {
  res.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return res
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
