<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../includes/db.php';
$input = json_decode(file_get_contents('php://input'), true);
if(!$input){ echo json_encode(['success'=>false,'error'=>'Invalid input']); exit; }
$name = trim($input['name'] ?? '');
$gender = $input['gender'] ?? '';
$standard = trim($input['standard'] ?? '');
$dob = $input['dob'] ?? '';
$age = intval($input['age'] ?? 0);
$father_name = trim($input['father_name'] ?? '');
$father_mobile = trim($input['father_mobile'] ?? '');
$email = trim($input['email'] ?? '');
if($name === '') { echo json_encode(['success'=>false,'error'=>'Name required']); exit; }
if($standard === '') { echo json_encode(['success'=>false,'error'=>'Standard required']); exit; }
if(!$dob) { echo json_encode(['success'=>false,'error'=>'DOB required']); exit; }
if(!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(['success'=>false,'error'=>'Invalid email']); exit; }
if(!preg_match('/^\d{10}$/', $father_mobile)) { echo json_encode(['success'=>false,'error'=>'Father mobile must be 10 digits']); exit; }
if($age <= 0) { echo json_encode(['success'=>false,'error'=>'Invalid age']); exit; }
try{
  $stmt = $pdo->prepare("INSERT INTO students (name, gender, standard, dob, age, father_name, father_mobile, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  $stmt->execute([$name,$gender,$standard,$dob,$age,$father_name,$father_mobile,$email]);
  echo json_encode(['success'=>true]);
} catch(Exception $e){
  echo json_encode(['success'=>false,'error'=>$e->getMessage()]);
}
