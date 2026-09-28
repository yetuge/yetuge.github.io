// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 个人主页仓库：博客部署在 https://yetuge.github.io/ 根路径
  // 若以后改用普通仓库（如 blog），把 base 改为 '/blog' 并同步文章里的图片路径
  site: 'https://yetuge.github.io',
  base: '/',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'one-dark-pro',
      },
      defaultColor: false,
    },
  },
});
