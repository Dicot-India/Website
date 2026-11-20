/**
 * Builds a Markdown mirror for every indexable page, plus llms-full.txt.
 *
 * Agents that send "Accept: text/markdown" get these files instead of the HTML
 * (see public/.htaccess), and /llms.txt points at them. Markdown is roughly an
 * order of magnitude smaller than the HTML, which also cuts bytes pulled from
 * the origin by crawlers.
 *
 * Runs between `astro build` and `scripts/publish-root.mjs`.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import TurndownService from "turndown";
import gfmPlugin from "turndown-plugin-gfm";

const BUILD = ".build";
const ORIGIN = "https://dicot.tech";
const TODAY = new Date().toISOString().slice(0, 10);

const SKIP_DIRS = new Set(["_astro", "images", "fonts", "vendor"]);

if (!existsSync(BUILD)) {
  throw new Error("Run `astro build` before generating Markdown mirrors.");
}

const gfm = typeof gfmPlugin === "function" ? gfmPlugin : gfmPlugin.gfm;

const service = new TurndownService({
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "_",
  strongDelimiter: "**",
  linkStyle: "inlined",
});
service.remove(["script", "style", "noscript", "template", "svg", "iframe", "canvas", "button"]);
if (typeof gfm === "function") service.use(gfm);

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, name) => ENTITIES[name] ?? `&${name};`);
}

function meta(html, name) {
  const match = html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, "i"));
  return match ? decode(match[1]).trim() : "";
}

function mainHtml(html) {
  const start = html.search(/<main\b/i);
  if (start !== -1) {
    const open = html.indexOf(">", start);
    const close = html.lastIndexOf("</main>");
    if (open !== -1 && close > open) return html.slice(open + 1, close);
  }
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return body ? body[1] : html;
}

function clean(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<template\b[\s\S]*?<\/template>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    // Elements hidden for humans (error banners, honeypots) are noise in a mirror.
    .replace(/<([a-z][a-z0-9]*)\b[^>]*\bhidden\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, "")
    // Flex-only labels rendered as one run of text otherwise.
    .replace(/<div class="hero-index">[\s\S]*?<\/div>/i, "")
    // The homepage demo is an animated SVG mock-up; its labels add no facts.
    .replace(/<section class="demo"[\s\S]*?<\/section>/i, "");
}

function walk(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(full));
    else if (entry.name === "index.html") found.push(full);
  }
  return found;
}

/**
 * The blog list is rendered in the browser from posts.json, so the static HTML
 * only says "Loading articles...". Build the mirror from the JSON instead.
 */
function blogMarkdown() {
  const file = join("public", "blog", "posts.json");
  if (!existsSync(file)) return "";
  let posts;
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    posts = Array.isArray(parsed) ? parsed : [];
  } catch {
    return "";
  }
  posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const lines = [
    "# Dicot Innovations blog",
    "",
    "> Practical writing on SCADA sizing, licensing, data acquisition and product updates for machine builders and plant teams.",
    "",
    `- Blog index: ${ORIGIN}/blog/`,
    "- Contact: sales@dicot.tech",
    "",
  ];
  if (!posts.length) {
    lines.push("No articles are published yet.");
    return lines.join("\n");
  }
  for (const post of posts) {
    lines.push(`## ${post.title}`);
    const byline = [post.date, post.author].filter(Boolean).join(" · ");
    if (byline) lines.push(`_${byline}_`);
    if (post.excerpt) lines.push("", post.excerpt);
    if (Array.isArray(post.tags) && post.tags.length) lines.push("", `Tags: ${post.tags.join(", ")}`);
    lines.push("", `Read: ${ORIGIN}/blog/?post=${encodeURIComponent(post.slug)}`, "");
  }
  return lines.join("\n");
}

function frontMatter({ title, description, url }) {
  return [
    "---",
    ...(title ? [`title: ${JSON.stringify(title)}`] : []),
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    `url: ${JSON.stringify(url)}`,
    `markdown_url: ${JSON.stringify(`${url}index.md`)}`,
    `updated: ${JSON.stringify(TODAY)}`,
    "---",
    "",
    `<!-- Markdown mirror of ${url}. The HTML page remains the source of truth. -->`,
    "",
  ].join("\n");
}

const pages = [];

for (const file of walk(BUILD)) {
  const html = readFileSync(file, "utf8");
  if (/noindex/i.test(meta(html, "robots"))) continue;

  const dir = dirname(file);
  const route = relative(BUILD, dir).split(sep).join("/");
  const url = route ? `${ORIGIN}/${route}/` : `${ORIGIN}/`;
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim());
  const description = meta(html, "description");

  let body = route === "blog" ? blogMarkdown() : "";
  if (!body) {
    body = service
      .turndown(clean(mainHtml(html)))
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
  if (!body) {
    console.warn(`[markdown] no content extracted for ${url}`);
    continue;
  }

  const markdown = `${frontMatter({ title, description, url })}${body}\n\n---\n\nGenerated ${TODAY} from ${url}. Questions: sales@dicot.tech\n`;
  writeFileSync(join(dir, "index.md"), markdown, "utf8");
  pages.push({ route, url, markdown });
}

// llms-full.txt: the pages an assistant is most likely to need, in reading order.
const PRIORITY = [
  "",
  "products",
  "products/vision-c",
  "products/vision-s",
  "products/vision-web",
  "products/vision-s-lite",
  "products/vgraphic",
  "pricing",
  "downloads",
  "downloads/vision-s",
  "solutions",
  "industries",
  "alternatives",
  "compare/cloud-vs-on-premise-scada",
  "about",
  "partners",
  "contact",
  "blog",
  "legal/privacy",
  "legal/terms",
  "legal/refund",
  "legal/cookies",
];

const byRoute = new Map(pages.map((page) => [page.route, page]));
const ordered = [];
for (const route of PRIORITY) {
  const page = byRoute.get(route);
  if (page) ordered.push(page);
}
for (const page of pages) {
  if (!ordered.includes(page)) ordered.push(page);
}

const full = [
  "# Dicot Innovations — full site text",
  "",
  `> Generated ${TODAY} from ${ORIGIN}. HTML pages are canonical.`,
  "> Products: Vision C (mini-SCADA), Vision S (enterprise SCADA), Vision Web (hosted cloud SCADA) and VGraphic (cloud report generator).",
  "> Prices are shared through authorised dealers and are not published. Vision S Lite is in development.",
  "",
  ...ordered.map((page) => `${page.markdown}\n`),
].join("\n");

writeFileSync(join(BUILD, "llms-full.txt"), full, "utf8");

console.log(`[markdown] wrote ${pages.length} Markdown mirrors + llms-full.txt`);


