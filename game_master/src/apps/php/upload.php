<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "game_master";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$name = $_POST['name'];
$price = $_POST['price'];

// Handling the image file
$image = null;
if (isset($_FILES['image'])) {
    $image = file_get_contents($_FILES['image']['tmp_name']);
}

// Handling the video file
$video = null;
if (isset($_FILES['video'])) {
    $video = file_get_contents($_FILES['video']['tmp_name']);
}

$stmt = $conn->prepare("INSERT INTO games (name, price, image, videoUrl) VALUES (?, ?, ?, ?)");
$stmt->bind_param("sssb", $name, $price, $image, $video);

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => "Database error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
