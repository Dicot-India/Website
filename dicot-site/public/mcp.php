<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/settings.php';
require_once __DIR__ . '/lib/rate-limit.php';

/**
 * Read-only MCP endpoint: JSON-RPC 2.0 over POST (Streamable HTTP).
 *
 * Supports initialize, notifications/initialized, ping, tools/list, tools/call
 * and server/discover. It exposes published product facts only: no personal
 * data is accepted or stored and no tool writes to the site.
 *
 * The matching Server Card is /.well-known/mcp/server-card.json.
 */

const MCP_NAME = 'dicot.tech';
const MCP_TITLE = 'Dicot Innovations';
const MCP_VERSION = '1.0.0';
const MCP_PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26'];
const MCP_INSTRUCTIONS = 'Read-only facts about Dicot SCADA, IIoT and data-acquisition software. '
    . 'Prices are shared through authorised dealers and are not published, so never quote a price. '
    . 'Vision S installers require a name, company, work email and explicit consent at '
    . 'https://dicot.tech/downloads/vision-s/ - point people there instead of the raw file.';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function mcp_send(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function mcp_result(mixed $id, mixed $result): void
{
    mcp_send(['jsonrpc' => '2.0', 'id' => $id, 'result' => $result]);
}

function mcp_fail(mixed $id, int $code, string $message, int $status = 200): void
{
    mcp_send(['jsonrpc' => '2.0', 'id' => $id, 'error' => ['code' => $code, 'message' => $message]], $status);
}

/**
 * @return array<string, mixed>
 */
function mcp_data(): array
{
    static $data = null;
    if (is_array($data)) {
        return $data;
    }

    $path = __DIR__ . '/mcp/data.json';
    if (!is_file($path)) {
        error_log('MCP endpoint: mcp/data.json is missing from the deployment.');
        $data = [];
        return $data;
    }
    $decoded = json_decode((string) file_get_contents($path), true);
    $data = is_array($decoded) ? $decoded : [];
    return $data;
}

function mcp_server_info(): array
{
    return ['name' => MCP_NAME, 'title' => MCP_TITLE, 'version' => MCP_VERSION];
}

function mcp_capabilities(): array
{
    return ['tools' => ['listChanged' => false]];
}

/**
 * @return list<array<string, mixed>>
 */
function mcp_tools(): array
{
    $readOnly = ['readOnlyHint' => true, 'openWorldHint' => false];

    return [
        [
            'name' => 'search_dicot_products',
            'title' => 'Search Dicot products',
            'description' => 'Search Dicot SCADA, IIoT and reporting software by product name, protocol, industry or use case. Returns matching products with a summary and canonical URL.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'query' => [
                        'type' => 'string',
                        'description' => 'Product name or keyword, for example "OPC UA", "pharma" or "cloud".',
                    ],
                ],
                'required' => ['query'],
                'additionalProperties' => false,
            ],
            'annotations' => $readOnly,
        ],
        [
            'name' => 'get_dicot_product',
            'title' => 'Get Dicot product facts',
            'description' => 'Return the published specification, editions, requirements and FAQs for one Dicot product. Prices are never returned.',
            'inputSchema' => [
                'type' => 'object',
                'properties' => [
                    'product' => [
                        'type' => 'string',
                        'description' => 'Product slug or name: vision-c, vision-s, vision-web, vision-s-lite or vgraphic.',
                    ],
                ],
                'required' => ['product'],
                'additionalProperties' => false,
            ],
            'annotations' => $readOnly,
        ],
        [
            'name' => 'get_dicot_download_options',
            'title' => 'Get Dicot download options',
            'description' => 'List public installers and manuals, and explain that the two Vision S builds need a request form with name, company and work email.',
            'inputSchema' => ['type' => 'object', 'additionalProperties' => false],
            'annotations' => $readOnly,
        ],
        [
            'name' => 'get_dicot_contact',
            'title' => 'Get Dicot contact details',
            'description' => 'Return the Dicot office address, sales and privacy email addresses, phone numbers and the authorised channel partners.',
            'inputSchema' => ['type' => 'object', 'additionalProperties' => false],
            'annotations' => $readOnly,
        ],
    ];
}

/**
 * @param array<string, mixed> $args
 * @return array<string, mixed>
 */
function mcp_tool_search(array $args): array
{
    $query = trim((string) ($args['query'] ?? ''));
    if ($query === '') {
        return ['error' => 'A query is required.'];
    }

    $terms = preg_split('/\s+/', mb_strtolower($query)) ?: [];
    $data = mcp_data();
    $scored = [];

    foreach ($data['products'] ?? [] as $product) {
        $haystack = mb_strtolower((string) json_encode($product, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        $score = 0;
        foreach ($terms as $term) {
            if ($term === '') {
                continue;
            }
            if (str_contains(mb_strtolower((string) ($product['name'] ?? '')), $term)) {
                $score += 5;
            }
            if (str_contains(mb_strtolower((string) ($product['category'] ?? '')), $term)) {
                $score += 2;
            }
            if (str_contains($haystack, $term)) {
                $score += 1;
            }
        }
        if ($score > 0) {
            $scored[] = ['score' => $score, 'product' => $product];
        }
    }

    usort($scored, static fn (array $a, array $b): int => $b['score'] <=> $a['score']);

    return [
        'matches' => array_map(static fn (array $row): array => [
            'slug' => $row['product']['slug'] ?? '',
            'name' => $row['product']['name'] ?? '',
            'category' => $row['product']['category'] ?? '',
            'summary' => $row['product']['summary'] ?? '',
            'url' => $row['product']['url'] ?? '',
        ], array_slice($scored, 0, 5)),
        'pricingPolicy' => $data['pricingPolicy'] ?? '',
        'catalogue' => $data['pages']['products'] ?? 'https://dicot.tech/products/',
    ];
}

/**
 * @param array<string, mixed> $args
 * @return array<string, mixed>
 */
function mcp_tool_product(array $args): array
{
    $needle = mb_strtolower(trim((string) ($args['product'] ?? '')));
    if ($needle === '') {
        return ['error' => 'A product slug or name is required.'];
    }

    $data = mcp_data();
    foreach ($data['products'] ?? [] as $product) {
        $slug = mb_strtolower((string) ($product['slug'] ?? ''));
        $name = mb_strtolower((string) ($product['name'] ?? ''));
        if ($needle === $slug || $needle === $name || ($name !== '' && str_contains($name, $needle))) {
            unset($product['metaDescription']);
            return [
                'product' => $product,
                'pricingPolicy' => $data['pricingPolicy'] ?? '',
            ];
        }
    }

    return [
        'error' => 'Unknown product.',
        'knownProducts' => ['vision-c', 'vision-s', 'vision-web', 'vision-s-lite', 'vgraphic'],
        'catalogue' => $data['pages']['products'] ?? 'https://dicot.tech/products/',
    ];
}

/**
 * @param array<string, mixed> $args
 * @return array<string, mixed>
 */
function mcp_tool_downloads(array $args): array
{
    $data = mcp_data();
    return [
        'downloads' => $data['downloads'] ?? [],
        'visionSInstallers' => $data['visionSInstallers'] ?? [],
        'note' => 'Only the Vision S installers are gated. Everything else downloads directly.',
    ];
}

/**
 * @param array<string, mixed> $args
 * @return array<string, mixed>
 */
function mcp_tool_contact(array $args): array
{
    $data = mcp_data();
    return [
        'company' => $data['company'] ?? [],
        'dealers' => $data['dealers'] ?? [],
        'pricingPolicy' => $data['pricingPolicy'] ?? '',
    ];
}

/**
 * @param array<string, mixed> $args
 * @return array<string, mixed>
 */
function mcp_call_tool(string $name, array $args): array
{
    return match ($name) {
        'search_dicot_products' => mcp_tool_search($args),
        'get_dicot_product' => mcp_tool_product($args),
        'get_dicot_download_options' => mcp_tool_downloads($args),
        'get_dicot_contact' => mcp_tool_contact($args),
        default => ['error' => 'Unknown tool: ' . $name],
    };
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    header('Allow: POST');
    mcp_fail(null, -32600, 'Use POST for JSON-RPC requests. This endpoint does not open an SSE stream.', 405);
}

$ip = dicot_client_ip();
if (!dicot_rate_limit('mcp-minute', $ip, 60, 60)) {
    header('Retry-After: 60');
    mcp_fail(null, -32000, 'Too many requests. Retry after 60 seconds.', 429);
}

$raw = file_get_contents('php://input');
if (!is_string($raw) || $raw === '' || strlen($raw) > 65536) {
    mcp_fail(null, -32600, 'Request body is missing or larger than 64 KB.');
}

$request = json_decode($raw, true);
if (!is_array($request) || ($request['jsonrpc'] ?? '') !== '2.0' || !isset($request['method'])) {
    $id = is_array($request) ? ($request['id'] ?? null) : null;
    mcp_fail($id, -32600, 'Invalid JSON-RPC 2.0 request.');
}

$id = $request['id'] ?? null;
$method = (string) $request['method'];
$params = is_array($request['params'] ?? null) ? $request['params'] : [];

switch ($method) {
    case 'initialize':
        $requested = (string) ($params['protocolVersion'] ?? '');
        $version = in_array($requested, MCP_PROTOCOL_VERSIONS, true) ? $requested : MCP_PROTOCOL_VERSIONS[0];
        header('MCP-Protocol-Version: ' . $version);
        mcp_result($id, [
            'protocolVersion' => $version,
            'capabilities' => mcp_capabilities(),
            'serverInfo' => mcp_server_info(),
            'instructions' => MCP_INSTRUCTIONS,
        ]);
        break;

    // Client notifications carry no id and must not receive a response body.
    case 'notifications/initialized':
    case 'notifications/cancelled':
        http_response_code(202);
        exit;

    case 'ping':
        mcp_result($id, new stdClass());
        break;

    case 'tools/list':
        mcp_result($id, ['tools' => mcp_tools()]);
        break;

    case 'tools/call':
        $name = (string) ($params['name'] ?? '');
        if ($name === '') {
            mcp_fail($id, -32602, 'A tool name is required.');
        }
        $args = is_array($params['arguments'] ?? null) ? $params['arguments'] : [];
        $result = mcp_call_tool($name, $args);
        $text = json_encode($result, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        mcp_result($id, [
            'content' => [[
                'type' => 'text',
                'text' => is_string($text) ? $text : '{}',
            ]],
            'structuredContent' => $result,
            'isError' => isset($result['error']),
        ]);
        break;

    case 'server/discover':
        mcp_result($id, [
            'serverInfo' => mcp_server_info(),
            'capabilities' => mcp_capabilities(),
            'protocolVersions' => MCP_PROTOCOL_VERSIONS,
            'instructions' => MCP_INSTRUCTIONS,
        ]);
        break;

    default:
        mcp_fail($id, -32601, 'Method not found: ' . $method);
}


