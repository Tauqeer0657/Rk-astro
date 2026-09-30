import { parse } from 'node-html-parser';
import TurndownService from 'turndown';
import fs from 'fs';
import path from 'path';

const SRC = process.env.SRC;
const OUT = 'src/content/blog';
fs.mkdirSync(OUT, { recursive: true });

const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
td.remove(['script', 'style']);

const yaml = (s = '') => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\s+/g, ' ').trim()}"`;

// category inferred from the content topic
const CATS = [
  [/prostatomegaly|prostate|bph|prostatitis/i, 'Prostate Health'],
  [/uti|urinary tract infection/i, 'Infections & UTI'],
  [/stone/i, 'Kidney Stones'],
  [/diet|hydration|lifestyle|prevent/i, 'Prevention & Diet'],
  [/voiding/i, 'Bladder Health'],
];
const catOf = (t) => (CATS.find(([re]) => re.test(t)) || [, 'Urology'])[1];

// listing page gives us order + excerpt + image
const listing = parse(fs.readFileSync(`${SRC}/blog.html`, 'utf8'));
const order = listing.querySelectorAll('.blog-card').map((c) => ({
  href: c.querySelector('a')?.getAttribute('href') || '',
  img: c.querySelector('img')?.getAttribute('src') || '',
  excerpt: (c.querySelector('p')?.structuredText || '').replace(/\s+/g, ' ').replace(/Read More$/, '').trim(),
}));

const total = order.length;
const rows = [];

order.forEach((entry, idx) => {
  const file = path.basename(entry.href);
  const full = `${SRC}/blogs/${file}`;
  if (!fs.existsSync(full)) { console.error('MISSING', file); return; }

  const doc = parse(fs.readFileSync(full, 'utf8'));
  const title = doc.querySelector('title')?.structuredText.trim() || '';
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || entry.excerpt;
  const body = doc.querySelector('.post-content');
  const featured = doc.querySelector('.post__featured img');

  // WP post id from the filename tail -> preserves original identity + ordering
  const wpId = (file.match(/-(\d+)\.html$/) || [, null])[1];
  const slug = file.replace(/\.html$/, '');

  // first <p> that is really a section heading (WP export demoted it) -> promote to h2
  const first = body.querySelector('p');
  if (first && /^[A-Z][^.!?]{5,70}\??$/.test(first.structuredText.trim()) && first.structuredText.trim().split(' ').length <= 10) {
    first.replaceWith(`<h2>${first.innerHTML}</h2>`);
  }

  // rewrite image paths to the Astro asset location
  body.querySelectorAll('img').forEach((im) => {
    const s = (im.getAttribute('src') || '').replace(/^\.\.\//, '/');
    im.setAttribute('src', s);
  });

  let md = td.turndown(body.innerHTML).replace(/\n{3,}/g, '\n\n').trim();

  // newest first in the listing -> synthesise a descending placeholder date
  const d = new Date(2026, 8, 10);
  d.setDate(d.getDate() - idx * 14);
  const iso = d.toISOString().slice(0, 10);

  const heroSrc = (featured?.getAttribute('src') || entry.img).replace(/^\.\.\//, '').replace(/^assets\//, '');

  const fm = [
    '---',
    `title: ${yaml(title)}`,
    `description: ${yaml(desc)}`,
    `pubDate: ${iso}`,
    `datePlaceholder: true`,
    `category: ${yaml(catOf(title))}`,
    `hero: ${yaml('~/assets/' + heroSrc)}`,
    `heroAlt: ${yaml(featured?.getAttribute('alt') || title)}`,
    `legacyId: ${yaml(wpId)}`,
    `legacyPath: ${yaml('/blogs/' + file)}`,
    `order: ${total - idx}`,
    '---',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(OUT, `${slug}.md`), fm + md + '\n');
  rows.push({ slug, title: title.slice(0, 55), words: md.split(/\s+/).length, h2: (md.match(/^## /gm) || []).length, cat: catOf(title) });
});

console.table(rows);
console.log('extracted', rows.length, 'posts ->', OUT);
