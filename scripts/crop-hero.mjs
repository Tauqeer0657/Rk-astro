import sharp from 'sharp';

/** The supplied hero banners have the doctor's name and credentials BAKED IN
 *  as pixels. Google cannot read text in an image, so that headline carried no
 *  SEO value and it also collided with the real <h1> we overlay.
 *  We crop the text block away and keep the clinical artwork + the portrait;
 *  the headline is now real, indexable HTML. */
const jobs = [
  { in: 'src/assets/img/hero-desktop.jpg', out: 'src/assets/img/hero-desktop-clean.jpg', left: 700, width: 820 },
  { in: 'src/assets/img/hero-mobile.jpg',  out: 'src/assets/img/hero-mobile-clean.jpg',  left: 500, width: 500 },
];

for (const j of jobs) {
  const meta = await sharp(j.in).metadata();
  await sharp(j.in)
    .extract({ left: j.left, top: 0, width: Math.min(j.width, meta.width - j.left), height: meta.height })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(j.out);
  const after = await sharp(j.out).metadata();
  console.log(`${j.out}  ${meta.width}x${meta.height} -> ${after.width}x${after.height}`);
}
