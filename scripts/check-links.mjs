import { parse } from 'node-html-parser';
import fs from 'fs';
import path from 'path';

const DIST = 'dist';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(path.join(d, e.name)) : path.join(d, e.name));
const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const exists = new Set(files.map((f) => '/' + path.relative(DIST, f)));

let broken = 0, checked = 0;
const ids = new Map();
for (const f of pages) ids.set('/' + path.relative(DIST, f),
  new Set(parse(fs.readFileSync(f, 'utf8')).querySelectorAll('[id]').map((e) => e.getAttribute('id'))));

for (const f of pages) {
  const rel = '/' + path.relative(DIST, f);
  const r = parse(fs.readFileSync(f, 'utf8'));
  for (const a of r.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    checked++;
    const [p, hash] = href.split('#');
    let target = p || rel;

    // Resolve a link to the file that actually serves it. The build emits
    // either `about-us.html` (legacy strategy) or `about-us/index.html`
    // (clean strategy), so accept whichever exists.
    const candidates =
      target === '/'
        ? ['/index.html']
        : target.endsWith('.html')
          ? [target]
          : [`${target}.html`, `${target}/index.html`, target];
    const hit = candidates.find((c) => exists.has(c));
    if (p && !hit) { console.log(`BROKEN  ${rel}  ->  ${href}`); broken++; continue; }
    target = hit ?? target;
    if (hash && ids.get(target) && !ids.get(target).has(hash)) {
      console.log(`BAD ANCHOR  ${rel}  ->  ${href}`); broken++;
    }
  }
}
console.log(`\nchecked ${checked} internal links across ${pages.length} pages — ${broken} broken`);
process.exit(broken ? 1 : 0);
