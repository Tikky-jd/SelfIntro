#!/usr/bin/env node
/**
 * SelfIntro 本地内容管理脚本（纯静态，无后端）
 *
 * 内容即文件：
 *   - 文字内容：frontend/public/data/{profile,posts,works}.json
 *   - 媒体文件：frontend/public/uploads/
 *
 * 用法示例：
 *   新增一篇动态（正文写在 draft.md 里）
 *     node scripts/content.mjs post:add --title "我的新笔记" --summary "一句话摘要" \
 *         --content ./draft.md --tags "生活,记录" --cover ./cover.jpg
 *
 *   新增一个作品（本地图片/视频文件）
 *     node scripts/content.mjs work:add --title "作品名" --description "简介" \
 *         --type IMAGE --media ./work.jpg
 *
 *   新增一个视频作品（也可直接给外链）
 *     node scripts/content.mjs work:add --title "Vlog" --type VIDEO --media https://...
 *
 *   列出 / 删除
 *     node scripts/content.mjs list
 *     node scripts/content.mjs remove --type post --id 3
 *
 *   修改个人资料（仅顶层字段；socials / resumeItems 请直接编辑 profile.json）
 *     node scripts/content.mjs profile:set --name "张三" --headline "..." --about "..."
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve, basename } from 'node:path'
import {
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync
} from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const DATA_DIR = resolve(ROOT, 'frontend/public/data')
const UPLOADS_DIR = resolve(ROOT, 'frontend/public/uploads')
// 与 vite base 保持一致（GitHub Pages 仓库名）
const SITE_BASE = '/SelfIntro/'

const POSTS_FILE = resolve(DATA_DIR, 'posts.json')
const WORKS_FILE = resolve(DATA_DIR, 'works.json')
const PROFILE_FILE = resolve(DATA_DIR, 'profile.json')

const PROFILE_FIELDS = ['name', 'headline', 'about', 'email', 'phone', 'location', 'avatarUrl']

// ---------- 工具 ----------
function readJson(file) {
  if (!existsSync(file)) return null
  return JSON.parse(readFileSync(file, 'utf8'))
}
function writeJson(file, data) {
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
}
function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}
function nextId(arr) {
  const max = arr.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0)
  return max + 1
}
function safeName(original) {
  const base = basename(original).replace(/[^\w.\-]+/g, '_')
  return `${Date.now()}-${base}`
}
// 媒体：远程 URL 原样返回；本地文件复制到 uploads/ 并返回站点路径
function copyMedia(src) {
  if (/^https?:\/\//i.test(src)) return src
  const abs = resolve(process.cwd(), src)
  if (!existsSync(abs)) throw new Error(`媒体文件不存在：${src}`)
  ensureDir(UPLOADS_DIR)
  const name = safeName(abs)
  copyFileSync(abs, resolve(UPLOADS_DIR, name))
  return `${SITE_BASE}uploads/${name}`
}
function splitList(v) {
  return (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
function parseArgs(argv) {
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next !== undefined && !next.startsWith('--')) {
        opts[key] = next
        i++
      } else {
        opts[key] = true
      }
    }
  }
  return opts
}
function fail(msg) {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

// ---------- 子命令 ----------
function addPost(opts) {
  if (!opts.title) fail('缺少 --title')
  let content
  if (opts.content) {
    const p = resolve(process.cwd(), opts.content)
    if (!existsSync(p)) fail(`正文文件不存在：${opts.content}`)
    content = readFileSync(p, 'utf8')
  } else if (opts.body) {
    content = opts.body
  } else {
    fail('请提供 --content <md文件路径> 或 --body "<正文>"')
  }

  const posts = readJson(POSTS_FILE) || []
  const now = opts.date ? new Date(opts.date).toISOString() : new Date().toISOString()
  // 一次性上传所有图（--images "a.jpg,b.jpg"）；未单独指定封面时，第一张图自动作为封面
  const images = opts.images ? splitList(opts.images).map(copyMedia) : []
  const coverUrl = opts.cover ? copyMedia(opts.cover) : (images.length ? images[0] : null)
  const post = {
    id: nextId(posts),
    title: opts.title,
    summary: opts.summary || '',
    content,
    coverUrl,
    images,
    createdAt: now,
    updatedAt: now,
    tags: splitList(opts.tags)
  }
  posts.push(post)
  writeJson(POSTS_FILE, posts)
  console.log(`\n✓ 已新增动态 #${post.id}：「${post.title}」`)
  console.log(`  文件：${POSTS_FILE}`)
  if (post.coverUrl || post.images.length) console.log(`  媒体：${UPLOADS_DIR}`)
}

function addWork(opts) {
  if (!opts.title) fail('缺少 --title')
  if (!opts.media) fail('请提供 --media <本地文件路径 或 远程URL>')
  const type = (opts.type || 'IMAGE').toUpperCase()
  if (!['IMAGE', 'VIDEO'].includes(type)) fail('--type 只能是 IMAGE 或 VIDEO')

  const works = readJson(WORKS_FILE) || []
  const now = new Date().toISOString()
  const url = copyMedia(opts.media)
  // 视频作品必须单独上传封面图，不能用视频本身当封面
  let coverUrl
  if (type === 'VIDEO') {
    if (!opts.cover) fail('视频作品必须通过 --cover 指定封面图，例如 --cover ./poster.jpg')
    coverUrl = copyMedia(opts.cover)
  } else {
    coverUrl = opts.cover ? copyMedia(opts.cover) : url
  }
  const work = {
    id: nextId(works),
    title: opts.title,
    description: opts.description || '',
    content: opts.content || '',
    mediaType: type,
    url,
    coverUrl,
    tags: splitList(opts.tags),
    createdAt: now
  }
  works.push(work)
  writeJson(WORKS_FILE, works)
  console.log(`\n✓ 已新增作品 #${work.id}：「${work.title}」(${type})`)
  console.log(`  文件：${WORKS_FILE}`)
  console.log(`  媒体：${UPLOADS_DIR}`)
}

function setProfile(opts) {
  const profile = readJson(PROFILE_FILE) || {}
  let changed = false
  for (const k of PROFILE_FIELDS) {
    if (opts[k] !== undefined) {
      profile[k] = opts[k]
      changed = true
    }
  }
  if (opts.avatar) {
    profile.avatarUrl = copyMedia(opts.avatar)
    changed = true
  }
  if (!changed) fail('请提供要修改的字段，如 --name / --headline / --about / --avatar')
  writeJson(PROFILE_FILE, profile)
  console.log(`\n✓ 已更新个人资料：${PROFILE_FILE}`)
  console.log('  （socials / resumeItems 请直接编辑该文件）')
}

function listItems() {
  const posts = readJson(POSTS_FILE) || []
  const works = readJson(WORKS_FILE) || []
  console.log('\n动态 posts.json：')
  if (!posts.length) console.log('  （空）')
  posts.forEach((p) => console.log(`  #${p.id}  ${p.title}`))
  console.log('\n作品 works.json：')
  if (!works.length) console.log('  （空）')
  works.forEach((w) => console.log(`  #${w.id}  [${w.mediaType}]  ${w.title}`))
}

function removeItem(opts) {
  const type = (opts.type || '').toLowerCase()
  if (!['post', 'work'].includes(type)) fail('--type 只能是 post 或 work')
  if (!opts.id) fail('缺少 --id')
  const file = type === 'post' ? POSTS_FILE : WORKS_FILE
  const arr = readJson(file) || []
  const idx = arr.findIndex((x) => String(x.id) === String(opts.id))
  if (idx < 0) fail(`未找到 ${type} #${opts.id}`)
  const [removed] = arr.splice(idx, 1)
  writeJson(file, arr)
  console.log(`\n✓ 已删除 ${type} #${removed.id}：「${removed.title}」`)
}

function printHelp() {
  console.log(`
SelfIntro 内容管理（纯静态，无后端）

  node scripts/content.mjs post:add    --title <t> [--summary s] [--content <md文件> | --body "<正文>"]
                                     [--tags "a,b"] [--cover <图片>] [--images "a.jpg,b.jpg"] [--date 2026-01-01]
                                     说明：--images 一次性上传所有图；不指定 --cover 时，第一张图自动作为封面
  node scripts/content.mjs work:add    --title <t> --media <本地文件|URL> [--type IMAGE|VIDEO] [--description d] [--content "<详细介绍>"] [--cover <图>] [--tags "动态设计,剪辑"]
                                     说明：VIDEO 类型必须通过 --cover 指定封面图；IMAGE 不指定则封面=图片本身；--content 为作品详细介绍（详情页渲染）；--tags 为技能标签（可多选，逗号分隔）
  node scripts/content.mjs profile:set --name <n> --headline <h> --about <a> --email <e> --phone <p> --location <l> --avatar <图>
  node scripts/content.mjs list
  node scripts/content.mjs remove      --type post|work --id <n>

说明：
  - 本地媒体文件会被复制到 frontend/public/uploads/，URL 自动改写为 ${SITE_BASE}uploads/...
  - 远程 URL（http/https）会原样保留
  - 改完记得：npm run build  →  git add -A  →  git commit  →  git push（Pages 自动更新）
`)
}

// ---------- 入口 ----------
const [cmd, ...rest] = process.argv.slice(2)
const opts = parseArgs(rest)

switch (cmd) {
  case 'post:add':
    addPost(opts)
    break
  case 'work:add':
    addWork(opts)
    break
  case 'profile:set':
    setProfile(opts)
    break
  case 'list':
    listItems()
    break
  case 'remove':
    removeItem(opts)
    break
  case undefined:
  case 'help':
  case '--help':
  case '-h':
    printHelp()
    break
  default:
    fail(`未知命令：${cmd}`)
}

console.log('\n下一步：npm run build 然后 git push 部署到 GitHub Pages。\n')
