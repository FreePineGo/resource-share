# 网盘资源分享站

一个静态资源分享网站，通过 Excel 管理内容，支持百度收录优化。

## 特性

- 📊 Excel 管理内容，方便更新
- 🚀 静态页面，访问快速
- 🌙 深色科技风设计
- 🔍 Fuse.js 全文搜索
- 📱 响应式设计
- 🕷️ SEO 优化（sitemap、结构化数据、百度主动推送）
- ☁️ 支持 Cloudflare Pages / GitHub Pages / Vercel 部署

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 编辑数据

编辑 `data/resources.xlsx`，每个分类一个 Sheet。

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| name | ✅ | 资源名称 |
| link | ✅ | 网盘链接 |
| code | ❌ | 提取码 |
| cover | ❌ | 封面图 URL 或本地路径 |
| size | ❌ | 文件大小 |
| version | ❌ | 版本号 |
| description | ❌ | 简介 |
| updateTime | ❌ | 更新时间（格式：YYYY-MM-DD） |
| note | ❌ | 备注 |

### 3. 构建

```bash
npm run build
```

### 4. 本地预览

直接打开 `dist/index.html` 即可。

## 部署

详细部署指南请查看 [docs/DEPLOY.md](docs/DEPLOY.md)

### Cloudflare Pages（推荐）

1. 推送代码到 GitHub
2. 在 Cloudflare Pages 连接仓库
3. 构建命令：`npm run build`
4. 输出目录：`dist`

### GitHub Pages

1. 推送代码到 GitHub
2. Settings → Pages → Source: GitHub Actions
3. 使用提供的 workflow 自动部署

## 目录结构

```
resource-share/
├── data/
│   └── resources.xlsx      # Excel 数据源
├── src/
│   ├── css/style.css       # 样式
│   ├── js/search.js        # 搜索逻辑
│   ├── images/             # 封面图
│   └── robots.txt          # SEO
├── scripts/
│   ├── build.js            # 构建脚本
│   └── baidu-push.js       # 百度推送
├── template/
│   ├── index.eta           # 首页模板
│   └── category.eta        # 分类页模板
├── dist/                   # 生成的静态文件
└── .github/workflows/      # CI/CD
```

## 百度收录优化

### sitemap

构建时自动生成 `sitemap.xml`，提交到百度搜索资源平台。

### 主动推送

```bash
# 设置环境变量后推送
BAIDU_SITE=your-domain.com BAIDU_TOKEN=your_token npm run push
```

获取 token：https://ziyuan.baidu.com/linksubmit/index

## 自定义

### 修改域名

构建时设置 `SITE_URL` 环境变量：

```bash
SITE_URL=https://your-domain.com npm run build
```

### 修改分类

编辑 `scripts/build.js` 中的 `CATEGORIES` 数组。

### 修改样式

编辑 `src/css/style.css`。

## License

MIT