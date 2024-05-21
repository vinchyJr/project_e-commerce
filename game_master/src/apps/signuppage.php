<?php
header("Access-Control-Allow-Origin: *");  
header("Content-Type: application/json; charset=UTF-8");  
header("Access-Control-Allow-Methods: POST");  
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$host = 'localhost'; 
$dbname = 'game-master';
$username = 'root';
$password = '';
$dsn = "mysql:host=$host;dbname=$dbname;charset=UTF8";

try {
    $conn = new PDO($dsn, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $data = json_decode(file_get_contents("php://input"));

    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$data->username, $data->email]);
    $user = $stmt->fetch();

    if ($user) {
        http_response_code(409); 
        echo json_encode(['message' => 'Utilisateur existant.']);
    } else {
        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $encryptedPassword = password_hash($data->password, PASSWORD_DEFAULT);  
        $stmt->execute([$data->username, $data->email, $encryptedPassword]);

        if ($stmt->rowCount() > 0) {
            http_response_code(201); 
            echo json_encode(['message' => 'Inscription réussie.']);
        } else {
            http_response_code(503);  
            echo json_encode(['message' => 'Erreur lors de l\'inscription.']);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);  
    echo json_encode(['message' => 'Erreur de connexion à la base de données: ' . $e->getMessage()]);
}
?>
