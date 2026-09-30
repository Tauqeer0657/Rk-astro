import type { APIRoute } from 'astro';
import { site } from '~/data/site';

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /

# no crawl budget wasted on build artefacts
Disallow: /_astro/

Sitemap: ${site.url}/sitemap-index.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
