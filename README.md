# 别栋！栋自会栋

一个 **纯静态** 的个人网站，使用 **Vue 3 + Vite** 构建。

- 🏠 **首页**：个人介绍 / Hero、最新动态、精选作品预览
- 📄 **简历页**：关于我 + 结构化简历（教育 / 工作 / 项目 / 技能）
- 📝 **个人动态页**：图文笔记（Markdown + 多图），列表 + 详情
- 🎨 **作品页**：图片 / 视频作品展示，支持分类筛选与详情

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vue 3 (Composition API) · Vite · Vue Router (hash) · marked |
| 内容 | 普通 JSON 文件（`frontend/public/data/*.json`）+ 媒体文件（`frontend/public/uploads/`） |
| 托管 | GitHub Pages（CI 自动构建部署） |

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
