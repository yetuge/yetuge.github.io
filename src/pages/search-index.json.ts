import { getCollection } from 'astro:content';
import { withBase } from '../utils/site';

/**
 * 构建时生成全站搜索索引（JSON）。
 * 客户端在 /search/ 页面拉取后做纯文本匹配，中文按子串匹配，无需分词。
 */
export async function GET() {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate - a.data.pubDate
  );

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    category: post.data.category ?? '',
    date: post.data.pubDate.toISOString().slice(0, 10),
    url: withBase(`/posts/${post.id}/`),
    // 正文截断，控制索引体积；纯 markdown 文本足够匹配用
    text: (post.body ?? '').slice(0, 4000),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
