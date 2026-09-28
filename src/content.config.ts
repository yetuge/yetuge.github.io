import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    /** 文章标题 */
    title: z.string(),
    /** 摘要，列表和 RSS 中显示 */
    description: z.string(),
    /** 发布日期，如 2026-09-28 */
    pubDate: z.coerce.date(),
    /** 最后修改日期，可选 */
    updatedDate: z.coerce.date().optional(),
    /** 分类，单个，可选 */
    category: z.string().optional(),
    /** 草稿：true 时正式构建中不显示 */
    draft: z.boolean().default(false),
  }),
});

/** 独立页面（如「关于」） */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { posts, pages };
