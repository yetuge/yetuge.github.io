/**
 * 站点通用工具：链接前缀、日期格式化、阅读时长、分组。
 */

/**
 * 给内部链接加上部署 base 前缀。
 * Astro 5 中 import.meta.env.BASE_URL 在 base='/' 时为 '/'，在 base='/blog' 时为 '/blog'。
 * withBase('/about/') → 根域部署 '/about/'；子路径部署 '/blog/about/'
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = base.endsWith('/') ? base.slice(0, -1) : base; // '' 或 '/blog'
  return clean + (path.startsWith('/') ? path : '/' + path);
}

/** 格式化为 YYYY-MM-DD */
export function fmtDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 估算阅读时长：中文按 400 字/分钟，英文按 200 词/分钟 */
export function readingTime(text: string): string {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = text
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.max(1, Math.round(cjk / 400 + words / 200));
  return `${minutes} min`;
}

/** 按年份倒序分组（接受 CollectionEntry，日期在 data.pubDate） */
export function groupByYear<T extends { data: { pubDate: Date } }>(items: T[]): [number, T[]][] {
  const map = new Map<number, T[]>();
  for (const item of [...items].sort((a, b) => b.data.pubDate - a.data.pubDate)) {
    const y = item.data.pubDate.getFullYear();
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(item);
  }
  return [...map.entries()];
}

/** 统计分类的出现次数 */
export function countByCategory(items: { data: { category?: string } }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    const v = item.data.category;
    if (!v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return map;
}
