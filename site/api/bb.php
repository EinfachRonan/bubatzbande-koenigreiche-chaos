<?php
// Bubatzbande: Konten (Benutzername + Passwort), Profil, Bestwerte, Erfolge und Bestenlisten für alle Spiele.
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function out($x) { echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }
function fail($e, $code = 400) { http_response_code($code); out(['e' => $e]); }

$GAMES = [
  'krieg'  => ['asc' => false, 'min' => 1, 'max' => 20000],
  'match'  => ['asc' => false, 'min' => 1, 'max' => 5000],
  'quiz'   => ['asc' => false, 'min' => 1, 'max' => 40000],
  'duell'  => ['asc' => false, 'min' => 1, 'max' => 200000],
  'schach' => ['asc' => true,  'min' => 5, 'max' => 36000],
  'runner' => ['asc' => false, 'min' => 1, 'max' => 5000000],
  'hof'    => ['asc' => false, 'min' => 1, 'max' => 1e18],
];
$ACH = ['profil', 'krieg_win', 'krieg_hart', 'krieg_fast', 'krieg_kills', 'match_3', 'match_10', 'match_30', 'quiz_10', 'quiz_perfekt', 'quiz_party', 'duell_win', 'duell_hart', 'duell_null', 'duell_prost', 'schach_win', 'schach_duelle', 'allrounder', 'runner_1000', 'runner_5000', 'runner_gold', 'hof_klick', 'hof_10k', 'hof_mio', 'hof_bande', 'karten_10', 'karte_max', 'karten_alle'];
$AV = ['artur', 'kobold', 'nille', 'geist', 'molly', 'lg3', 'fokuhila', 'kraeuter', 'don', 'koenig', 'allan', 'marwin'];

$dir = __DIR__ . '/data';
if (!is_dir($dir)) {
  @mkdir($dir, 0755);
  @file_put_contents($dir . '/.htaccess', "<IfModule mod_authz_core.c>\nRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
}
if (!is_dir("$dir/img")) @mkdir("$dir/img", 0755);
if (!is_dir($dir) || !is_writable($dir)) fail('storage', 500);
$file = "$dir/accounts.json";

function clean($s, $max) { $s = trim(strip_tags((string) $s)); $s = preg_replace('/\s+/u', ' ', $s); return mb_substr($s, 0, $max); }
function cleanMeta($m) {
  $o = [];
  if (is_array($m)) foreach (array_slice($m, 0, 4, true) as $k => $v) {
    $k = substr(preg_replace('/[^a-z0-9]/i', '', (string) $k), 0, 8);
    if ($k !== '') $o[$k] = is_numeric($v) ? $v + 0 : clean($v, 20);
  }
  return $o;
}
function load($h) { rewind($h); $d = json_decode(stream_get_contents($h), true); if (!is_array($d)) $d = []; $d += ['users' => []]; return $d; }
function avOk($a) { return in_array($a, $GLOBALS['AV'], true) ? $a : 'artur'; }
function lite($u, $id) { return ['id' => $id, 'name' => $u['name'], 'av' => avOk($u['av']), 'img' => $u['img'] ?? 0, 'nach' => count($u['ach'] ?? []), 'best' => (object) ($u['best'] ?? [])]; }
function full($u, $id) { return lite($u, $id) + ['ach' => (object) ($u['ach'] ?? []), 'since' => $u['t'] ?? 0, 'nfr' => count($u['fr'] ?? [])]; }
function pub($u, $id) { return ['fr' => $u['fr'] ?? [], 'req' => $u['req'] ?? [], 'sent' => $u['sent'] ?? [], 'id' => $id, 'user' => $u['user'], 'name' => $u['name'], 'av' => avOk($u['av']), 'img' => $u['img'] ?? 0, 'best' => (object) ($u['best'] ?? []), 'ach' => (object) ($u['ach'] ?? []), 'stats' => (object) ($u['stats'] ?? [])]; }
function nameTaken($d, $name, $except) {
  $l = mb_strtolower($name);
  foreach ($d['users'] as $id => $u) if ($id !== $except && (mb_strtolower($u['name']) === $l || $u['ul'] === $l)) return true;
  return false;
}

$a = $_GET['a'] ?? '';
if ($a === 'ping') out(['ok' => 1]);

// Profilbild ausliefern
if ($a === 'img') {
  $id = $_GET['u'] ?? '';
  if (!preg_match('/^[a-f0-9]{12}$/', $id) || !is_file("$dir/img/$id.jpg")) fail('noimg', 404);
  header('Content-Type: image/jpeg'); header('Cache-Control: public, max-age=604800');
  readfile("$dir/img/$id.jpg"); exit;
}

$h = fopen($file, 'c+'); if (!$h) fail('io', 500);

if ($a === 'user') {
  flock($h, LOCK_SH); $d = load($h); flock($h, LOCK_UN); fclose($h);
  $id = (string) ($_GET['u'] ?? '');
  if (!isset($d['users'][$id])) fail('nouser', 404);
  out(['user' => full($d['users'][$id], $id)]);
}

if ($a === 'top') {
  flock($h, LOCK_SH); $d = load($h); flock($h, LOCK_UN); fclose($h);
  $g = $_GET['g'] ?? '';
  if (!isset($GAMES[$g])) fail('game');
  $asc = $GAMES[$g]['asc']; $rows = [];
  foreach ($d['users'] as $id => $u) {
    $b = $u['best'][$g] ?? null; if (!$b) continue;
    $rows[] = ['id' => $id, 'name' => $u['name'], 'av' => avOk($u['av']), 'img' => $u['img'] ?? 0, 's' => $b['s'], 'm' => $b['m'] ?? null, 't' => $b['t'] ?? 0];
  }
  usort($rows, fn($x, $y) => $asc ? ($x['s'] <=> $y['s'] ?: $x['t'] <=> $y['t']) : ($y['s'] <=> $x['s'] ?: $x['t'] <=> $y['t']));
  $me = $_GET['u'] ?? ''; $mine = null;
  foreach ($rows as $i => $r) if ($r['id'] === $me) $mine = ['rank' => $i + 1, 's' => $r['s']];
  $list = array_map(function ($r) use ($me) { $r['you'] = $r['id'] === $me; unset($r['t']); return $r; }, array_slice($rows, 0, 300));
  out(['list' => $list, 'n' => count($rows), 'me' => $mine]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { fclose($h); fail('method', 405); }
$in = json_decode(file_get_contents('php://input', false, null, 0, 300000), true);
if (!is_array($in)) { fclose($h); fail('json'); }

flock($h, LOCK_EX);
$d = load($h);
$finish = function ($res) use ($h, &$d) { ftruncate($h, 0); rewind($h); fwrite($h, json_encode($d, JSON_UNESCAPED_UNICODE)); fflush($h); flock($h, LOCK_UN); fclose($h); out($res); };
$stop = function ($e, $code = 400) use ($h) { flock($h, LOCK_UN); fclose($h); fail($e, $code); };

// Bremse gegen Passwort-Raten: max. 15 Fehlversuche pro IP in 10 Minuten
$ip = substr(hash('sha256', $_SERVER['REMOTE_ADDR'] ?? ''), 0, 16);
$d['rl'] = array_filter($d['rl'] ?? [], fn($x) => $x['t'] > time() - 600);
$rl = &$d['rl'];

function newToken(&$u) { $t = bin2hex(random_bytes(24)); $u['tok'] = array_slice(array_merge([hash('sha256', $t)], $u['tok'] ?? []), 0, 10); return $t; }
function userByLogin($d, $user) { $l = mb_strtolower($user); foreach ($d['users'] as $id => $u) if ($u['ul'] === $l) return $id; return null; }

if ($a === 'register') {
  $user = clean($in['user'] ?? '', 16); $pass = (string) ($in['pass'] ?? '');
  if (!preg_match('/^[\p{L}\p{N}_.\- ]{2,16}$/u', $user)) $stop('user');
  if (mb_strlen($pass) < 4 || strlen($pass) > 100) $stop('pass');
  if (count($d['users']) >= 3000) $stop('full', 503);
  if (nameTaken($d, $user, null)) $stop('taken', 409);
  $id = bin2hex(random_bytes(6));
  $u = ['user' => $user, 'ul' => mb_strtolower($user), 'ph' => password_hash($pass, PASSWORD_DEFAULT), 'name' => $user,
    'av' => in_array($in['av'] ?? '', $AV, true) ? $in['av'] : 'artur', 'img' => 0, 'best' => [], 'ach' => ['profil' => time()], 'stats' => [], 't' => time()];
  $tok = newToken($u); $d['users'][$id] = $u;
  $finish(['token' => $tok, 'me' => pub($u, $id)]);
}
if ($a === 'login') {
  $n = 0; foreach ($rl as $x) if ($x['ip'] === $ip) $n++;
  if ($n >= 15) $stop('slow', 429);
  $id = userByLogin($d, clean($in['user'] ?? '', 16));
  if (!$id || !password_verify((string) ($in['pass'] ?? ''), $d['users'][$id]['ph'])) { $rl[] = ['ip' => $ip, 't' => time()]; $finish(['e' => 'wrong']); }
  $tok = newToken($d['users'][$id]);
  $finish(['token' => $tok, 'me' => pub($d['users'][$id], $id)]);
}

// Ab hier: angemeldet
$id = (string) ($in['id'] ?? ''); $tok = (string) ($in['token'] ?? '');
$u = $d['users'][$id] ?? null;
if (!$u || !in_array(hash('sha256', $tok), $u['tok'] ?? [], true)) $stop('auth', 401);
$U = &$d['users'][$id];

if ($a === 'logout') { $U['tok'] = array_values(array_filter($U['tok'], fn($x) => $x !== hash('sha256', $tok))); $finish(['ok' => 1]); }
if ($a === 'me') $finish(['me' => pub($U, $id)]);

// Freunde
$rm = function (&$arr, $x) { $arr = array_values(array_diff($arr ?? [], [$x])); };
$befriend = function ($a1, $b1) use (&$d, $rm) {
  foreach ([[$a1, $b1], [$b1, $a1]] as [$x, $y]) {
    $X = &$d['users'][$x];
    $X['fr'] = array_values(array_unique(array_merge($X['fr'] ?? [], [$y])));
    $rm($X['req'], $y); $rm($X['sent'], $y);
    unset($X);
  }
};
if ($a === 'friend') {
  $to = mb_strtolower(clean($in['to'] ?? '', 16)); $tid = null;
  foreach ($d['users'] as $k => $x) if ($x['ul'] === $to || mb_strtolower($x['name']) === $to) { $tid = $k; break; }
  if (!$tid) $stop('nouser', 404);
  if ($tid === $id) $stop('self');
  if (in_array($tid, $U['fr'] ?? [], true)) $stop('already');
  if (count($U['fr'] ?? []) >= 200) $stop('full');
  if (in_array($tid, $U['req'] ?? [], true)) { $befriend($id, $tid); $finish(['ok' => 1, 'now' => 'friends', 'me' => pub($d['users'][$id], $id)]); }
  $T = &$d['users'][$tid];
  $T['req'] = array_values(array_unique(array_merge($T['req'] ?? [], [$id])));
  unset($T);
  $U['sent'] = array_values(array_unique(array_merge($U['sent'] ?? [], [$tid])));
  $finish(['ok' => 1, 'now' => 'sent', 'name' => $d['users'][$tid]['name'], 'me' => pub($U, $id)]);
}
if ($a === 'accept' || $a === 'decline' || $a === 'unfriend') {
  $o = (string) ($in['u'] ?? ''); if (!isset($d['users'][$o])) $stop('nouser', 404);
  if ($a === 'accept') { if (!in_array($o, $U['req'] ?? [], true)) $stop('noreq'); $befriend($id, $o); }
  else {
    $O = &$d['users'][$o];
    $rm($U['req'], $o); $rm($U['sent'], $o); $rm($U['fr'], $o);
    $rm($O['req'], $id); $rm($O['sent'], $id); $rm($O['fr'], $id);
    unset($O);
  }
  $finish(['ok' => 1, 'me' => pub($d['users'][$id], $id)]);
}
if ($a === 'friends') {
  $map = fn($ids) => array_values(array_filter(array_map(fn($x) => isset($d['users'][$x]) ? lite($d['users'][$x], $x) : null, $ids ?? [])));
  $finish(['fr' => $map($U['fr'] ?? []), 'req' => $map($U['req'] ?? []), 'sent' => $map($U['sent'] ?? []), 'me' => pub($U, $id)]);
}

// Spiel-Einladungen (nur an Freunde)
if ($a === 'invite') {
  $to = (string) ($in['to'] ?? ''); $g = (string) ($in['g'] ?? ''); $c = (string) ($in['c'] ?? '');
  if (!in_array($to, $U['fr'] ?? [], true) || !isset($d['users'][$to])) $stop('notfriend', 403);
  if (!in_array($g, ['quiz', 'schach'], true) || !preg_match('/^[A-Za-z0-9]{4}$/', $c)) $stop('bad');
  $T = &$d['users'][$to];
  $T['inv'] = array_values(array_filter($T['inv'] ?? [], fn($x) => $x['t'] > time() - 7200 && !($x['from'] === $id && $x['g'] === $g)));
  $T['inv'][] = ['id' => bin2hex(random_bytes(4)), 'from' => $id, 'g' => $g, 'c' => $c, 't' => time()];
  $T['inv'] = array_slice($T['inv'], -20);
  unset($T);
  $finish(['ok' => 1]);
}
if ($a === 'inbox') {
  $U['inv'] = array_values(array_filter($U['inv'] ?? [], fn($x) => $x['t'] > time() - 7200 && isset($d['users'][$x['from']])));
  $inv = array_map(fn($x) => ['id' => $x['id'], 'g' => $x['g'], 'c' => $x['c'], 't' => $x['t'], 'from' => lite($d['users'][$x['from']], $x['from'])], $U['inv']);
  $finish(['inv' => $inv, 'me' => pub($U, $id)]);
}
if ($a === 'inv_done') {
  $iid = (string) ($in['iid'] ?? '');
  $U['inv'] = array_values(array_filter($U['inv'] ?? [], fn($x) => $x['id'] !== $iid));
  $finish(['ok' => 1]);
}

// Spielstände in der Cloud (z. B. Bandenhof)
if ($a === 'gput') {
  $g = (string) ($in['g'] ?? ''); $data = (string) ($in['data'] ?? '');
  if (!in_array($g, ['hof', 'meta', 'runner', 'krieg'], true) || strlen($data) > 40000) $stop('bad');
  $U['gs'][$g] = ['d' => $data, 't' => time()];
  $finish(['ok' => 1]);
}
if ($a === 'gget') {
  $g = (string) ($in['g'] ?? '');
  $x = $U['gs'][$g] ?? null;
  $finish(['data' => $x ? $x['d'] : null, 't' => $x ? $x['t'] : 0]);
}

if ($a === 'save') {
  // Profil
  if (isset($in['name'])) {
    $name = clean($in['name'], 16);
    if ($name === '' ) $stop('name');
    if (nameTaken($d, $name, $id)) $stop('taken', 409);
    $U['name'] = $name;
  }
  if (isset($in['av']) && in_array($in['av'], $AV, true)) { $U['av'] = $in['av']; }
  if (isset($in['img'])) {
    if ($in['img'] === null || $in['img'] === '') { $U['img'] = 0; @unlink("$dir/img/$id.jpg"); }
    elseif (preg_match('#^data:image/jpeg;base64,([A-Za-z0-9+/=]+)$#', $in['img'], $m)) {
      $bin = base64_decode($m[1]);
      if (!$bin || strlen($bin) > 120000 || substr($bin, 0, 3) !== "\xFF\xD8\xFF") $stop('img');
      file_put_contents("$dir/img/$id.jpg", $bin); $U['img'] = time();
    } else $stop('img');
  }
  if (isset($in['pass'])) {
    if (!password_verify((string) ($in['old'] ?? ''), $U['ph'])) $stop('wrong', 403);
    if (mb_strlen((string) $in['pass']) < 4) $stop('pass');
    $U['ph'] = password_hash((string) $in['pass'], PASSWORD_DEFAULT);
  }
  // Bestwerte: nur bessere übernehmen
  foreach (($in['best'] ?? []) as $g => $b) {
    if (!isset($GAMES[$g]) || !is_array($b)) continue;
    $G = $GAMES[$g]; $s = round((float) ($b['s'] ?? 0), 1);
    if (!is_finite($s) || $s < $G['min'] || $s > $G['max']) continue;
    $old = $U['best'][$g] ?? null;
    if (!$old || ($G['asc'] ? $s < $old['s'] : $s > $old['s'])) $U['best'][$g] = ['s' => $s, 'm' => cleanMeta($b['m'] ?? null), 't' => time()];
  }
  foreach (($in['ach'] ?? []) as $k => $t) if (in_array($k, $ACH, true) && !isset($U['ach'][$k])) $U['ach'][$k] = time();
  foreach (($in['stats'] ?? []) as $k => $v) {
    $k = substr(preg_replace('/[^a-z0-9_]/i', '', (string) $k), 0, 24);
    if ($k !== '' && is_numeric($v) && count($U['stats']) < 60) $U['stats'][$k] = max($U['stats'][$k] ?? 0, min(1e7, (int) $v));
  }
  $finish(['me' => pub($U, $id)]);
}
$stop('action');
