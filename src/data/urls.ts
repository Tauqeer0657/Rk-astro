import { URL_STRATEGY } from '../../astro.config.mjs';

export const strategy = (URL_STRATEGY as 'legacy' | 'clean');

/** Route param (no extension, no leading slash) — Astro's `build.format`
 *  turns this into `foo.html` (legacy) or `foo/index.html` (clean). */
export function postParam(legacySlug: string): string {
  return strategy === 'legacy'
    ? `blogs/${legacySlug}`
    : `blog/${legacySlug.replace(/-\d+$/, '')}`;
}

/** Href for a blog post. */
export const postUrl = (legacySlug: string) =>
  strategy === 'legacy' ? `/blogs/${legacySlug}.html` : `/blog/${legacySlug.replace(/-\d+$/, '')}`;

/** Href for a normal page. Pass the bare slug ('about-us'). */
export function pageUrl(slug: string): string {
  if (!slug || slug === 'index') return '/';
  return strategy === 'legacy' ? `/${slug}.html` : `/${slug}`;
}

export const abs = (path: string, site = 'https://raghavendrakulkarni.com') => new URL(path, site).href;
