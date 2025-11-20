<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db.php';

$input = json_decode(file_get_contents("php://input"), true);
$id = intval($input['id'] ?? 0);

if($id <= 0){
  echo json_encode(['success'=>false,'error'=>'Invalid ID']);
  exit;
}

try{
  $stmt = $pdo->prepare("DELETE FROM students WHERE id=? LIMIT 1");
  $stmt->execute([$id]);
  echo json_encode(['success'=>true]);
} catch(Exception $e){
  echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
