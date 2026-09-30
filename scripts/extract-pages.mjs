import { parse } from 'node-html-parser';
import TurndownService from 'turndown';
import fs from 'fs';

const SRC = process.env.SRC;
const OUT = 'src/content/pages';
fs.mkdirSync(OUT, { recursive: true });
const td = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-' });
td.remove(['script', 'style']);

const PAGES = [
  'index.html', 'about-us.html', 'contact-us.html', 'gallery.html', 'blog.html',
  'advanced-prostate-care.html', 'urological-cancer-care.html',
  'additional-urology-expertise.html', 'kidney-stone-treatment.html',
];

const dump = {};

for (const f of PAGES) {
  const r = parse(fs.readFileSync(`${SRC}/${f}`, 'utf8'));
  const slug = f.replace(/\.html$/, '');

  // strip chrome that becomes a shared layout in Astro
  ['.topbar', '.site-header', '.site-footer', 'footer', '.skip-link', 'script', 'style', '.breadcrumb'].forEach((s) =>
    r.querySelectorAll(s).forEach((e) => e.remove())
  );

  const sections = r.querySelectorAll('section').map((s) => {
    const cls = s.getAttribute('class') || '';
    s.querySelectorAll('img').forEach((im) => im.setAttribute('src', (im.getAttribute('src') || '').replace(/^\.\.\//, '')));
    return {
      cls: cls.replace(/\b(reveal|anim-[a-z0-9-]+)\b/g, '').replace(/\s+/g, ' ').trim(),
      heading: s.querySelector('h1,h2')?.structuredText.trim() || null,
      images: s.querySelectorAll('img').map((i) => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') || '' })),
      markdown: td.turndown(s.innerHTML).replace(/\n{3,}/g, '\n\n').trim(),
    };
  });

  dump[slug] = {
    title: r.querySelector('title')?.structuredText.trim(),
    description: r.querySelector('meta[name="description"]')?.getAttribute('content')?.trim(),
    h1: r.querySelector('h1')?.structuredText.trim(),
    legacyPath: '/' + f,
    sections,
  };

  console.log(`${slug.padEnd(32)} sections=${String(sections.length).padStart(2)}  chars=${sections.reduce((a, s) => a + s.markdown.length, 0)}`);
}

fs.writeFileSync('src/data/legacy-content.json', JSON.stringify(dump, null, 2));
console.log('\nwrote src/data/legacy-content.json');
