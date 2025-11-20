<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db.php';
try{
  $stmt = $pdo->query("SELECT id, name, gender, standard, DATE_FORMAT(dob,'%Y-%m-%d') as dob, age, father_name, father_mobile, email FROM students ORDER BY id DESC");
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode($rows);
} catch(Exception $e){
  echo json_encode([]);
}
