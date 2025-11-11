<?php
header('Content-Type: application/json');

// Database connection settings
$servername = "localhost";
$dbusername = "your_db_username";
$dbpassword = "your_db_password";
$dbname = "your_database_name";

// Connect to MySQL
$conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit();
}

// Get the POSTed JSON data
$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data['username']);
$password = $data['password'];

// Basic validation
if (empty($username) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Username and password are required."]);
    exit();
}

// Check if username exists
$stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Username already taken."]);
    exit();
}
$stmt->close();

// Hash the password securely
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
$stmt->bind_param("ss", $username, $hashed_password);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Account created successfully!"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
