import { parse } from 'node-html-parser';
import fs from 'fs';
import path from 'path';

const DIST = 'dist';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : path.join(d, e.name));

const pages = walk(DIST).filter((f) => f.endsWith('.html'));
const issues = [];
const add = (sev, page, msg) => issues.push({ sev, page: page.replace(`${DIST}/`, ''), msg });

for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  const r = parse(html);
  const rel = f.replace(`${DIST}/`, '');
  const noindex = /noindex/.test(r.querySelector('meta[name="robots"]')?.getAttribute('content') || '');

  const title = r.querySelector('title')?.structuredText.trim() || '';
  if (!title) add('ERROR', f, 'missing <title>');
  else if (title.length > 60) add('WARN', f, `title ${title.length} chars (Google truncates ~60): "${title.slice(0, 62)}…"`);

  const desc = r.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  if (!desc) add('ERROR', f, 'missing meta description');
  else if (desc.length > 165) add('WARN', f, `description ${desc.length} chars (truncates ~160)`);
  else if (desc.length < 70) add('WARN', f, `description only ${desc.length} chars — thin`);

  if (!noindex && !r.querySelector('link[rel="canonical"]')) add('ERROR', f, 'missing canonical');
  if (!noindex && !r.querySelector('meta[property="og:title"]')) add('ERROR', f, 'missing Open Graph');
  if (!noindex && !r.querySelector('meta[name="twitter:card"]')) add('ERROR', f, 'missing Twitter card');

  const h1 = r.querySelectorAll('h1');
  if (h1.length === 0) add('ERROR', f, 'no <h1>');
  if (h1.length > 1) add('ERROR', f, `${h1.length} <h1> tags (must be exactly 1)`);

  const ld = r.querySelectorAll('script[type="application/ld+json"]');
  if (!noindex && !ld.length) add('ERROR', f, 'no JSON-LD structured data');
  for (const s of ld) {
    try { JSON.parse(s.rawText); } catch { add('ERROR', f, 'invalid JSON-LD — will not parse'); }
  }

  for (const img of r.querySelectorAll('img')) {
    if (!img.getAttribute('src')) continue; // JS-populated viewer, not content
    if (img.getAttribute('alt') === null) add('ERROR', f, `img without alt: ${(img.getAttribute('src') || '').slice(-48)}`);
    if (!img.getAttribute('width') || !img.getAttribute('height')) {
      add('WARN', f, `img without width/height (causes CLS): ${(img.getAttribute('src') || '').slice(-40)}`);
    }
  }

  // internal links must not point at the old extensionless duplicates
  for (const a of r.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') || '';
    // Under the clean-URL strategy the extensionless form IS canonical, so
    // only flag a link that would actually take a redirect hop: a stale
    // `.html` link, or a WordPress-era trailing slash.
    if (/\.html($|[?#])/.test(href) && !href.startsWith('http')) {
      add('WARN', f, `links to legacy ${href} — will take a 301 hop`);
    }
    if (/^\/.+\/$/.test(href)) {
      add('WARN', f, `links to trailing-slash ${href} — will take a 301 hop`);
    }
    if (href.startsWith('http') && !href.includes('raghavendrakulkarni.com') && !/rel="[^"]*noopener/.test(a.toString())) {
      if (a.getAttribute('target') === '_blank' && !(a.getAttribute('rel') || '').includes('noopener')) {
        add('WARN', f, `external _blank link without rel=noopener: ${href.slice(0, 40)}`);
      }
    }
  }
}

if (!fs.existsSync(`${DIST}/robots.txt`)) add('ERROR', DIST, 'robots.txt not generated');
if (!fs.existsSync(`${DIST}/sitemap-index.xml`)) add('ERROR', DIST, 'sitemap not generated');

const errs = issues.filter((i) => i.sev === 'ERROR');
const warns = issues.filter((i) => i.sev === 'WARN');

const group = (list) => {
  const by = {};
  for (const i of list) (by[i.page] ||= []).push(i.msg);
  return by;
};

console.log(`\nScanned ${pages.length} pages — ${errs.length} errors, ${warns.length} warnings\n`);
for (const [label, list] of [['ERRORS', errs], ['WARNINGS', warns]]) {
  if (!list.length) continue;
  console.log(`===== ${label} =====`);
  for (const [page, msgs] of Object.entries(group(list))) {
    console.log(`\n  ${page}`);
    [...new Set(msgs)].forEach((m) => console.log(`    - ${m}`));
  }
  console.log('');
}
process.exit(errs.length ? 1 : 0);
