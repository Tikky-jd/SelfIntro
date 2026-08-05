# AI 代理 · 阿里云函数计算 FC 版

AI 应用页的代理已从 Cloudflare Worker 迁移到**阿里云函数计算 FC**。
原因：`*.workers.dev` 在大陆被墙，而讯飞星辰接口又不支持浏览器直连（无 CORS 头），
所以必须保留一个**部署在大陆可直连节点**的服务端代理。

## 当前线上部署

| 项 | 值 |
| --- | --- |
| 地域 | 华东 1（杭州）`cn-hangzhou` |
| 服务 | `selfintro-proxy` |
| 函数 | `ai-proxy`（Node.js 18，512MB，60s） |
| 触发器 | `httpTrigger`（HTTP，匿名认证，GET/POST） |
| 接口地址 | `https://1086385896267634.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/selfintro-proxy/ai-proxy/chat` |

前端 `frontend/src/config.js` 的 `AI_API_BASE` 即为上面地址去掉 `/chat` 的部分。

## 重要：这是「HTTP 函数（Web 函数）」

handler 签名是 `(req, resp, context)`，**不是** `(event, context)`：

- `req.method` / `req.path`（已自动去掉 `/2016-08-15/proxy/<service>/<function>` 前缀）/ `req.body`（Buffer）/ `req.clientIP`
- 必须用 `resp.setStatusCode()` / `resp.setHeader()` / `resp.send()` 输出
- handler **不要 return 结构体**，否则运行时报 `Wrong response argument type`

## 更新代码

改完 `index.js` 后，两种方式任选：

**A. 脚本一键部署（推荐）**

```bash
cd fc-proxy
npm i adm-zip @alicloud/fc2          # 仅首次
ALIYUN_ACCESS_KEY_ID=LTAI... ALIYUN_ACCESS_KEY_SECRET=... node deploy.mjs
```

Windows PowerShell：

```powershell
$env:ALIYUN_ACCESS_KEY_ID="LTAI..."; $env:ALIYUN_ACCESS_KEY_SECRET="..."; node deploy.mjs
```

**B. 控制台在线编辑**：函数详情 → 代码 → 把 `index.js` 全文粘贴 → 部署。

## 配置模型密钥

函数配置 → 环境变量，变量名 = **大写 provider 名 + `_KEY`**：

| 变量名 | 对应模型 | 状态 |
| --- | --- | --- |
| `XFYUN_KEY` | 讯飞星辰 MaaS 上的 Qwen（`xop35qwen2b`） | 已配置 |
| `DEEPSEEK_KEY` | DeepSeek | 未配置 |
| `KIMI_KEY` | Kimi / Moonshot | 未配置 |
| `GROQ_KEY` / `OPENAI_KEY` / `GEMINI_KEY` | 海外模型 | 未配置（且大陆调不通） |

> 讯飞星辰的 key 形如 `<APIKey>:<APISecret>`，**整串**作为 Bearer token 使用。
> 密钥只存在于 FC 环境变量，**不要写进本仓库任何文件**。

## 验证

```bash
BASE=https://1086385896267634.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/selfintro-proxy/ai-proxy
curl "$BASE/"        # 期望 {"ok":true,"service":"selfintro ai proxy","endpoint":"/chat"}
curl -X POST "$BASE/chat" -H "Content-Type: application/json" \
  -d '{"provider":"xfyun","model":"xop35qwen2b","messages":[{"role":"user","content":"你好"}]}'
```

## 说明 / 局限

- 函数 URL 是**公开**的（匿名认证），任何拿到地址的人都能调（会消耗你的模型配额）。
  个人站流量小可接受；代码内已做每 IP 每分钟 20 次的简单限流。
- OpenAI / Gemini / Groq 的官方端点本身在大陆被墙，即使经由这个国内代理也**调不通**
  （代理→上游那一段仍走不通）。国内可稳定使用的：DeepSeek、Kimi、讯飞 Qwen 等大陆厂商。
- 计费：FC 按调用次数 + CU 计费。个人站量级（每月几百次对话）在试用额度内基本为 0，
  试用期后预计 ¥1~2/月。
