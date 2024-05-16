<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "game_master";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = json_decode(file_get_contents("php://input"));

$username = $data->username;
$email = $data->email;
$password = password_hash($data->password, PASSWORD_BCRYPT);

$sql = "SELECT * FROM users WHERE username = '$username' OR email = '$email'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo json_encode(["success" => false, "error" => "Username or Email already exists."]);
} else {
    $sql = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $conn->error]);
    }
}

$conn->close();
?>
