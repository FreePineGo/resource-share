# Cloudflare Pages 部署指南

## 前提条件

1. 一个 GitHub 账号
2. 一个 Cloudflare 账号（免费）
3. 一个域名（可选，Cloudflare Pages 会提供免费二级域名）

---

## 方式一：GitHub Actions 自动部署（推荐）

### 步骤 1：创建 GitHub 仓库

```bash
cd resource-share
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/resource-share.git
git push -u origin main
```

### 步骤 2：获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角头像 → **My Profile** → **API Tokens**
3. 点击 **Create Token**
4. 选择 **Edit Cloudflare Workers** 模板
5. 或者自定义权限：
   - `Account` → `Cloudflare Pages` → `Edit`
   - `Zone` → `DNS` → `Edit`（如果需要自定义域名）
6. 创建后复制 Token

### 步骤 3：获取 Cloudflare Account ID

1. 在 Cloudflare Dashboard 点击左侧 **Workers & Pages**
2. 右侧可以看到 **Account ID**，复制它

### 步骤 4：配置 GitHub Secrets

在你的 GitHub 仓库中：

1. **Settings** → **Secrets and variables** → **Actions**
2. 添加 **Repository secrets**：
   - `CLOUDFLARE_API_TOKEN`：步骤2获取的 Token
   - `CLOUDFLARE_ACCOUNT_ID`：步骤3获取的 Account ID

3. （可选）添加 **Variables** 用于百度推送：
   - `SITE_URL`：`https://你的域名.com`
   - `BAIDU_SITE`：`你的域名.com`

4. （可选）添加百度推送 Secret：
   - `BAIDU_TOKEN`：从百度搜索资源平台获取

### 步骤 5：推送代码触发部署

```bash
git add .
git commit -m "Update content"
git push
```

GitHub Actions 会自动构建并部署到 Cloudflare Pages。

---

## 方式二：Cloudflare Pages 直接连接（更简单）

### 步骤 1：推送代码到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/resource-share.git
git push -u origin main
```

### 步骤 2：连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击左侧 **Workers & Pages** → **Create application**
3. 选择 **Pages** → **Connect to Git**
4. 授权 GitHub 并选择 `resource-share` 仓库
5. 配置构建设置：
   - **Framework preset**：None
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Root directory**：`/`（如果仓库根目录就是项目，留空）
6. 点击 **Save and Deploy**

### 步骤 3：配置环境变量（可选）

在 Cloudflare Pages 项目设置中：

1. **Settings** → **Environment variables**
2. 添加变量：
   - `SITE_URL`：`https://你的域名.com`

---

## 绑定自定义域名

### 步骤 1：添加域名到 Cloudflare

1. 在 Cloudflare Dashboard 点击 **Add a site**
2. 输入你的域名
3. 按提示修改域名的 DNS 服务器为 Cloudflare 提供的

### 步骤 2：在 Pages 项目中绑定域名

1. 进入你的 Pages 项目
2. **Settings** → **Custom domains**
3. 点击 **Set up a custom domain**
4. 输入域名（如 `www.example.com` 或 `resources.example.com`）
5. Cloudflare 会自动添加 DNS 记录

### 步骤 3：更新配置

修改以下文件中的域名：

1. `scripts/build.js` 中的 `SITE_URL`
2. `src/robots.txt` 中的 sitemap URL
3. `template/index.eta` 和 `template/category.eta` 中的 canonical URL

或在 GitHub Actions 中设置 `SITE_URL` 变量。

---

## 常见问题

### Q: 构建失败怎么办？

查看 GitHub Actions 的日志，常见问题：
- `npm ci` 失败：删除 `package-lock.json` 重新生成
- 找不到模块：检查 `package.json` 依赖

### Q: 如何手动触发部署？

在 GitHub 仓库：
- **Actions** → 选择 workflow → **Run workflow**

### Q: 如何查看部署的网站？

- Cloudflare 会提供 `xxx.pages.dev` 的免费域名
- 绑定自定义域名后可以通过自定义域名访问

### Q: 百度推送失败？

检查：
- `BAIDU_TOKEN` 是否正确
- `BAIDU_SITE` 是否与实际域名一致
- 域名是否已在百度搜索资源平台验证