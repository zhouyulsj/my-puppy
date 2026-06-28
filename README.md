# my-puppy

静态前端网站——用于宠物（犬只）管理/展示，已部署到 GitHub Pages：
https://zhouyulsj.github.io/my-puppy/

> 说明：当前仓库 gh-pages 分支主要包含构建产物（index.html、js/、css/ 等）。为了可维护性与协作，建议把未压缩/未构建的源码放到主分支（例如 `main`），并通过 CI 自动构建后将产物发布到 gh-pages。

## 仓库现状
- 部署分支：gh-pages（包含构建产物）
- 主要文件：index.html、js/（打包后的 JS 文件）、css/（打包后的 CSS 文件）

## 本地预览（仅针对构建产物）
在包含构建产物的目录运行静态服务器：

- Python 3：
  - python -m http.server 8080
  - 访问 http://localhost:8080

- npm（http-server）：
  - npx http-server -p 8080
  - 访问 http://localhost:8080

> 如果站点使用 hash 路由（URL 中带 #），直接打开 index.html 或用静态服务器通常可以正常访问；若使用 history 模式路由，需要服务器端回退到 index.html。

## 开发者建议（如何把项目变成可持续维护的仓库）
1. 在主分支（例如 `main`）保留源码：
   - 添加目录：`src/`（源码）、`public/`（静态资源）、`package.json`、`.gitignore` 等。
2. 提供常用脚本：
   - `npm run dev`（本地开发）
   - `npm run build`（生成构建产物到 `dist/` 或 `build/`）
   - `npm run lint`（静态检查）
3. 将 CI/CD 与部署接入：
   - 在 `main` 上运行测试与 lint，构建成功后自动把构建产物部署到 `gh-pages`（可使用 GitHub Actions）。
4. 补充文档：README、CONTRIBUTING、LICENSE、PR/Issue 模板等。

## 性能与可维护性优化建议（优先级排序）
- 高优先级
  - 将源码保存在主分支并自动部署到 gh-pages
  - 添加 README、LICENSE、.gitignore、CONTRIBUTING
  - 配置 CI（运行 lint/test）并自动部署
- 中优先级
  - 减小首包体积（代码拆分、移除未用依赖、tree-shaking）
  - 启用 ESLint/Prettier 与单元测试（Jest/Vitest）
- 低优先级
  - 提供（或有选择地生成）source maps；生产环境注意敏感信息
  - 可访问性（ARIA/语义化）与 SEO（meta 标签、sitemap）优化

## 我已在本分支中添加的文件
- README.md（本文件）
- LICENSE（MIT）
- .gitignore（常见前端/Node 忽略项）
- .github/workflows/deploy.yml（GitHub Actions 示例：在 main push 后构建并部署到 gh-pages）

## 如何贡献
1. Fork 并在 fork 中的 `main` 分支实现修改
2. 提交前运行 lint 与测试
3. 发起 PR 到上游仓库的 `main`（或对应分支）

## 许可
本仓库已添加 MIT 许可证（见 LICENSE 文件）。

---

如果你希望我继续：
- 我可以帮助把源码目录结构（示例 src/、package.json）和 CI 配置完善为可直接使用的模板；
- 或者我可以把工作流调整为你的具体构建命令（如果你使用 Vite/webpack 等，请告诉我构建输出目录名，例如 `dist/`）。
