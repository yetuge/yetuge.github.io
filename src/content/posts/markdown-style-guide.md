---
title: Markdown 写作元素速查
description: 一篇文章过一遍博客支持的 Markdown 元素：标题、列表、引用、代码块、表格、图片，写文章时可以对照着用。
pubDate: 2026-09-24
category: 教程
tags: [Markdown, 写作]
---

这篇文章本身就是一个「元素展示页」：写文章时想不起某个语法怎么写，翻到这里照着抄就行。

## 行内元素

正文里可以混用**加粗**、*斜体*、`行内代码`，以及[链接文字](https://docs.astro.build)。行内代码适合出现变量名、命令、文件路径，比如 `npm run dev` 或者 `astro.config.mjs`。

删除线也支持：~~这是过期的想法~~。

## 代码块

代码块支持语法高亮，深浅色主题自动跟随站点切换。

```ts
// TypeScript 示例
interface Post {
  title: string;
  pubDate: Date;
  tags: string[];
}

export function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}
```

```bash
# 命令行示例
git add .
git commit -m "docs: 新文章"
git push origin main
```

```css
/* CSS 示例 */
.card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
```

## 列表

有序列表：

1. 新建一个 `.md` 文件放进 `src/content/posts/`
2. 补上 frontmatter（标题、日期、标签）
3. `git push`，CI 自动构建发布

无序列表：

- 支持多级嵌套
  - 二级内容
    - 三级也能用
- 任务列表：
  - [x] 搭好博客框架
  - [x] 写第一篇文章
  - [ ] 保持更新

## 引用

> 引用块适合摘录别人的话，或者补充一段和主线关系不大的说明。
>
> 引用里也可以有 **加粗** 和 `代码`。

## 表格

| 语法 | 用途 | 备注 |
| ---- | ---- | ---- |
| `#tag` | 标签 | 可多个，横切主题 |
| 分类 | 单个 | 纵向归类 |
| draft | 草稿开关 | `true` 时构建不输出 |

## 分隔线与图片

---

图片语法和标准 Markdown 一致：把图片放进 `public/` 目录，引用时路径带上部署前缀（当前为 `/blog`）。例如把 `avatar.png` 放进 `public/` 后这样写：

```markdown
![头像说明文字](/blog/avatar.png)
```

> 注意：`public/` 里的文件不会被自动加前缀，引用路径要手动带上 `/blog`。如果以后换了仓库名，记得同步改文章里的图片路径。
