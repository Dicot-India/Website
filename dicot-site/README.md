# dicot.tech

Static rebuild of the Dicot Innovations website. Astro 5, plain CSS, no UI framework. Built for SEO and for AI search (GEO).

## Run

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs dist/
npm run preview  # serves dist/
```

Node 20+ is required (tested on Node 24).

## Structure

```
src/
  layouts/Base.astro        head, metadata, JSON-LD, header/footer
  layouts/Legal.astro       shared legal page shell
  components/               Header, Footer, Consent, LiveDemo, Faq, Cta
  data/site.ts              company details, emails, phones, nav, GA ID
  data/products.ts          product copy, specs, plans, FAQs
  data/content.ts           stats, industries, testimonials, team, downloads
  pages/                    routes
  content/careers/*.json    one file per open role
public/
  images/                   logo, screenshots, customer logos, OG images
  fonts/                    self-hosted Inter + Plus Jakarta Sans
  robots.txt, llms.txt
  contact.php               contact form handler (Hostinger PHP)
  .htaccess                 redirects, cache, security headers
```

## Editing content

**Company details** — `src/data/site.ts`: address, emails, phones, social links, GA4 ID, partner form URL.

**Products** — `src/data/products.ts`. Each entry drives the product page, cards, pricing table and structured data. Keep `metaTitle` under about 60 characters and `metaDescription` around 150.

**Careers** — add a JSON file to `src/content/careers/`:

```json
{
  "title": "Automation Engineer",
  "department": "Engineering",
  "location": "Ahmedabad, on-site",
  "type": "Full-time",
  "experience": "2–4 years",
  "description": "Short description of the role.",
  "posted": "2026-11-18"
}
```

The page lists roles newest first and shows an empty state when the folder is empty. Applications go to `careers@dicot.tech` (change in `site.ts`).

**Industries, testimonials, team, downloads** — `src/data/content.ts`.
Team photos live in `public/images/team/` and are referenced from `src/data/content.ts`. Remove a person there to remove them from the about page.

**Legal pages** — `src/pages/legal/*.astro`. The privacy policy is written to the DPDP Act 2023 and DPDP Rules 2025. Have counsel review before publishing; update the effective date and version when you change it.

**Redirects** — `public/.htaccess`. Every old `.html` URL maps to its new route. Add new legacy URLs there, never as meta refresh.

## Deploy to Hostinger

1. `npm run build`
2. Zip the **contents** of `dist/` and upload to `public_html` (File Manager or FTP). Include hidden files so `.htaccess` is transferred.
3. Confirm `.htaccess` exists in `public_html`. It forces HTTPS, non-www canonicals, old-URL redirects, compression, caching and security headers.
4. Set PHP 8.0+ in hPanel. Test the contact form; it uses PHP `mail()` to `sales@dicot.tech`. If mail is not deliverable, switch to Hostinger SMTP or an authenticated form service.
5. Cloudflare (already in front of the domain): purge cache after upload. **Disable Email Address Obfuscation** so `sales@`, `privacy@` and phone numbers stay readable to crawlers, and **disable Rocket Loader** so the demo scripts are not deferred or broken.
6. Submit `https://dicot.tech/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
7. Check that `www.dicot.tech` and every old `.html` URL return a single 301 to the new route, and that a random URL returns a real 404.

`dist/contact.php` must be uploaded too; without it the form has nowhere to post.

## DPDP and consent

- GA4 (`G-CLGWSRY8FE`) is not loaded until the visitor accepts analytics. Consent is stored in `localStorage` under `dicot_consent_v1`, with an “Accept all / Reject all / Preferences” choice and a permanent “Cookie settings” link in the footer.
- The contact form requires an unticked consent checkbox and has a separate marketing opt-in.
- Privacy, cookie, terms and refund pages are included. Ensure the grievance officer contact (`privacy@dicot.tech`) is monitored and that data requests are answered within the stated window.
- If you add marketing pixels, add them to the consent category first and update the cookie table.

## SEO / GEO checklist already in place

- Canonical non-www host, trailing slashes, one `h1` per page, breadcrumbs.
- Generated `sitemap-index.xml`, `robots.txt` with sitemap and explicit allowances for search and AI crawlers.
- JSON-LD: Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, LocalBusiness, ContactPage, Article.
- `llms.txt` with product facts and “do not quote prices” guidance for assistants.
- Real 1200×630 OG images per product; `og:image` dimensions set.
- Self-hosted fonts, no third-party scripts before consent, lazy images, no layout-shifting embeds.
- Comparison pages (`/alternatives/`, `/compare/cloud-vs-on-premise-scada/`) written to be citable with direct answers, tables and stated limits.

## Known limits

- The contact form has a honeypot but no per-IP rate limit. Add one if spam appears.
- The LiveDemo is a simulation and is labelled as such on the page. Do not remove that label.
- Customer logos and product screenshots are reused from the existing site and approved for use.
- Site search and a full CMS are intentionally absent. Blog posts are added by editing `public/blog/posts.json`; see `BLOG.md`. Other page content needs a rebuild.
- The blog is hosted at `/blog/`. A JSON file is fetched in the browser, so new posts do not need a rebuild.
- Google Analytics uses the ID from the existing site and loads only after analytics consent. Tawk.to uses the property from the existing site and loads only after support-chat consent.
