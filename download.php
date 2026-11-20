<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/settings.php';
require_once __DIR__ . '/lib/rate-limit.php';
require_once __DIR__ . '/lib/mail.php';

/**
 * Gated Vision S download endpoint.
 *
 * POST validates the request and the DPDP consent, records the consent in the
 * internal lead email, and then either emails a signed 48-hour link or
 * redirects straight to the installer.
 * GET with a valid signature redirects to the file; nothing is stored.
 */

const DICOT_BUILDS = [
    'green' => ['file' => 'VisionS.iso', 'label' => 'Vision S (green key)', 'size' => '827 MB'],
    'grey' => ['file' => 'VisionS_Version_2026.iso', 'label' => 'Vision S Version 2026 (grey key)', 'size' => '977 MB'],
];
const DICOT_CONSENT_VERSION = '2026-11-1';
const DICOT_PAGE = '/downloads/vision-s/';
const DICOT_SALES = 'sales@dicot.tech';
const DICOT_PRIVACY = 'privacy@dicot.tech';
const DICOT_LINK_HOURS = 48;
const DICOT_RETENTION = '24 months from our last contact';

function dicot_download_fail(string $reason): void
{
    header('Location: ' . DICOT_PAGE . '?error=1&reason=' . urlencode($reason), true, 303);
    exit;
}

/**
 * Key that signs the emailed links.
 *
 * DOWNLOAD_SIGNING_KEY is the intended value. When it is missing the key is
 * derived from a secret the deployment already needs, so the email flow works
 * before that setting is added. Adding or rotating that secret invalidates
 * links already sent, which is acceptable inside the 48-hour window.
 */
function dicot_download_key(): string
{
    $key = dicot_setting('DOWNLOAD_SIGNING_KEY');
    if ($key !== '') {
        return $key;
    }

    foreach (['SMTP_PASSWORD', 'TURNSTILE_SECRET_KEY'] as $source) {
        $secret = dicot_setting($source);
        if ($secret !== '') {
            return hash('sha256', 'dicot-vision-s-links|' . $secret);
        }
    }

    return '';
}

function dicot_download_signature(string $build, int $expires, string $emailHash): string
{
    $key = dicot_download_key();
    if ($key === '') {
        return '';
    }
    $raw = hash_hmac('sha256', 'vision-s|' . $build . '|' . $expires . '|' . $emailHash, $key, true);
    return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
}

/**
 * @return array{url: string, expires: int}
 */
function dicot_download_link(string $build, string $email): array
{
    $expires = time() + DICOT_LINK_HOURS * 3600;
    // A short hash keeps the address out of the URL while binding the link to it.
    $emailHash = substr(hash('sha256', 'vision-s|' . strtolower($email)), 0, 16);
    $signature = dicot_download_signature($build, $expires, $emailHash);

    return [
        'url' => 'https://dicot.tech/download.php?' . http_build_query([
            'build' => $build,
            'exp' => $expires,
            'u' => $emailHash,
            'sig' => $signature,
        ]),
        'expires' => $expires,
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Signed link: redirect to the installer. No data is written.
if ($method !== 'POST') {
    $build = (string) ($_GET['build'] ?? '');
    $expires = (int) ($_GET['exp'] ?? 0);
    $emailHash = (string) ($_GET['u'] ?? '');
    $signature = (string) ($_GET['sig'] ?? '');

    if (
        !array_key_exists($build, DICOT_BUILDS)
        || $expires < time()
        || $expires > time() + 14 * 86400
        || $emailHash === ''
        || $signature === ''
    ) {
        header('Location: ' . DICOT_PAGE, true, 303);
        exit;
    }
    if (!hash_equals(dicot_download_signature($build, $expires, $emailHash), $signature)) {
        header('Location: ' . DICOT_PAGE . '?error=1&reason=token', true, 303);
        exit;
    }

    header('Cache-Control: no-store');
    header('Referrer-Policy: no-referrer');
    header('Location: /' . DICOT_BUILDS[$build]['file'], true, 302);
    exit;
}

// Honeypot: real browsers leave this empty. Bots get a silent success.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    header('Location: /thank-you/?type=vision-s', true, 303);
    exit;
}

// Validate the submission before spending a Turnstile call or a rate-limit
// slot on it. A missing or unticked consent box stops here.
$name = dicot_line('name', 100);
$company = dicot_line('company', 120);
$email = dicot_line('email', 160);
$phone = dicot_line('phone', 40);
$build = (string) ($_POST['build'] ?? '');
$mode = (string) ($_POST['mode'] ?? '');
$consent = ($_POST['consent'] ?? '') === 'yes';
$updates = ($_POST['updates'] ?? '') === 'yes';

// DPDP: the required consent must be an explicit, affirmative choice.
if ($name === '' || $company === '' || $email === '' || !$consent) {
    dicot_download_fail('fields');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    dicot_download_fail('fields');
}
if (!array_key_exists($build, DICOT_BUILDS) || ($mode !== 'email' && $mode !== 'direct')) {
    dicot_download_fail('fields');
}

$ip = dicot_client_ip();
$hourOk = dicot_rate_limit('download-hour', $ip, 5, 3600);
$dayOk = dicot_rate_limit('download-day', $ip, 20, 86400);
if (!$hourOk || !$dayOk) {
    header('Retry-After: 600');
    dicot_download_fail('rate');
}

$turnstileSecret = dicot_setting('TURNSTILE_SECRET_KEY');
$turnstileResponse = trim((string) ($_POST['cf-turnstile-response'] ?? ''));
if ($turnstileSecret === '') {
    error_log('Vision S download unavailable: TURNSTILE_SECRET_KEY is not configured.');
    dicot_download_fail('config');
}
if ($turnstileResponse === '' || strlen($turnstileResponse) > 2048 || !function_exists('curl_init')) {
    dicot_download_fail('token');
}

$curl = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
if ($curl === false) {
    error_log('Vision S download unavailable: could not initialize cURL.');
    dicot_download_fail('config');
}
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'secret' => $turnstileSecret,
        'response' => $turnstileResponse,
        'remoteip' => $ip,
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 5,
]);
$verificationResponse = curl_exec($curl);
$verificationStatus = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
if ($verificationResponse === false) {
    error_log('Turnstile verification request failed: ' . curl_error($curl));
}
curl_close($curl);

$verification = is_string($verificationResponse) ? json_decode($verificationResponse, true) : null;
if (
    $verificationStatus !== 200
    || !is_array($verification)
    || ($verification['success'] ?? false) !== true
    || ($verification['hostname'] ?? '') !== 'dicot.tech'
) {
    dicot_download_fail('token');
}

$buildInfo = DICOT_BUILDS[$build];
$timestamp = gmdate('Y-m-d H:i:s');
$consentText = 'I agree that Dicot Innovations may use these details to send my Vision S download link '
    . 'and to contact me about this download. I have read the privacy policy.';

// The lead email doubles as the consent record: exact wording, notice version
// and timestamp. There is no database, so this mailbox is the record of proof.
$leadBody = "New Vision S download request\n\n"
    . "Name: {$name}\n"
    . "Company: {$company}\n"
    . "Email: {$email}\n"
    . "Phone: " . ($phone !== '' ? $phone : '(not given)') . "\n"
    . "Build: {$buildInfo['label']}\n"
    . "File: {$buildInfo['file']} ({$buildInfo['size']})\n"
    . "Delivery: " . ($mode === 'email' ? 'signed email link' : 'direct download') . "\n"
    . "Product updates opt-in: " . ($updates ? 'yes' : 'no') . "\n\n"
    . "Consent record\n"
    . "  Text: {$consentText}\n"
    . "  Notice version: " . DICOT_CONSENT_VERSION . "\n"
    . "  Given: {$timestamp} UTC\n"
    . "  Withdrawal: write to " . DICOT_PRIVACY . "; withdrawal is as easy as giving consent.\n\n"
    . "Request IP: {$ip}\n"
    . "Retention: " . DICOT_RETENTION . ". Delete this record when the window ends.\n";

$leadSubject = 'Vision S download: ' . $buildInfo['label'] . ' — ' . $name . ' (' . $company . ')';

// The lead email is the consent record, so it is always sent. Its failure is
// logged rather than shown: blocking the file here would punish the visitor for
// our SMTP.
$sendLead = static function () use ($leadSubject, $leadBody, $email): void {
    $leadError = dicot_send_mail(DICOT_SALES, $leadSubject, $leadBody, $email);
    if ($leadError !== null) {
        error_log('Vision S download: lead email failed: ' . $leadError);
    }
};

if ($mode === 'direct') {
    // Release the response first. SMTP takes a few seconds, and the browser
    // should start the large transfer instead of waiting for our mailbox.
    header('Cache-Control: no-store');
    header('Location: /' . $buildInfo['file'], true, 303);
    dicot_finish_response();
    $sendLead();
    exit;
}

$sendLead();

if (dicot_download_key() === '') {
    error_log('Vision S download unavailable: no signing key. Set DOWNLOAD_SIGNING_KEY, or the SMTP password it falls back to.');
    dicot_download_fail('config');
}

$link = dicot_download_link($build, $email);
$expiresLabel = gmdate('d M Y H:i', $link['expires']) . ' UTC';

$userBody = "Hello {$name},\n\n"
    . "Your download link for {$buildInfo['label']} is below. It is valid for " . DICOT_LINK_HOURS
    . " hours, until {$expiresLabel}, and downloads {$buildInfo['size']} in one file.\n\n"
    . $link['url'] . "\n\n"
    . "If the link expires, request a new one at https://dicot.tech" . DICOT_PAGE . "\n\n"
    . "What we recorded: your name, company, work email" . ($phone !== '' ? ', phone' : '')
    . " and the build you chose, so we can send this link and help if the install needs it. "
    . "We keep it for " . DICOT_RETENTION . ".\n\n"
    . "Withdraw consent, or ask for a copy or deletion, at any time: " . DICOT_PRIVACY . "\n"
    . "Privacy policy: https://dicot.tech/legal/privacy/\n\n"
    . "Licence questions: " . DICOT_SALES . " or +91 90166 83114.\n\n"
    . "Dicot Innovations Private Limited\n";

$userSubject = 'Your Vision S download link (' . DICOT_LINK_HOURS . ' hours)';
$userError = dicot_send_mail($email, $userSubject, $userBody, DICOT_SALES);
if ($userError !== null) {
    error_log('Vision S download: link email failed: ' . $userError);
    dicot_download_fail('mail');
}

header('Location: ' . DICOT_PAGE . '?sent=1', true, 303);
exit;

