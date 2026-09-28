// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: 部署前替换为你的真实信息，例如 GitHub 用户名 yetuge、仓库名 blog：
  //   site: 'https://yetuge.github.io',  base: '/blog'
  // 若仓库直接命名为 yetuge.github.io（个人主页仓库），则把 base 改为 '/'
  site: 'https://yourname.github.io',
  base: '/blog',
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
