/**
 * Honest <lastmod> values for @astrojs/sitemap.
 *
 * The source of truth is git: one `git log --name-only` pass gives the newest
 * commit date for every tracked file, and it survives a fresh clone (file
 * mtimes do not — a clone gives every file the checkout time). Falls back to
 * mtime, then to the build date.
 *
 * A route's lastmod is the newest date among the files that can change its
 * output: its page file, the shared layout/components/styles, and any data
 * module the page renders.
 */
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/**
 * Files that change the *content* of every page. Layout and header changes are
 * intentionally excluded: they alter presentation, not what the page says, and
 * including them would stamp one identical date on every URL.
 */
const SHARED = ["src/data/site.ts"];

let cache;
let prefix;

/** Paths reported by git are relative to the repository root. */
function subdirPrefix() {
  if (prefix === undefined) {
    try {
      prefix = execFileSync("git", ["rev-parse", "--show-prefix"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      prefix = "";
    }
  }
  return prefix;
}

function localPath(file) {
  const dir = subdirPrefix();
  return dir && file.startsWith(dir) ? file.slice(dir.length) : file;
}

function gitDates() {
  if (cache) return cache;
  cache = new Map();
  try {
    const out = execFileSync(
      "git",
      ["log", "-n", "300", "--pretty=format:%cI", "--name-only", "--", "src", "public", "astro.config.mjs"],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }
    );
    let current = "";
    for (const line of out.split(/\r?\n/)) {
      const value = line.trim();
      if (!value) continue;
      if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        current = value;
      } else if (current) {
        const file = localPath(value);
        if (!cache.has(file)) cache.set(file, current);
      }
    }
  } catch {
    // Not a git checkout, or git is unavailable: fall back to mtimes.
  }
  return cache;
}

/** Files with uncommitted edits are reported with their mtime instead. */
function gitDirty() {
  const dirty = new Set();
  try {
    const out = execFileSync("git", ["status", "--porcelain"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    for (const line of out.split(/\r?\n/)) {
      if (!line.trim()) continue;
      let file = line.slice(3).trim();
      if (file.includes(" -> ")) file = file.split(" -> ").pop().trim();
      file = file.replace(/^"|"$/g, "");
      if (file) dirty.add(localPath(file));
    }
  } catch {
    // Ignore: without a work tree every file uses its commit date.
  }
  return dirty;
}

function toIso(value) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? "" : new Date(parsed).toISOString();
}

function mtime(file) {
  try {
    return statSync(join(ROOT, file)).mtime.toISOString();
  } catch {
    return "";
  }
}

function sourcesFor(url) {
  const route = new URL(url).pathname.replace(/^\/+|\/+$/g, "");
  const files = [];
  const add = (file) => {
    if (file && !files.includes(file)) files.push(file);
  };

  if (!route) {
    add("src/pages/index.astro");
  } else {
    add(`src/pages/${route}.astro`);
    add(`src/pages/${route}/index.astro`);
    if (route.startsWith("products/")) {
      add("src/pages/products/[slug].astro");
      add("src/data/products.ts");
    }
    if (route.startsWith("legal/")) add("src/layouts/Legal.astro");
  }

  // Pages that render data from a shared module.
  if (route === "" || route === "about" || route === "downloads") add("src/data/content.ts");
  if (route === "downloads/vision-s") add("src/data/downloads.ts");
  if (route === "blog") add("public/blog/posts.json");
  if (route === "contact") add("src/data/dealers.ts");

  SHARED.forEach(add);
  return files.filter((file) => existsSync(join(ROOT, file)));
}

/** @param {string} url Absolute URL emitted by Astro. @returns {string} YYYY-MM-DD */
export function lastmodFor(url) {
  const dates = gitDates();
  const dirty = gitDirty();
  let newest = "";
  for (const file of sourcesFor(url)) {
    const value = dirty.has(file) ? toIso(mtime(file)) : toIso(dates.get(file) || mtime(file));
    if (value > newest) newest = value;
  }
  return (newest || new Date().toISOString()).slice(0, 10);
}
