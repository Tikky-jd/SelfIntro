# AI 应用页 · Cloudflare Worker 代理

个人网站的「AI 应用」页通过本 Worker 调用各家大模型 API。
**密钥只存在于 Worker（服务端），前端永不接触，因此不会泄露。**

---

## 架构

```
浏览器(AIChat.vue) ──POST /chat──▶ Cloudflare Worker(本目录)
                                      │ 读取 Secret 里的密钥
                                      ▼
                              各家大模型 API(OpenAI/DeepSeek/Kimi/Qwen/Gemini/Groq…)
```

前端把 `{ provider, model, messages }` 发给你的 Worker 域名，Worker 加上密钥后转发，
并把不同厂商的返回统一成 OpenAI 格式回给前端。

---

## 一、准备 Cloudflare 账号
1. 注册 https://dash.cloudflare.com （免费）。
2. 安装 Wrangler（任选其一）：
   - `npm install -g wrangler` 然后 `wrangler login`
   - 或直接用 Cloudflare Dashboard（见下）。

## 二、设置密钥（每个模型一份，缺哪个填哪个）
```bash
cd worker
npx wrangler secret put DEEPSEEK_KEY   # 去 deepseek.com 拿 api_key
npx wrangler secret put KIMI_KEY       # 去 platform.moonshot.cn 拿
npx wrangler secret put QWEN_KEY       # 去 dashscope 拿
npx wrangler secret put GEMINI_KEY     # 去 AI Studio 拿
npx wrangler secret put GROQ_KEY       # 去 groq.com 拿
npx wrangler secret put OPENAI_KEY     # 可选
```
> 变量名必须是 `<PROVIDER 大写>_KEY`，与 `index.js` 的 `PROVIDERS` 键对应。
> 不想用命令行，也可以去 Dashboard → 你的 Worker → Settings → Variables 里添加。

## 三、部署
```bash
npx wrangler deploy
```
部署成功后会得到一个地址，形如：
`https://selfintro-ai.<你的子域>.workers.dev`

## 四、把地址填回前端
打开 `frontend/src/config.js`，把 `AI_API_BASE` 改成上面的地址：
```js
export const AI_API_BASE = 'https://selfintro-ai.<你的子域>.workers.dev'
```
或在 `frontend/.env` 写：
```
VITE_AI_API_BASE=https://selfintro-ai.<你的子域>.workers.dev
```
然后重新 `npm run build` 并推送，AI 页即可使用。

---

## 支持的模型（在 `frontend/src/config.js` 的 `AI_MODELS` 中维护）
| provider | 厂商 | 端点类型 |
|----------|------|----------|
| deepseek | DeepSeek | OpenAI 兼容 |
| kimi | Moonshot / Kimi | OpenAI 兼容 |
| qwen | 通义千问 | OpenAI 兼容 |
| groq | Groq (Llama) | OpenAI 兼容 |
| openai | OpenAI | OpenAI 兼容 |
| gemini | Google Gemini | 专用适配（Worker 已转成统一格式） |

新增模型：在 `index.js` 的 `PROVIDERS` 加一行（端点类型选 `openai` 或 `gemini`），
并在 `frontend/src/config.js` 的 `AI_MODELS` 加一个下拉项即可。

## 视频生成模型
已在 UI 预留「视频生成」入口（type=`video`），但厂商大多是异步任务（提交+轮询），
与普通聊天不同，暂未接入。需要的话单独扩展一个 `/video` 路由即可。

## 安全 / 成本
- 密钥仅在 Worker 侧，前端不可见。
- Worker 内置每 IP 每分钟 20 次限流（免费方案够用；生产建议换 KV / Durable Objects）。
- 若担心被滥用，把 `index.js` 里的 `ALLOWED_ORIGIN` 改成你的站点域名。
