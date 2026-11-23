---
title: "Dicot MCP API | Read-only SCADA data for AI agents"
description: "JSON-RPC 2.0 endpoint serving published Dicot product facts, download options and contact details. No auth, read-only, no personal data, 60 requests per minute per IP."
url: "https://dicot.tech/mcp/"
markdown_url: "https://dicot.tech/mcp/index.md"
updated: "2026-11-23"
---

<!-- Markdown mirror of https://dicot.tech/mcp/. The HTML page remains the source of truth. -->
Machine access

# The Dicot MCP API.

A read-only JSON-RPC endpoint that serves published facts about Dicot SCADA, IIoT and data-acquisition software: products, download options and contact details. Built for AI agents and integrations.

### Endpoint

https://dicot.tech/mcp.php

JSON-RPC 2.0 over HTTP POST. GET is rejected with 405.

### Protocol

MCP Streamable HTTP. Protocol versions: 2025-11-25, 2025-06-18, 2025-03-26.

### Access

No authentication. Every tool carries a read-only annotation. No personal data is accepted or stored.

### Rate limit

60 requests per minute per IP address. A 429 response carries Retry-After: 60.

Reference

## Methods and tools.

Prices never appear in any response: Dicot sells through authorised dealers and does not publish prices.

### JSON-RPC methods

| Method | Purpose | Params |
| --- | --- | --- |
| initialize | Handshake. Returns the negotiated protocol version, capabilities and server instructions. | protocolVersion (optional) |
| ping | Liveness check. Returns an empty result. | none |
| tools/list | Lists the four read-only tools with their input schemas. | none |
| tools/call | Runs one tool and returns text and structured content. | name, arguments |
| server/discover | Server information, capabilities and protocol versions in one call. | none |
| notifications/initialized · notifications/cancelled | Accepted and acknowledged with HTTP 202 and no body. | none |

### Tools

-   **search\_dicot\_products** — Search Dicot SCADA, IIoT and reporting software by product name, protocol, industry or use case. Returns matching products with a summary and canonical URL. Input: query (string, required) — a product name or keyword, for example “OPC UA”, “pharma” or “cloud”..
-   **get\_dicot\_product** — Return the published specification, editions, requirements and FAQs for one Dicot product. Prices are never returned. Input: product (string, required) — vision-c, vision-s, vision-web, vision-s-lite or vgraphic..
-   **get\_dicot\_download\_options** — List public installers and manuals, and explain that the two Vision S builds need a request form with name, company and work email. Input: none.
-   **get\_dicot\_contact** — Return the Dicot office address, sales and privacy email addresses, phone numbers and the authorised channel partners. Input: none.

### Example requests

```
curl -X POST https://dicot.tech/mcp.php \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

```
curl -X POST https://dicot.tech/mcp.php \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_dicot_product","arguments":{"product":"vision-s"}}}'
```

Responses are JSON-RPC 2.0: a result object with content and structuredContent, or an error object with a code and message.

### Machine-readable discovery

-   API catalog (RFC 9727): [/.well-known/api-catalog](/.well-known/api-catalog)
-   OpenAPI 3.1 description of this endpoint: [/.well-known/mcp/openapi.json](/.well-known/mcp/openapi.json)
-   MCP Server Card (SEP-2127): [/.well-known/mcp/server-card.json](/.well-known/mcp/server-card.json)
-   Health and status document: [/.well-known/health.json](/.well-known/health.json)
-   Agent guidance in plain text: [/llms.txt](/llms.txt) and [/llms-full.txt](/llms-full.txt)
-   AI catalog: [/.well-known/ai-catalog.json](/.well-known/ai-catalog.json)

robots.txt declares Content-Signal: search=yes, ai-input=yes, ai-train=no: pages may be indexed and quoted in answers, not used for model training. Every page also has a Markdown mirror at the same URL plus index.md, served when a request sends Accept: text/markdown.

## Talking to a person.

For quotes, demos or integration questions, use the [contact form](/contact/) or write to sales@dicot.tech. Vision S installers are requested at the [downloads page](/downloads/vision-s/), not through the API.

---

Generated 2026-11-23 from https://dicot.tech/mcp/. Questions: sales@dicot.tech
