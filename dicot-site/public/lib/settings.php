<?php
declare(strict_types=1);

// Refuse a direct request to this file; it is only meant to be required.
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    http_response_code(404);
    exit;
}

/**
 * Deployment settings for the PHP endpoints.
 *
 * Values are read from the process environment first, then from
 * contact-secrets.php one directory above the web root. Secrets must never be
 * committed or placed inside public_html.
 */

/**
 * @return array<string, mixed>
 */
function dicot_secret_file(): array
{
    static $loaded = null;
    if (is_array($loaded)) {
        return $loaded;
    }

    $loaded = [];
    // __DIR__ is public_html/lib on the server, so go up two levels.
    $path = dirname(__DIR__, 2) . '/contact-secrets.php';
    if (is_file($path)) {
        $values = require $path;
        if (is_array($values)) {
            $loaded = $values;
        } else {
            error_log('contact-secrets.php must return an array.');
        }
    }

    return $loaded;
}

function dicot_setting(string $name): string
{
    $value = getenv($name);
    if ($value !== false && $value !== '') {
        return $value;
    }

    $secret = dicot_secret_file();
    $value = $secret[$name] ?? '';
    return is_string($value) ? $value : '';
}

/**
 * Trim, strip newlines and cap the length of a posted single-line field.
 */
function dicot_line(string $key, int $max): string
{
    $value = trim((string) ($_POST[$key] ?? ''));
    $value = str_replace(["\r", "\n"], ' ', $value);
    return mb_substr($value, 0, $max);
}

function dicot_client_ip(): string
{
    // Cloudflare forwards the real client address; the origin sees the edge IP.
    $candidates = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];
    foreach ($candidates as $candidate) {
        $value = trim(explode(',', (string) $candidate)[0]);
        if ($value !== '' && filter_var($value, FILTER_VALIDATE_IP) !== false) {
            return $value;
        }
    }
    return '0.0.0.0';
}

/**
 * Hand the response to the client and keep the script running.
 *
 * Used after the redirect for a direct download: the visitor must not wait for
 * the SMTP conversation before a large transfer starts. Where the SAPI cannot
 * flush early the function is a no-op and the caller simply continues normally.
 */
function dicot_finish_response(): void
{
    ignore_user_abort(true);
    while (ob_get_level() > 0) {
        ob_end_flush();
    }
    flush();

    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
    } elseif (function_exists('litespeed_finish_request')) {
        litespeed_finish_request();
    }
}
