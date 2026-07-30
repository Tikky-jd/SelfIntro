# SelfIntro · 个人网站

一个使用 **Vue 3 + Spring Boot** 构建的个人网站，支持：

- 🏠 **首页**：个人介绍 / Hero、最新动态、精选作品预览
- 📄 **简历页**：关于我 + 结构化简历（教育 / 工作 / 项目 / 技能 / 证书）
- 📝 **个人动态页**：图文笔记（Markdown + 多图），列表 + 详情
- 🎨 **作品页**：图片 / 视频作品展示，支持分类筛选与详情
- 🔐 **后台管理**：管理员登录（JWT），可视化编辑资料、笔记、作品，媒体上传

前端部署到 **GitHub Pages**（免费公开访问），后端（Spring Boot）部署到 **Render / Railway** 等云平台，媒体文件存到 **Cloudinary** 对象存储。

---

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vue 3 (Composition API) · Vite · Vue Router (hash) · Pinia · Axios · marked |
| 后端 | Spring Boot 3.2 · Spring Security 6 (JWT) · Spring Data JPA · Java 17 |
| 数据库 | MySQL（生产）/ H2（本地开发） |
| 存储 | Cloudinary（生产）/ 本地磁盘（开发） |

---

## 目录结构

```
SELFIntro/
├── frontend/                # Vue3 前端
│   ├── src/
│   │   ├── api/             # 后端接口封装
│   │   ├── components/      # 公共组件
│   │   ├── views/           # 页面（含 admin/ 后台）
│   │   ├── stores/          # Pinia 状态（鉴权）
│   │   ├── router/          # 路由 + 守卫
│   │   └── assets/style.css # 设计系统
│   ├── .env                 # 本地 API 地址
│   ├── .env.production      # 生产 API 地址（部署前改）
│   └── vite.config.js       # 含 GitHub Pages base 路径
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/...    # 实体 / 仓库 / 服务 / 控制器 / 安全
│   ├── src/main/resources/  # application.yml (dev/prod)
│   ├── Dockerfile
│   └── pom.xml
├── render.yaml              # 后端 Render 部署配置
└── .github/workflows/       # 前端自动部署到 GitHub Pages
```

---

## 本地开发

### 后端（需要 Java 17 + Maven）

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# 默认 http://localhost:8080
# H2 控制台: http://localhost:8080/h2-console
```

开发模式使用 H2 内存库 + 本地磁盘存储，启动时会自动写入示例数据。

### 前端

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

浏览器打开 `http://localhost:5173`，默认 API 指向 `http://localhost:8080/api`。

---

## 部署

### 1) 后端 → Render（或其他云平台）

1. 在 Render 新建 **Web Service**，连接本仓库，设置：
   - **Root Directory**: `backend`
   - **Runtime**: Docker（使用仓库内 `Dockerfile`）
2. 在 Render 控制台添加环境变量（见下表），然后部署。
3. 记下后端地址，例如 `https://your-backend.onrender.com`。

也可改用 Railway / Fly.io / 任意支持 Docker 的平台，逻辑相同。

### 2) 前端 → GitHub Pages

1. 把仓库推到 GitHub（见下方命令）。
2. 修改两处配置：
   - `frontend/vite.config.js` 的 `base`：
     - 项目站点（`用户名.github.io/仓库名`）：设为 `'/仓库名/'`
     - 用户/组织站点（`用户名.github.io`）：设为 `'/'`
   - `frontend/.env.production` 的 `VITE_API_BASE`：改成你的后端地址 + `/api`，例如 `https://your-backend.onrender.com/api`
3. 在 GitHub 仓库 → **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
4. 推送到 `main` 分支，GitHub Actions 会自动构建并发布。

### 环境变量（后端）

| 变量 | 说明 | 示例 |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | 固定 `prod` | `prod` |
| `STORAGE_MODE` | `cloudinary` / `local` | `cloudinary` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary 云名 | `demo` |
| `CLOUDINARY_API_KEY` | Cloudinary Key | — |
| `CLOUDINARY_API_SECRET` | Cloudinary Secret | — |
| `DB_URL` | JDBC 连接串 | `jdbc:mysql://host:3306/portfolio` |
| `DB_USERNAME` / `DB_PASSWORD` | 数据库账号 | — |
| `JWT_SECRET` | ≥32 位随机串 | — |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | 后台管理员账号 | — |
| `CORS_ALLOWED_ORIGINS` | 前端域名（逗号分隔） | `https://user.github.io` |

> 数据库可用 Render 托管的 MySQL/PostgreSQL（需改 `application-prod.yml` 的驱动与方言），或用 Supabase / Aiven 的免费 MySQL。

---

## 默认管理员

- 用户名：`admin`
- 密码：`admin123`

请在部署时通过 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 环境变量修改，避免被他人登录。

后台入口：`/#/admin/login`（hash 路由）。

---

## API 一览

| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | 管理员登录，返回 JWT | 否 |
| GET | `/api/profile` | 获取个人资料 + 简历 | 否 |
| PUT | `/api/profile` | 更新资料 | 是 |
| GET | `/api/posts?page=&size=` | 笔记列表（分页） | 否 |
| GET | `/api/posts/{id}` | 笔记详情 | 否 |
| POST/PUT/DELETE | `/api/posts[/id]` | 增改删笔记 | 是 |
| GET | `/api/works` | 作品列表 | 否 |
| GET | `/api/works/{id}` | 作品详情 | 否 |
| POST/PUT/DELETE | `/api/works[/id]` | 增改删作品 | 是 |
| POST | `/api/upload` | 上传媒体，返回 URL | 是 |

所有受保护接口需在请求头带 `Authorization: Bearer <token>`。
