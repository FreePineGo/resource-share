# 项目记忆索引

> 记录重要项目信息，方便跨会话、跨设备访问

---

## 活跃项目

### 网盘资源分享站 (resource-share)

**状态：** 已完成，已部署

**简介：** 静态资源分享网站，Excel 管理内容，支持百度收录优化

**GitHub：** https://github.com/FreePineGo/resource-share

**详细文档：** [resource-share-project.md](./resource-share-project.md)

**关键命令：**
```bash
cd D:\workspace\resource-share
npm run build    # 构建静态文件
npm run push     # 百度推送
```

**部署平台：** Cloudflare Pages

---

## 技术偏好

- 部署优先 Cloudflare Pages（国内访问较好）
- 静态站点优先，便于维护
- Excel 作为数据源（用户友好）

---

## 相关文档位置

- 设计规范：`D:\workspace\docs\superpowers\specs\`
- 实现计划：`D:\workspace\docs\superpowers\plans\`