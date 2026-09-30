import fs from 'fs';
const legacy = JSON.parse(fs.readFileSync('src/data/legacy-content.json', 'utf8'));
const OUT = 'src/content/services';
fs.mkdirSync(OUT, { recursive: true });

const META = {
  'advanced-prostate-care':        { title: 'Advanced Prostate Care', hero: 'prostate-ribbon.jpg', order: 1,
    short: 'ThuFLEP laser, Bipolar TURP, REZUM and MIST for enlarged prostate (BPH) and urinary symptoms.' },
  'kidney-stone-treatment':        { title: 'Kidney Stone Treatment', hero: 'kidney-model-pills.jpg', order: 2,
    short: 'RIRS, PCNL, MiniPerc and laser stone surgery — matched to stone size, location and complexity.' },
  'urological-cancer-care':        { title: 'Urological Cancer Care', hero: 'cancer-ribbon.jpg', order: 3,
    short: 'Kidney, bladder, prostate and testicular cancer surgery with organ preservation wherever safe.' },
  'additional-urology-expertise':  { title: 'Additional Urology Expertise', hero: 'urology-glow-hands.jpg', order: 4,
    short: 'Laparoscopic urology, andrology, female urology, reconstruction and paediatric urology.' },
};

const yaml = (s) => `"${String(s).replace(/"/g, '\\"').replace(/\s+/g, ' ').trim()}"`;

for (const [slug, m] of Object.entries(META)) {
  const page = legacy[slug];
  if (!page) { console.error('missing', slug); continue; }

  let md = page.sections[1].markdown
    .replace(/^!\[[^\]]*\]\([^)]*\)\s*/, '')          // drop the inline hero, the template renders it
    // heading lift, in this order: legacy h3 -> h2, then legacy h4 -> h3,
    // so "Treatments Offered" is an h2 and each procedure sits under it as an h3.
    .replace(/^### /gm, '## ')
    .replace(/^#### /gm, '### ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const fm = [
    '---',
    `title: ${yaml(m.title)}`,
    `description: ${yaml(page.description)}`,
    `short: ${yaml(m.short)}`,
    `hero: ${yaml('~/assets/img/' + m.hero)}`,
    `order: ${m.order}`,
    `legacyPath: ${yaml('/' + slug + '.html')}`,
    '---',
    '',
  ].join('\n');

  fs.writeFileSync(`${OUT}/${slug}.md`, fm + md + '\n');
  const h2 = (md.match(/^## /gm) || []).length, h3 = (md.match(/^### /gm) || []).length;
  console.log(`${slug.padEnd(32)} ${String(md.split(/\s+/).length).padStart(4)} words  h2=${h2} h3=${h3}`);
}
