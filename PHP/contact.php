<?php 
    require 'src/Exception.php';
    require 'src/PHPMailer.php';
    require 'src/SMTP.php';
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    $mail = new PHPMailer(true);
    $mail->IsSMTP();
    $mail->Mailer = "smtp";

    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'dicotindia@gmail.com';                     
    $mail->Password   = 'naseeb06012020';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;


    $to = "sales@dicot.in";
    $from = $_POST['email'];
    $first_name = $_POST['name'];

    $subject = "Inquiry Dicot";
    $message = "Message: " . $_POST['textans'];
    $headers = "From:" . $from;

/*     email($to,$subject,$message,$headers); */
    $mail->setFrom($from, $first_name);
    $mail->addAddress('sales@dicot.in', 'Sales Team');
    $mail->Subject = $subject;
    $mail->AltBody=$message;
    if(!$mail->send())
    {
        echo "Didn't send mail!";
    }
    
?>