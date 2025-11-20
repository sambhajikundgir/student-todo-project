<?php
// Simple placeholder replacement demo
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$text = $input['text'] ?? '';
$map = $input['map'] ?? [];
if(!$text || !is_array($map)){ echo json_encode(['success'=>false,'error'=>'Invalid']); exit; }
$out = strtr($text, $map);
echo json_encode(['success'=>true,'output'=>$out]);
