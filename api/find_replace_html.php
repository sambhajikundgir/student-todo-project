<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$html = $input['html'] ?? '';
$find = $input['find'] ?? [];
$replace = $input['replace'] ?? [];
if(!$html || !is_array($find) || !is_array($replace)){ echo json_encode(['success'=>false,'error'=>'Invalid']); exit; }
$out = str_replace($find, $replace, $html);
echo json_encode(['success'=>true,'output'=>$out]);
