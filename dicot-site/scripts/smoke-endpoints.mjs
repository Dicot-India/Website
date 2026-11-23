#!/usr/bin/env node
/**
 * Endpoint smoke test for the PHP side of the site.
 *
 * It exercises the paths that do not need a real Turnstile token: signature
 * checking, the DPDP consent gate, the honeypot and the read-only MCP methods.
 *
 *   1. Build first:            npm run build
 *   2. Serve the root:         php -S 127.0.0.1:8099 -t ..\        (from dicot-site)
 *      with DOWNLOAD_SIGNING_KEY set in the environment
 *   3. Run this:               node scripts/smoke-endpoints.mjs
 *
 * Exits non-zero if any check fails.
 */
import { createHash, createHmac } from "node:crypto";

const BASE = (process.env.SMOKE_BASE ?? "http://127.0.0.1:8099").replace(/\/+$/, "");
const KEY = process.env.DOWNLOAD_SIGNING_KEY ?? "";
const PAGE = "/downloads/vision-s/";

if (KEY === "") {
  console.error("Set DOWNLOAD_SIGNING_KEY to the same value the PHP server is using.");
  process.exit(2);
}

let failures = 0;

function check(label, actual, expected) {
  const ok = typeof expected === "function" ? expected(actual) : actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        got: ${actual}`}`);
}

function signedQuery(build) {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const emailHash = createHash("sha256").update("vision-s|smoke@example.com").digest("hex").slice(0, 16);
  const signature = createHmac("sha256", KEY)
    .update(`vision-s|${build}|${expires}|${emailHash}`)
    .digest("base64url");
  return `build=${build}&exp=${expires}&u=${emailHash}&sig=${signature}`;
}

const get = (path) => fetch(`${BASE}${path}`, { redirect: "manual" });
const post = (path, body) =>
  fetch(`${BASE}${path}`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });

const validForm = {
  name: "Smoke Test",
  company: "Dicot QA",
  email: "smoke@example.com",
  phone: "",
  build: "green",
  mode: "direct",
  consent: "yes",
};

try {
  // --- download.php ---
  let response = await get("/download.php");
  check("GET without a signature redirects to the page", `${response.status} ${response.headers.get("location")}`, `303 ${PAGE}`);

  response = await get(`/download.php?build=green&exp=${Math.floor(Date.now() / 1000) + 600}&u=abc&sig=bad`);
  check(
    "GET with a bad signature is rejected",
    `${response.status} ${response.headers.get("location")}`,
    (value) => value.startsWith("303 ") && value.includes("reason=token")
  );

  response = await get(`/download.php?${signedQuery("green")}`);
  check("GET with a valid signature redirects to the ISO", `${response.status} ${response.headers.get("location")}`, "302 /VisionS.iso");

  response = await get(`/download.php?${signedQuery("grey")}`);
  check("GET for the grey build redirects to the 2026 ISO", `${response.status} ${response.headers.get("location")}`, "302 /VisionS_Version_2026.iso");

  response = await post("/download.php", { ...validForm, consent: "" });
  check(
    "POST without consent is rejected (DPDP)",
    `${response.status} ${response.headers.get("location")}`,
    (value) => value.startsWith("303 ") && value.includes("reason=fields")
  );

  response = await post("/download.php", { ...validForm, email: "not-an-email" });
  check(
    "POST with an invalid email is rejected",
    `${response.status} ${response.headers.get("location")}`,
    (value) => value.includes("reason=fields")
  );

  response = await post("/download.php", { ...validForm, build: "unknown" });
  check(
    "POST with an unknown build is rejected",
    `${response.status} ${response.headers.get("location")}`,
    (value) => value.includes("reason=fields")
  );

  response = await post("/download.php", { ...validForm, website: "spam" });
  check(
    "Honeypot gets a silent success",
    `${response.status} ${response.headers.get("location")}`,
    "303 /thank-you/?type=vision-s"
  );

  // --- careers-apply.php ---
  response = await get("/careers-apply.php");
  check("Careers GET redirects to the page", `${response.status} ${response.headers.get("location")}`, "303 /careers/");

  const application = {
    role: "Growth Associate/BDE (Fresher)",
    name: "Smoke Test",
    phone: "+91 90000 00000",
    email: "smoke@example.com",
    fit: "Smoke test answer.",
    obsession: "Smoke test answer.",
    consent: "yes",
  };

  response = await post("/careers-apply.php", { ...application, consent: "" });
  check(
    "Application without consent is rejected (DPDP)",
    `${response.status} ${response.headers.get("location")}`,
    (value) => value.startsWith("303 ") && value.includes("reason=fields")
  );

  response = await post("/careers-apply.php", { ...application, phone: "call me" });
  check(
    "Application with an invalid phone is rejected",
    `${response.status} ${response.headers.get("location")}`,
    (value) => value.includes("reason=fields")
  );

  response = await post("/careers-apply.php", { ...application, website: "spam" });
  check(
    "Career honeypot gets a silent success",
    `${response.status} ${response.headers.get("location")}`,
    "303 /thank-you/"
  );

  // --- mcp.php ---
  response = await get("/mcp.php");
  check("MCP GET returns 405", response.status, 405);

  const mcp = async (payload) => {
    const result = await fetch(`${BASE}/mcp.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: result.status, body: await result.json().catch(() => null) };
  };

  let mcpResult = await mcp({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25" } });
  check("MCP initialize returns the server info", mcpResult.body?.result?.serverInfo?.name, "dicot.tech");
  check("MCP initialize echoes the protocol version", mcpResult.body?.result?.protocolVersion, "2025-11-25");

  mcpResult = await mcp({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  check("MCP tools/list returns four tools", mcpResult.body?.result?.tools?.length, 4);

  mcpResult = await mcp({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "search_dicot_products", arguments: { query: "opc ua" } },
  });
  check(
    "MCP search returns product matches",
    mcpResult.body?.result?.structuredContent?.matches?.length,
    (value) => typeof value === "number" && value > 0
  );

  mcpResult = await mcp({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "get_dicot_product", arguments: { product: "vision-s" } },
  });
  check("MCP product lookup returns Vision S", mcpResult.body?.result?.structuredContent?.product?.name, "Vision S");

  mcpResult = await mcp({ jsonrpc: "2.0", id: 5, method: "notifications/initialized" });
  check("MCP notification is accepted without a body", mcpResult.status, 202);
} catch (error) {
  failures++;
  console.error(`FAIL  request error: ${error?.message ?? error}`);
  console.error(`      Is the PHP server running at ${BASE}?`);
}

console.log(failures === 0 ? "\nAll endpoint checks passed." : `\n${failures} check(s) failed.`);
// Set the code instead of calling process.exit(): exiting with open keep-alive
// sockets trips a libuv assertion on Windows.
process.exitCode = failures === 0 ? 0 : 1;
