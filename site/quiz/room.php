<?php
// Bubatz-Quiz: Räume mit Code. Jeder Raum ist eine kleine JSON-Datei, alle Geräte fragen regelmäßig den Stand ab.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out($x) { echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }
function fail($e, $code = 400) { http_response_code($code); out(['e' => $e]); }

$a = $_GET['a'] ?? '';
if ($a === 'ping') out(['ok' => 1, 'now' => microtime(true)]);

$dir = __DIR__ . '/rooms';
if (!is_dir($dir)) {
  @mkdir($dir, 0755);
  @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
}
if (!is_dir($dir) || !is_writable($dir)) fail('storage', 500);
// alte Räume nach 6 Stunden aufräumen
if (mt_rand(1, 50) === 1) { foreach (glob($dir . '/*.json') ?: [] as $f) { if (filemtime($f) < time() - 6 * 3600) @unlink($f); } }

$in = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $raw = file_get_contents('php://input', false, null, 0, 200000);
  $in = json_decode($raw, true);
  if (!is_array($in)) fail('json');
}
$now = microtime(true);
$AV = ['artur', 'kobold', 'nille', 'runen', 'geist', 'molly', 'lg3', 'fokuhila', 'kraeuter', 'don', 'koenig', 'allan', 'marwin'];

function clean($s, $max) {
  $s = trim(strip_tags((string) $s));
  $s = preg_replace('/\s+/u', ' ', $s);
  return mb_substr($s, 0, $max);
}
function codeOk($c) { return is_string($c) && preg_match('/^[A-Z]{4}$/', $c); }
function rid($n) { return bin2hex(random_bytes($n)); }

// Raum sperren, ändern, speichern
function withRoom($code, $fn) {
  global $dir;
  if (!codeOk($code)) fail('code');
  $f = "$dir/$code.json";
  if (!is_file($f)) fail('noroom', 404);
  $h = fopen($f, 'c+'); if (!$h) fail('io', 500);
  flock($h, LOCK_EX);
  $r = json_decode(stream_get_contents($h), true);
  if (!is_array($r)) { flock($h, LOCK_UN); fclose($h); fail('broken', 500); }
  $res = $fn($r);
  $r['v'] = ($r['v'] ?? 0) + 1;
  ftruncate($h, 0); rewind($h);
  fwrite($h, json_encode($r, JSON_UNESCAPED_UNICODE));
  fflush($h); flock($h, LOCK_UN); fclose($h);
  return $res;
}
function readRoom($code) {
  global $dir;
  if (!codeOk($code)) fail('code');
  $f = "$dir/$code.json";
  if (!is_file($f)) fail('noroom', 404);
  $h = fopen($f, 'r'); flock($h, LOCK_SH);
  $r = json_decode(stream_get_contents($h), true);
  flock($h, LOCK_UN); fclose($h);
  if (!is_array($r)) fail('broken', 500);
  return $r;
}
// Punkte der aktuellen Frage verbuchen (beim Auflösen)
function settle(&$r) {
  $qi = $r['qi']; $c = $r['qs'][$qi]['c']; $ans = $r['ans'][$qi] ?? [];
  foreach ($r['players'] as &$p) {
    $x = $ans[$p['id']] ?? null;
    if ($x && $x['a'] === $c) {
      $p['streak'] = ($p['streak'] ?? 0) + 1;
      $frac = max(0, 1 - $x['t'] / $r['limit']);
      $pts = (int) (round((500 + 500 * $frac) / 10) * 10) + min(3, $p['streak'] - 1) * 50;
      $p['score'] += $pts; $p['last'] = ['ok' => true, 'pts' => $pts, 'a' => $x['a']];
    } else {
      $p['streak'] = 0; $p['last'] = ['ok' => false, 'pts' => 0, 'a' => $x ? $x['a'] : -1];
    }
  }
}

switch ($a) {
case 'create': {
  $qs = [];
  foreach (array_slice($in['qs'] ?? [], 0, 60) as $q) {
    $o = array_map(fn($x) => clean($x, 90), array_slice($q['o'] ?? [], 0, 4));
    $c = (int) ($q['c'] ?? -1);
    if (count($o) < 2 || $c < 0 || $c >= count($o) || clean($q['q'] ?? '', 220) === '') continue;
    $qs[] = ['q' => clean($q['q'], 220), 'o' => $o, 'c' => $c, 'p' => clean($q['p'] ?? '', 40)];
  }
  if (!$qs) fail('noquestions');
  $limit = max(5, min(60, (int) ($in['limit'] ?? 20)));
  $L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  for ($i = 0; $i < 50; $i++) {
    $code = ''; for ($k = 0; $k < 4; $k++) $code .= $L[random_int(0, strlen($L) - 1)];
    if (!is_file("$dir/$code.json")) break;
  }
  $hk = rid(12);
  $room = ['v' => 1, 'code' => $code, 'hk' => $hk, 'phase' => 'lobby', 'players' => [], 'qi' => -1, 'qs' => $qs, 'limit' => $limit, 'qStart' => 0, 'ans' => new stdClass, 'created' => time()];
  file_put_contents("$dir/$code.json", json_encode($room, JSON_UNESCAPED_UNICODE), LOCK_EX);
  out(['code' => $code, 'hk' => $hk]);
}
case 'join': {
  $name = clean($in['name'] ?? '', 16);
  if ($name === '') fail('name');
  $av = in_array($in['av'] ?? '', $AV, true) ? $in['av'] : $AV[array_rand($AV)];
  $res = withRoom($in['c'] ?? '', function (&$r) use ($name, $av) {
    if ($r['phase'] === 'end') fail('ended');
    if (count($r['players']) >= 40) fail('full');
    foreach ($r['players'] as $p) if (mb_strtolower($p['name']) === mb_strtolower($name)) fail('taken');
    $p = ['id' => rid(4), 'k' => rid(8), 'name' => $name, 'av' => $av, 'score' => 0, 'streak' => 0, 'last' => null];
    $r['players'][] = $p;
    return ['pid' => $p['id'], 'pk' => $p['k']];
  });
  out($res);
}
case 'host': {
  $op = $in['op'] ?? '';
  $res = withRoom($in['c'] ?? '', function (&$r) use ($op, $in, $now) {
    if (!hash_equals($r['hk'], (string) ($in['hk'] ?? ''))) fail('auth', 403);
    $n = count($r['qs']);
    if ($op === 'start' && $r['phase'] === 'lobby') { $r['phase'] = 'question'; $r['qi'] = 0; $r['qStart'] = $now; }
    elseif ($op === 'reveal' && $r['phase'] === 'question') { settle($r); $r['phase'] = 'reveal'; }
    elseif ($op === 'next' && $r['phase'] === 'reveal') {
      if ($r['qi'] + 1 >= $n) $r['phase'] = 'end';
      else { $r['qi']++; $r['phase'] = 'question'; $r['qStart'] = $now; foreach ($r['players'] as &$p) $p['last'] = null; }
    }
    elseif ($op === 'end') { $r['phase'] = 'end'; }
    elseif ($op === 'kick') { $id = $in['pid'] ?? ''; $r['players'] = array_values(array_filter($r['players'], fn($p) => $p['id'] !== $id)); }
    return ['ok' => 1];
  });
  out($res);
}
case 'answer': {
  $res = withRoom($in['c'] ?? '', function (&$r) use ($in, $now) {
    $pid = (string) ($in['pid'] ?? ''); $me = null;
    foreach ($r['players'] as $p) if ($p['id'] === $pid && hash_equals($p['k'], (string) ($in['pk'] ?? ''))) $me = $p;
    if (!$me) fail('auth', 403);
    if ($r['phase'] !== 'question' || (int) ($in['qi'] ?? -1) !== $r['qi']) fail('late');
    $el = $now - $r['qStart'];
    if ($el > $r['limit'] + 1.5) fail('late');
    $qi = (string) $r['qi'];
    $ans = (array) $r['ans'];
    if (isset($ans[$qi][$pid])) fail('already');
    $a = (int) ($in['a'] ?? -1);
    if ($a < 0 || $a >= count($r['qs'][$r['qi']]['o'])) fail('bad');
    $ans[$qi][$pid] = ['a' => $a, 't' => round(min($el, $r['limit']), 2)];
    $r['ans'] = $ans;
    return ['ok' => 1];
  });
  out($res);
}
case 'state': {
  $r = readRoom($_GET['c'] ?? '');
  if (isset($_GET['v']) && (int) $_GET['v'] === $r['v']) out(['same' => 1, 'now' => $now]);
  $pid = $_GET['p'] ?? ''; $pk = $_GET['k'] ?? '';
  $isHost = isset($_GET['hk']) && hash_equals($r['hk'], (string) $_GET['hk']);
  $qi = $r['qi']; $ans = (array) ($r['ans'][(string) $qi] ?? []);
  $players = $r['players'];
  usort($players, fn($x, $y) => $y['score'] <=> $x['score']);
  $list = []; $you = null; $rank = 0;
  foreach ($players as $i => $p) {
    $list[] = ['id' => $p['id'], 'name' => $p['name'], 'av' => $p['av'], 'score' => $p['score'], 'streak' => $p['streak'], 'last' => $r['phase'] === 'question' ? null : $p['last']];
    if ($p['id'] === $pid && hash_equals($p['k'], (string) $pk)) {
      $mine = $ans[$pid] ?? null;
      $you = ['id' => $p['id'], 'name' => $p['name'], 'av' => $p['av'], 'score' => $p['score'], 'rank' => $i + 1, 'answered' => (bool) $mine, 'a' => $mine ? $mine['a'] : -1, 'last' => $r['phase'] === 'question' ? null : $p['last'], 'streak' => $p['streak']];
    }
  }
  $st = ['v' => $r['v'], 'code' => $r['code'], 'phase' => $r['phase'], 'qi' => $qi, 'qn' => count($r['qs']), 'limit' => $r['limit'], 'qStart' => $r['qStart'], 'now' => $now,
    'players' => $list, 'answered' => count($ans), 'host' => $isHost, 'you' => $you, 'gone' => $pid !== '' && !$you];
  if ($qi >= 0 && $qi < count($r['qs'])) {
    $q = $r['qs'][$qi];
    $st['q'] = ['q' => $q['q'], 'o' => $q['o'], 'p' => $q['p']];
    if ($r['phase'] !== 'question') {
      $st['q']['c'] = $q['c'];
      $cnt = array_fill(0, count($q['o']), 0);
      foreach ($ans as $x) if (isset($cnt[$x['a']])) $cnt[$x['a']]++;
      $st['q']['counts'] = $cnt;
    }
  }
  out($st);
}
default: fail('action');
}
