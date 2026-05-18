# Changelog

## [2.0.0] — 2026-05-18

### Added
- `services.html` — Deep-dive service page with 4 sections (Web Design, Paid Advertising, SEO, CRM Automation), deliverables lists, and "Most Popular" badge on Paid Ads
- `process.html` — Full Upthrive System page with all 6 layers expanded (~150 words each), timeline section, and Layer 06 "Advanced Growth Layer" badge
- `about.html` — Founder story page with ~350-word Kole Fox bio, 4 values, where-we-work section, and working expectations
- `results.html` — Case studies page with Fox's Fleet, Precision Stone, and Upthrive self-build; placeholder stats marked `[PLACEHOLDER — replace before launch]`
- `contact.html` — Dedicated contact page with same form endpoint, visible labels, sidebar with 5 info blocks (response time, email, service area, expectations, reviews)
- `robots.txt` — Crawler policy with sitemap reference
- `CHANGELOG.md` — This file
- `DEPLOY_NOTES.md` — Post-deploy checklist
- `assets/images/webp/` — WebP versions of all 8 images (97-98% file size reduction vs PNG originals)
- `.htmlvalidate.json` — HTML validation config

### Modified
- `index.html` — Refactored to teaser layout: services teasers link to `services.html#[id]`, system strip links to `process.html`, about blurb links to `about.html`, work tiles link to `results.html`; added redirect script for legacy `#anchor` URLs; added skip-link, `<main id="main">`, sr-only form labels, autocomplete attributes
- `sitemap.xml` — Updated with all 6 public pages (priorities: index 1.0, services/contact 0.9, process/results 0.8, about 0.7, legal 0.3)
- `css/style.css` — Added multi-page utilities: `.sr-only`, `.skip-link`, `[aria-current="page"]` active nav styles, `.breadcrumb-nav`, `.page-hero`, `.service-section`/`.service-panel`/`.service-deliverables`, `.timeline-section`/`.timeline-steps`, `.values-grid`/`.value-card`, `.about-meta-grid`, `.case-study-section`/`.cs-stats-row`, `.contact-page-layout`/`.contact-sidebar`, `.page-cta-block`, responsive breakpoints; contrast-compliant breadcrumb colors; touch-target sizing on breadcrumb links
- `js/script.js` — Hoisted `mobileNav` reference and `setMobileNavState()` function to module scope; mobile nav now toggles `inert` attribute alongside `aria-hidden` for proper keyboard trap; `setMobileNavState` called on all three close paths

### Preserved (untouched)
- `privacy-policy.html`
- `terms-of-service.html`
- All original image assets in `assets/images/`
- Form webhook: `https://services.leadconnectorhq.com/hooks/XCmNK4RxWkr73hPCuKzR/webhook-trigger/2c2e59a6-8290-47b3-98b3-c7e5357071aa`
- All tracking scripts (Microsoft Clarity, Meta Pixel, Google Analytics, Vercel Analytics)

### Lighthouse Scores (local server, pre-CDN)
| Page | Performance | Accessibility | Best Practices | SEO |
|------|------------|---------------|----------------|-----|
| index.html | 57 | 100 | 54 | 100 |
| services.html | 66 | 100 | 54 | 100 |
| process.html | 60 | 100 | 54 | 100 |
| about.html | 57 | 100 | 54 | 100 |
| results.html | 68 | 100 | 54 | 100 |
| contact.html | 66 | 100 | 54 | 100 |

**Performance note:** Scores measured on a local Python HTTP server without CDN caching. Expected improvement of +20-30 points on Vercel due to: long-cache TTLs, Brotli compression, and edge network. Primary remaining blockers are the existing Meta Pixel (deprecated Attribution Reporting API = BP score) and unminified CSS (no build pipeline).

**Best Practices note:** Score of 54 is entirely caused by Facebook's Attribution Reporting API deprecation in their own `fbevents.js` SDK and Clarity/Bing third-party cookies. These are pre-existing scripts; no code change on our end can affect this score without removing the Meta Pixel.
