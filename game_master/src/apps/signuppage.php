<?php
header("Access-Control-Allow-Origin: *");  // Permettre les requêtes CORS depuis toutes les origines
header("Content-Type: application/json; charset=UTF-8");  // Spécifier le type de contenu attendu
header("Access-Control-Allow-Methods: POST");  // Autoriser uniquement les méthodes POST
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Connexion à la base de données
$host = 'localhost';  // ou l'adresse de votre serveur SQL
$dbname = 'game-master';
$username = 'root';
$password = '';
$dsn = "mysql:host=$host;dbname=$dbname;charset=UTF8";

try {
    $conn = new PDO($dsn, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Recevoir les données du corps de la requête
    $data = json_decode(file_get_contents("php://input"));

    // Vérifier si l'utilisateur existe déjà
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$data->username, $data->email]);
    $user = $stmt->fetch();

    if ($user) {
        // L'utilisateur existe déjà
        http_response_code(409);  // Code de conflit
        echo json_encode(['message' => 'Utilisateur existant.']);
    } else {
        // Insérer le nouvel utilisateur
        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $encryptedPassword = password_hash($data->password, PASSWORD_DEFAULT);  // Crypter le mot de passe
        $stmt->execute([$data->username, $data->email, $encryptedPassword]);

        if ($stmt->rowCount() > 0) {
            http_response_code(201);  // Création réussie
            echo json_encode(['message' => 'Inscription réussie.']);
        } else {
            http_response_code(503);  // Service indisponible
            echo json_encode(['message' => 'Erreur lors de l\'inscription.']);
        }
    }
} catch (PDOException $e) {
    http_response_code(500);  // Erreur interne du serveur
    echo json_encode(['message' => 'Erreur de connexion à la base de données: ' . $e->getMessage()]);
}
?>
