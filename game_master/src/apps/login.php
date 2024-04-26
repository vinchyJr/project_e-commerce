<?php
header('Content-Type: application/json');
$host = 'localhost'; // ou l'adresse de votre serveur MySQL
$db   = 'game-master';
$user = 'root'; // Votre nom d'utilisateur pour accéder à MySQL
$pass = ''; // Votre mot de passe pour accéder à MySQL
$charset = 'utf8mb4';

$email = $_POST['email'];
$password = $_POST['password'];

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}
