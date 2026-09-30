import { parse } from 'node-html-parser';
import fs from 'fs';
const D=process.env.SRC;
const r=parse(fs.readFileSync(`${D}/blog.html`,'utf8'));
const cards=r.querySelectorAll('.blog-card, .post-card, article');
console.log('card count:', cards.length);
cards.slice(0,3).forEach((c,i)=>{
  console.log(`\n--- card ${i} (class=${c.getAttribute('class')}) ---`);
  console.log('text:', c.structuredText.trim().replace(/\s+/g,' ').slice(0,220));
  console.log('href:', c.querySelector('a')?.getAttribute('href'));
  console.log('img :', c.querySelector('img')?.getAttribute('src'));
});
console.log('\n=== H1 of blog page ===', r.querySelector('h1')?.structuredText.trim());
console.log('=== any dates in page ===');
console.log([...new Set((r.text.match(/\b\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/g)||[]))].slice(0,15));
