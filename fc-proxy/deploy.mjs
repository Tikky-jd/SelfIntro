// 一键把 index.js 更新到阿里云函数计算 FC（不含任何密钥，凭证从环境变量读）
//
// 用法（Windows PowerShell）：
//   $env:ALIYUN_ACCESS_KEY_ID="LTAI..."; $env:ALIYUN_ACCESS_KEY_SECRET="..."; node deploy.mjs
// 用法（bash）：
//   ALIYUN_ACCESS_KEY_ID=LTAI... ALIYUN_ACCESS_KEY_SECRET=... node deploy.mjs
//
// 可选环境变量：
//   FC_ACCOUNT_ID（默认 1086385896267634）、FC_REGION（默认 cn-hangzhou）
//   FC_SERVICE（默认 selfintro-proxy）、FC_FUNCTION（默认 ai-proxy）
//   XFYUN_KEY / DEEPSEEK_KEY / KIMI_KEY / QWEN_KEY / GROQ_KEY / OPENAI_KEY / GEMINI_KEY / SITE_KEY
//   XFYUN_IMG_KEY / XFYUN_IMG_SECRET / XFYUN_IMG_APPID（讯飞星火文生图三要素）
//     —— 若设置了，会合并进函数环境变量；不设置则保留 FC 上已有的值（不会清空）。
//     例如首次部署只需提供 SITE_KEY；已配好的 XFYUN_KEY 会自动保留。
//
// 依赖：npm i adm-zip @alicloud/fc2

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const AdmZip = require('adm-zip')
const FC = require('@alicloud/fc2')

const AK = process.env.ALIYUN_ACCESS_KEY_ID
const SK = process.env.ALIYUN_ACCESS_KEY_SECRET
if (!AK || !SK) {
  console.error('请先设置 ALIYUN_ACCESS_KEY_ID 与 ALIYUN_ACCESS_KEY_SECRET 环境变量')
  process.exit(1)
}

const ACCOUNT_ID = process.env.FC_ACCOUNT_ID || '1086385896267634'
const REGION = process.env.FC_REGION || 'cn-hangzhou'
const SERVICE = process.env.FC_SERVICE || 'selfintro-proxy'
const FUNCTION = process.env.FC_FUNCTION || 'ai-proxy'

const client = new FC(ACCOUNT_ID, {
  accessKeyID: AK,
  accessKeySecret: SK,
  region: REGION,
  timeout: 120000,
})

// 先读取 FC 上已有环境变量（如已配好的 XFYUN_KEY），再合并本次提供的，避免覆盖清空
let existing = {}
try {
  const f = await client.getFunction(SERVICE, FUNCTION)
  existing = (f && f.data && f.data.environmentVariables) || (f && f.environmentVariables) || {}
  console.log('FC 现有环境变量：', Object.keys(existing).join(', ') || '(无)')
} catch (e) {
  console.warn('⚠️ 读取现有环境变量失败，将仅应用本次提供的：', e.code || e.message)
}

const envKeys = ['XFYUN_KEY', 'DEEPSEEK_KEY', 'KIMI_KEY', 'QWEN_KEY', 'GROQ_KEY', 'OPENAI_KEY', 'GEMINI_KEY', 'SITE_KEY',
  'XFYUN_IMG_KEY', 'XFYUN_IMG_SECRET', 'XFYUN_IMG_APPID']
const environmentVariables = { ...existing }
for (const k of envKeys) if (process.env[k]) environmentVariables[k] = process.env[k]

const zip = new AdmZip()
zip.addLocalFile(path.join(__dirname, 'index.js'))

const payload = {
  handler: 'index.handler',
  runtime: 'nodejs18',
  timeout: 120,
  memorySize: 512,
  code: { zipFile: zip.toBuffer().toString('base64') },
  environmentVariables,
}

try {
  const r = await client.updateFunction(SERVICE, FUNCTION, payload)
  console.log('✅ 已更新：', r.data?.functionName, '| codeSize =', r.data?.codeSize)
  console.log('本次写入的环境变量：', Object.keys(environmentVariables).join(', '))
  console.log('函数地址：',
    `https://${ACCOUNT_ID}.${REGION}.fc.aliyuncs.com/2016-08-15/proxy/${SERVICE}/${FUNCTION}/chat`)
} catch (e) {
  console.error('❌ 部署失败：', e.code || '', e.message)
  process.exit(1)
}
