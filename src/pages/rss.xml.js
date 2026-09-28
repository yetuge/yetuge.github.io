import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';
import { withBase } from '../utils/site';

export async function GET(context) {
  const posts = (await getCollection('posts', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate - a.data.pubDate
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    // 频道地址带上部署前缀（如 /blog/）
    site: new URL(withBase('/'), context.site),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: [...(post.data.category ? [post.data.category] : []), ...post.data.tags],
      // withBase 已包含部署前缀，绝对地址由 @astrojs/rss 拼接
      link: withBase(`/posts/${post.id}/`),
    })),
    customData: '<language>zh-cn</language>',
  });
}
