import { toString } from 'mdast-util-to-string';

/** Adds `words` + `minutes` to each post's frontmatter so the template can
 *  render an honest reading time without shipping any client JS. */
export function remarkReadingTime() {
  return (tree, file) => {
    const words = toString(tree).split(/\s+/).filter(Boolean).length;
    file.data.astro.frontmatter.words = words;
    file.data.astro.frontmatter.minutes = Math.max(1, Math.round(words / 220));
  };
}
