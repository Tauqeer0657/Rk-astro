import { parse } from 'node-html-parser';
import fs from 'fs';
const SRC = process.env.SRC;
const r = parse(fs.readFileSync(`${SRC}/index.html`, 'utf8'));
const cards = r.querySelectorAll('.review-card');
const out = cards.map((c) => {
  const t = (s) => c.querySelector(s)?.structuredText.replace(/\s+/g, ' ').trim() || '';
  const stars = (t('.review-card__stars').match(/★/g) || []).length;
  const body = c.querySelectorAll('p').map((p) => p.structuredText.replace(/\s+/g, ' ').trim()).filter(Boolean).sort((a, b) => b.length - a.length)[0] || '';
  const head = c.structuredText.replace(/\s+/g, ' ').trim();
  const m = head.match(/^([A-Za-z][A-Za-z .]{2,40}?)\s+(\d+\s+\w+\s+ago|\w+\s+ago)/);
  return { name: m ? m[1].trim() : t('.review-card__name'), when: m ? m[2] : t('.review-card__date'), rating: stars || 5, text: body };
}).filter((x) => x.text.length > 40);
fs.writeFileSync('src/data/reviews.json', JSON.stringify(out, null, 2));
console.log('extracted', out.length, 'reviews');
out.forEach((o) => console.log(` - ${o.name} (${o.when}) ${o.rating}★ : ${o.text.slice(0, 70)}…`));
