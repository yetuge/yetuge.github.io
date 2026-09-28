/**
 * 站点配置 —— 改这里就能改全站
 * 标题、作者、简介、社交链接都集中在这一个文件。
 */
export const SITE = {
  /** 浏览器标签页标题 / RSS 标题 */
  title: '~/yetuge',
  /** 页头品牌名（终端风），与 title 保持一致 */
  name: 'yetuge',
  /** 你的名字 */
  author: 'yetuge',
  /** 一句话介绍 */
  description: '南航学生，开源贡献者；记录学习、踩坑与思考。',
  /** 社交链接，留空字符串则不显示 */
  links: {
    github: 'https://github.com/yetuge',
    email: '',
    bilibili: '',
    zhihu: '',
  },
} as const;

/** 全站页脚起始年份 */
export const SITE_START_YEAR = 2026;
