import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { lastmodFor } from "./src/lib/sitemap-lastmod.mjs";

export default defineConfig({
  site: "https://dicot.tech",
  trailingSlash: "always",
  outDir: "./.build",
  build: { format: "directory" },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/thank-you") && !page.includes("/404"),
      // Agents use <lastmod> to decide what to re-read. Derive it from the
      // files that actually produce each page instead of stamping one date.
      serialize: (item) => ({ ...item, lastmod: lastmodFor(item.url) }),
    }),
  ],
});
