<?php 

// Create connection to the database
function connectToDB() {
    require __DIR__ . '/vendor/autoload.php';

    use Dotenv\Dotenv;

    // Load .env file
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    $servername = $_ENV['DB_HOST'];
    $username =  $_ENV['DB_DATABASE'];
    $password =$_ENV['DB_USERNAME'];
    $dbname = $_ENV['DB_PASSWORD'];
    
    // Create a new mysqli connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Check if the connection is successful
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    return $conn;
}

// Insert data into the Inquiries table
function insertData($conn, $companyName, $customerName, $phoneNo, $email, $product) {
    try{
        // Start building the SQL query
        $query = "INSERT INTO Inquires";
        
        // Initialize the keys and values parts of the SQL query
        $key = "(Name, Company, Phone, Email";
        $value = "VALUES ('" . $customerName . "', '" . $companyName . "', '" . $phoneNo . "', '" . $email . "'";
        
        // Check if each product is in the product array and append to keys and values
        if (in_array("visionc", $product)) {
            $value .= ", '1'";
            $key .= ", VisionC";
        }
        if (in_array("visionweb", $product)) {
            $value .= ", '1'";
            $key .= ", VisionWeb";
        }
        if (in_array("vgraphic", $product)) {
            $value .= ", '1'";
            $key .= ", VGraphic";
        }
        if (in_array("dstick", $product)) {
            $value .= ", '1'";
            $key .= ", DStick";
        }
        
        // Close the keys and values parts of the SQL query
        $key .= ")";
        $value .= ")";
        
        // Combine query parts to create the final SQL command
        $command = $query . " " . $key . " " . $value;
        
        
        // Execute the SQL command
        if ($conn->query($command) === TRUE) {
            return TRUE;
        } else {
            // Output error if the query fails
            echo "Error: " . $command . "<br>" . $conn->error;
            throw $conn->error;
        }
    }
    catch(err){
        throw err;
    }
}

// Example usage:
// $conn = connectToDB();
// insertData($conn, "Example Company", "John Doe", "123-456-7890", "john@example.com", ["visionc", "dstick"]);

?>
