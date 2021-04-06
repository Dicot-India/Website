require('recaptcha-master/src/autoload.php');

$recaptchaSecret = '6LfPhJsaAAAAAF2Xzi4FPyS7cUXZZ1JA0aIjJCBF';

$recaptcha = new \ReCaptcha\ReCaptcha($recaptchaSecret);

$response = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);

if (!$response->isSuccess()) {

}
else {
    
}