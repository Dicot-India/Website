<?php 
if(isset($_POST['submit']) && isset($_POST['name']) && isset($_POST['email']) && isset($_POST['txet-ans'])){
    $to = "sales@dicot.in"; // this is your Email address
    $from = $_POST['email']; // this is the sender's Email address
    $first_name = $_POST['name'];
    $subject = "Inquiry";
    $message = $first_name . " contact no: " . $_POST['tel'] . " Email: " . $from . " wrote the following:" . "\n\n" . $_POST['text-ans'];
    $message2 = "Here is a copy of your message " . $first_name . "\n\n" . $_POST['text-ans'];

    $headers = "From:" . $from;
    mail($to,$subject,$message,$headers);
    echo "Mail Sent. Thank you " . $first_name . ", we will contact you shortly.";
}
else
{
    echo "Please fill the required feilds";
}

?>