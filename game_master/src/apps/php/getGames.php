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
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$sql = "SELECT * FROM games";
$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Query failed: " . $conn->error]);
    exit();
}

$games = array();
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $row['image'] = 'http://localhost/project_e-commerce/game_master/src/apps/assets/images/' . basename($row['image']);
        if ($row['videoUrl']) {
            $row['videoUrl'] = 'http://localhost/project_e-commerce/game_master/src/apps/assets/videos/' . basename($row['videoUrl']);
        } else {
            $row['videoUrl'] = null; 
        }
        $games[] = $row;
    }
} else {
    echo json_encode(["success" => false, "error" => "No games found"]);
    exit();
}

echo json_encode($games);

$conn->close();
?>
