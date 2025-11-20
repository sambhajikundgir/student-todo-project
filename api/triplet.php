<?php
header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$a = $input['a'] ?? [];
$val = $input['val'] ?? null;
if(!is_array($a) || $val === null){ echo json_encode(['success'=>false,'error'=>'Invalid']); exit; }
sort($a);
$n = count($a);
for($i=0;$i<$n-2;$i++){
  $l=$i+1; $r=$n-1;
  while($l<$r){
    $s = $a[$i]+$a[$l]+$a[$r];
    if($s == $val){ echo json_encode(['success'=>true,'triplet'=>[$a[$i],$a[$l],$a[$r]]]); exit; }
    if($s < $val) $l++; else $r--;
  }
}
echo json_encode(['success'=>false,'error'=>'No triplet']);
