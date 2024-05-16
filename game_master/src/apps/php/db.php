<?php
$host = 'localhost'; 
$dbname = 'game_master'; 
$username = 'root'; 
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connexion réussie";  
} catch(PDOException $e) {
    die("Erreur de connexion: " . $e->getMessage());
}
?>
