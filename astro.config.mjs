import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkReadingTime } from './scripts/remark-reading-time.mjs';

/**
 * URL STRATEGY SWITCH  — the single decision still pending on Search Console data.
 *
 * DECIDED 2026-09-20: 'clean'. Search Console URL Inspection showed the site
 * is entirely unindexed — homepage and inner pages all "URL is not on Google"
 * with every field N/A, meaning Google had never even crawled them. There was
 * no ranking to preserve, so we took the one-time chance to drop the .html
 * suffix and the meaningless WordPress post ids. Every legacy URL 301s here.
 *
 *   'legacy' : emit the exact URLs the live site uses today, including the
 *              `.html` suffix and the WordPress numeric ids
 *              (/about-us.html, /blogs/kidney-stones-...-25964.html).
 *              Zero ranking risk. Extensionless duplicates are 301'd away.
 *
 *   'clean'  : emit /about-us and /blog/kidney-stones-risk-factors and 301
 *              every legacy URL onto it.
 *
 * Flip this one value, re-run `npm run build`, and both the routes and the
 * generated nginx redirect map follow automatically. Nothing else changes.
 */
export const URL_STRATEGY = process.env.URL_STRATEGY || 'clean';

export default defineConfig({
  site: 'https://raghavendrakulkarni.com',
  trailingSlash: 'never',
  build: {
    // legacy mode needs real .html files, not /about-us/index.html
    format: URL_STRATEGY === 'legacy' ? 'file' : 'directory',
    inlineStylesheets: 'auto',
  },
  image: {
    // let Astro emit AVIF/WebP + responsive srcsets from the existing JPGs
    responsiveStyles: true,
    layout: 'constrained',
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
    shikiConfig: { theme: 'github-light', wrap: true },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        if (item.url === 'https://raghavendrakulkarni.com/') item.priority = 1.0;
        else if (/prostate|cancer|kidney-stone|urology-expertise/.test(item.url)) item.priority = 0.9;
        else if (item.url.includes('/blog')) item.priority = 0.7;
        else item.priority = 0.6;
        return item;
      },
    }),
  ],
});
