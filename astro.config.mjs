// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // 主部署：Vercel（push 自动部署）；GitHub Pages 同步镜像（如不再需要可删 .github/workflows/deploy.yml）
  site: 'https://yetuge-blog.vercel.app',
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
