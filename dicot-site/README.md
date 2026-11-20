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

1. Install Composer dependencies with `composer install --no-dev --optimize-autoloader`.
2. Set `PUBLIC_TURNSTILE_SITE_KEY` in `dicot-site/.env`, then run `npm run build:deploy` from `dicot-site`. Astro writes the generated site into the repository root; the deploy command also copies PHPMailer into the root `vendor/` folder. The build does not clear the repository root.
3. Upload the generated website files from the repository root to `public_html`. Do not upload `.git/` or the `dicot-site/` source project. Include the root `.htaccess`.
4. Confirm `.htaccess` exists in `public_html`. It forces HTTPS, non-www canonicals, old-URL redirects, compression, caching and security headers.
5. Set PHP 8.0+ with cURL and OpenSSL enabled in hPanel. Create a Cloudflare Turnstile widget for `dicot.tech`. Set `TURNSTILE_SECRET_KEY` and the Zoho SMTP settings in PHP's runtime environment if your plan supports custom variables. Otherwise, create `contact-secrets.php` one directory above `public_html` and return an array containing those settings; the handler checks there as a fallback. Never put secrets in `dicot-site/.env`, source control, or `public_html`. Use `SMTP_HOST` for your Zoho data center, `SMTP_PORT` (`587` for STARTTLS or `465` for SSL), `SMTP_USERNAME` (full mailbox address), `SMTP_PASSWORD` (app-specific password), and optionally `SMTP_FROM`. The form rejects submissions if verification or SMTP configuration is missing.
6. Test the contact form and check the PHP error log, mailbox spam folder, and domain SPF/DKIM records if delivery fails.
7. Cloudflare (already in front of the domain): purge cache after upload. Enable Email Address Obfuscation to make published email addresses harder for scrapers to collect, and **disable Rocket Loader** so the demo scripts are not deferred or broken.
8. Submit `https://dicot.tech/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
9. Check that `www.dicot.tech` and every old `.html` URL return a single 301 to the new route, and that a random URL returns a real 404.

The generated root `contact.php` and `vendor/` must both be uploaded; without them the contact form cannot verify CAPTCHA or send mail.

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

## Troubleshooting

- **429 Too Many Requests:** check Cloudflare Security Events and Hostinger traffic/resource logs at the timestamp shown. These responses are generated by the CDN or host, not Astro. Adjust only the specific rate-limit/WAF rule confirmed to be blocking legitimate traffic; share the Cloudflare Ray ID with support if the source is unclear.
- **Contact mail missing:** verify the contact handler's PHP error log, SMTP settings, mailbox spam folder, and the domain's SPF/DKIM records.

## Known limits

- The contact form has a honeypot but no per-IP rate limit. Add one if spam appears.
- The LiveDemo is a simulation and is labelled as such on the page. Do not remove that label.
- Customer logos and product screenshots are reused from the existing site and approved for use.
- Site search and a full CMS are intentionally absent. Blog posts are added by editing `public/blog/posts.json`; see `BLOG.md`. Other page content needs a rebuild.
- The blog is hosted at `/blog/`. A JSON file is fetched in the browser, so new posts do not need a rebuild.
- Google Analytics uses the ID from the existing site and loads only after analytics consent. Tawk.to uses the property from the existing site and loads only after support-chat consent.
