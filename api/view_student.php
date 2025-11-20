<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db.php';

$id = intval($_GET['id'] ?? 0);
if($id <= 0){ echo json_encode(['success'=>false,'error'=>'Invalid ID']); exit; }

try {
  $stmt = $pdo->prepare("SELECT id, name, gender, standard, DATE_FORMAT(dob,'%Y-%m-%d') as dob, age, father_name, father_mobile, email FROM students WHERE id=? LIMIT 1");
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if(!$row) echo json_encode(['success'=>false,'error'=>'Not found']);
  else echo json_encode(['success'=>true,'data'=>$row]);
} catch(Exception $e){
  echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
