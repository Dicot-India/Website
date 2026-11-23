<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

// Refuse a direct request to this file; it is only meant to be required.
if (isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__) {
    http_response_code(404);
    exit;
}

/**
 * Sends one plain-text message through the Zoho SMTP account.
 *
 * An optional file (the applicant's resume) is attached from disk; it is never
 * copied or stored by the site.
 *
 * @return string|null Null on success, a short error description otherwise.
 */
function dicot_send_mail(
    string $to,
    string $subject,
    string $body,
    string $replyTo = '',
    string $attachmentPath = '',
    string $attachmentName = ''
): ?string
{
    $host = dicot_setting('SMTP_HOST');
    $username = dicot_setting('SMTP_USERNAME');
    $password = dicot_setting('SMTP_PASSWORD');
    $portValue = dicot_setting('SMTP_PORT');
    $port = $portValue === '' ? 587 : (int) $portValue;
    $from = dicot_setting('SMTP_FROM');
    if ($from === '') {
        $from = $username;
    }

    if ($host === '' || $username === '' || $password === '' || $port < 1 || $port > 65535) {
        return 'SMTP settings are incomplete.';
    }

    $autoload = dirname(__DIR__) . '/vendor/autoload.php';
    if (!is_file($autoload)) {
        return 'PHPMailer is missing from the deployment.';
    }
    require_once $autoload;

    try {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->Host = $host;
        $mailer->SMTPAuth = true;
        $mailer->Username = $username;
        $mailer->Password = $password;
        $mailer->Port = $port;
        $mailer->SMTPSecure = $port === 465
            ? PHPMailer::ENCRYPTION_SMTPS
            : PHPMailer::ENCRYPTION_STARTTLS;
        $mailer->Timeout = 10;
        $mailer->CharSet = 'UTF-8';
        $mailer->setFrom($from, 'Dicot Website');
        $mailer->addAddress($to);
        if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL) !== false) {
            $mailer->addReplyTo($replyTo);
        }
        $mailer->Subject = $subject;
        $mailer->Body = $body;
        if ($attachmentPath !== '' && is_file($attachmentPath)) {
            $mailer->addAttachment($attachmentPath, $attachmentName !== '' ? $attachmentName : basename($attachmentPath));
        }
        $mailer->send();
        return null;
    } catch (Throwable $error) {
        return str_replace(["\r", "\n"], ' ', $error->getMessage());
    }
}
