<?php
declare(strict_types=1);

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

$from = 'website@dicot.tech';

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

$headers = [
    'From: Dicot Website <' . $from . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
    'X-Content-Type-Options: nosniff',
];

$sent = mail($to, $subject, $body, implode("\r\n", $headers));

// shortcut: no per-IP rate limit beyond the honeypot; add one if spam gets through.
if (!$sent) {
    header('Location: /contact/?error=1', true, 303);
    exit;
}
header('Location: /thank-you/', true, 303);
exit;
