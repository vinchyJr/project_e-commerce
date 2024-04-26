<?php

// Connexion à la base de données
$host = 'localhost';
$db   = 'myapp_db';
$user = 'db_user';
$pass = 'db_password';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

// Récupération des données soumises
$username = $_POST['username'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Validation simplifiée
if (empty($username) || empty($email) || empty($password)) {
    echo "Veuillez remplir tous les champs.";
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "Format d'email invalide.";
    exit;
}

// Hashage du mot de passe
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Insertion dans la base de données
try {
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$username, $email, $passwordHash]);
    
    echo "Inscription réussie.";
} catch (\PDOException $e) {
    if ($e->getCode() == 23000) {
        echo "Utilisateur déjà existant.";
    } else {
        throw $e;
    }
}
