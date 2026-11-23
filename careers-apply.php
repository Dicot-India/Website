<?php
declare(strict_types=1);

require_once __DIR__ . '/lib/settings.php';
require_once __DIR__ . '/lib/rate-limit.php';
require_once __DIR__ . '/lib/mail.php';

/**
 * On-site job application endpoint.
 *
 * POST validates the form, the resume and Turnstile, then emails the
 * application to careers@dicot.tech with the resume attached. The upload is
 * never written to disk: PHPMailer reads it from the PHP temp file, so no CV
 * is left behind on the server.
 */

const DICOT_CAREERS = 'careers@dicot.tech';
const DICOT_CAREERS_PAGE = '/careers/';
const DICOT_RESUME_BYTES = 5242880; // 5 MB

$fail = static function (string $reason = 'fields'): void {
    header('Location: ' . DICOT_CAREERS_PAGE . '?error=1&reason=' . urlencode($reason), true, 303);
    exit;
};

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: ' . DICOT_CAREERS_PAGE, true, 303);
    exit;
}

// Honeypot: real browsers leave this empty. Bots get a silent success.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    header('Location: /thank-you/', true, 303);
    exit;
}

$role = dicot_line('role', 120);
$name = dicot_line('name', 100);
$phone = dicot_line('phone', 40);
$email = dicot_line('email', 160);
$fit = mb_substr(trim((string) ($_POST['fit'] ?? '')), 0, 3000);
$obsession = mb_substr(trim((string) ($_POST['obsession'] ?? '')), 0, 3000);
$consent = ($_POST['consent'] ?? '') === 'yes';

if ($role === '' || $name === '' || $phone === '' || $email === '' || $fit === '' || $obsession === '' || !$consent) {
    $fail();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $fail();
}
if (preg_match('/^[0-9+()\s.\-]{7,40}$/', $phone) !== 1) {
    $fail();
}

// Resume: extension and size only. The file is attached to an inbox mail and
// never stored or served, so its content cannot execute anywhere in our stack.
// shortcut: extension check, add finfo sniffing if CVs are ever parsed.
$resume = $_FILES['resume'] ?? null;
$resumeError = is_array($resume) ? (int) ($resume['error'] ?? UPLOAD_ERR_NO_FILE) : UPLOAD_ERR_NO_FILE;
if ($resumeError !== UPLOAD_ERR_OK) {
    $fail(in_array($resumeError, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) ? 'large' : 'resume');
}

$resumePath = (string) ($resume['tmp_name'] ?? '');
$resumeName = basename((string) ($resume['name'] ?? 'resume'));
$resumeSize = (int) ($resume['size'] ?? 0);
if ($resumePath === '' || !is_uploaded_file($resumePath)) {
    $fail('resume');
}
if ($resumeSize < 1 || $resumeSize > DICOT_RESUME_BYTES) {
    $fail('large');
}
if (!in_array(strtolower(pathinfo($resumeName, PATHINFO_EXTENSION)), ['pdf', 'doc', 'docx'], true)) {
    $fail('resume');
}

$ip = dicot_client_ip();
if (!dicot_rate_limit('careers-hour', $ip, 3, 3600) || !dicot_rate_limit('careers-day', $ip, 10, 86400)) {
    header('Retry-After: 600');
    $fail('rate');
}

$turnstileSecret = dicot_setting('TURNSTILE_SECRET_KEY');
$turnstileResponse = trim((string) ($_POST['cf-turnstile-response'] ?? ''));
if ($turnstileSecret === '') {
    error_log('Job application unavailable: TURNSTILE_SECRET_KEY is not configured.');
    $fail('config');
}
if ($turnstileResponse === '' || strlen($turnstileResponse) > 2048 || !function_exists('curl_init')) {
    $fail('token');
}

$curl = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
if ($curl === false) {
    error_log('Job application unavailable: could not initialize cURL.');
    $fail('config');
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
    $fail('token');
}

$received = gmdate('Y-m-d H:i:s');
$consentText = 'I agree that Dicot may use these details and my resume to assess this application.';

// The application email doubles as the consent record: wording, timestamp, IP.
$body = "New job application\n\n"
    . "Role: {$role}\n"
    . "Name: {$name}\n"
    . "Phone: {$phone}\n"
    . "Email: {$email}\n"
    . "Resume: {$resumeName} (" . number_format($resumeSize / 1048576, 2) . " MB attached)\n\n"
    . "What makes you uniquely positioned to succeed in this role:\n{$fit}\n\n"
    . "Obsession, rabbit hole or self-taught skill:\n{$obsession}\n\n"
    . "Consent record\n"
    . "  Text: {$consentText}\n"
    . "  Given: {$received} UTC\n"
    . "  Withdrawal: write to privacy@dicot.tech\n\n"
    . "Received: {$received} UTC\n"
    . "IP: {$ip}\n";

$error = dicot_send_mail(
    DICOT_CAREERS,
    'Application: ' . $role . ' — ' . $name,
    $body,
    $email,
    $resumePath,
    $resumeName
);
if ($error !== null) {
    error_log('Job application email failed: ' . $error);
    $fail('mail');
}

header('Location: /thank-you/', true, 303);
exit;
