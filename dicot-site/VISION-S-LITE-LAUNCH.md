# Vision S Lite — launch checklist

Vision S Lite ships as an "in development" product. Everything below is data-driven by
`status: "upcoming"` in `src/data/products.ts`, but the launch copy itself is written out
in a few places. Use this list when the product is ready.

## 1. Flip the status

In `src/data/products.ts`, change `status: "upcoming"` to `status: "available"` (or delete
the line). This:

- re-enables the normal product hero CTA and "Plans" section
- removes the "In development" chip on the product list and homepage
- adds Vision S Lite back to the pricing page product grid
- switches the product schema from `Product` (upcoming) to `SoftwareApplication`
- removes the "Register interest" CTA in favour of "Book a demo"

## 2. Replace the launch copy

Still in `src/data/products.ts`:

- `summary`, `metaDescription`, `tagline` — remove "in development"
- `facts` — replace "In development" and "Announced at launch" with real figures
- `features` — keep, verify each claim
- `plans` — add editions and what each includes
- `planNote` — replace the launch note
- `requirements` — add the hardware requirements
- `faqs` — replace "Is Vision S Lite available now?" and the licensing answer
- `image` / `imageAlt` — replace the Vision S image with a real screenshot

Then update:

- `src/pages/products/index.astro` — `atGlance["vision-s-lite"]` tags and licence
- `src/pages/pricing.astro` — remove the "in development" note; add the tag routing rule
  (it currently routes on-premise above 100 tags to Vision S only)
- `src/pages/alternatives.astro` — remove the `chip--soon` badge and "in development" wording
- `src/data/content.ts` — remove "in development" from `homeFaqs`
- `public/llms.txt` — update the Vision S Lite line and remove the "do not describe as available" rule
- `src/pages/products/[slug].astro` — delete the `p.status === "upcoming"` branches if no other
  upcoming product exists, and replace `og-vision-s-lite.png` with a real screenshot when available

## 3. Check before publishing

- Any published tag limit must match the shipped licence.
- Rebuild `sitemap-0.xml` and confirm `/products/vision-s-lite/` is still listed.
- Re-run the JSON-LD validator on the product page.
- If Vision S Lite overlaps Vision C or Vision S pricing, update the pricing finder copy.
