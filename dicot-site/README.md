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
  layouts/Base.astro        head, metadata, JSON-LD, header/footer, WebMCP tools
  layouts/Legal.astro       shared legal page shell
  components/               Header, Footer, Consent, LiveDemo, Faq, Cta, WebMcp
  data/site.ts              company details, emails, phones, nav, GA ID
  data/products.ts          product copy, specs, plans, FAQs
  data/downloads.ts         Vision S builds, sizes, consent version, retention
  data/content.ts           stats, industries, testimonials, team, downloads
  lib/sitemap-lastmod.mjs   per-route <lastmod> from git history
  pages/                    routes (includes /downloads/vision-s/ and /mcp/data.json)
  content/careers/*.json    one file per open role
public/
  images/                   logo, screenshots, customer logos, OG images
  fonts/                    self-hosted Inter + Plus Jakarta Sans
  robots.txt, llms.txt      Content-Signal + agent guidance
  .well-known/              MCP Server Card and AI catalog
  .htaccess                 redirects, markdown negotiation, cache, security headers
  contact.php               contact form handler (Hostinger PHP)
  download.php              gated Vision S download endpoint
  mcp.php                   read-only MCP endpoint (JSON-RPC over POST)
  lib/                      shared PHP settings, rate limiter, mailer
scripts/
  generate-markdown.mjs     HTML → Markdown mirrors + llms-full.txt
  probe-429.mjs             controlled 429 probe
docs/429-RUNBOOK.md         how to identify and fix a 429
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
2. Set `PUBLIC_TURNSTILE_SITE_KEY` in `dicot-site/.env`, then run `npm run build:deploy` from `dicot-site`. The build runs three steps: `astro build`, then `scripts/generate-markdown.mjs` (Markdown mirrors + `llms-full.txt`), then `scripts/publish-root.mjs`, which writes the generated site into the repository root. The deploy command also copies PHPMailer into the root `vendor/` folder. The build does not clear the repository root.
   In addition to the Turnstile and SMTP settings, set `DOWNLOAD_SIGNING_KEY` to 32+ random bytes. It signs the 48-hour Vision S download links. It is optional: without it the endpoint derives a key from `SMTP_PASSWORD` (then `TURNSTILE_SECRET_KEY`), so the email flow works before the setting is added — but adding or rotating that secret later invalidates links already sent. Direct downloads never need a key.
3. Upload the generated website files from the repository root to `public_html`. Do not upload `.git/` or the `dicot-site/` source project. Include the root `.htaccess`, `download.php`, `mcp.php`, `lib/`, `mcp/` and the `.well-known/` folder — FTP clients often hide dot-folders, so enable "show hidden files".
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

## Vision S downloads (DPDP)

`/downloads/vision-s/` publishes the two Vision S installers behind a short form.

- Green key → `VisionS.iso` (827 MB). Grey key → `VisionS_Version_2026.iso` (977 MB). Sizes, file dates and copy live in `src/data/downloads.ts`.
- Name, company and work email are required; phone is optional. The marketing opt-in is separate and never pre-ticked.
- The visitor chooses "email a temporary link" (HMAC-signed, valid 48 hours, bound to a hash of their address) or "start the download now".
- `public/download.php` checks the honeypot, Turnstile, the required consent, the build and the delivery mode, and rate-limits per IP (5/hour, 20/day). It emails the lead to `sales@dicot.tech` and, in email mode, the signed link to the visitor.
- The lead email **is** the consent record: exact consent text, `downloadPolicy.consentVersion` and a UTC timestamp. Retention is 24 months from last contact; delete the record when the window ends.
- Withdrawal is a prefilled `privacy@dicot.tech` request, repeated in the visitor email and on `/thank-you/`.
- The ISO files stay at the web root for now, so this is lead capture, not access control. To make it access control, move the ISOs to Cloudflare R2 on `dl.dicot.tech` and point the signed link there; the file map is in one place in `download.php`.

## Agent access (GEO)

- `robots.txt` declares `Content-Signal: search=yes, ai-input=yes, ai-train=no` in every group.
- `sitemap-0.xml` carries a per-URL `<lastmod>` derived from git history (`src/lib/sitemap-lastmod.mjs`), so agents know what changed.
- `scripts/generate-markdown.mjs` writes `/index.md`, `/products/vision-s/index.md`, … plus `/llms-full.txt`. A request with `Accept: text/markdown` is rewritten to the mirror in `.htaccess`.
- HTML and Markdown responses carry an RFC 8288 `Link` header pointing at `llms.txt`, `llms-full.txt`, the MCP card and the sitemap.
- `/.well-known/mcp/server-card.json` (SEP-2127) and `/.well-known/ai-catalog.json` advertise `https://dicot.tech/mcp.php`, a read-only JSON-RPC endpoint with four tools. Its knowledge base is generated at build time by `src/pages/mcp/data.json.ts`.
- `WebMcp.astro` registers four read-only tools through `navigator.modelContext` / `document.modelContext` (falling back to `provideContext`). None submit forms or handle personal data.

After a deploy, verify:

```powershell
curl.exe -sSI -H "Accept: text/markdown" https://dicot.tech/            # Content-Type: text/markdown
curl.exe -sSI https://dicot.tech/                                        # Link: ... llms.txt ...
curl.exe -sS  https://dicot.tech/.well-known/mcp/server-card.json
curl.exe -sS -X POST https://dicot.tech/mcp.php -H "Content-Type: application/json" -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'
```

Before deploying the PHP side, run the endpoint smoke test locally:

```powershell
cd dicot-site
npm run build
$env:DOWNLOAD_SIGNING_KEY = "any-test-value"
php -S 127.0.0.1:8099 -t ..
node scripts/smoke-endpoints.mjs
```

## SEO / GEO checklist already in place

- Canonical non-www host, trailing slashes, one `h1` per page, breadcrumbs.
- Generated `sitemap-index.xml` with a real per-URL `lastmod`, `robots.txt` with a Content-Signal and explicit allowances for search and AI crawlers.
- JSON-LD: Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, LocalBusiness, ContactPage, Article.
- `llms.txt` with product facts and “do not quote prices” guidance for assistants, plus `llms-full.txt` and per-page Markdown mirrors.
- `Link` headers, `Vary: Accept`, MCP Server Card, AI catalog and WebMCP tools for in-browser agents.
- Real 1200×630 OG images per product; `og:image` dimensions set.
- Self-hosted fonts, no third-party scripts before consent, lazy images, no layout-shifting embeds.
- Comparison pages (`/alternatives/`, `/compare/cloud-vs-on-premise-scada/`) written to be citable with direct answers, tables and stated limits.

## Troubleshooting

- **429 Too Many Requests:** follow `docs/429-RUNBOOK.md`. Capture the `cf-ray` value from DevTools or the error page, then run `node scripts/probe-429.mjs --url https://dicot.tech/ --count 30 --concurrency 5` from the network that saw the error. These responses come from Cloudflare, Hostinger, or our own PHP endpoints — never from Astro. Adjust only the specific rule confirmed to be blocking legitimate traffic. Remember that HTML is not edge-cached and the ISOs are ~1 GB each, so the origin does the work.
- **Contact mail missing:** verify the contact handler's PHP error log, SMTP settings, mailbox spam folder, and the domain's SPF/DKIM records.
- **Vision S link email missing:** the link is signed with `DOWNLOAD_SIGNING_KEY`, or a key derived from `SMTP_PASSWORD` when that setting is absent; with neither, the endpoint redirects back with `reason=config` ("not configured"). Check the SMTP settings and the PHP error log. The fallback is the direct-download option on the same form.
- **Direct download slow to start:** the endpoint sends the 303 and calls `dicot_finish_response()` before mailing the lead record, so the transfer begins while SMTP runs. On a host without `fastcgi_finish_request` or `litespeed_finish_request` the mail is sent first and the visitor waits again — the page shows a "starting" note for that case.
- **MCP endpoint returns 500:** confirm `mcp/data.json` exists in `public_html` (the build generates it) and that `public_html/mcp.php` and `public_html/lib/` were both uploaded.

## Known limits

- The contact form has a honeypot and Turnstile but no per-IP rate limit. The Vision S download and MCP endpoints do rate-limit per IP.
- HTML is not edge-cached (`cf-cache-status: DYNAMIC`). Enabling a Cloudflare "Cache Everything" rule would cut origin load but breaks `Accept: text/markdown`, because Cloudflare ignores `Vary: Accept`. Move agents to the explicit `.md` URLs first if you ever need it.
- The Vision S installers are served from Hostinger, not from a CDN: Cloudflare bypasses `.iso` and the files exceed the cacheable-object limit on non-Enterprise plans. Moving them to Cloudflare R2 is the fix if bandwidth or 429s become a problem.
- The Vision S form is lead capture, not access control: the ISO files are still publicly reachable by URL. Remove them from the web root if that matters.
- The MCP endpoint is read-only and rate-limited. It returns published facts only and never accepts personal data.
- The LiveDemo is a simulation and is labelled as such on the page. Do not remove that label.
- Customer logos and product screenshots are reused from the existing site and approved for use.
- Site search and a full CMS are intentionally absent. Blog posts are added by editing `public/blog/posts.json`; see `BLOG.md`. Other page content needs a rebuild.
- The blog is hosted at `/blog/`. A JSON file is fetched in the browser, so new posts do not need a rebuild.
- Google Analytics uses the ID from the existing site and loads only after analytics consent. Tawk.to uses the property from the existing site and loads only after support-chat consent.
