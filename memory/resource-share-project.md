# 项目记忆：网盘资源分享站

> 创建时间：2026-03-23
> 项目地址：https://github.com/FreePineGo/resource-share

## 项目概述

一个静态资源分享网站，用于分享网盘游戏、短剧等资源。

**核心功能：**
- Excel 管理内容，脚本生成静态 HTML
- 深色科技风设计
- Fuse.js 全文搜索
- SEO 优化（sitemap、结构化数据、百度主动推送）
- 支持多平台部署

## 技术栈

| 技术 | 用途 |
|------|------|
| Node.js >= 16 | 运行环境 |
| xlsx | 读取 Excel |
| Eta | 模板引擎 |
| Fuse.js (CDN) | 前端搜索 |

## 本地开发

```bash
cd D:\workspace\resource-share
npm install
npm run build
# 打开 dist/index.html 预览
```

## 数据管理

**Excel 文件：** `data/resources.xlsx`

**5 个分类（每个一个 Sheet）：**
- 手机游戏
- 电脑游戏
- PS4游戏
- SWITCH游戏
- 短剧资源

**字段：**
| 字段 | 必填 | 说明 |
|------|------|------|
| name | ✅ | 资源名称 |
| link | ✅ | 网盘链接 |
| code | ❌ | 提取码 |
| cover | ❌ | 封面图（URL 或本地路径） |
| size | ❌ | 文件大小 |
| version | ❌ | 版本号 |
| description | ❌ | 简介 |
| updateTime | ❌ | 更新时间 YYYY-MM-DD |
| note | ❌ | 备注 |

## 项目结构

```
resource-share/
├── data/resources.xlsx      # 数据源
├── src/
│   ├── css/style.css        # 样式
│   ├── js/search.js         # 搜索逻辑
│   ├── images/              # 本地封面图
│   └── robots.txt           # SEO
├── scripts/
│   ├── build.js             # 构建脚本
│   └── baidu-push.js        # 百度推送
├── template/
│   ├── index.eta            # 首页模板
│   └── category.eta         # 分类页模板
├── dist/                    # 生成的静态文件
├── docs/DEPLOY.md           # 部署文档
└── README.md
```

## 部署信息

**GitHub 仓库：** https://github.com/FreePineGo/resource-share

**部署平台：** Cloudflare Pages（推荐）

### Cloudflare Pages 配置

- Build command: `npm run build`
- Build output: `dist`

### 部署步骤

1. 登录 Cloudflare Dashboard
2. Workers & Pages → Create application → Pages → Connect to Git
3. 选择 GitHub 仓库 `resource-share`
4. 填入构建配置，部署

### 自定义域名

部署后在 Cloudflare Pages → Settings → Custom domains 添加域名。

**修改域名后需要更新：**
- `scripts/build.js` 中的 `SITE_URL`
- `src/robots.txt` 中的 sitemap URL
- 或设置环境变量 `SITE_URL`

## 百度收录

### 提交 sitemap

1. 登录 https://ziyuan.baidu.com/
2. 用户中心 → 站点管理 → 添加站点
3. 验证后 → 链接提交 → sitemap → 提交 `https://你的域名/sitemap.xml`

### 主动推送

```bash
BAIDU_SITE=你的域名.com BAIDU_TOKEN=你的token npm run push
```

获取 token：https://ziyuan.baidu.com/linksubmit/index

## 环境变量

| 变量 | 说明 |
|------|------|
| `SITE_URL` | 站点完整 URL |
| `BAIDU_PUSH` | 设为 `true` 启用百度推送 |
| `BAIDU_SITE` | 域名（不含 https://） |
| `BAIDU_TOKEN` | 百度推送 token |

## 设计决策

1. **纯静态** - 无后端，方便部署
2. **Excel 数据源** - 用户熟悉，方便管理
3. **Eta 模板** - 轻量，生成纯 HTML
4. **深色科技风** - 用户选择的配色
5. **首页大图布局** - Hero + 分类入口 + 卡片网格

## 常见操作

### 更新内容

1. 编辑 `data/resources.xlsx`
2. 运行 `npm run build`
3. 推送到 GitHub：`git add . && git commit -m "update" && git push`

### 添加新分类

1. 在 `scripts/build.js` 的 `CATEGORIES` 数组添加
2. 在 Excel 添加对应 Sheet
3. 重新构建

### 修改样式

编辑 `src/css/style.css`，重新构建。

## 相关文件

- 设计文档：`D:\workspace\docs\superpowers\specs\2026-03-22-resource-share-design.md`
- 实现计划：`D:\workspace\docs\superpowers\plans\2026-03-22-resource-share.md`