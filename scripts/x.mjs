import {parse} from 'node-html-parser'; import fs from 'fs';
const r=parse(fs.readFileSync('theme-3-aurora/index.html','utf8'));
for(const s of ['header','.topbar','footer']){const e=r.querySelector(s); if(e){console.log(`\n===== ${s} =====`); console.log(e.outerHTML.replace(/\n\s*\n/g,'\n').slice(0,2600));}}
