# 个人博客

基于 [Astro](https://astro.build) 的静态个人博客，部署在 GitHub Pages。终端风界面，支持深浅色切换、分类、全文搜索、RSS 和 Sitemap。

## 常用命令

```bash
npm run dev      # 本地开发预览（http://localhost:4321），草稿可见
npm run build    # 构建到 dist/
npm run preview  # 预览正式构建结果
```

## 写新文章

在 `src/content/posts/` 下新建 `英文小写-连字符.md`，文件名即 URL。开头写 frontmatter：

```yaml
---
title: 文章标题            # 必填
description: 一两句摘要    # 必填
pubDate: 2026-09-28       # 必填
category: 学习笔记         # 可选，单分类
draft: true                # 可选，草稿不发布
---
```

之后是正常 Markdown 正文。`git push` 到 `main` 后自动构建发布。

## 改站点信息

**`src/config.ts`** —— 博客名、作者名、一句话介绍、社交链接，全部集中在这一个文件。

**`src/content/pages/about.md`** —— 「关于」页内容。

**`astro.config.mjs`** —— `site` 和 `base` 两行，部署前要改成你的真实仓库信息：

```js
site: 'https://<你的用户名>.github.io',
base: '/<仓库名>',            // 仓库若是 <用户名>.github.io 则改为 '/'
```

改完 `base` 记得全局搜索替换旧前缀（默认 `/blog`），文章里的图片路径也要同步。

## 部署（GitHub Pages）

1. 把 `astro.config.mjs` 里的 `site` / `base` 改成真实仓库信息
2. 在 GitHub 创建仓库并推送：
   ```bash
   git remote add origin https://github.com/<用户名>/<仓库名>.git
   git push -u origin main
   ```
3. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
4. 之后每次 push 到 `main`，Actions 自动构建发布（见 `.github/workflows/deploy.yml`）

## 目录结构

```
├── astro.config.mjs          # Astro 配置（site/base/代码高亮）
├── src/
│   ├── config.ts             # ★ 站点信息，改这里
│   ├── content.config.ts     # 内容集合字段定义
│   ├── content/
│   │   ├── posts/            # ★ 文章目录（.md）
│   │   └── pages/about.md    # 关于页
│   ├── layouts/BaseLayout.astro
│   ├── components/           # Header / Footer / PostCard
│   ├── pages/                # 各页面路由
│   │   ├── search-index.json.ts  # 搜索索引（构建时生成）
│   │   └── rss.xml.js        # RSS 输出
│   ├── styles/global.css     # 设计令牌与全局样式
│   └── utils/site.ts         # 工具函数
└── .github/workflows/deploy.yml  # GitHub Pages 部署
```
