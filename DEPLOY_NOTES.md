# Deploy Notes — Upthrive Digital v2.0

## Pre-Deploy Checklist

### Required before going live
- [ ] **Replace placeholder stats on results.html** — Search for `[PLACEHOLDER` in results.html and fill in verified client metrics for Fox's Fleet and Precision Stone sections
- [ ] **Verify form submissions reach GoHighLevel** — Submit a test form on both `index.html` and `contact.html`; confirm the lead appears in your GoHighLevel CRM
- [ ] **Review About page copy** — Read through the founder bio on `about.html` and edit to match your exact voice and any details that need updating

### Deployment steps
1. Push the `feature/multi-page-expansion` branch to your Vercel-connected repo
2. Vercel will auto-deploy; confirm all 6 pages load on the preview URL
3. If preview looks good, promote to production (`www.upthrivedigital.io`)
4. Check that Vercel Analytics (`/_vercel/insights/script.js`) loads without 404

## Post-Deploy Checklist

### DNS & CDN
- [ ] All 6 pages load on `https://www.upthrivedigital.io/[page].html`
- [ ] Canonical URLs resolve correctly (no redirect loops)
- [ ] HTTPS is enforced (Vercel default)

### Forms
- [ ] Submit test form on `index.html` → confirm GoHighLevel receives it with correct field values
- [ ] Submit test form on `contact.html` → confirm GoHighLevel receives it
- [ ] SMS consent language is displayed verbatim and checkbox works correctly
- [ ] Success confetti/modal fires after form submission on both pages

### SEO
- [ ] Submit updated `sitemap.xml` in Google Search Console: Search Console → Sitemaps → add `https://www.upthrivedigital.io/sitemap.xml`
- [ ] Request indexing for each of the 6 new/updated pages via URL Inspection tool
- [ ] Verify Google can crawl each page (no robots.txt blocks, check Coverage report)

### Navigation & Links
- [ ] Click every nav link on all 6 pages — confirm no broken links
- [ ] Test old anchor URLs (`/index.html#about`, `/#services`, etc.) → confirm redirect fires to the correct new page
- [ ] Verify `aria-current="page"` shows gold underline on active nav item for each page
- [ ] Footer links on all pages point to correct destinations

### Accessibility & Mobile
- [ ] Test mobile nav hamburger on 375px (iPhone SE size)
- [ ] Confirm mobile nav opens/closes and that background content is not focusable when nav is open
- [ ] Test skip-to-main link on keyboard (Tab → Enter → lands in main content)
- [ ] Verify images load (WebP in supported browsers, PNG fallback in Safari <14)

### Analytics & Tracking
- [ ] Verify Microsoft Clarity is recording sessions on all new pages
- [ ] Verify Meta Pixel fires PageView on all new pages (use Facebook Pixel Helper extension)
- [ ] Verify Google Analytics is recording pageviews for all new pages

### Monitoring (first 2 weeks post-launch)
- [ ] Watch Google Search Console Coverage report for 404 errors — particularly any old `#anchor` URLs that external sites may link to
- [ ] Monitor Core Web Vitals report in Search Console (data appears 2–4 weeks after launch)
- [ ] If Core Web Vitals show LCP > 2.5s in field data, consider: adding `preload` hints for case study images, or setting up Vercel Image Optimization

## Performance Notes

### Why Lighthouse Performance = 57-68 locally
These scores were measured on a local Python HTTP server. On Vercel in production expect +20–30 points because:
- **Cache-Control headers**: Vercel sets long TTLs on static assets (immutable cache on hashed filenames)
- **Brotli compression**: Vercel compresses all text assets (HTML, CSS, JS)
- **Edge network**: Assets served from PoP closest to user

### Remaining performance opportunities (post-launch, if needed)
1. **Responsive image sizes**: Add `srcset` with multiple width variants to case study images. Currently serving full-resolution images even on mobile.
2. **CSS per-page splitting**: Extract only the CSS needed per page. Reduces unused CSS from ~78 KiB per page. Requires a build pipeline (Vite, Parcel, etc.).
3. **JS deferring**: Move the Meta Pixel init to after `DOMContentLoaded`. Minor improvement.
4. **Web font self-hosting**: Download Plus Jakarta Sans and serve from your own domain. Eliminates Google Fonts round-trip.

### Why Best Practices = 54
This score is **not a code quality issue**. It's caused by:
1. Facebook's Attribution Reporting API deprecation in `fbevents.js` — this is in Facebook's own SDK
2. Third-party cookies from Clarity (Microsoft) and Bing — these are the existing tracking setup
3. Vercel Analytics 404 on localhost (resolves automatically on Vercel)

Removing the Meta Pixel would raise this to ~92. That is a business decision, not a technical one.

## Form Endpoint

**Webhook URL (do not change):**
```
https://services.leadconnectorhq.com/hooks/XCmNK4RxWkr73hPCuKzR/webhook-trigger/2c2e59a6-8290-47b3-98b3-c7e5357071aa
```

This endpoint is used in `js/script.js` for the `#contact-form` handler. Both `index.html` and `contact.html` share the same `#contact-form` ID and the same JS handler.

## Git Branches
- `main` — production-ready after merge
- `feature/multi-page-expansion` — this expansion work
- `backup/pre-expansion` — snapshot of the original single-page site before any changes
