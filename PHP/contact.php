<?php 
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    require 'src/Exception.php';
    require 'src/PHPMailer.php';
    require 'src/SMTP.php';

    $mail = new PHPMailer(true);
    $mail->IsSMTP();
    $mail->Mailer = "smtp";

    $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'smtp.gmail.com';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                             //Enable SMTP authentication
    $mail->Username   = 'dicotindia@gmail.com';                     //SMTP username
    $mail->Password   = 'naseeb06012020';                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;         //Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` encouraged
    $mail->Port       = 465;                                    //TCP port to connect to, use 465 for `PHPMailer::ENCRYPTION_SMTPS` above


    $to = "sales@dicot.in"; // this is your Email address
    $from = $_POST['email']; // this is the sender's Email address
    $first_name = $_POST['name'];
<<<<<<< HEAD
    $subject = "Inquiry";
    $message = "Message:" . "\n\n" . $_POST['textans'];
    $mail->setFrom($from, $first_name);
    $mail->addAddress($to, 'Sales Team');
    $mail->Subject = $subject;
    $mail->AltBody=$message;
    $mail->send();
    //You can change 'Sent Mail' to any other folder or tag
    $path = '{imap.gmail.com:993/imap/ssl}[Gmail]/Sent Mail';

    //Tell your server to open an IMAP connection using the same username and password as you used for SMTP
    $imapStream = imap_open($path, $mail->Username, $mail->Password);

    $result = imap_append($imapStream, $path, $mail->getSentMIMEMessage());
    imap_close($imapStream);
=======
    $subject = "Inquiry Dicot";
    $message = $first_name . " contact no: " . $_POST['tel'] . " Email: " . $from . " wrote the following:" . "\n\n" . $_POST['textans'];

    $headers = "From:" . $from;

    email($to,$subject,$message,$headers);
>>>>>>> 29dfee27e885dff3d923e456c11918249c0dbfce
?>