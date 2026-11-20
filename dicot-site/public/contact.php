<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

// Contact endpoint for dicot.tech. Hostinger serves PHP next to the static build.
$to = 'sales@dicot.tech';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /contact/', true, 303);
    exit;
}

// Honeypot: real browsers leave this empty. Bots get a silent success.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    header('Location: /thank-you/', true, 303);
    exit;
}

$privateSettingsPath = dirname(__DIR__) . '/contact-secrets.php';
$privateSettings = is_file($privateSettingsPath) ? require $privateSettingsPath : [];
if (!is_array($privateSettings)) {
    error_log('Contact form unavailable: contact-secrets.php must return an array.');
    header('Location: /contact/?error=1', true, 303);
    exit;
}

$getSetting = static function (string $name) use ($privateSettings): string|false {
    $value = getenv($name);
    if ($value !== false) {
        return $value;
    }

    $value = $privateSettings[$name] ?? false;
    return is_string($value) ? $value : false;
};

$turnstileSecret = $getSetting('TURNSTILE_SECRET_KEY');
$turnstileResponse = trim((string)($_POST['cf-turnstile-response'] ?? ''));
if ($turnstileSecret === false || $turnstileSecret === '') {
    error_log('Contact form unavailable: TURNSTILE_SECRET_KEY is not configured.');
    header('Location: /contact/?error=1', true, 303);
    exit;
}
if ($turnstileResponse === '' || strlen($turnstileResponse) > 2048 || !function_exists('curl_init')) {
    header('Location: /contact/?error=1', true, 303);
    exit;
}

$curl = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
if ($curl === false) {
    error_log('Contact form unavailable: could not initialize cURL.');
    header('Location: /contact/?error=1', true, 303);
    exit;
}

curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'secret' => $turnstileSecret,
        'response' => $turnstileResponse,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
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

$verification = is_string($verificationResponse)
    ? json_decode($verificationResponse, true)
    : null;
if (
    $verificationStatus !== 200
    || !is_array($verification)
    || ($verification['success'] ?? false) !== true
    || ($verification['hostname'] ?? '') !== 'dicot.tech'
) {
    header('Location: /contact/?error=1', true, 303);
    exit;
}

function line(string $key, int $max): string
{
    $value = trim((string)($_POST[$key] ?? ''));
    $value = str_replace(["\r", "\n"], ' ', $value);
    return mb_substr($value, 0, $max);
}

$name = line('name', 100);
$company = line('company', 120);
$email = line('email', 160);
$phone = line('phone', 40);
$interest = line('interest', 40);
$message = mb_substr(trim((string)($_POST['message'] ?? '')), 0, 4000);
$consent = ($_POST['consent'] ?? '') === 'yes';
$updates = ($_POST['updates'] ?? '') === 'yes';

$interestLabels = [
    'demo' => 'Product demo',
    'vision-c' => 'Vision C',
    'vision-web' => 'Vision Web',
    'vision-s' => 'Vision S',
    'vgraphic' => 'VGraphic',
    'oem' => 'OEM / white-label',
    'partner' => 'Dealer or partner',
    'support' => 'Technical support',
    'other' => 'Other',
];

if ($name === '' || $email === '' || $message === '' || !$consent) {
    header('Location: /contact/?error=1', true, 303);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: /contact/?error=1', true, 303);
    exit;
}
if (!isset($interestLabels[$interest])) {
    $interest = 'other';
}

$subject = 'Website enquiry: ' . $interestLabels[$interest] . ' — ' . $name;
$body = "New website enquiry\n\n"
    . "Name: {$name}\n"
    . "Company: {$company}\n"
    . "Email: {$email}\n"
    . "Phone: {$phone}\n"
    . "Interest: {$interestLabels[$interest]}\n"
    . "Product updates opt-in: " . ($updates ? 'yes' : 'no') . "\n"
    . "Consent given: yes\n\n"
    . "Message:\n{$message}\n\n"
    . "Sent: " . gmdate('Y-m-d H:i:s') . " UTC\n"
    . "IP: " . substr((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 0, 45) . "\n";

$smtpHost = trim((string)($getSetting('SMTP_HOST') ?: ''));
$smtpUsername = trim((string)($getSetting('SMTP_USERNAME') ?: ''));
$smtpPassword = $getSetting('SMTP_PASSWORD');
$smtpPortValue = $getSetting('SMTP_PORT');
$smtpPort = $smtpPortValue === false || $smtpPortValue === '' ? 587 : (int)$smtpPortValue;
$from = trim((string)($getSetting('SMTP_FROM') ?: $smtpUsername));

if ($smtpHost === '' || $smtpUsername === '' || $smtpPassword === false || $smtpPassword === '' || $smtpPort < 1 || $smtpPort > 65535) {
    error_log('Contact form unavailable: SMTP settings are incomplete.');
    header('Location: /contact/?error=1', true, 303);
    exit;
}

$autoload = __DIR__ . '/vendor/autoload.php';
if (!is_file($autoload)) {
    error_log('Contact form unavailable: PHPMailer is missing from the deployment.');
    header('Location: /contact/?error=1', true, 303);
    exit;
}
require_once $autoload;

$mailer = new PHPMailer(true);
try {
    $mailer->isSMTP();
    $mailer->Host = $smtpHost;
    $mailer->SMTPAuth = true;
    $mailer->Username = $smtpUsername;
    $mailer->Password = $smtpPassword;
    $mailer->Port = $smtpPort;
    $mailer->SMTPSecure = $smtpPort === 465
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mailer->Timeout = 10;
    $mailer->CharSet = 'UTF-8';
    $mailer->setFrom($from, 'Dicot Website');
    $mailer->addAddress($to);
    $mailer->addReplyTo($email);
    $mailer->Subject = $subject;
    $mailer->Body = $body;
    $mailer->send();
} catch (\PHPMailer\PHPMailer\Exception $error) {
    error_log('Contact form SMTP delivery failed: ' . str_replace(["\r", "\n"], ' ', $error->getMessage()));
    header('Location: /contact/?error=1', true, 303);
    exit;
}
header('Location: /thank-you/', true, 303);
exit;
