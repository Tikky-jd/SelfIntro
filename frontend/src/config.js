// AI 应用页配置
// 把 AI_API_BASE 改成你部署好的 Cloudflare Worker 地址（见 worker/README.md）。
// 也可在 frontend/.env 里设置 VITE_AI_API_BASE=https://xxx.workers.dev 覆盖。

export const AI_API_BASE =
  import.meta.env.VITE_AI_API_BASE ||
  'https://selfintro-ai.tikky-jd.workers.dev'

// 可选模型列表。provider 字段对应 worker/PROVIDERS 的键；
// type='llm' 走 /chat 代理，type='video' 为视频生成（暂未接入）。
export const AI_MODELS = [
  { id: 'deepseek', label: 'DeepSeek · deepseek-chat', provider: 'deepseek', model: 'deepseek-chat', type: 'llm' },
  { id: 'kimi', label: 'Kimi · moonshot-v1-8k', provider: 'kimi', model: 'moonshot-v1-8k', type: 'llm' },
  { id: 'qwen', label: 'Qwen · 讯飞星辰', provider: 'xfyun', model: 'xop35qwen2b', type: 'llm' },
  { id: 'gemini', label: 'Gemini · gemini-1.5-flash', provider: 'gemini', model: 'gemini-1.5-flash', type: 'llm' },
  { id: 'groq', label: 'Groq · Llama-3.1-8B', provider: 'groq', model: 'llama-3.1-8b-instant', type: 'llm' },
  { id: 'openai', label: 'OpenAI · gpt-4o-mini', provider: 'openai', model: 'gpt-4o-mini', type: 'llm' },
  // 视频生成模型（暂未接入，敬请期待）
  { id: 'video', label: '视频生成（即将支持）', provider: 'video', model: '', type: 'video' },
]
