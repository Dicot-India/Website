<?php
declare(strict_types=1);

// Refuse a direct request to this file; it is only meant to be required.
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    http_response_code(404);
    exit;
}

/**
 * Fixed-window rate limiter for the form and MCP endpoints.
 *
 * Counters live one directory above the web root. The file name is a hash of
 * the bucket and the client IP, so the raw address is never written to disk.
 * If the counter directory cannot be created the request is allowed: the
 * Cloudflare Turnstile check and the honeypot still apply.
 */
function dicot_rate_limit(string $bucket, string $ip, int $limit, int $windowSeconds): bool
{
    $dir = dirname(__DIR__, 2) . '/dicot-rate-limit';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        error_log('Rate limit unavailable: counter directory could not be created.');
        return true;
    }

    // Occasionally sweep windows that are long finished.
    if (random_int(1, 100) === 1) {
        foreach (glob($dir . '/*.json') ?: [] as $stale) {
            if (@filemtime($stale) < time() - 172800) {
                @unlink($stale);
            }
        }
    }

    $salt = dicot_setting('DOWNLOAD_SIGNING_KEY');
    if ($salt === '') {
        $salt = 'dicot-rate-limit';
    }
    $name = $bucket . '-' . hash('sha256', $bucket . '|' . $ip . '|' . $salt) . '.json';
    $path = $dir . '/' . $name;

    $handle = @fopen($path, 'c+');
    if ($handle === false) {
        error_log('Rate limit unavailable: counter file could not be opened.');
        return true;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return true;
        }

        $raw = stream_get_contents($handle);
        $state = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
        $now = time();
        $start = is_array($state) ? (int) ($state['start'] ?? 0) : 0;
        $count = is_array($state) ? (int) ($state['count'] ?? 0) : 0;

        if ($start === 0 || $now - $start >= $windowSeconds) {
            $start = $now;
            $count = 0;
        }
        $count++;

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode(['start' => $start, 'count' => $count]));
        fflush($handle);

        return $count <= $limit;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}
