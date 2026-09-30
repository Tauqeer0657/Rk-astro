import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      /** The on-page H1 / article title. Kept verbatim from the legacy site. */
      title: z.string(),
      /** Optional shorter <title> for SERPs when `title` exceeds ~60 chars.
       *  Falls back to `title`. See scripts/audit-seo.mjs for the offenders. */
      seoTitle: z.string().max(60).optional(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** true while the date is synthesised — client must supply the real one */
      datePlaceholder: z.boolean().default(false),
      category: z.string(),
      hero: image(),
      heroAlt: z.string(),
      legacyId: z.string().nullable(),
      legacyPath: z.string(),
      order: z.number(),
      draft: z.boolean().default(false),
    }),
});

const servicesCol = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      short: z.string(),
      hero: image(),
      order: z.number(),
      legacyPath: z.string(),
      faqs: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    }),
});

export const collections = { blog, services: servicesCol };
