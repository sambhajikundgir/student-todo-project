<?php
// includes/db.php
$host = 'localhost';
$db   = 'school';
$user = 'root';
$pass = ''; // change if needed
$options = [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION];
try {
  $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8",$user,$pass,$options);
} catch (Exception $e) {
  die('DB connect error: '.$e->getMessage());
}
