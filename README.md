# SelfIntro · 个人网站（纯静态）

一个 **纯静态** 的个人网站，使用 **Vue 3 + Vite** 构建。

- 🏠 **首页**：个人介绍 / Hero、最新动态、精选作品预览
- 📄 **简历页**：关于我 + 结构化简历（教育 / 工作 / 项目 / 技能）
- 📝 **个人动态页**：图文笔记（Markdown + 多图），列表 + 详情
- 🎨 **作品页**：图片 / 视频作品展示，支持分类筛选与详情

**没有后端、没有数据库、没有服务器**：所有内容就是仓库里的几个 JSON 文件 + 媒体文件，由 GitHub Pages 直接托管。改内容 = 改文件 + 重新构建部署。

---

## 它是怎么"没有后端"的

```
访客浏览器
   │  ① 加载静态页面（HTML/JS/CSS）
   ▼
GitHub Pages（纯文件托管）
   ├── index.html / 打包后的 JS
   ├── data/profile.json  ← 个人资料 + 简历
   ├── data/posts.json    ← 动态（笔记）列表
   ├── data/works.json    ← 作品列表
   └── uploads/*          ← 图片 / 视频等媒体
```

前端在运行时直接 `fetch` 这些 JSON 文件来渲染页面，**完全不需要任何服务器程序或数据库**。

---

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vue 3 (Composition API) · Vite · Vue Router (hash) · marked |
| 内容 | 普通 JSON 文件（`frontend/public/data/*.json`）+ 媒体文件（`frontend/public/uploads/`） |
| 托管 | GitHub Pages（CI 自动构建部署） |

> 没有任何后端依赖。旧的 Spring Boot 后端已被移除。

---

## 目录结构

```
SELFIntro/
├── frontend/                # Vue3 前端（唯一的"应用"）
│   ├── src/
│   │   ├── api/content.js   # 读取 public/data 下的静态 JSON
│   │   ├── components/      # 公共组件（含 WorkCard / PostCard / MarkdownView）
│   │   ├── views/           # 页面（首页/简历/动态/作品 + 详情）
│   │   ├── router/display.js# 展示站路由（仅公开页）
│   │   └── assets/style.css # 设计系统
│   ├── public/
│   │   ├── data/            # ← 内容源：profile / posts / works 三个 JSON
│   │   └── uploads/         # ← 媒体文件（图片 / 视频）
│   └── vite.config.js       # GitHub Pages base 路径
├── scripts/
│   └── content.mjs          # 本地"写内容"脚本（无依赖）
└── .github/workflows/       # 推送到 main 即自动部署到 Pages
```

---

## 本地预览

```bash
cd frontend
npm install
npm run dev        # 打开 http://localhost:5173/SELFIntro/
```

构建产物本地预览：

```bash
npm run build
npm run preview    # 默认 http://localhost:4173/SELFIntro/
```

---

## 怎么新增 / 修改内容

内容就是文件，有两种方式：**用脚本（推荐）** 或 **直接手改 JSON**。

### 方式一：用脚本（最省事）

脚本 `scripts/content.mjs` 帮你自动分配 id、处理时间戳、把本地图片/视频复制进 `uploads/` 并改写路径。

```bash
# 新增一篇动态（正文写在一个 .md 文件里）
node scripts/content.mjs post:add \
  --title "我的新笔记" --summary "一句话摘要" \
  --content ./draft.md --tags "生活,记录" --cover ./cover.jpg

# 新增一个图片作品（本地文件会自动进 uploads/）
node scripts/content.mjs work:add \
  --title "作品名" --description "简介" --type IMAGE --media ./work.jpg

# 新增一个视频作品（也可直接给外链）
node scripts/content.mjs work:add --title "Vlog" --type VIDEO --media https://example.com/v.mp4

# 修改个人资料（仅顶层字段；socials / resumeItems 请直接编辑 profile.json）
node scripts/content.mjs profile:set --name "张三" --headline "..." --about "..."

# 查看 / 删除
node scripts/content.mjs list
node scripts/content.mjs remove --type post --id 3
```

- 本地媒体文件会被复制到 `frontend/public/uploads/`，URL 自动变成 `/SELFIntro/uploads/...`
- 远程 URL（`http/https`）会原样保留
- **注意**：如果改了仓库名，`scripts/content.mjs` 顶部的 `SITE_BASE` 与 `vite.config.js` 的 `base` 要一起改

### 方式二：直接手改 JSON

打开 `frontend/public/data/` 下的文件直接编辑：

- `profile.json`：个人资料 + 简历（`resumeItems` 是数组，每条含 `category / title / org / description / startYear / endYear / sortOrder`）
- `posts.json`：数组，每条 `{ id, title, summary, content, coverUrl, images[], createdAt, updatedAt, tags[] }`
- `works.json`：数组，每条 `{ id, title, description, mediaType("IMAGE"|"VIDEO"), url, coverUrl, createdAt }`

媒体文件手动放进 `frontend/public/uploads/`，然后在 JSON 里把 `url` / `coverUrl` 写成 `/SELFIntro/uploads/文件名`。

---

## 部署（GitHub Pages）

1. 改完内容后构建并提交：
   ```bash
   npm run build
   git add -A
   git commit -m "更新内容"
   git push
   ```
2. 在 GitHub 仓库 → **Settings → Pages → Source** 选择 **GitHub Actions**。
3. 推送到 `main` 分支后，GitHub Actions 会自动执行 `npm run build` 并发布到 Pages。

> 站点基路径默认 `/SELFIntro/`（对应仓库名）。若仓库改名，请同步修改 `frontend/vite.config.js` 的 `base` 与 `scripts/content.mjs` 的 `SITE_BASE`。

---

## 常见问题

- **媒体文件太大？** 建议单文件控制在 50MB 内；GitHub 单文件上限约 100MB。大视频可用外链（直接给 `https://` 地址）。
- **改完访客多久看到？** 推送后 GitHub Actions 通常 1 分钟内完成部署，浏览器强刷（Ctrl/Cmd+Shift+R）即可。
- **没有后台登录了？** 是的，纯静态站没有登录概念——你本人通过编辑文件 / 运行脚本来管理内容，访客只能看。
