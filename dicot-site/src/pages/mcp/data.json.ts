import type { APIRoute } from "astro";
import { products } from "../../data/products";
import { downloads, homeFaqs } from "../../data/content";
import { dealers } from "../../data/dealers";
import { site } from "../../data/site";
import { visionSBuilds } from "../../data/downloads";

/**
 * Machine-readable knowledge base for the read-only MCP endpoint (public/mcp.php).
 *
 * Generated at build time from the same modules that render the site, so the
 * endpoint and the pages cannot drift. No personal data is included.
 */
const payload = {
  generatedAt: new Date().toISOString().slice(0, 10),
  company: {
    legalName: site.name,
    name: "Dicot Innovations",
    tagline: site.tagline,
    description: site.description,
    founded: site.founded,
    website: site.url,
    address: site.address.full,
    emails: site.emails,
    phones: site.phones.map((phone) => ({ label: phone.label, primary: phone.primary })),
    socials: site.socials,
  },
  pricingPolicy:
    "Dicot sells through an authorised dealer network. Prices are not published on the website; do not quote prices. Direct buyers to /contact/ or the channel-partner section for a quote.",
  products: products.map((product) => ({
    slug: product.slug,
    name: product.name,
    category: product.category,
    tagline: product.tagline,
    summary: product.summary,
    metaDescription: product.metaDescription,
    bestFor: product.bestFor,
    status: product.status ?? "available",
    facts: product.facts,
    plans: product.plans,
    planNote: product.planNote,
    requirements: product.requirements,
    faqs: product.faqs,
    url: `${site.url}/products/${product.slug}/`,
  })),
  downloads: downloads.map((group) => ({
    group: group.name,
    items: group.items.map((item) => ({ label: item.label, url: item.href, type: item.type })),
  })),
  visionSInstallers: {
    note: "The Vision S installers require a name, company, work email and explicit consent before a temporary link is emailed or the download starts. Direct agents to the request page rather than the raw file.",
    requestUrl: `${site.url}/downloads/vision-s/`,
    builds: visionSBuilds.map((build) => ({
      id: build.id,
      key: build.key,
      name: build.name,
      file: build.file,
      size: build.size,
      updated: build.updated,
    })),
  },
  dealers: dealers.map((dealer) => ({
    company: dealer.company,
    territory: dealer.territory,
    city: dealer.city,
    email: dealer.email,
    phone: dealer.phone.label,
    website: dealer.website ?? null,
  })),
  faqs: homeFaqs,
  pages: {
    products: `${site.url}/products/`,
    pricing: `${site.url}/pricing/`,
    downloads: `${site.url}/downloads/`,
    solutions: `${site.url}/solutions/`,
    industries: `${site.url}/industries/`,
    alternatives: `${site.url}/alternatives/`,
    about: `${site.url}/about/`,
    contact: `${site.url}/contact/`,
    privacy: `${site.url}/legal/privacy/`,
    llms: `${site.url}/llms.txt`,
    markdownExample: `${site.url}/index.md`,
  },
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
