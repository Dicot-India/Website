<?php 
require('recaptcha-master/src/autoload.php');

$recaptchaSecret = '6LfPhJsaAAAAAF2Xzi4FPyS7cUXZZ1JA0aIjJCBF';

$recaptcha = new \ReCaptcha\ReCaptcha($recaptchaSecret);

$response = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);

if (!$response->isSuccess()) {

}
else {
    if(isset($_POST['submit'])){
        $to = "sales@dicot.in"; // this is your Email address
        $from = $_POST['email']; // this is the sender's Email address
        $first_name = $_POST['name'];
        $subject = "Inquiry";
        $message = $first_name . " contact no: " . $_POST['tel'] . " Email: " . $from . " wrote the following:" . "\n\n" . $_POST['text-ans'];
        $message2 = "Here is a copy of your message " . $first_name . "\n\n" . $_POST['text-ans'];
    
        $headers = "From:" . $from;
        mail($to,$subject,$message,$headers);
        echo "Mail Sent. Thank you " . $first_name . ", we will contact you shortly.";
        // You can also use header('Location: thank_you.php'); to redirect to another page.
    }
}

?>