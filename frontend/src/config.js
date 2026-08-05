// AI 应用页配置
// AI_API_BASE = 阿里云函数计算 FC 的 HTTP 触发器地址（见 fc-proxy/README.md）。
// 也可在 frontend/.env 里设置 VITE_AI_API_BASE=https://xxx 覆盖。
// 注意：末尾不要带斜杠，前端会自动拼 /chat。

export const AI_API_BASE =
  import.meta.env.VITE_AI_API_BASE ||
  'https://1086385896267634.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/selfintro-proxy/ai-proxy'

// 访问口令：与 FC 函数环境变量 SITE_KEY 保持一致。
// 说明：纯静态站点无法真正保密，此口令仅用于提高第三方脚本直连盗用的门槛，并非强鉴权。
export const AI_SITE_KEY = '385oFUEfTgnlpq8UEZ_tjs5aHIu0ANLA'

// 可选模型列表。provider 字段对应 fc-proxy 里 PROVIDERS 的键；
// type='llm' 走 /chat 代理做对话，type='image' 走 /chat 代理做文生图，type='video' 为视频生成（暂未接入）。
// 想启用某个模型：在 FC 函数的「环境变量」里加对应密钥即可，前端无需改动。
export const AI_MODELS = [
  // 已配置密钥，可直接使用
  { id: 'qwen', label: 'Qwen · 通义千问（讯飞星辰）', provider: 'xfyun', model: 'xop35qwen2b', type: 'llm' },
  // 讯飞星辰文生图（已在 FC 配置 XFYUN_IMG_KEY/SECRET/APPID，走 MaaS tti 接口，modelId=xopzimageturbo）
  { id: 'xfyun-img', label: '讯飞星辰 · 文生图 (xopzimageturbo)', provider: 'xfyun-img', model: 'xopzimageturbo', type: 'image' },
  // 以下需在 FC 环境变量中补密钥后才可用
  { id: 'deepseek', label: 'DeepSeek · deepseek-chat（需配置密钥）', provider: 'deepseek', model: 'deepseek-chat', type: 'llm' },
  { id: 'kimi', label: 'Kimi · moonshot-v1-8k（需配置密钥）', provider: 'kimi', model: 'moonshot-v1-8k', type: 'llm' },
  { id: 'gemini', label: 'Gemini · gemini-1.5-flash（需配置密钥）', provider: 'gemini', model: 'gemini-1.5-flash', type: 'llm' },
  { id: 'groq', label: 'Groq · Llama-3.1-8B（需配置密钥）', provider: 'groq', model: 'llama-3.1-8b-instant', type: 'llm' },
  { id: 'openai', label: 'OpenAI · gpt-4o-mini（需配置密钥）', provider: 'openai', model: 'gpt-4o-mini', type: 'llm' },
  // 视频生成模型（暂未接入，敬请期待）
  { id: 'video', label: '视频生成（即将支持）', provider: 'video', model: '', type: 'video' },
]
