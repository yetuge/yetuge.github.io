// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 主域名：https://y1y1.me（Vercel 托管，push 自动部署）；GitHub Pages 同步镜像
  site: 'https://y1y1.me',
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
