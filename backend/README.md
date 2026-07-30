# 后端（Spring Boot）

个人网站的后端 API。提供资料、图文笔记、作品的管理与公开读取，以及媒体上传。

## 运行

需要 **Java 17** 与 **Maven**。

```bash
# 本地开发（H2 内存库 + 本地磁盘存储，自动写入示例数据）
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 打成 jar
mvn clean package -DskipTests
java -jar target/portfolio-backend-1.0.0.jar
```

开发模式访问：

- API: http://localhost:8080/api
- H2 控制台: http://localhost:8080/h2-console （JDBC URL: `jdbc:h2:mem:portfolio`）

## 配置

主配置 `src/main/resources/application.yml`，按 `spring.profiles.active` 加载：

- `application-dev.yml`：H2 + 本地存储，用于本地开发
- `application-prod.yml`：MySQL + 对象存储，用于生产部署

所有敏感项通过环境变量注入（见仓库根目录 `README.md` 的环境变量表）。

## 存储说明

- 开发（`STORAGE_MODE=local`）：文件存到 `storage.upload-dir`（默认 `./uploads`），通过 `/files/**` 静态访问。
- 生产（`STORAGE_MODE=cloudinary`）：上传到 Cloudinary，返回 `secure_url`。需要设置 `CLOUDINARY_*` 三个环境变量。

## 安全

- Spring Security 6，无状态（JWT）。
- 公开接口：`GET /api/profile`、`GET /api/posts/**`、`GET /api/works/**`。
- 管理接口需 `Authorization: Bearer <token>`。
- 默认管理员账号来自 `ADMIN_USERNAME` / `ADMIN_PASSWORD`（首次启动自动建账号）。
