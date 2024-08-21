<?php 
// Set the Content-Type header to application/json
header('Content-Type: application/json');

// Include the database connection script
include('db/db.php');

// Initialize variables
$companyName = $emailAddress = $phoneNo = $customerName = "";
$product = array();

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] == "POST") {

    // Sanitize and validate input data
    $companyName = isset($_POST['companyName']) ? htmlspecialchars($_POST['companyName']) : "";
    $phoneNo = isset($_POST['contactNo']) ? htmlspecialchars($_POST['contactNo']) : "";
    $customerName = isset($_POST['customerName']) ? htmlspecialchars($_POST['customerName']) : "";
    $emailAddress = isset($_POST['email']) ? htmlspecialchars($_POST['email']) : "";
    $product = isset($_POST['dicotproduct']) ? $_POST['dicotproduct'] : array();

    // Establish a database connection
    $conn = connectToDB();

    // Insert data into the database
    $success = insertData($conn, $companyName, $customerName, $phoneNo, $emailAddress, $product);

    // Check if the data insertion was successful
    if ($success) {
        // Return a JSON response indicating success
        echo json_encode(['success' => true, 'message' => 'Form submitted successfully!']);
    }
}
?>
