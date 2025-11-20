<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if(!$input){ echo json_encode(['success'=>false,'error'=>'Invalid input']); exit; }

$id = intval($input['id'] ?? 0);
$name = trim($input['name'] ?? '');
$gender = $input['gender'] ?? '';
$standard = trim($input['standard'] ?? '');
$dob = $input['dob'] ?? '';
$age = intval($input['age'] ?? 0);
$father_name = trim($input['father_name'] ?? '');
$father_mobile = trim($input['father_mobile'] ?? '');
$email = trim($input['email'] ?? '');

if($id<=0) { echo json_encode(['success'=>false,'error'=>'Invalid ID']); exit; }
if($name === '' || $standard === '' || !$dob || !filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{10}$/',$father_mobile) || $age<=0){
  echo json_encode(['success'=>false,'error'=>'Validation failed']); exit;
}

try{
  $stmt = $pdo->prepare("UPDATE students SET name=?, gender=?, standard=?, dob=?, age=?, father_name=?, father_mobile=?, email=? WHERE id=?");
  $stmt->execute([$name,$gender,$standard,$dob,$age,$father_name,$father_mobile,$email,$id]);
  echo json_encode(['success'=>true]);
} catch(Exception $e){
  echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
