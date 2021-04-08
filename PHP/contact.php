<?php 

    $to = "sales@dicot.in"; // this is your Email address
    $from = $_POST['email']; // this is the sender's Email address
    $first_name = $_POST['name'];
    $subject = "Inquiry";
    $message = $first_name . " contact no: " . $_POST['tel'] . " Email: " . $from . " wrote the following:" . "\n\n" . $_POST['textans'];

    $headers = "From:" . $to;
    mail($to,$subject,$message,$headers);
?>