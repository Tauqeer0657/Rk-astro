# Dr. Raghavendra Kulkarni — Astro rebuild

SEO-focused rebuild of [raghavendrakulkarni.com](https://raghavendrakulkarni.com) in Astro,
using the **Aurora** design direction (theme-3) the client approved.

Content was migrated from the static source repo
[`itsahmadyaseen/Dr-RK`](https://github.com/itsahmadyaseen/Dr-RK), which was verified
byte-identical to the live site — so the repo, not the live HTML, is the source of truth.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on :4321 |
| `npm run build` | Static build into `dist/` |
| `npm run audit` | SEO audit of the built HTML — fails on any error |
| `npm run links` | Internal link + anchor checker |
| `npm run qa` | build + audit + links (run this before every deploy) |
| `npm run build:clean-urls` | Build with the clean-URL strategy instead of legacy |

Current QA status: **23 pages, 0 SEO errors, 0 warnings, 1016 internal links, 0 broken.**

---

## URL strategy — one switch

`astro.config.mjs` exports `URL_STRATEGY`:

- **`legacy`** (current default) — reproduces the live site's URLs exactly, including the
  `.html` suffix and the WordPress numeric IDs, e.g.
  `/blogs/kidney-stones-risk-factors-causes-and-prevention-tips-25964.html`.
  **Zero ranking risk.** Verified: all 21 original URLs are reproduced with none missing.
- **`clean`** — `/about-us`, `/blog/kidney-stones-risk-factors`, with 301s from every legacy URL.

Flip the value (or set the `URL_STRATEGY` env var) and both the routes and the nginx
behaviour follow. Nothing else needs editing.

> **Pending decision:** which strategy to ship. Waiting on Google Search Console data
> (Performance → Pages, top 20 by clicks) to confirm which URLs currently earn traffic.

---

## What the rebuild fixes

The live site had `<title>` and meta descriptions on all 21 pages — and nothing else:

| Problem on the live site | Status |
| --- | --- |
| No `sitemap.xml` (404) | Generated, with per-section priorities |
| No `robots.txt` (404) | Generated, points at the sitemap |
| **Zero JSON-LD on all 21 pages** | `Physician` + `MedicalBusiness`, `MedicalWebPage`, `BreadcrumbList`, `FAQPage`, `MedicalProcedure`, `WebSite` |
| Zero Open Graph / Twitter tags | Full set — WhatsApp and Facebook shares now render a card |
| Zero canonical tags | Canonical on every indexable page |
| `/about-us` and `/about-us.html` both HTTP 200, identical MD5 | Extensionless form now 301s to the canonical (`nginx.conf`) |
| `error_page 404 /index.html` → soft 404 | Real `404.html` with a real 404 status |
| 2.6 MB of unoptimised JPG/PNG | Automatic AVIF/WebP + responsive `srcset` (e.g. 77 kB → 19 kB) |
| Headline text baked into the hero JPEG (invisible to Google) | Cropped out; the `<h1>` is now real HTML — see `scripts/crop-hero.mjs` |
| Blog post titles up to 104 chars (truncated in SERPs) | `seoTitle` frontmatter gives every post a ≤60-char SERP title |

Performance: **0 KB of external JS** — every script is inlined and under 2 KB, so there are
no extra round-trips. CSS totals ~44 KB.

---

## Structure

```
src/
  content/
    blog/        12 posts, Markdown + frontmatter (migrated from the legacy HTML)
    services/     4 service pages, Markdown
  data/
    site.ts       NAP (name/address/phone) — single source of truth for local SEO
    schema.ts     JSON-LD builders
    urls.ts       URL strategy helpers
    home.ts       stats, "excellence" points, FAQs
    reviews.json  9 real Google reviews scraped from the legacy homepage
  components/   Seo, Header, Footer, Icon, Reviews, ContactForm, Faq
  layouts/      Base.astro
  pages/        index, about-us, services, contact-us, gallery, blog, 404,
                [service].astro, [...slug].astro (blog posts), robots.txt.ts
  styles/       aurora.css (ported theme) + components.css + enhance.css
scripts/        one-off migration + QA tooling
```

### Migration scripts
`extract-blogs.mjs`, `extract-pages.mjs`, `extract-services.mjs`, `extract-reviews.mjs`
and `crop-hero.mjs` re-run the content import from the legacy repo. They need the source
checked out and `SRC=/path/to/Dr-RK` set. They are kept so the import is reproducible,
not because they run at build time.

---

## Animation

Ported 1:1 from the Aurora mockup (CSS keyframes + one `IntersectionObserver`), then
extended in `enhance.css` / `scripts/motion.ts`:

- directional reveals (`data-reveal="left|right|zoom|fade"`)
- `data-stagger` for sequenced children
- animated counters, scroll progress bar on articles, sticky-header state
- cross-fade page transitions via the View Transitions API

Everything is disabled under `prefers-reduced-motion: reduce`.

---

## Deployment

Unchanged from the existing setup — Docker + nginx:

```bash
docker compose up --build        # serves on :8080
```

`nginx.conf` additionally fixes the duplicate-URL and soft-404 problems described above,
and sets immutable caching for the content-hashed `/_astro/` output.

---

## Open items for the client

1. **Real publish dates for the 12 blog posts.** The legacy site had none, so dates are
   synthesised in descending order. Every affected post is flagged with
   `datePlaceholder: true` in its frontmatter. These feed `datePublished` in Article
   schema, so they should be corrected before launch.
2. **Consulting hours.** `site.ts` currently says Mon–Sat 10:00–18:00. This drives
   `LocalBusiness` schema and Google's "open now" badge, so wrong values actively hurt.
3. **Gallery captions / alt text.** Currently generic; descriptive alt text is what earns
   placement in Google Images. See the `TODO(client)` in `src/pages/gallery.astro`.
4. **Contact form destination.** There is no backend, so the form hands off to WhatsApp
   (`+91-7411088875`), which is where enquiries actually arrive today. Swap in a real
   endpoint if email delivery is wanted.
5. **Aggregate rating schema** was deliberately **not** added. The 56 reviews live on
   Google, and marking up third-party reviews as first-party `aggregateRating` is against
   Google's guidelines and risks a manual action. The reviews are displayed and linked
   to the Google listing instead.
