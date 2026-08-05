// 阿里云函数计算 FC（Node.js 18 运行时 + HTTP 触发器）大模型代理
//
// 运行模型：HTTP 函数（Web 函数）。handler 签名为 (req, resp, context)：
//   - req.method  请求方法；req.path 已自动去掉 /2016-08-15/proxy/<service>/<function> 前缀
//   - req.body    Buffer（FC 已读完请求体）；req.clientIP 客户端 IP
//   - 必须调用 resp.setStatusCode / resp.setHeader / resp.send 输出，handler 不要 return 值
//
// 零依赖（global fetch 即可），控制台「在线编辑」直接粘贴本文件，无需构建、无需 npm install。
// 密钥从函数「环境变量」读取，变量名 = 大写 provider 名 + _KEY（如 XFYUN_KEY）。
// 前端只调这个函数的 /chat，由它保管密钥并转发，密钥永不进前端 / 仓库。

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

// 兜底允许来源（取不到请求 Origin 时使用）
const FALLBACK_ORIGIN = '*'

// 简单限流：每 IP 每分钟最多 20 次（FC 多实例下为尽力而为）
const WINDOW_MS = 60000
const MAX_PER_WINDOW = 20
const hits = new Map()

exports.handler = async (req, resp, context) => {
  const headers = req.headers || {}
  const origin = headers.origin || headers.Origin || FALLBACK_ORIGIN

  const out = (code, payload) => {
    resp.setStatusCode(code)
    resp.setHeader('content-type', 'application/json; charset=utf-8')
    resp.setHeader('access-control-allow-origin', origin)
    resp.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS')
    resp.setHeader('access-control-allow-headers', 'Content-Type, Authorization')
    resp.setHeader('vary', 'Origin')
    resp.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
  }

  const method = String(req.method || 'GET').toUpperCase()
  const rawPath = String(req.path || req.url || '/')
  const path = rawPath.replace(/\/+$/, '')
  const isChat = path.endsWith('/chat')

  // CORS 预检
  if (method === 'OPTIONS') return out(204, '')

  // 健康检查
  if (method === 'GET' && path === '') {
    return out(200, { ok: true, service: 'selfintro ai proxy', endpoint: '/chat' })
  }

  if (!(isChat && method === 'POST')) {
    return out(404, { error: 'not found', path: rawPath, method })
  }

  const ip = String(req.clientIP || req.ip || 'unknown')
  if (!rateOK(ip)) return out(429, { error: '请求过于频繁，请稍后再试' })

  let raw = req.body
  if (Buffer.isBuffer(raw)) raw = raw.toString('utf8')
  if (typeof raw !== 'string') raw = raw ? JSON.stringify(raw) : '{}'

  let body
  try { body = JSON.parse(raw || '{}') } catch { return out(400, { error: '请求体不是合法 JSON' }) }

  const provider = PROVIDERS[body.provider]
  if (!provider) return out(400, { error: `未知 provider: ${body.provider}` })
  if (!body.model) return out(400, { error: '缺少 model' })

  const envName = `${String(body.provider).toUpperCase()}_KEY`
  const key = process.env[envName]
  if (!key) return out(500, { error: `未配置 ${body.provider} 的密钥（请在函数环境变量中添加 ${envName}）` })

  let upstreamUrl, upstreamBody, fwdHeaders
  if (provider.type === 'openai') {
    upstreamUrl = `${provider.base}/chat/completions`
    upstreamBody = JSON.stringify({
      model: body.model,
      messages: body.messages || [],
      stream: false,
    })
    fwdHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
  } else if (provider.type === 'gemini') {
    upstreamUrl = `${provider.base}/models/${body.model}:generateContent?key=${key}`
    const contents = (body.messages || []).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    upstreamBody = JSON.stringify({ contents })
    fwdHeaders = { 'Content-Type': 'application/json' }
  } else {
    return out(400, { error: '不支持的 provider 类型' })
  }

  try {
    const upstream = await fetch(upstreamUrl, { method: 'POST', headers: fwdHeaders, body: upstreamBody })
    const text = await upstream.text()
    let data
    try { data = JSON.parse(text) } catch { data = { error: text.slice(0, 500) } }
    let reply
    if (provider.type === 'openai') {
      reply = data
    } else {
      const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content
        && data.candidates[0].content.parts) || []
      reply = { choices: [{ message: { role: 'assistant', content: parts.map(p => p.text).join('') } }] }
    }
    return out(upstream.status, reply)
  } catch (err) {
    return out(500, { error: String(err && err.message ? err.message : err) })
  }
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
