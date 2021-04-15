<?php 
    
    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    use PHPMailer\PHPMailer\SMTP;

    require 'src/Exception.php';
    require 'src/PHPMailer.php';
    require 'src/SMTP.php';

    $mail = new PHPMailer(true);
    $mail->IsSMTP();
    $mail->Mailer = "smtp";
    
    $mail->SMTPDebug = 3;//SMTP::DEBUG_SERVER;
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username   = 'dicotindia@gmail.com';                     
    $mail->Password   = 'naseeb06012020';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    $mail->SMTPOptions = array(
	'ssl'=> array(
	    'verify_peer' => false,
	    'verify_peer_name' => false,
	    'allow_self_signed' => true,
	)
    );

    $to = "sales@dicot.in";
    $from = $_POST['email'];
    $first_name = $_POST['name'];

    $subject = "Inquiry Dicot from " . $first_name;
    $message = " Name: ". $first_name . " Email: " . $from . " Contact No.: " . $_POST['tel'] . " Message: " . $_POST['textans'];
    
    //email($to,$subject,$message,$headers);
    $mail->SetFrom($from, 'Contact form');
    $mail->addAddress('sales@dicot.in', 'Sales Team');
    $mail->Subject = $subject;
    $mail->Body=$message;
    if(!$mail->send())
    {
        echo "Didn't send mail!";
    }
    
?>