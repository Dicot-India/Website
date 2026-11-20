#!/usr/bin/env node
/**
 * 429 probe.
 *
 * Fires a controlled burst at one URL and prints the status plus the headers
 * that identify who rate-limited the request (Cloudflare, Hostinger, or our own
 * PHP endpoints). Read-only: it only issues GET/HEAD requests.
 *
 * Usage (Windows PowerShell swallows flags after `--` when going through npm,
 * so the node form is the reliable one):
 *   node scripts/probe-429.mjs --url https://dicot.tech/ --count 30 --concurrency 5
 *   node scripts/probe-429.mjs --url https://dicot.tech/ --accept text/markdown --count 5
 *   node scripts/probe-429.mjs --url https://dicot.tech/VisionS.iso --count 4 --concurrency 2
 *   npm run probe:429                     # defaults: homepage, 20 HEADs, concurrency 4
 */
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    url: { type: "string", default: "https://dicot.tech/" },
    count: { type: "string", default: "20" },
    concurrency: { type: "string", default: "4" },
    method: { type: "string", default: "HEAD" },
    accept: { type: "string" },
    delay: { type: "string", default: "0" },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log("429 probe — see docs/429-RUNBOOK.md\n\n  --url --count --concurrency --method --accept --delay");
  process.exit(0);
}

const url = String(values.url ?? positionals[0] ?? "https://dicot.tech/");
const total = Math.max(1, Number(values.count ?? positionals[1]) || 20);
const concurrency = Math.max(1, Math.min(total, Number(values.concurrency ?? positionals[2]) || 4));
const method = String(values.method || "HEAD").toUpperCase();
const delay = Math.max(0, Number(values.delay) || 0);

const HEADER_KEYS = [
  "server",
  "cf-ray",
  "cf-cache-status",
  "cf-mitigated",
  "x-hcdn-cache-status",
  "retry-after",
  "content-type",
  "cache-control",
  "vary",
  "link",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function pick(headers) {
  const out = {};
  for (const key of HEADER_KEYS) {
    const value = headers.get(key);
    if (value) out[key] = value.length > 80 ? `${value.slice(0, 77)}...` : value;
  }
  return out;
}

const rows = [];
let cursor = 0;

async function worker() {
  while (cursor < total) {
    const index = cursor++;
    const started = Date.now();
    try {
      const response = await fetch(url, {
        method,
        redirect: "manual",
        headers: values.accept ? { Accept: values.accept } : {},
      });
      rows.push({ index, status: response.status, ms: Date.now() - started, headers: pick(response.headers) });
    } catch (error) {
      rows.push({ index, status: "ERR", ms: Date.now() - started, error: String(error?.message ?? error) });
    }
    if (delay > 0) await sleep(delay);
  }
}

const startedAll = Date.now();
await Promise.all(Array.from({ length: concurrency }, () => worker()));
rows.sort((a, b) => a.index - b.index);

console.log(`\n429 probe — ${method} ${url}`);
console.log(
  `${total} requests, concurrency ${concurrency}` +
    (values.accept ? `, Accept: ${values.accept}` : "") +
    (delay ? `, ${delay} ms apart` : "")
);
console.log("=".repeat(86));

for (const row of rows) {
  const headers = row.headers ?? {};
  const bits = [headers["cf-ray"], headers["cf-cache-status"], headers["x-hcdn-cache-status"], headers["retry-after"]].filter(Boolean);
  console.log(`#${String(row.index + 1).padStart(3)} ${String(row.status).padEnd(4)} ${String(row.ms).padStart(5)} ms  ${bits.join("  ") || row.error || ""}`);
}

const counts = new Map();
for (const row of rows) counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
console.log("-".repeat(86));
console.log(
  `${[...counts.entries()].map(([status, n]) => `${status}=${n}`).join("  ")}   (${Date.now() - startedAll} ms total)`
);

const limited = rows.filter((row) => row.status === 429);
if (limited.length === 0) {
  console.log(
    "\nNo 429 at this rate. The limit is burst-, IP-, geo- or bot-specific: rerun from the network that saw\n" +
      "the error, or raise --count and --concurrency."
  );
} else {
  const cloudflare = limited.some(
    (row) => row.headers?.["cf-mitigated"] || /cloudflare/i.test(row.headers?.server ?? "")
  );
  const hostinger = limited.some(
    (row) => row.headers?.["x-hcdn-cache-status"] || /hostinger|litespeed/i.test(row.headers?.server ?? "")
  );

  console.log(`\n${limited.length} of ${total} requests were rate-limited.`);
  if (cloudflare) {
    console.log("Verdict: Cloudflare served part of this. Look the cf-ray value up in Security → Events, then review");
    console.log("the rate-limiting rules, WAF custom rules, Bot Fight Mode and Security Level.");
  }
  if (hostinger) {
    console.log("Verdict: the response carries Hostinger/LiteSpeed headers, so the origin limiter fired. Check");
    console.log("hPanel resource usage, bandwidth and entry processes for the same minute.");
  }
  if (!cloudflare && !hostinger) {
    console.log("Verdict: no CDN or Hostinger signature. Capture the Ray ID from the failing browser and follow");
    console.log("docs/429-RUNBOOK.md.");
  }
  if (limited.some((row) => row.headers?.["retry-after"])) {
    console.log("A Retry-After header is present, which means our own PHP endpoint produced this 429.");
  }
}
