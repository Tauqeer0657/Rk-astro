import { parse } from 'node-html-parser';
import fs from 'fs';
const D=process.env.SRC;
for (const f of ['advanced-prostate-care.html','about-us.html','gallery.html','index.html']) {
  const r=parse(fs.readFileSync(`${D}/${f}`,'utf8'));
  console.log(`\n================ ${f} ================`);
  console.log('TITLE:', r.querySelector('title')?.structuredText.trim());
  console.log('H1   :', r.querySelectorAll('h1').map(h=>h.structuredText.trim()).join(' || '));
  console.log('SECTIONS:');
  r.querySelectorAll('section').forEach(s=>{
    const cls=(s.getAttribute('class')||'').replace(/reveal|anim-[a-z0-9-]+/g,'').trim();
    const h=s.querySelector('h1,h2')?.structuredText.trim()||'(no heading)';
    console.log(`   [${cls}] ${h.slice(0,70)}`);
  });
  console.log('H2 count:', r.querySelectorAll('h2').length, '| imgs:', r.querySelectorAll('img').length);
}
