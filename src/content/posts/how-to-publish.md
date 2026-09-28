---
title: 如何发布一篇新文章
description: 从新建 Markdown 文件到自动发布上线的完整流程，以及 frontmatter 字段速查。
pubDate: 2026-09-28
category: 站务
---

把发布流程记录下来，省得每次都要回忆一遍。整个过程只有三步。

## 第一步：新建文件

在 `src/content/posts/` 下新建一个 `.md` 文件。**文件名就是文章的 URL**，建议用英文小写加连字符：

```
src/content/posts/
├── hello-world.md        → /posts/hello-world/
├── markdown-style-guide.md → /posts/markdown-style-guide/
└── my-new-post.md        → /posts/my-new-post/
```

## 第二步：写 frontmatter

文件开头是一段 YAML 元信息，字段含义如下：

```yaml
---
title: 文章标题            # 必填
description: 一两句摘要    # 必填，列表和 RSS 里会显示
pubDate: 2026-09-28       # 必填，发布日期
updatedDate: 2026-10-01   # 可选，修改日期
category: 学习笔记         # 可选，单分类
draft: false               # 可选，true 时草稿不发布
---
```

frontmatter 之后就是正文，全部使用标准 Markdown 语法。

## 第三步：发布

```bash
git add .
git commit -m "docs: 新文章《文章标题》"
git push origin main
```

推送到 `main` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages，大约一分钟后生效。本地想先看效果的话：

```bash
npm run dev      # 开发预览，草稿也会显示
npm run build    # 构建产物到 dist/
npm run preview  # 预览正式构建结果（草稿不显示）
```

## 一个约定

- **摘要（description）认真写**：它是首页卡片、RSS 和搜索结果里的第一印象，比标题多承担一层信息。
