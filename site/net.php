<?php
// Schlagabtausch Online-Vermittler: jeder Spieler schreibt seinen aktuellen Stand, bekommt den des Gegners zurück.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if (isset($_GET['ping'])) { echo '{"ok":1}'; exit; }
$c = $_GET['c'] ?? ''; $r = $_GET['r'] ?? ''; $k = $_GET['k'] ?? '';
if (!preg_match('/^[a-z0-9]{4}$/', $c) || !in_array($r, ['w', 'b'], true) || !preg_match('/^[a-z0-9]{6,16}$/', $k)) {
  http_response_code(400); echo '{"e":"bad"}'; exit;
}
$dir = __DIR__ . '/rooms';
if (!is_dir($dir)) {
  @mkdir($dir, 0755);
  @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
}
if (mt_rand(1, 300) === 1) { foreach (glob($dir . '/*.txt') ?: [] as $f) { if (filemtime($f) < time() - 86400) @unlink($f); } }
$now = microtime(true);
$o = $r === 'w' ? 'b' : 'w';
$mine = "$dir/$c-$r.txt"; $their = "$dir/$c-$o.txt";
$read = function ($f) use ($now) {
  if (!is_file($f)) return null;
  $raw = @file_get_contents($f); if (!$raw) return null;
  $nl = strpos($raw, "\n"); if ($nl === false) return null;
  $h = json_decode(substr($raw, 0, $nl), true); if (!is_array($h)) return null;
  return ['k' => $h['k'] ?? '', 'age' => $now - ($h['ts'] ?? 0), 'body' => substr($raw, $nl + 1)];
};
$me = $read($mine);
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $body = file_get_contents('php://input', false, null, 0, 16384);
  $x = json_decode($body);
  if (!is_object($x)) { http_response_code(400); echo '{"e":"json"}'; exit; }
  if ($me && $me['k'] !== $k && $me['age'] < 8) { echo '{"e":"full"}'; exit; }
  if (!empty($x->_leave)) { @unlink($mine); }
  else { file_put_contents($mine, json_encode(['k' => $k, 'ts' => $now]) . "\n" . $body, LOCK_EX); }
  $me = null;
}
$t = $read($their);
$fresh = $t && $t['age'] < 10;
echo '{"o":' . ($fresh ? $t['body'] : 'null')
  . ',"oa":' . ($t ? round($t['age'], 2) : 'null')
  . ',"ma":' . ($me ? round($me['age'], 2) : 'null')
  . ',"mk":' . ($me ? json_encode($me['k']) : 'null') . '}';
