/* Bubatzbande: gemeinsames Profil, Bestenlisten und Erfolge für alle Spiele.
   Einbinden mit <script src="../bb.js"></script>, dann window.BB nutzen. */
(function () {
  'use strict';
  const ROOT = new URL('.', document.currentScript ? document.currentScript.src : location.href).href;
  const API = ROOT + 'api/bb.php';
  const IMG = k => ROOT + 'krieg/img/' + k + '.jpg';
  const CHAR = { artur: 'Artur', kobold: 'Kobold', nille: 'Nille', geist: 'Grauer Geist', molly: 'Mollymann', lg3: 'LG3', fokuhila: 'Fokuhilamann', kraeuter: 'KräuterKönig', don: 'DonPatron', koenig: 'König', allan: 'Allan', marwin: 'Marwin' };
  const AV = Object.keys(CHAR);
  const fmtTime = s => { s = Math.max(0, s); const m = Math.floor(s / 60), r = s - m * 60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1); };
  const fmtN = n => n >= 1e12 ? (n / 1e12).toFixed(1) + 'T' : n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(Math.round(n));
  const GAMES = {
    krieg: { off: 1, name: 'Bandenkrieg', ico: '⚔️', unit: 'Punkte', what: 'Bester Sieg', url: 'krieg/', meta: m => m && m.d ? `${m.d}${m.t ? ' · ' + fmtTime(m.t).replace(/\.\d$/, '') : ''}` : '' },
    match: { off: 1, name: 'Kräuter-Match', ico: '🌿', unit: 'Sterne', what: 'Sterne gesamt', url: 'match/', meta: m => m && m.lv ? `bis Level ${m.lv}` : '' },
    quiz: { off: 1, name: 'Bubatz-Quiz', ico: '🎤', unit: 'Punkte', what: 'Solo-Highscore', url: 'quiz/', meta: m => m && m.n ? `${m.r}/${m.n} richtig` : '' },
    duell: { off: 1, name: 'Kneipen-Duell', ico: '🍺', unit: 'Kneipenpunkte', what: 'Siege gegen den Wirt', url: 'duell/', meta: m => m && m.w ? `${m.w} Siege` : '' },
    runner: { name: 'Kobold-Runner', ico: '🏃', unit: 'Punkte', what: 'Bester Lauf', url: 'runner/', meta: m => m && m.m ? `${m.m.toLocaleString('de-DE')} m · 🪙 ${m.c}` : '' },
    hof: { off: 1, name: 'Bandenhof', ico: '🏡', unit: 'Gold', what: 'Gold verdient', url: 'hof/', fmt: n => n >= 1e6 ? (n / (n >= 1e9 ? 1e9 : 1e6)).toLocaleString('de-DE', { maximumFractionDigits: 2 }) + (n >= 1e9 ? ' Mrd' : ' Mio') : Math.round(n).toLocaleString('de-DE'), meta: m => m && m.b != null ? `${m.l ? 'Hof-Stufe ' + m.l + ' · ' : ''}${m.b}/8 Bande` : '' },
    drill: { name: 'Galaxie-Bohrer', ico: '🚀', unit: 'Planeten', what: 'Höchster Planet', url: 'drill/', meta: m => m ? [m.pt ? '⏱ ' + (m.pt >= 3600 ? (m.pt / 3600).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' Std.' : Math.floor(m.pt / 60) + ' Min.') : '', m.n, m.w != null ? m.w + ' Warps' : '', m.d ? fmtN(m.d) + ' DPS' : ''].filter(Boolean).join(' · ') : '' },
    ernte: { name: 'Erntezeit', ico: '🧟', unit: 'Punkte', what: 'Bester Lauf', url: 'ernte/', meta: m => m && m.w ? `Welle ${m.w}${m.k ? ' · ' + m.k + ' Kills' : ''}${m.m ? ' · ' + m.m : ''}` : '' },
    schach: { name: 'Schlagabtausch', ico: '♞', unit: '', what: 'Schnellster Sieg gegen Herrn Holz', url: 'schach/', asc: true, fmt: fmtTime, meta: m => m && m.d ? String(m.d) : '' }
  };
  // Archiv: Spiele mit off: 1 sind vorerst nicht spielbar (Code bleibt, Seite leitet zur Startseite um)
  const ON = Object.fromEntries(Object.entries(GAMES).filter(([, G]) => !G.off));
  const ACH_ALL = [
    ['profil', '🪪', 'Teil der Bande', 'Profil angelegt'],
    ['krieg_win', '🏰', 'Burgstürmer', 'Bandenkrieg gewonnen'],
    ['krieg_hart', '💀', 'Spießerschreck', 'Bandenkrieg auf Schwer gewonnen'],
    ['krieg_fast', '⚡', 'Blitzkrieg', 'Bandenkrieg in unter 10 Minuten gewonnen'],
    ['krieg_kills', '🗡️', 'Aufräumer', '120 Gegner in einem Bandenkrieg besiegt'],
    ['match_3', '⭐', 'Perfektionist', '3 Sterne in einem Kräuter-Level'],
    ['match_10', '🌿', 'Kräuterkenner', 'Kräuter-Match Level 10 geschafft'],
    ['match_30', '🌟', 'Sternensammler', '30 Sterne im Kräuter-Match'],
    ['match_boss', '💀', 'Bosskiller', 'Erstes Boss-Level im Kräuter-Match geschafft'],
    ['match_25', '👑', 'Kronenträger', 'Kräuter-Match Level 25 geschafft'],
    ['match_50', '🌳', 'Kräuterlegende', 'Kräuter-Match Level 50 geschafft'],
    ['quiz_10', '🧠', 'Schlaumeier', 'Mindestens 10 richtige in einer Solo-Runde'],
    ['quiz_perfekt', '🎓', 'Alleswisser', 'Solo-Runde mit mindestens 10 Fragen ohne Fehler'],
    ['quiz_party', '🎤', 'Partykönig', 'Ein Online-Quiz mit mindestens 2 Leuten gewonnen'],
    ['duell_win', '🍺', 'Stammgast', 'Kneipen-Duell gegen den Wirt gewonnen'],
    ['duell_hart', '👑', 'Kneipenkönig', 'Den harten Wirt geschlagen'],
    ['duell_null', '🧹', 'Zu null', 'Ein Kneipen-Duell 3:0 gewonnen'],
    ['duell_prost', '🤠', 'Schnellste Hand', 'Prost-Duell in unter 250 ms'],
    ['schach_win', '♚', 'Matt!', 'Herrn Holz im Schach geschlagen'],
    ['schach_duelle', '🥊', 'Duellant', '10 Ego-Duelle im Schach gewonnen'],
    ['runner_1000', '🏃', 'Flinker Kobold', '1.000 Punkte im Kobold-Runner'],
    ['runner_5000', '🌀', 'Höhlenläufer', '5.000 Punkte im Kobold-Runner'],
    ['runner_gold', '🪙', 'Goldgierig', '100 Gold in einem Lauf'],
    ['hof_klick', '👆', 'Fleißige Hände', '100-mal auf dem Bandenhof mitgeholfen'],
    ['hof_10k', '🏡', 'Hofbesitzer', '10.000 Gold mit dem Bandenhof verdient'],
    ['hof_mio', '💰', 'Goldgrube', '1 Million Gold mit dem Bandenhof verdient'],
    ['hof_bande', '🤝', 'Volle Bande', 'Die ganze Bande auf den Bandenhof geholt'],
    ['karten_10', '🃏', 'Sammler', '10 verschiedene Karten gesammelt'],
    ['karte_max', '🌟', 'Meisterkarte', 'Eine Karte auf Stufe 5 gebracht'],
    ['karten_alle', '👑', 'Komplette Bande', 'Alle Karten gesammelt'],
    ['runner_20k', '🐉', 'Drachenläufer', '20.000 Punkte in einem Runner-Lauf'],
    ['runner_x20', '⚡', 'Volle Ladung', 'Runner-Multiplikator auf ×20 gebracht'],
    ['match_100', '🌳', 'Urwaldkönig', 'Kräuter-Match Level 100 geschafft'],
    ['krieg_kampagne', '🏯', 'Kaiser der Bande', 'Bandenkrieg-Kampagne komplett durchgespielt'],
    ['krieg_sterne', '🌕', 'Blutmond', 'Alle 24 Sterne in der Bandenkrieg-Kampagne'],
    ['hof_mrd', '🪙', 'Drachenschatz', '1 Milliarde Gold mit dem Bandenhof verdient'],
    ['quiz_marathon', '🔮', 'Orakel', 'Solo-Quiz mit 30 Fragen ohne einen Fehler'],
    ['karten_gold', '💠', 'Goldene Hand', '5 Karten auf Maximalstufe gebracht'],
    ['reich', '💰', 'Dagobert', '10.000 Bandengold auf einmal besitzen'],
    ['duell_meister', '🥇', 'Kneipenlegende', '25 Kneipen-Duelle gegen den Wirt gewonnen'],
    ['drill_1', '🪐', 'Erster Abbau', 'Im Galaxie-Bohrer einen Planeten abgebaut'],
    ['drill_10', '🌌', 'Planetenfresser', 'Im Galaxie-Bohrer 10 Planeten abgebaut'],
    ['drill_waffen', '🔫', 'Volle Bewaffnung', 'Alle 6 Waffen im Galaxie-Bohrer freigeschaltet'],
    ['drill_100', '⚡', 'Überladen', 'Eine Waffe im Galaxie-Bohrer auf Stufe 100'],
    ['drill_warp', '🌀', 'Warp-Pilot', 'Im Galaxie-Bohrer den ersten Warp-Sprung gemacht'],
    ['drill_legende', '🛸', 'Legendärer Hangar', 'Im Galaxie-Bohrer ein legendäres Schiffsteil gezogen'],
    ['ernte_w5', '🌾', 'Erntehelfer', 'Erntezeit: Welle 5 überlebt'],
    ['ernte_w10', '🌙', 'Nachtschicht', 'Erntezeit: Welle 10 überlebt'],
    ['ernte_w20', '🌅', 'Bis zum Morgengrauen', 'Erntezeit: Welle 20 überlebt'],
    ['ernte_toni', '🚜', 'Traktor gestoppt', 'Erntezeit: Traktor-Toni besiegt'],
    ['ernte_friedhof', '⚰️', 'Totengräber', 'Erntezeit: Welle 10 auf dem Friedhof überlebt'],
    ['ernte_head', '🎯', 'Kopfjäger', 'Erntezeit: 100 Kopfschüsse insgesamt'],
    ['ernte_hacke', '⛏️', 'Gartenarbeit', 'Erntezeit: 50 Zombies im Nahkampf erledigt'],
    ['ernte_kills', '🧟', 'Seuchenbekämpfer', 'Erntezeit: 1.000 Zombies insgesamt'],
    ['allrounder', '🏆', 'Allrounder', 'In allen Spielen auf der Bestenliste']
  ];
  const OFFP = Object.keys(GAMES).filter(k => GAMES[k].off).map(k => k + '_');
  const ACH = ACH_ALL.filter(a => !OFFP.some(p => a[0].startsWith(p)));

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = n => { const a = new Uint8Array(n); (crypto || window.msCrypto).getRandomValues(a); return Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); };

  // ---------- Speicher ----------
  // P: Konto (id, token) + Profil-Cache + Fortschritt. Ohne Konto wird der Fortschritt lokal gesammelt und beim Anmelden übernommen.
  const KEY = 'bb_acc';
  const fresh = () => ({ id: null, token: null, user: '', name: '', av: 'artur', img: 0, rh: '', best: {}, ach: {}, stats: {}, fr: [], req: [], sent: [], unl: {}, dirty: false, ep: 3 });
  let P;
  try { P = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { P = null; }
  if (!P || typeof P !== 'object') P = fresh();
  P = Object.assign(fresh(), P);
  // Einmaliger Neustart: Bestwerte, Erfolge und Rahmen auf 0 (passt zur Epoche im Server)
  const EP = 3;
  const DEP = 2; // Neustart nur für den Galaxie-Bohrer
  if ((P.dep || 0) < DEP) { delete P.best.drill; for (const k in P.ach) if (k.indexOf('drill') === 0) delete P.ach[k]; for (const k in P.stats) if (k.indexOf('drill') === 0) delete P.stats[k]; P.dep = DEP; try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  if ((P.ep || 1) < EP) { P.best = {}; P.ach = {}; P.stats = {}; P.rh = ''; P.ep = EP; P.dirty = false; try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };
  const logged = () => !!(P.id && P.token);
  // Profilrahmen: werden über Erfolge freigeschaltet (Zahl = so viele Erfolge insgesamt)
  const FRAMES = [
    ['holz', 'Holzrahmen', 'profil'], ['kraut', 'Kräuterkranz', 'match_10'], ['krone', 'Königsrahmen', 'krieg_win'],
    ['bier', 'Stammtisch', 'duell_win'], ['feuer', 'Koboldfeuer', 'runner_1000'], ['schach', 'Schachbrett', 'schach_win'],
    ['quiz', 'Gelehrtenrahmen', 'quiz_perfekt'], ['kristall', 'Mollys Kristall', 'match_boss'], ['hof', 'Goldgrube', 'hof_mio'],
    ['sammler', 'Kartenhai', 'karten_10'], ['gold', 'Reines Gold', 10], ['legende', 'Bandenlegende', 20],
    ['drache', 'Drachenglut', 'runner_20k'], ['sturm', 'Gewittersturm', 'runner_x20'], ['dschungel', 'Urwaldkrone', 'match_100'],
    ['kaiser', 'Kaiserkrone', 'krieg_kampagne'], ['blut', 'Blutmond', 'krieg_sterne'], ['schatz', 'Drachenschatz', 'hof_mrd'],
    ['arkan', 'Arkane Runen', 'quiz_marathon'], ['holo', 'Holo-Glanz', 'karten_gold'], ['nordlicht', 'Nordlicht', 30], ['gott', 'Bubatz-Gottheit', -1],
  ];
  const frN = f => f[2] < 0 ? ACH.length : f[2];
  const frNeed = f => typeof f[2] === 'number' ? `${frN(f)} Erfolge freischalten` : (ACH.find(a => a[0] === f[2]) || [, , '?'])[2] + ': ' + (ACH.find(a => a[0] === f[2]) || [, , , ''])[3];
  const frOk = (f, ach) => typeof f[2] === 'number' ? Object.keys(ach || {}).length >= frN(f) : !!(ach || {})[f[2]];
  const avH = (o, attrs = '') => { const f = o && o.rh && FRAMES.some(x => x[0] === o.rh) ? o.rh : '';
    return f ? `<span class="bb-fr f-${f}"><img src="${avUrl(o)}" alt="" ${attrs}></span>` : `<img src="${avUrl(o)}" alt="" ${attrs}>`; };
  const avUrl = (o) => o && o.img && o.id ? `${API}?a=img&u=${o.id}&v=${o.img}` : IMG((o && o.av) || 'artur');

  // ---------- Server ----------
  async function post(a, body) {
    const r = await fetch(API + '?a=' + a, { method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign(logged() ? { id: P.id, token: P.token } : {}, { ep: EP, dep: DEP }, body || {})) });
    let j = {}; try { j = await r.json(); } catch (e) { throw new Error('net'); }
    if (j.e === 'auth') { logoutLocal(); }
    if (!r.ok || j.e) throw new Error(j.e || 'net');
    return j;
  }
  function applyMe(me) {
    P.id = me.id; P.user = me.user; P.name = me.name; P.av = me.av; P.img = me.img || 0; P.rh = me.rh || '';
    P.fr = me.fr || []; P.req = me.req || []; P.sent = me.sent || []; P.unl = me.unl && typeof me.unl === 'object' ? me.unl : {};
    for (const g in me.best) { if (!P.best[g] || !better(g, P.best[g].s, me.best[g].s)) P.best[g] = me.best[g]; else P.dirty = true; }
    for (const k in me.ach) P.ach[k] = P.ach[k] || me.ach[k];
    for (const k in me.stats) P.stats[k] = Math.max(P.stats[k] || 0, me.stats[k]);
    if ('meta' in me) mFromServer(me.meta);
    if (Object.keys(P.ach).some(k => !me.ach[k]) || Object.keys(P.best).some(g => !me.best[g])) P.dirty = true;
    save(); listeners.forEach(f => f(P));
  }
  let syncing = false, again = false, syncT = null;
  async function sync() {
    if (!logged() || !P.dirty) return;
    if (syncing) { again = true; return; }
    syncing = true; P.dirty = false; save();
    try { const j = await post('save', { best: P.best, ach: P.ach, stats: P.stats }); applyMe(j.me); }
    catch (e) { if (logged()) { P.dirty = true; save(); } }
    syncing = false;
    if (again) { again = false; setTimeout(sync, 300); }
  }
  const soon = () => { clearTimeout(syncT); syncT = setTimeout(sync, 600); };
  function logoutLocal() { P = fresh(); save(); mPulled = false; mDirty = false; listeners.forEach(f => f(P)); }

  // ---------- Toast ----------
  let css = false;
  function addCss() {
    if (css) return; css = true;
    const st = document.createElement('style');
    st.textContent = `
.bb-toasts{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:min(92vw,420px)}
.bb-toast{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;background:linear-gradient(#2a1e0c,#140e06);border:1px solid #ffc94d;color:#f3f1ea;font:15px/1.3 Georgia,serif;box-shadow:0 10px 30px rgba(0,0,0,.7),0 0 20px rgba(255,201,77,.25);animation:bbIn .4s ease-out}
.bb-toast b{font-family:Cinzel,Georgia,serif;color:#ffe08a}.bb-toast .i{font-size:28px}
.bb-toasts.top{top:calc(max(10px,env(safe-area-inset-top)) + 172px);bottom:auto}.bb-toasts.top .bb-toast{padding:7px 12px;font-size:13px}.bb-toasts.top .bb-toast .i{font-size:20px}
.bb-toast.out{opacity:0;transform:translateY(10px);transition:.4s}
@keyframes bbIn{from{opacity:0;transform:translateY(20px) scale(.9)}}
.bb-ov{position:fixed;inset:0;z-index:9990;background:rgba(3,3,4,.8);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:max(14px,env(safe-area-inset-top)) 12px 24px;font:15px/1.4 Georgia,serif;color:#f3f1ea;-webkit-user-select:text;user-select:text}
.bb-box{position:relative;width:100%;max-width:620px;margin:auto 0;background:linear-gradient(rgba(15,18,25,.97),rgba(6,8,11,.98));border:1px solid #ffc94d;outline:1px solid #1f2533;outline-offset:4px;border-radius:12px;box-shadow:0 24px 70px rgba(0,0,0,.85);padding:18px}
.bb-x{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:50%;border:1px solid #414b61;background:#0f1219;color:#ffe08a;font-size:18px;cursor:pointer}
.bb-h{font:900 26px "Cinzel Decorative",Cinzel,Georgia,serif;text-align:center;background:linear-gradient(#fff6d6,#ffe08a 45%,#e0a526);-webkit-background-clip:text;background-clip:text;color:transparent;margin:2px 30px 10px}
.bb-tabs{display:flex;gap:6px;margin-bottom:14px}
.bb-tabs button,.bb-gs button{flex:1;padding:9px 6px;border-radius:8px;border:1px solid #252c3d;background:#0c0e14;color:#f3f1ea;font:800 13px Cinzel,Georgia,serif;cursor:pointer}
.bb-tabs button.on,.bb-gs button.on{border-color:#ffc94d;background:linear-gradient(#ffd666,#f0a91f);color:#1a1206}
.bb-gs{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}.bb-gs button{flex:1 1 30%;font-size:12px}
.bb-me{display:flex;align-items:center;gap:14px;margin:16px 0 10px}
.bb-me img{width:78px;height:78px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:3px solid #ffc94d;box-shadow:0 0 18px rgba(255,201,77,.4)}
.bb-in{width:100%;padding:11px 13px;border-radius:8px;border:1px solid #6b5228;background:#0a0b0f;color:#f3f1ea;font:17px Georgia,serif;outline:none}
.bb-in:focus{border-color:#ffe08a}
.bb-avs{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px;margin:10px 0}
.bb-avs button{aspect-ratio:1;border-radius:50%;border:2px solid #1f2533;padding:0;overflow:hidden;background:#0a0b0f;cursor:pointer}
.bb-avs img{width:100%;height:100%;object-fit:cover;object-position:50% 15%;display:block}
.bb-avs button.on{border-color:#ffe08a;box-shadow:0 0 0 3px rgba(240,211,122,.35)}
.bb-go{display:block;width:100%;padding:12px;border:1px solid #ffc94d;border-radius:8px;background:linear-gradient(#ffd666,#f0a91f);color:#1a1206;font:800 16px Cinzel,Georgia,serif;letter-spacing:.1em;cursor:pointer}
.bb-msg{text-align:center;font-size:14px;min-height:20px;margin:6px 0}
.bb-sec{font:800 14px Cinzel,Georgia,serif;color:#ffe08a;margin:16px 0 8px}
.bb-best{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bb-best div{padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.3);border:1px solid #1f2533;font-size:13px;color:#b5a07c}
.bb-best b{display:block;font:800 17px Cinzel,Georgia,serif;color:#fff3c4}
.bb-row{display:flex;align-items:center;gap:10px;padding:7px 6px;border-bottom:1px solid rgba(255,201,77,.12)}
.bb-row.you{background:linear-gradient(90deg,rgba(62,117,48,.45),rgba(62,117,48,.1));border-radius:8px}
.bb-row .n{width:30px;text-align:center;font:800 16px Cinzel,Georgia,serif;color:#ffe08a}
.bb-row img{width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:2px solid #ffc94d}
.bb-row .nm{flex:1;min-width:0;font:800 15px Cinzel,Georgia,serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bb-row .nm small{display:block;font:12px Georgia,serif;color:#b5a07c}
.bb-row .s{font:800 16px Cinzel,Georgia,serif;color:#fff3c4;text-align:right}
.bb-row .s small{display:block;font:11px Georgia,serif;color:#b5a07c}
.bb-ach{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.bb-ach>div{display:flex;gap:9px;align-items:center;padding:9px;border-radius:9px;border:1px solid #6b5228;background:linear-gradient(#161a24,#0b0d13)}
.bb-ach>div.lock{filter:grayscale(1);opacity:.4;border-color:#333}
.bb-ach i{font-style:normal;font-size:26px}.bb-ach b{display:block;font:800 13px Cinzel,Georgia,serif;color:#ffe08a}.bb-ach span{font-size:12px;color:#a2a7b6}
.bb-mut{color:#b5a07c;text-align:center;font-size:14px;padding:16px 0}
.bb-chip{display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 5px;border-radius:99px;border:1px solid #ffc94d;background:linear-gradient(#2a1e0c,#140e06);color:#f3f1ea;font:800 14px Cinzel,Georgia,serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.5);text-decoration:none}
.bb-chip img{width:30px;height:30px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:2px solid #ffe08a}
.bb-chip small{font:12px Georgia,serif;color:#b5a07c;margin-left:2px}
.bb-auth{max-width:440px;overflow:hidden}
.bb-invs{position:fixed;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);z-index:9995;display:flex;flex-direction:column;gap:8px;width:min(94vw,440px)}
.bb-invc{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:linear-gradient(#171c28,#0c0e14);border:1px solid #ffe08a;color:#f3f1ea;font:14px/1.3 Georgia,serif;box-shadow:0 14px 40px rgba(0,0,0,.8),0 0 24px rgba(240,211,122,.35);animation:bbDrop .45s cubic-bezier(.2,1.4,.4,1)}
.bb-invc.out{opacity:0;transform:translateY(-20px);transition:.35s}
.bb-invc img{width:46px;height:46px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:2px solid #ffe08a;flex:none}
.bb-invc .t{flex:1;min-width:0}.bb-invc b{font-family:Cinzel,Georgia,serif;color:#fff3c4}
.bb-invc .a{display:flex;flex-direction:column;gap:5px}.bb-invc .a button{padding:7px 12px;border-radius:8px;border:1px solid #ffc94d;font:800 12px Cinzel,Georgia,serif;cursor:pointer}
@keyframes bbDrop{from{opacity:0;transform:translateY(-30px) scale(.9)}}
.bb-inv-b{flex:none;padding:8px 11px;border-radius:8px;border:1px solid #ffc94d;background:linear-gradient(#ffd666,#f0a91f);color:#1a1206;font:800 12px Cinzel,Georgia,serif;cursor:pointer}
.bb-inv-b.done{background:#151923;color:#9fe36a;border-color:#4c7a32}
.bb-game{display:flex;align-items:center;gap:12px;width:100%;margin-top:8px;padding:12px 14px;border-radius:10px;border:1px solid #4b5671;background:linear-gradient(#1b212d,#0d1016);color:#ffe08a;font:800 22px Georgia,serif;text-align:left;cursor:pointer}
.bb-game i{font-style:normal;font-size:30px}.bb-game span{flex:1}.bb-game b{display:block;font:800 17px Cinzel,Georgia,serif;color:#fff3c4}.bb-game small{font:13px Georgia,serif;color:#b5a07c}
.bb-tabs button{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:16px;padding:7px 4px}.bb-tabs button span{font-size:11.5px}
.bb-auth .bb-tabs button{flex-direction:row;justify-content:center;font-size:13px;padding:9px 6px}
.bb-dot{position:absolute;top:-6px;right:-4px;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#d4473a;color:#fff;font:800 12px/20px Georgia,serif;font-style:normal;box-shadow:0 0 0 2px #07080b}
.bb-chip{position:relative}
.bb-seg{display:flex;gap:4px;margin:0 auto 10px;max-width:280px;padding:3px;border-radius:99px;background:#07090d;border:1px solid #1f2533}
.bb-seg button{flex:1;padding:7px;border-radius:99px;border:0;background:none;color:#b5a07c;font:800 13px Cinzel,Georgia,serif;cursor:pointer}.bb-seg button.on{background:linear-gradient(#ffd666,#f0a91f);color:#1a1206}
.bb-row[data-u]{cursor:pointer}.bb-row[data-u]:hover{background:rgba(255,201,77,.07)}
.bb-addrow{display:flex;gap:8px}.bb-addrow .bb-go{width:auto;flex:none;padding:0 16px;font-size:14px;letter-spacing:.04em}
.bb-acts{display:flex;gap:6px}.bb-acts button{width:38px;height:38px;border-radius:50%;font-size:17px;cursor:pointer;border:1px solid #ffc94d}
.bb-ok{background:linear-gradient(#ffd666,#f0a91f);color:#1a1206}.bb-no{background:#2a1410;color:#ff9a7a;border-color:#7a3a28!important}
.bb-back{background:none;border:0;color:#ffe08a;font:800 14px Cinzel,Georgia,serif;cursor:pointer;padding:0 0 8px}
.bb-uhead{display:flex;align-items:center;gap:14px}.bb-uhead img{width:84px;height:84px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:3px solid #ffc94d;box-shadow:0 0 18px rgba(255,201,77,.4)}
.bb-uhead b{display:block;font:900 24px Cinzel,Georgia,serif;color:#fff3c4}.bb-uhead small{display:block;color:#b5a07c;font-size:13px;margin-top:2px}
.bb-tag{display:inline-block;margin-top:3px;padding:2px 9px;border-radius:99px;background:#f0a91f;border:1px solid #ffc94d;color:#fff1c2;font:800 11px Cinzel,Georgia,serif}
.bb-best em{display:block;font-style:normal;font-size:11px;margin-top:2px;color:#b5a07c}.bb-best em.up{color:#ff9a7a}.bb-best em.dn{color:#9fe36a}
.bb-hero{display:block;width:calc(100% + 36px);margin:-18px -18px 6px;max-height:170px;object-fit:cover;object-position:50% 30%;-webkit-mask-image:linear-gradient(#000 60%,transparent);mask-image:linear-gradient(#000 60%,transparent)}
.bb-sub{text-align:center;color:#c7c2b5;font-size:14px;margin:-4px 0 14px}
.bb-l{display:block;font-size:13px;color:#b5a07c;margin:10px 0 4px}.bb-l .bb-in{margin-top:4px}
.bb-skip{display:block;margin:14px auto 0;background:none;border:0;color:#b5a07c;text-decoration:underline;font:14px Georgia,serif;cursor:pointer}
.bb-go.alt{background:linear-gradient(#2a1e0c,#140e06);color:#ffe08a;margin-top:8px}
.bb-pic{position:relative;flex:none;cursor:pointer}.bb-pic span{position:absolute;right:-2px;bottom:-2px;width:30px;height:30px;border-radius:50%;background:#f0a91f;border:2px solid #ffc94d;display:flex;align-items:center;justify-content:center;font-size:15px}
.bb-fr{position:relative;display:inline-flex;flex:none;border-radius:50%;padding:3px;isolation:isolate;line-height:0}
.bb-fr>img{position:relative;z-index:1;border:0 !important;margin:0 !important}
.bb-fr::before{content:"";position:absolute;inset:0;border-radius:50%;z-index:0}
.bb-fr::after{position:absolute;z-index:2;line-height:1;pointer-events:none;filter:drop-shadow(0 1px 2px rgba(0,0,0,.8))}
.bb-fr{font-size:12px}.bb-uhead .bb-fr,.bb-pic>.bb-fr{padding:5px;font-size:24px}.bb-uhead .bb-fr>img,.bb-me .bb-fr>img{box-shadow:none !important}
.bb-pic>.bb-fr{position:relative;right:auto;bottom:auto;width:auto;height:auto;background:none;border:0;display:inline-flex;align-items:initial;justify-content:initial}
.bb-rhs .bb-fr{font-size:15px}.bb-chip .bb-fr{font-size:10px}
.bb-fr.f-none{padding:0}.bb-fr.f-none>img{border:2px solid #ffc94d !important}
.f-holz::before{background:repeating-linear-gradient(35deg,#8a5a2b 0 4px,#6a3e18 4px 7px,#a87038 7px 10px);box-shadow:inset 0 0 0 1px #3a1e08,0 0 0 1px #3a1e08}
.f-kraut::before{background:conic-gradient(from 0deg,#333e57,#7fd36a,#333e57,#5aa83c,#333e57,#7fd36a,#333e57);box-shadow:0 0 10px rgba(255,201,77,.45)}
.f-kraut::after{content:"🌿";bottom:-12%;left:50%;transform:translateX(-50%);font-size:0.93em}
.f-krone::before{background:linear-gradient(135deg,#fff2b0,#ffc94d 40%,#8a6a10 60%,#ffe08a);box-shadow:0 0 10px rgba(240,211,122,.5)}
.f-krone::after{content:"👑";top:-30%;left:50%;transform:translateX(-50%) rotate(-8deg);font-size:1.11em}
.f-bier::before{background:linear-gradient(#fff 0 22%,#f5c542 22%,#c8861a);box-shadow:0 0 8px rgba(245,197,66,.45)}
.f-bier::after{content:"🍺";bottom:-8%;right:-10%;font-size:0.89em}
.f-feuer::before{background:conic-gradient(#ff3b1a,#ffb21a,#ff6a1a,#ffe04a,#ff3b1a,#ff8a1a,#ff3b1a);box-shadow:0 0 12px rgba(255,120,30,.7);animation:bbSpin 3s linear infinite}
.f-feuer::after{content:"🔥";bottom:-10%;right:-8%;font-size:0.93em}
.f-schach::before{background:repeating-conic-gradient(#eae7e0 0 15deg,#1a1a1a 15deg 30deg);box-shadow:0 0 0 1px #ffc94d}
.f-quiz::before{background:linear-gradient(135deg,#3a7bd5,#1a2e6a 50%,#5aa0ff);box-shadow:0 0 0 1px #ffc94d,0 0 10px rgba(90,160,255,.45)}
.f-quiz::after{content:"🎓";top:-22%;right:-14%;font-size:0.98em;transform:rotate(14deg)}
.f-kristall::before{background:conic-gradient(#b48cff,#5ae0ff,#ff8cf0,#8c6cff,#5ae0ff,#b48cff);box-shadow:0 0 14px rgba(180,140,255,.7);animation:bbSpin 5s linear infinite}
.f-kristall::after{content:"💎";top:-14%;left:-10%;font-size:0.84em}
.f-hof::before{background:radial-gradient(circle at 30% 25%,#fff6c4,#f0c94a 35%,#9a6a10 70%,#5a3a06);box-shadow:0 0 10px rgba(240,201,74,.55)}
.f-hof::after{content:"💰";bottom:-10%;left:-10%;font-size:0.93em}
.f-sammler::before{background:conic-gradient(#9aa0a8 0 25%,#3a8adf 0 50%,#a855f7 0 75%,#f0c94a 0);box-shadow:0 0 8px rgba(168,85,247,.5)}
.f-sammler::after{content:"🃏";top:-16%;right:-12%;font-size:0.89em;transform:rotate(12deg)}
.f-gold::before{background:conic-gradient(#fff4c0,#ffc94d,#303a52,#ffe08a,#fff4c0,#b8901e,#fff4c0);box-shadow:0 0 0 1px #5a3a06,0 0 14px rgba(255,215,90,.7);animation:bbSpin 6s linear infinite}
.f-legende::before{background:conic-gradient(#ff4a4a,#ffb21a,#f0e04a,#5ad35a,#3ac8ff,#8c6cff,#ff4ad0,#ff4a4a);box-shadow:0 0 16px rgba(255,200,120,.75);animation:bbSpin 2.5s linear infinite}
.f-legende::after{content:"✦";top:-18%;left:50%;transform:translateX(-50%);font-size:1.02em;color:#fff4c0;text-shadow:0 0 8px #ffd36a}
@keyframes bbSpin{to{transform:rotate(360deg)}}
.f-drache,.f-sturm,.f-dschungel,.f-kaiser,.f-blut,.f-schatz,.f-arkan,.f-holo,.f-nordlicht,.f-gott{padding:4px}
.bb-uhead .bb-fr:is(.f-drache,.f-sturm,.f-dschungel,.f-kaiser,.f-blut,.f-schatz,.f-arkan,.f-holo,.f-nordlicht,.f-gott),.bb-pic>.bb-fr:is(.f-drache,.f-sturm,.f-dschungel,.f-kaiser,.f-blut,.f-schatz,.f-arkan,.f-holo,.f-nordlicht,.f-gott){padding:7px}
.f-drache::before{background:conic-gradient(#3a0000,#ff2a00,#ffb000,#fff2a0,#ff6a00,#7a0a00,#ff3a00,#3a0000);animation:bbSpin 1.6s linear infinite}
.f-drache{animation:bbFire 1.1s ease-in-out infinite alternate}
.f-drache::after{content:"🐉";bottom:-14%;right:-16%;font-size:1.05em}
@keyframes bbFire{from{box-shadow:0 0 8px 1px rgba(255,90,0,.6)}to{box-shadow:0 0 22px 5px rgba(255,160,20,.9)}}
.f-sturm::before{background:conic-gradient(#0a1a4a,#4ad0ff,#fff,#1a3aa8,#0a1a4a,#7ae0ff,#fff,#0a1a4a);animation:bbSpin 2.4s linear infinite}
.f-sturm{animation:bbZap 2.2s steps(1) infinite}
.f-sturm::after{content:"⚡";top:-16%;right:-12%;font-size:1em}
@keyframes bbZap{0%,100%{box-shadow:0 0 10px rgba(80,180,255,.5)}8%{box-shadow:0 0 26px 6px rgba(220,245,255,1)}12%{box-shadow:0 0 10px rgba(80,180,255,.5)}16%{box-shadow:0 0 20px 4px rgba(180,230,255,.95)}20%{box-shadow:0 0 10px rgba(80,180,255,.5)}}
.f-dschungel::before{background:repeating-conic-gradient(#293145 0 10deg,#5ac83c 10deg 16deg,#191f2b 16deg 24deg);animation:bbSpin 14s linear infinite;box-shadow:0 0 14px rgba(255,201,77,.6)}
.f-dschungel::after{content:"🌳";bottom:-16%;left:50%;transform:translateX(-50%);font-size:1em}
.f-kaiser::before{background:radial-gradient(circle at 50% 0,#e0204a 0 6%,transparent 7%),radial-gradient(circle at 0 50%,#e0204a 0 6%,transparent 7%),radial-gradient(circle at 100% 50%,#e0204a 0 6%,transparent 7%),radial-gradient(circle at 50% 100%,#2a7ae0 0 6%,transparent 7%),conic-gradient(#fff6c0,#ffc94d,#8a6a10,#fff6c0,#c8962a,#fff6c0)}
.f-kaiser{box-shadow:0 0 0 2px #3a2606,0 0 0 4px #ffe08a,0 0 22px rgba(255,215,90,.8)}
.f-kaiser::after{content:"👑";top:-42%;left:50%;transform:translateX(-50%);font-size:1.35em}
.f-blut::before{background:radial-gradient(circle at 35% 30%,#ff6a5a,#a8100a 45%,#3a0202 80%)}
.f-blut{animation:bbBlood 2.6s ease-in-out infinite}
.f-blut::after{content:"🩸";top:-16%;left:-10%;font-size:1em;filter:drop-shadow(0 0 4px #ff2020)}
@keyframes bbBlood{50%{box-shadow:0 0 24px 6px rgba(220,20,20,.85)}0%,100%{box-shadow:0 0 8px rgba(160,10,10,.6)}}
.f-schatz::before{background:linear-gradient(110deg,#8a6a10 0%,#f0c94a 30%,#fffbe0 45%,#f0c94a 60%,#8a6a10 100%);background-size:250% 100%;animation:bbShine 2.2s linear infinite;box-shadow:0 0 16px rgba(255,210,80,.75)}
.f-schatz::after{content:"🪙";bottom:-12%;left:-12%;font-size:1em}
@keyframes bbShine{from{background-position:120% 0}to{background-position:-120% 0}}
.f-arkan::before{background:repeating-conic-gradient(#c070ff 0 8deg,#2a0a4a 8deg 15deg);animation:bbSpin 6s linear infinite reverse;box-shadow:0 0 16px rgba(170,90,255,.8)}
.f-arkan::after{content:"🔮";bottom:-14%;right:-14%;font-size:1em}
.f-holo::before{background:conic-gradient(#ffb3e6,#b3d9ff,#b3ffd9,#fff3b3,#e6b3ff,#ffb3e6);animation:bbHue 3s linear infinite;box-shadow:0 0 14px rgba(200,200,255,.8)}
.f-holo::after{content:"💠";top:-16%;right:-14%;font-size:1em}
@keyframes bbHue{to{filter:hue-rotate(360deg)}}
.f-nordlicht::before{background:linear-gradient(120deg,#0a3a5a,#2affb0,#4a6aff,#c04aff,#2affb0,#0a3a5a);background-size:300% 300%;animation:bbAurora 4s ease-in-out infinite alternate;box-shadow:0 0 18px rgba(60,255,180,.6)}
.f-nordlicht::after{content:"✨";top:-18%;left:-12%;font-size:1em}
@keyframes bbAurora{from{background-position:0 50%}to{background-position:100% 50%}}
.f-gott::before{background:conic-gradient(#fff6c0,#ff4a4a,#ffb21a,#f0e04a,#5ad35a,#3ac8ff,#8c6cff,#ff4ad0,#fff6c0);animation:bbSpin 1.4s linear infinite}
.f-gott{animation:bbGod 3s linear infinite;outline:2px solid rgba(255,240,180,.7);outline-offset:2px}
.f-gott::after{content:"🌿";top:-40%;left:50%;transform:translateX(-50%);font-size:1.25em;filter:drop-shadow(0 0 6px #fff4a0) drop-shadow(0 0 2px #fff)}
@keyframes bbGod{0%{box-shadow:0 0 22px 6px rgba(255,80,80,.8)}33%{box-shadow:0 0 22px 6px rgba(255,201,77,.8)}66%{box-shadow:0 0 22px 6px rgba(120,120,255,.8)}100%{box-shadow:0 0 22px 6px rgba(255,80,80,.8)}}
.bb-tclick{cursor:pointer;pointer-events:auto;border-color:#ffe08a !important}.bb-tclick .bb-tgo{margin-left:auto;font-size:26px;color:#ffe08a;padding-left:6px}.bb-tclick:hover{filter:brightness(1.15)}
.bb-home{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;max-width:420px;margin:10px auto 0;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,201,77,.55);background:rgba(0,0,0,.35);color:#ffe08a !important;text-decoration:none !important;font:800 14px Cinzel,Georgia,serif;letter-spacing:.04em;box-sizing:border-box}
.bb-home:hover{background:rgba(255,201,77,.12);border-color:#ffe08a}
.bb-rhbtn{display:flex;align-items:center;gap:12px;width:100%;margin:12px 0 4px;padding:10px 12px;border-radius:10px;border:1px solid #ffc94d;background:linear-gradient(#171c27,#0d0f15);color:#f3f1ea;font:inherit;cursor:pointer;text-align:left}
.bb-rhbtn img{width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:50% 15%;display:block}
.bb-rhbtn>span:nth-child(2){flex:1}.bb-rhbtn b{display:block;color:#ffe08a;font-family:Cinzel,Georgia,serif}.bb-rhbtn small{font-size:12px;color:#b5a07c}.bb-rhbtn em{font-style:normal;font-size:26px;color:#ffe08a}
.bb-rtop{display:flex;align-items:center;gap:14px;margin:8px 0 12px}.bb-rtop .bb-fr{font-size:22px;padding:5px}
.bb-rtop img{width:72px;height:72px;border-radius:50%;object-fit:cover;object-position:50% 15%;display:block}
.bb-rtop>div{flex:1}.bb-rtop b{display:block;color:#ffe08a;font:800 17px Cinzel,Georgia,serif}.bb-rtop small{font-size:12.5px;color:#b5a07c}
.bb-bar{height:6px;border-radius:4px;background:#1b1f29;margin-top:6px;overflow:hidden}.bb-bar i{display:block;height:100%;background:linear-gradient(90deg,#7fd36a,#ffc94d)}
.bb-rlist{display:flex;flex-direction:column;gap:8px}
.bb-rr{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;border:1px solid #1e2432;background:rgba(0,0,0,.3)}
.bb-rr.on{border-color:#ffe08a;box-shadow:0 0 0 2px rgba(240,211,122,.25);background:linear-gradient(#171c27,#0d0f15)}
.bb-rr .bb-fr{font-size:15px}.bb-rr img{width:46px;height:46px;border-radius:50%;object-fit:cover;object-position:50% 15%;display:block}
.bb-rr .t{flex:1;min-width:0}.bb-rr .t b{display:block;color:#ffe08a;font-size:14.5px}.bb-rr .t small{display:block;font-size:12px;color:#9fe36a}.bb-rr .t small.n{color:#a6abb9}.bb-rr .t small:empty{display:none}
.bb-rr.lk .bb-fr{filter:grayscale(1) brightness(.55)}.bb-rr.lk .t b{color:#6a7288}.bb-rr.lk .t small{color:#b5a07c}
.bb-rr button{padding:8px 12px;border-radius:8px;border:1px solid #ffc94d;background:linear-gradient(#ffd666,#f0a91f);color:#1a1206;font:800 12.5px Cinzel,Georgia,serif;cursor:pointer}
.bb-rr .st{font-size:12px;font-weight:800;color:#ffe08a;padding:0 4px}.bb-rr .st.lk{font-size:18px}
.bb-rhs{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px;margin:6px 0 4px}
.bb-rhs button{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;padding:9px 2px 6px;border-radius:10px;border:1px solid #1e2432;background:rgba(0,0,0,.3);cursor:pointer;color:#dbd7cd;font:inherit}
.bb-rhs button img{width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:50% 15%;display:block}
.bb-rhs button small{font-size:10.5px;line-height:1.15;text-align:center}
.bb-rhs button.on{border-color:#ffe08a;box-shadow:0 0 0 2px rgba(240,211,122,.35)}
.bb-rhs button.lk .bb-fr{filter:grayscale(.55) brightness(.6)}.bb-rhs button.lk small{color:#54617e}
.bb-rhs button i{position:absolute;top:22px;left:50%;transform:translateX(-50%);font-style:normal;font-size:16px;z-index:3}
.bb-rhinfo{font-size:12.5px;color:#a6abb9;min-height:16px;margin-bottom:4px}
.bb-chip .bb-fr{padding:2px}
.bb-pw{margin-top:16px;border-top:1px solid rgba(255,201,77,.15);padding-top:10px}.bb-pw summary{cursor:pointer;color:#ffe08a;font:800 14px Cinzel,Georgia,serif}.bb-pw .bb-in{margin-top:8px}
/* ===== Design v2: passend zur neuen Startseite (Navy, feiner Goldrand, ruhiger) ===== */
.bb-ov{background:rgba(4,6,10,.82)}
.bb-box{background:linear-gradient(180deg,#151c2b,#0c111b);border:1px solid rgba(255,201,77,.35);outline:0;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.05);padding:18px 16px}
.bb-box::before{content:"";position:absolute;left:24px;right:24px;top:-1px;height:1px;background:linear-gradient(90deg,transparent,#ffe08a,transparent)}
.bb-h{font:400 28px "Lilita One","Cinzel Decorative",sans-serif;letter-spacing:.01em}
.bb-x{border-radius:12px;border-color:#2a3348;background:#0a0e16}
.bb-tabs{gap:4px;padding:4px;background:#0a0e16;border:1px solid #222b3d;border-radius:14px}
.bb-tabs button{border:0;border-radius:10px;background:none;color:#9aa3b6;font:800 12.5px Nunito,sans-serif;padding:8px 4px}
.bb-tabs button.on{background:linear-gradient(#ffd666,#e3a326);color:#1a1206;box-shadow:0 4px 14px rgba(255,201,77,.25)}
.bb-gs{flex-wrap:nowrap;overflow-x:auto;gap:6px;padding-bottom:4px;scrollbar-width:none;margin:0 -16px 10px;padding-left:16px;padding-right:16px}
.bb-gs::-webkit-scrollbar{display:none}
.bb-gs button{flex:0 0 auto;padding:8px 12px;border-radius:999px;border:1px solid #273046;background:#0a0e16;color:#dfe3ec;font:800 12.5px Nunito,sans-serif;white-space:nowrap}
.bb-gs button.on{background:linear-gradient(#ffd666,#e3a326);color:#1a1206;border-color:#ffe9a8}
.bb-seg{border-radius:12px;background:#0a0e16;border-color:#222b3d}
.bb-seg button{border-radius:9px;font:800 13px Nunito,sans-serif;color:#9aa3b6}
.bb-seg button.on{background:#1c2436;color:#ffe08a;box-shadow:inset 0 0 0 1px rgba(255,201,77,.35)}
.bb-row{gap:10px;padding:9px 10px;margin-bottom:6px;border:1px solid #1e2636;border-radius:12px;background:rgba(10,14,22,.65)}
.bb-row.you{border-color:rgba(255,201,77,.5);background:rgba(255,201,77,.07)}
.bb-row .n{font:400 17px "Lilita One",sans-serif;color:#9aa3b6}
.bb-row .nm{font:800 15px Nunito,sans-serif}
.bb-row .nm small{display:block;font:700 11.5px Nunito,sans-serif;color:#8792a8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bb-row .s{font:400 19px "Lilita One",sans-serif;color:#ffe08a}
.bb-row .s small{display:block;font:700 10.5px Nunito,sans-serif;color:#8792a8}
.bb-go{border-radius:12px;font:400 17px "Lilita One",sans-serif;letter-spacing:.03em;box-shadow:0 4px 0 #8a5d10}
.bb-mut{color:#8f98ab;font-family:Nunito,sans-serif}
.bb-sec{font:400 18px "Lilita One",sans-serif;color:#ffe08a}
.bb-in{border-radius:12px;border-color:#2a3348;background:#0a0e16;font:600 16px Nunito,sans-serif}
.bb-rr{border-radius:12px;background:rgba(10,14,22,.65)}
.bb-chip{font-family:Nunito,sans-serif}
.bb-det{margin:-2px 0 8px;padding:10px 12px;border:1px solid rgba(255,201,77,.25);border-radius:12px;background:#0a0e16}
.bb-det table{width:100%;border-collapse:collapse;font:700 13px Nunito,sans-serif}
.bb-det th{text-align:right;color:#ffe08a;font:400 14px "Lilita One",sans-serif;padding:2px 6px 6px}
.bb-det td{padding:5px 6px;border-top:1px solid #1e2636;text-align:right;color:#dfe3ec}
.bb-det td:first-child{text-align:left;color:#8f98ab}
.bb-det td.w{color:#9dff6a}
.bb-ship{display:flex;gap:10px;align-items:center;margin:2px 0 8px;padding:10px;background:radial-gradient(circle at 20% 50%,#0f2328,#05080a 70%);border:1px solid #1d3a40}
.bb-shv{flex:none;text-align:center}.bb-shv svg{display:block;filter:drop-shadow(0 0 8px var(--rc))}.bb-shv span{font-size:11px;color:#5ce8f0}
.bb-spp{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}.bb-sp{padding:4px 7px;border-left:3px solid var(--rc);background:#070b0d}.bb-sp small{display:block;font-size:10px;color:#8fa3a8}.bb-sp b{display:block;font-size:12.5px;color:var(--rc)}.bb-sp i{font-style:normal;font-size:9.5px;color:#9fb3b8}
.bb-shl{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}.bb-shl small{width:100%;font-size:10.5px;color:#8fa3a8}.bb-shl span{font-size:11px;padding:3px 6px;background:#0b1114;border:1px solid #1e2a2f;color:#cfd8da}.bb-shl b{color:#5ce8f0;font-weight:600}.bb-shl em{font-style:normal;color:#ff9f43}
.bb-det td.w::after{content:" ▲";font-size:10px}
.bb-pod{display:grid;grid-template-columns:1fr 1.15fr 1fr;align-items:end;gap:8px;margin:6px 0 12px}
.bb-pd{text-align:center;cursor:pointer;padding:10px 4px;border-radius:14px}
.bb-pd.p1{background:linear-gradient(180deg,rgba(255,201,77,.18),rgba(255,201,77,.02));border:1px solid rgba(255,201,77,.35)}
.bb-pd b{display:block;font:400 15px/1.1 "Lilita One",sans-serif;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bb-pd span{font:800 13px Nunito,sans-serif;color:#ffe08a}
.bb-pd i{display:block;font:900 11px Nunito,sans-serif;font-style:normal;color:#8792a8}
.bb-pd img{width:54px;height:54px;border-radius:50%;object-fit:cover;display:block;border:2px solid #0d121c}
.bb-pd.p1 img{width:68px;height:68px;box-shadow:0 0 20px rgba(255,201,77,.5)}
.bb-pd>span:first-child,.bb-pd>img:first-child{margin:0 auto}
.bb-pd .bb-fr{margin:0 auto}
`;
    document.head.appendChild(st);
  }
  function toast(html, ico, onClick) {
    addCss();
    let box = document.querySelector('.bb-toasts');
    if (!box) { box = document.createElement('div'); box.className = 'bb-toasts'; document.body.appendChild(box); }
    // Spiele können die Meldungen nach oben legen (data-bbtoast="top") – max. 2 gleichzeitig, damit nichts zugemüllt wird
    box.classList.toggle('top', document.body.dataset.bbtoast === 'top');
    while (box.children.length >= 2) box.firstElementChild.remove();
    const t = document.createElement('div'); t.className = 'bb-toast' + (onClick ? ' bb-tclick' : ''); t.innerHTML = (ico ? `<span class="i">${ico}</span>` : '') + `<div>${html}</div>` + (onClick ? '<span class="bb-tgo">›</span>' : '');
    if (onClick) t.onclick = () => { t.remove(); onClick(); };
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, onClick ? 6500 : 3800);
  }


  // ---------- Logik ----------
  function better(g, a, b) { return GAMES[g].asc ? a < b : a > b; }
  let nagged = false;
  function record(g, s, m) {
    if (!GAMES[g] || !(s > 0)) return false;
    const old = P.best[g];
    if (old && !better(g, s, old.s)) return false;
    P.best[g] = { s: Math.round(s * 10) / 10, m: m || null, t: Date.now() };
    P.dirty = true; save(); soon();
    if (!logged() && !nagged) { nagged = true; setTimeout(() => toast('Neuer Bestwert! <b>Melde dich an</b>, damit er auf die Bestenliste kommt.', '🏆'), 1200); }
    if (Object.keys(ON).every(k => P.best[k])) unlock('allrounder');
    return !!old;
  }
  function unlock(id) {
    if (P.ach[id]) return false;
    const a = ACH.find(x => x[0] === id); if (!a) return false;
    P.ach[id] = Date.now(); P.dirty = true; save(); soon();
    toast(`<b>Erfolg freigeschaltet</b><br>${esc(a[2])}`, a[1]);
    const n = Object.keys(P.ach).length;
    FRAMES.filter(f => f[2] === id || (typeof f[2] === 'number' && frN(f) === n)).forEach(f => setTimeout(() => toast(`<b>Neuer Profilrahmen</b><br>${esc(f[1])} · tippen zum Anlegen`, '🖼️', () => open('rahmen')), 1600));
    return true;
  }
  function stat(k, n) { P.stats[k] = (P.stats[k] || 0) + (n == null ? 1 : n); P.dirty = true; save(); soon(); return P.stats[k]; }
  function fmt(g, s) { const G = GAMES[g]; return G.fmt ? G.fmt(s) : Math.round(s).toLocaleString('de-DE'); }
  const ERR = { user: 'Benutzername: 2 bis 16 Zeichen, nur Buchstaben, Zahlen, Leerzeichen, _ . -', pass: 'Das Passwort braucht mindestens 4 Zeichen.', taken: 'Der Name ist schon vergeben.', wrong: 'Benutzername oder Passwort stimmt nicht.', slow: 'Zu viele Versuche. Warte ein paar Minuten.', name: 'Bitte gib einen Namen ein.', img: 'Das Bild hat nicht geklappt. Probier ein anderes.', net: 'Keine Verbindung zum Server.', full: 'Gerade keine neuen Konten möglich.' };

  // Foto auf 256 × 256 zuschneiden
  function cropPhoto(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const s = Math.min(im.width, im.height), g = c.getContext('2d');
        g.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 256, 256);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .82));
      };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
      im.src = url;
    });
  }

  // ---------- Fenster ----------
  let ov = null, tab = 'profil', curGame = '_all', authMode = 'login';
  function open(t, g) {
    addCss();
    if (t) tab = t; if (g && (GAMES[g] || g === '_all')) curGame = g; else if (t === 'board' && !g) curGame = '_all';
    if (!logged() && tab !== 'board' && tab !== 'ach') tab = 'login';
    if (!ov) {
      ov = document.createElement('div'); ov.className = 'bb-ov';
      ov.addEventListener('click', e => { if (e.target === ov && logged()) close(); });
      ['pointerdown', 'pointerup', 'keydown', 'keyup', 'touchstart'].forEach(ev => ov.addEventListener(ev, e => e.stopPropagation()));
      document.body.appendChild(ov);
    }
    ov.style.display = 'flex';
    render();
  }
  function close() { if (ov) ov.style.display = 'none'; listeners.forEach(f => f(P)); }
  function render() {
    if (tab === 'login') return renderAuth();
    ov.innerHTML = `<div class="bb-box"><button class="bb-x" aria-label="Schließen">✕</button>
      <div class="bb-h">${{ board: 'Bestenliste', ach: 'Erfolge', friends: 'Freunde', user: 'Profil', rahmen: 'Profilrahmen' }[tab] || 'Dein Profil'}</div>
      <div class="bb-tabs"><button data-t="profil">🪪<span>${logged() ? 'Profil' : 'Login'}</span></button><button data-t="board">🏆<span>Rangliste</span></button><button data-t="friends">👥<span>Freunde</span>${P.req && P.req.length ? `<i class="bb-dot">${P.req.length}</i>` : ''}</button><button data-t="ach">🎖️<span>${Object.keys(P.ach).length}/${ACH.length}</span></button><button data-t="rahmen">🖼️<span>Rahmen</span></button></div>
      <div id="bbBody"></div></div>`;
    ov.querySelector('.bb-x').onclick = close;
    ov.querySelectorAll('[data-t]').forEach(b => { b.classList.toggle('on', b.dataset.t === tab); b.onclick = () => { tab = (b.dataset.t === 'profil' || b.dataset.t === 'friends' || b.dataset.t === 'rahmen') && !logged() ? 'login' : b.dataset.t; render(); }; });
    const body = ov.querySelector('#bbBody');
    if (tab === 'profil') profil(body); else if (tab === 'board') board(body); else if (tab === 'friends') friends(body); else if (tab === 'user') userView(body); else if (tab === 'rahmen') rahmen(body); else achs(body);
  }
  function renderAuth() {
    const reg = authMode === 'reg';
    let av = P.av || AV[Math.floor(Math.random() * AV.length)];
    ov.innerHTML = `<div class="bb-box bb-auth">
      <img class="bb-hero" src="${ROOT}krieg/img/hero.jpg" alt="">
      <div class="bb-h" style="margin-top:0">Bubatzbande</div>
      <div class="bb-sub">${reg ? 'Leg dein Konto an. Bestwerte und Erfolge landen dann auf der Bestenliste, auf jedem Gerät.' : 'Melde dich an, um auf die Bestenliste zu kommen.'}</div>
      <div class="bb-tabs"><button data-m="login" class="${reg ? '' : 'on'}">Anmelden</button><button data-m="reg" class="${reg ? 'on' : ''}">Registrieren</button></div>
      <form id="bbForm" autocomplete="on">
        <label class="bb-l">Benutzername<input class="bb-in" id="bbUser" name="username" maxlength="16" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
        <label class="bb-l">Passwort<input class="bb-in" id="bbPass" type="password" name="password" maxlength="100" autocomplete="${reg ? 'new-password' : 'current-password'}" required></label>
        ${reg ? `<label class="bb-l">Passwort wiederholen<input class="bb-in" id="bbPass2" type="password" maxlength="100" autocomplete="new-password" required></label>
        <div class="bb-l">Deine Figur (Foto geht später im Profil)</div>
        <div class="bb-avs">${AV.map(k => `<button type="button" data-av="${k}" class="${k === av ? 'on' : ''}" title="${esc(CHAR[k])}"><img src="${IMG(k)}" alt=""></button>`).join('')}</div>` : ''}
        <div class="bb-msg" id="bbMsg"></div>
        <button class="bb-go" type="submit">${reg ? 'Konto anlegen' : 'Anmelden'}</button>
      </form>
      <button class="bb-skip" id="bbSkip">Ohne Konto spielen</button>
    </div>`;
    ov.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { authMode = b.dataset.m; renderAuth(); });
    ov.querySelectorAll('[data-av]').forEach(b => b.onclick = () => { av = b.dataset.av; ov.querySelectorAll('[data-av]').forEach(x => x.classList.toggle('on', x === b)); });
    ov.querySelector('#bbSkip').onclick = () => { try { sessionStorage.setItem('bb_skip', '1'); } catch (e) {} close(); };
    const msg = ov.querySelector('#bbMsg');
    ov.querySelector('#bbForm').onsubmit = async e => {
      e.preventDefault();
      const user = ov.querySelector('#bbUser').value.trim().replace(/\s+/g, ' '), pass = ov.querySelector('#bbPass').value;
      if (reg && pass !== ov.querySelector('#bbPass2').value) { msg.textContent = 'Die Passwörter sind nicht gleich.'; return; }
      msg.style.color = '#b5a07c'; msg.textContent = reg ? 'Lege Konto an …' : 'Melde an …';
      try {
        const j = await post(reg ? 'register' : 'login', { user, pass, av });
        const keep = { best: P.best, ach: P.ach, stats: P.stats };
        P = Object.assign(fresh(), keep, { token: j.token }); applyMe(j.me); mPulled = false; setTimeout(mpull, 50);
        P.dirty = true; save(); await sync();
        toast(`${reg ? 'Willkommen in der Bande' : 'Hi'}, <b>${esc(P.name)}</b>!`, '🍻');
        if (reg) unlock('profil');
        tab = 'profil'; reg ? render() : close();
      } catch (err) { msg.style.color = '#ff9a7a'; msg.textContent = ERR[err.message] || 'Hat nicht geklappt.'; }
    };
  }
  function profil(body) {
    let av = P.av, img = undefined; // undefined = unverändert, '' = Foto löschen, data:… = neues Foto
    const cur = () => img ? img : img === '' ? IMG(av) : avUrl(Object.assign({}, P, { av }));
    const bests = Object.entries(ON).map(([g, G]) => `<div>${G.ico} ${esc(G.name)}<b>${P.best[g] ? fmt(g, P.best[g].s) + (G.unit ? ' <small style="font-size:11px;color:#b5a07c">' + G.unit + '</small>' : '') : '–'}</b></div>`).join('');
    body.innerHTML = `<div class="bb-me"><label class="bb-pic" title="Foto hochladen"><span class="bb-fr f-${P.rh || 'none'}"><img id="bbAv" src="${cur()}" alt=""></span><span>📷</span><input type="file" id="bbFile" accept="image/*" hidden></label>
        <div style="flex:1;min-width:0"><div class="bb-l" style="margin:0 0 4px">Anzeigename <small style="color:#b5a07c">· Login: ${esc(P.user)}</small></div><input class="bb-in" id="bbName" maxlength="16" value="${esc(P.name)}"></div></div>
      <div class="bb-l">Profilbild: tipp aufs Bild für ein eigenes Foto oder nimm eine Figur aus der Bande</div>
      <div class="bb-avs">${AV.map(k => `<button data-av="${k}" class="${!P.img && k === av ? 'on' : ''}" title="${esc(CHAR[k])}"><img src="${IMG(k)}" alt=""></button>`).join('')}</div>
      <button class="bb-rhbtn" id="bbRhGo"><span class="bb-fr f-${P.rh || 'none'}"><img src="${cur()}" alt=""></span><span><b>Profilrahmen</b><small>${FRAMES.filter(f => frOk(f, P.ach)).length} von ${FRAMES.length} freigeschaltet · ${P.rh ? esc((FRAMES.find(f => f[0] === P.rh) || [, ''])[1]) + ' aktiv' : 'kein Rahmen aktiv'}</small></span><em>›</em></button>
      <div class="bb-msg" id="bbMsg"></div>
      <button class="bb-go" id="bbSave">Speichern</button>
      <div class="bb-sec">Deine Bestwerte</div><div class="bb-best">${bests}</div>
      <details class="bb-pw"><summary>Passwort ändern</summary>
        <input class="bb-in" id="bbOld" type="password" placeholder="Altes Passwort" autocomplete="current-password">
        <input class="bb-in" id="bbNew" type="password" placeholder="Neues Passwort" autocomplete="new-password">
        <button class="bb-go alt" id="bbPw">Passwort ändern</button><div class="bb-msg" id="bbPwMsg"></div></details>
      <button class="bb-skip" id="bbOut">Abmelden</button>`;
    const pic = body.querySelector('#bbAv'), msg = body.querySelector('#bbMsg');
    const setPics = () => { const u = cur(); pic.src = u; body.querySelectorAll('.bb-rhbtn img').forEach(i => i.src = u); };
    body.querySelectorAll('[data-av]').forEach(b => b.onclick = () => { av = b.dataset.av; img = ''; body.querySelectorAll('[data-av]').forEach(x => x.classList.toggle('on', x === b)); setPics(); });
    body.querySelector('#bbRhGo').onclick = () => { tab = 'rahmen'; render(); };
    body.querySelector('#bbFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { img = await cropPhoto(f); setPics(); body.querySelectorAll('[data-av]').forEach(x => x.classList.remove('on')); msg.style.color = '#b5a07c'; msg.textContent = 'Foto gewählt. Jetzt speichern.'; }
      catch (err) { msg.style.color = '#ff9a7a'; msg.textContent = ERR.img; }
    };
    body.querySelector('#bbSave').onclick = async () => {
      const name = body.querySelector('#bbName').value.trim().replace(/\s+/g, ' ').slice(0, 16);
      if (!name) { msg.style.color = '#ff9a7a'; msg.textContent = ERR.name; return; }
      msg.style.color = '#b5a07c'; msg.textContent = 'Speichere …';
      const data = { name, av }; if (img !== undefined) data.img = img || null;
      try { const j = await post('save', data); applyMe(j.me); img = undefined; msg.style.color = '#9fe36a'; msg.textContent = 'Gespeichert ✓'; }
      catch (err) { msg.style.color = '#ff9a7a'; msg.textContent = ERR[err.message] || 'Speichern hat nicht geklappt.'; }
    };
    body.querySelector('#bbPw').onclick = async () => {
      const m = body.querySelector('#bbPwMsg');
      try { await post('save', { old: body.querySelector('#bbOld').value, pass: body.querySelector('#bbNew').value }); m.style.color = '#9fe36a'; m.textContent = 'Passwort geändert ✓'; }
      catch (err) { m.style.color = '#ff9a7a'; m.textContent = err.message === 'wrong' ? 'Das alte Passwort stimmt nicht.' : ERR[err.message] || 'Hat nicht geklappt.'; }
    };
    body.querySelector('#bbOut').onclick = async () => { try { await post('logout'); } catch (e) {} logoutLocal(); tab = 'login'; authMode = 'login'; render(); };
  }
  function rahmen(body) {
    const pic = avUrl(P), have = FRAMES.filter(f => frOk(f, P.ach)).length;
    const row = f => { const ok = !f[0] || frOk(f, P.ach), on = (P.rh || '') === f[0];
      const need = !f[0] ? 'Schlichter goldener Rand' : typeof f[2] === 'number' ? `${f[2] < 0 ? 'Alle ' + ACH.length : f[2]} Erfolge insgesamt (du hast ${Object.keys(P.ach).length})` : (() => { const a = ACH.find(x => x[0] === f[2]) || ['', '🎖️', '?', '']; return `${a[1]} ${esc(a[2])} – ${esc(a[3])}`; })();
      return `<div class="bb-rr ${ok ? '' : 'lk'} ${on ? 'on' : ''}"><span class="bb-fr f-${f[0] || 'none'}"><img src="${pic}" alt=""></span>
        <div class="t"><b>${esc(f[1])}</b><small>${ok ? (f[0] ? '✓ Freigeschaltet' : '') : '🔒 Erfolg nötig:'}</small><small class="n">${ok && f[0] ? '' : need}</small></div>
        ${on ? '<span class="st">Aktiv</span>' : ok ? `<button data-rh="${f[0]}">Anlegen</button>` : '<span class="st lk">🔒</span>'}</div>`; };
    body.innerHTML = `<div class="bb-rtop"><span class="bb-fr f-${P.rh || 'none'}"><img src="${pic}" alt=""></span><div><b>${esc(P.name)}</b><small>${have} von ${FRAMES.length} Rahmen freigeschaltet</small><div class="bb-bar"><i style="width:${have / FRAMES.length * 100}%"></i></div></div></div>
      <div class="bb-msg" id="bbRhMsg"></div>
      <div class="bb-rlist">${[['', 'Ohne Rahmen', 0]].concat(FRAMES).map(row).join('')}</div>`;
    body.querySelectorAll('[data-rh]').forEach(b => b.onclick = async () => {
      const m = body.querySelector('#bbRhMsg'); b.disabled = true; m.style.color = '#b5a07c'; m.textContent = 'Speichere …';
      try { const j = await post('save', { rh: b.dataset.rh, ach: P.ach }); applyMe(j.me); save(); listeners.forEach(f => f(P)); render(); }
      catch (err) { b.disabled = false; m.style.color = '#ff9a7a'; m.textContent = 'Hat nicht geklappt.'; }
    });
  }
  async function board(body) {
    const ALL = curGame === '_all', GG = ALL ? { what: 'Punkte aus allen Spielen (1. Platz 25, 2. Platz 18, 3. Platz 15 …)', unit: 'Punkte', meta: () => '', name: '' } : GAMES[curGame];
    body.innerHTML = `<div class="bb-gs"><button data-g="_all" class="${ALL ? 'on' : ''}">🏆 Gesamt</button>${Object.entries(ON).map(([g, G]) => `<button data-g="${g}" class="${g === curGame ? 'on' : ''}">${G.ico} ${esc(G.name)}</button>`).join('')}</div>
      <div class="bb-seg"><button data-s="all" class="${scope === 'all' ? 'on' : ''}">🌍 Alle</button><button data-s="fr" class="${scope === 'fr' ? 'on' : ''}">👥 Freunde</button></div>
      <div style="text-align:center;font-size:13px;color:#b5a07c;margin-bottom:6px">${esc(GG.what)}</div><div id="bbList"><div class="bb-mut">Lade …</div></div>
      ${ALL ? `<div class="bb-mut">Tipp auf einen Spieler, um sein Profil zu sehen und ihn als Freund zu adden.</div>` : `<a class="bb-go" style="margin-top:14px;text-align:center;text-decoration:none;display:block" href="${ROOT + GAMES[curGame].url}">${GAMES[curGame].ico} ${esc(GAMES[curGame].name)} spielen</a>`}`;
    body.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { curGame = b.dataset.g; board(body); });
    body.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { if (b.dataset.s === 'fr' && !logged()) { tab = 'login'; return render(); } scope = b.dataset.s; board(body); });
    const g = curGame, el = body.querySelector('#bbList');
    await sync();
    try {
      const r = await fetch(ALL ? `${API}?a=overall&u=${P.id || ''}` : `${API}?a=top&g=${g}&u=${P.id || ''}`, { cache: 'no-store' });
      const j = await r.json(); if (g !== curGame) return;
      if (!j.list) throw 0;
      if (scope === 'fr') { const ok = new Set([...(P.fr || []), P.id]); j.list = j.list.filter(x => ok.has(x.id)); const k = j.list.findIndex(x => x.you); j.me = k >= 0 ? { rank: k + 1 } : null; }
      else j.list = j.list.slice(0, 50);
      const row = (x, i) => `<div class="bb-row ${x.you ? 'you' : ''}" data-u="${x.id}"><span class="n">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>${avH(x)}<span class="nm">${esc(x.name)}${x.you ? ' (du)' : ''}<small>${ALL ? `🎖️${x.nach} · 🎮${x.ng}/${Object.keys(GAMES).length}` : esc(GG.meta(x.m) || '')}${x.ls ? ` · 🕒 ${lastSeen(x.ls)}` : ''}</small></span><span class="s">${ALL ? x.s : fmt(g, x.s)}<small>${GG.unit}</small></span></div>`;
      const podium = scope === 'all' && j.list.length >= 3 ? `<div class="bb-pod">${[1, 0, 2].map(k => { const x = j.list[k]; return `<div class="bb-pd ${k === 0 ? 'p1' : ''}" data-u="${x.id}">${avH(x)}<b>${esc(x.name)}${x.you ? ' (du)' : ''}</b><span>${ALL ? x.s + ' P' : fmt(g, x.s)}</span><i>${k + 1}. Platz</i></div>`; }).join('')}</div>` : '';
      el.innerHTML = j.list.length ? podium + j.list.map(row).slice(podium ? 3 : 0).join('') + (j.me && j.me.rank > j.list.length ? `<div class="bb-mut">… du bist auf Platz ${j.me.rank} von ${j.n}</div>` : '')
        : `<div class="bb-mut">${scope === 'fr' ? 'Von deinen Freunden steht noch keiner drauf.' : 'Noch keiner drauf. Sei der Erste!'}</div>`;
      if (scope === 'fr' && !(P.fr || []).length) el.innerHTML += `<div class="bb-mut">Du hast noch keine Freunde hinzugefügt. <a href="#" id="bbToFr" style="color:#f0d37a">Freunde finden</a></div>`;
      el.querySelectorAll('[data-u]').forEach(r => r.onclick = () => ALL ? showUser(r.dataset.u) : detail(r, g, r.dataset.u));
      const tf = el.querySelector('#bbToFr'); if (tf) tf.onclick = e => { e.preventDefault(); tab = 'friends'; render(); };
      if (!logged()) el.insertAdjacentHTML('beforeend', `<div class="bb-mut">${!ALL && P.best[g] ? `Dein Bestwert: <b style="color:#fff3c4">${fmt(g, P.best[g].s)}</b>. ` : ''}<a href="#" id="bbLog" style="color:#f0d37a">Melde dich an</a>, um mitzumachen.</div>`);
      else if (!j.me) el.insertAdjacentHTML('beforeend', `<div class="bb-mut">Du stehst noch nicht drauf. ${ALL ? 'Hol dir in irgendeinem Spiel einen Bestwert!' : 'Spiel eine Runde ' + esc(GAMES[g].name) + '!'}</div>`);
      const lg = el.querySelector('#bbLog'); if (lg) lg.onclick = e => { e.preventDefault(); tab = 'login'; render(); };
    } catch (e) { el.innerHTML = `<div class="bb-mut">Bestenliste gerade nicht erreichbar.${!ALL && P.best[g] ? `<br>Dein Bestwert: <b style="color:#fff3c4">${fmt(g, P.best[g].s)}</b>` : ''}</div>`; }
  }
  // Detail-Vergleich in der Bestenliste: Werte des Spielers neben deinen eigenen
  const LBL = { level: 'Level', stars: 'Sterne', coins: 'Münzen', gold: 'Gold', best: 'Bestwert', dist: 'Strecke', runs: 'Läufe', wins: 'Siege', lv: 'Stufe', bg: 'Bandengold', p: 'Planet' };
  const lbl = k => { const n = k.endsWith('#'), b = n ? k.slice(0, -1) : k; const t = LBL[b] || (b.charAt(0).toUpperCase() + b.slice(1)); return n ? t + ' (Anzahl)' : t; };
  async function gstat(g, id) { const r = await fetch(`${API}?a=gstat&g=${g}&u=${id}`, { cache: 'no-store' }); return r.json(); }
  // Galaxie-Bohrer: Schiffsdaten zum Anschauen in der Bestenliste (Kopie aus drill/index.html)
  const DR = (() => { const I = [
  { id: 'h_pfeil', s: 'h', r: 'g', n: 'Pfeilgleiter', col: '#f4fbff', poly: [[0, 14], [-10, -10], [0, -4], [10, -10]] },
  { id: 'h_kobold', s: 'h', r: 'g', n: 'Kobold-Kreuzer', col: '#9dff6a', poly: [[0, 14], [-6, 6], [-13, 9], [-9, -2], [-11, -10], [0, -6], [11, -10], [9, -2], [13, 9], [6, 6]] },
  { id: 'h_blatt', s: 'h', r: 's', n: 'Kräuterblatt', col: '#5fe36b', poly: [[0, 16], [-3, 6], [-12, 10], [-6, 1], [-13, -3], [-4, -4], [-2, -11], [0, -6], [2, -11], [4, -4], [13, -3], [6, 1], [12, 10], [3, 6]] },
  { id: 'h_molly', s: 'h', r: 's', n: 'Mollys Sternjäger', col: '#6ab0ff', poly: [[0, 15], [-4, 4], [-14, 2], [-5, -2], [-8, -11], [0, -5], [8, -11], [5, -2], [14, 2], [4, 4]] },
  { id: 'h_geist', s: 'h', r: 'e', n: 'Geisterschiff', col: '#dfe6ff', poly: [[0, 14], [-8, 10], [-11, 0], [-11, -10], [-7, -6], [-4, -11], [0, -7], [4, -11], [7, -6], [11, -10], [11, 0], [8, 10]] },
  { id: 'h_don', s: 'h', r: 'e', n: 'DonPatrons Goldyacht', col: '#ffd23f', poly: [[0, 14], [-5, 10], [-14, 4], [-14, -4], [-6, -10], [6, -10], [14, -4], [14, 4], [5, 10]] },
  { id: 'h_koenig', s: 'h', r: 'l', n: 'Königsfregatte', col: '#ffb43a', poly: [[0, 16], [-8, 6], [-12, -6], [-12, -12], [-6, -7], [0, -13], [6, -7], [12, -12], [12, -6], [8, 6]] },
  { id: 'h_drache', s: 'h', r: 'l', n: 'Nullraum-Drache', col: '#ff4f7a', poly: [[0, 16], [-3, 9], [-15, 12], [-8, 2], [-15, -6], [-5, -4], [0, -12], [5, -4], [15, -6], [8, 2], [15, 12], [3, 9]] },
  { id: 'r_basis', s: 'r', r: 'g', n: 'Kohle-Reaktor', col: '#ffb06a' },
  { id: 'r_kraut', s: 'r', r: 'g', n: 'Kräuterkern', col: '#7dff6a' },
  { id: 'r_plasma', s: 'r', r: 's', n: 'Plasmakern', col: '#5ce8f0' },
  { id: 'r_kristall', s: 'r', r: 's', n: 'Kristallherz', col: '#b48cff' },
  { id: 'r_geist', s: 'r', r: 'e', n: 'Geisterflamme', col: '#e9f4ff' },
  { id: 'r_sonne', s: 'r', r: 'e', n: 'Mini-Sonne', col: '#ffd23f' },
  { id: 'r_null', s: 'r', r: 'l', n: 'Nullraum-Kern', col: '#ff4fd8' },
  { id: 't_basis', s: 't', r: 'g', n: 'Standard-Düse', col: '#5ce8f0', f: 1 },
  { id: 't_doppel', s: 't', r: 'g', n: 'Doppeldüse', col: '#5ce8f0', f: 2 },
  { id: 't_ion', s: 't', r: 's', n: 'Ionen-Antrieb', col: '#6ab0ff', f: 1, tr: 1 },
  { id: 't_blitz', s: 't', r: 's', n: 'Blitzantrieb', col: '#ffe36a', f: 2 },
  { id: 't_rauch', s: 't', r: 'e', n: 'Bubatz-Rauch', col: '#9dff6a', f: 1, smoke: 1 },
  { id: 't_regen', s: 't', r: 'e', n: 'Regenbogen-Schweif', col: 'rainbow', f: 2, tr: 1 },
  { id: 't_warp', s: 't', r: 'l', n: 'Warp-Triebwerk', col: '#ff4fd8', f: 3, tr: 1 }
]; const W = [
  { id: 'line', n: 'Kobold-Blaster', d: 'Schießt Energie-Kugeln auf den nächsten Block' },
  { id: 'star', n: 'Mollys Kristallstern', d: '4 rotierende Laser' },
  { id: 'drill', n: 'Fokuhilas Bohrlanze', d: 'Durchschlagender Stoß bis zum Kern' },
  { id: 'nova', n: 'Geister-Nova', d: 'Geisterkugel explodiert im Planeten' },
  { id: 'scatter', n: 'Nilles Streufeuer', d: '7 Schüsse im Fächer' },
  { id: 'drones', n: 'DonPatrons Drohnen', d: '3 Drohnen ballern mit' },
  { id: 'chain', n: 'Marwins Kettenblitz', d: 'Blitz springt über 6 Blöcke' },
  { id: 'saw', n: 'LG3s Kräutersäge', d: '2 große Sägeblätter kreisen ums Schiff' },
  { id: 'mine', n: 'Allans Minenwerfer', d: 'Minen explodieren auf der Oberfläche' },
  { id: 'sniper', n: 'Königsschuss', d: 'Ein Riesenschuss auf das wertvollste Erz' },
  { id: 'meteor', n: 'Meteorregen' }, { id: 'whip', n: 'Plasmapeitsche' }, { id: 'rockets', n: 'Raketenschwarm' }, { id: 'grav', n: 'Gravitonbombe' }, { id: 'tornado', n: 'Wirbelsturm' }, { id: 'boomer', n: 'Sichelbumerang' }, { id: 'frost', n: 'Frostkanone' }
]; const R = { g: { n: 'Gewöhnlich', c: '#c9d1d3', b: .1 }, s: { n: 'Selten', c: '#8dff5a', b: .25 }, e: { n: 'Episch', c: '#ff5fe0', b: .6 }, l: { n: 'Legendär', c: '#ffe94d', b: 1.5 } }; const A = {"over": "Hyperschub", "gold": "Goldrausch", "meteor": "Meteorschauer", "kanone": "Orbitalkanone", "loch": "Schwarzes Loch", "erz": "Erzradar", "zeit": "Zeitsprung"}; return { I, W, R, A }; })();
  function shipCard(s) {
    if (!s || !s.eq) return '';
    const it = id => DR.I.find(x => x.id === id), h = it(s.eq.h) || DR.I[0], lv = id => (s.lv && s.lv[id]) || 1;
    const part = (k, lb) => { const x = it(s.eq[k]); if (!x) return ''; const c = DR.R[x.r].c; return `<div class="bb-sp" style="--rc:${c}"><small>${lb}</small><b>${esc(x.n)}</b><i>${DR.R[x.r].n} · Lv. ${lv(x.id)}</i></div>`; };
    const ws = DR.W.filter(w => s.w && s.w[w.id]).map(w => `<span>${esc(w.n)} <b>Lv.${s.w[w.id]}</b>${s.mod && s.mod[w.id] ? ` <em>⬢${s.mod[w.id]}</em>` : ''}</span>`).join('');
    const ab = Object.keys(s.ab || {}).filter(k => DR.A[k]).map(k => `<span>${esc(DR.A[k])} <b>Lv.${s.ab[k]}</b></span>`).join('');
    const hc = DR.R[h.r].c;
    return `<div class="bb-ship"><div class="bb-shv" style="--rc:${hc}"><img src="/drill/ships/${h.id}.png" onerror="this.onerror=null;this.src='/drill/ships/pix/${h.id}.png'" width="96" height="96" alt="${esc(h.n)}" style="display:block;margin:7px auto;image-rendering:pixelated;filter:drop-shadow(0 0 10px ${hc}55)"><span>Rumpf Lv. ${lv(h.id)}</span></div>
      <div class="bb-spp">${part('h', 'Rumpf')}${part('r', 'Reaktor')}${part('t', 'Triebwerk')}</div></div>
      ${ws ? `<div class="bb-shl"><small>Waffen</small>${ws}</div>` : ''}${ab ? `<div class="bb-shl"><small>Fähigkeiten</small>${ab}</div>` : ''}`;
  }
  async function detail(row, g, id) {
    const anc = row.closest('.bb-pod') || row, nx = anc.nextElementSibling, had = nx && nx.classList.contains('bb-det') && nx.dataset.for === id;
    anc.parentNode.querySelectorAll('.bb-det').forEach(x => x.remove()); if (had) return;
    const box = document.createElement('div'); box.className = 'bb-det'; box.dataset.for = id; box.innerHTML = '<div class="bb-mut">Lade Werte …</div>'; anc.after(box);
    try {
      const mine = logged() && id !== P.id;
      const [a, me] = await Promise.all([gstat(g, id), mine ? gstat(g, P.id).catch(() => null) : null]);
      const meMap = new Map(((me && me.stats) || []).map(x => [x[0], x[1]]));
      const val = (k, v) => typeof v === 'number' ? (k === 'Bestwert' ? fmt(g, v) : v.toLocaleString('de-DE')) : esc(String(v));
      box.innerHTML = (g === 'drill' ? shipCard(a.ship) : '') + (a.stats && a.stats.length ? `<table><tr><th></th><th>${esc(a.name)}</th>${mine ? '<th>Du</th>' : ''}</tr>${a.stats.map(([k, v]) => { const m = meMap.get(k), win = mine && typeof v === 'number' && typeof m === 'number' ? (v > m ? 1 : v < m ? -1 : 0) : 0;
          return `<tr><td>${esc(lbl(k))}</td><td class="${win > 0 ? 'w' : ''}">${val(k, v)}</td>${mine ? `<td class="${win < 0 ? 'w' : ''}">${m == null ? '–' : val(k, m)}</td>` : ''}</tr>`; }).join('')}</table>` : '<div class="bb-mut">Noch keine Details gespeichert.</div>')
        + `${a.ls ? `<div class="bb-mut" style="padding:6px 0 0">🕒 zuletzt ${lastSeen(a.ls)}</div>` : ''}<button class="bb-skip" data-prof="${id}">Profil ansehen ›</button>`;
      box.querySelector('[data-prof]').onclick = () => showUser(id);
    } catch (e) { box.innerHTML = '<div class="bb-mut">Details gerade nicht erreichbar.</div>'; }
  }
  // „zuletzt gespeichert“: heute 07:31 · gestern 22:10 · 12.11. 18:00
  function lastSeen(t) { const d = new Date(t * 1000), n = new Date(), hm = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }), y = new Date(n); y.setDate(n.getDate() - 1);
    if (d.toDateString() === n.toDateString()) return 'heute ' + hm; if (d.toDateString() === y.toDateString()) return 'gestern ' + hm;
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + hm; }
  // ---------- Freunde ----------
  let scope = 'all', viewId = null, prevTab = 'friends';
  function showUser(id) { if (id === P.id) { tab = 'profil'; return render(); } prevTab = tab; viewId = id; tab = 'user'; render(); }
  const liteRow = (x, extra) => `<div class="bb-row bb-click" data-u="${x.id}">${avH(x)}<span class="nm">${esc(x.name)}<small>🎖️ ${x.nach}/${ACH.length} Erfolge · ${Object.keys(x.best || {}).length}/${Object.keys(GAMES).length} Spiele</small></span>${extra || '<span class="s" style="font-size:20px;color:#b5a07c">›</span>'}</div>`;
  async function friends(body) {
    body.innerHTML = `<form id="bbAdd" class="bb-addrow"><input class="bb-in" id="bbTo" maxlength="16" placeholder="Benutzername deines Freundes" autocapitalize="none" spellcheck="false"><button class="bb-go" type="submit">+ Adden</button></form>
      <div class="bb-msg" id="bbFMsg"></div><div id="bbFr"><div class="bb-mut">Lade …</div></div>`;
    const msg = body.querySelector('#bbFMsg'), el = body.querySelector('#bbFr');
    body.querySelector('#bbAdd').onsubmit = async e => {
      e.preventDefault();
      const to = body.querySelector('#bbTo').value.trim(); if (!to) return;
      try {
        const j = await post('friend', { to }); applyMe(j.me);
        msg.style.color = '#9fe36a'; msg.textContent = j.now === 'friends' ? 'Ihr seid jetzt Freunde 🤝' : `Anfrage an ${j.name} geschickt ✓`;
        body.querySelector('#bbTo').value = ''; load();
      } catch (err) { msg.style.color = '#ff9a7a'; msg.textContent = { nouser: 'Den Benutzernamen gibt es nicht.', self: 'Das bist du selbst 😄', already: 'Ihr seid schon Freunde.', full: 'Du hast schon sehr viele Freunde.' }[err.message] || ERR[err.message] || 'Hat nicht geklappt.'; }
    };
    async function load() {
      try {
        const j = await post('friends'); applyMe(j.me);
        el.innerHTML = (j.req.length ? `<div class="bb-sec">Anfragen an dich</div>` + j.req.map(x => liteRow(x, `<span class="bb-acts"><button class="bb-ok" data-acc="${x.id}">✓</button><button class="bb-no" data-dec="${x.id}">✕</button></span>`)).join('') : '')
          + `<div class="bb-sec">Deine Freunde (${j.fr.length})</div>` + (j.fr.length ? j.fr.map(x => liteRow(x, `<button class="bb-inv-b" data-g="${x.id}" data-nm="${esc(x.name)}">🎮 Einladen</button>`)).join('') : '<div class="bb-mut">Noch keine Freunde. Gib oben den Benutzernamen ein.</div>')
          + (j.sent.length ? `<div class="bb-sec">Gesendet, wartet auf Antwort</div>` + j.sent.map(x => liteRow(x, `<span class="bb-acts"><button class="bb-no" data-dec="${x.id}" title="Zurückziehen">✕</button></span>`)).join('') : '');
        el.querySelectorAll('[data-acc]').forEach(b => b.onclick = async e => { e.stopPropagation(); try { const r = await post('accept', { u: b.dataset.acc }); applyMe(r.me); toast('Neuer Freund in der Bande!', '🤝'); } catch (x) {} render(); });
        el.querySelectorAll('[data-dec]').forEach(b => b.onclick = async e => { e.stopPropagation(); try { const r = await post('decline', { u: b.dataset.dec }); applyMe(r.me); } catch (x) {} render(); });
        el.querySelectorAll('[data-g]').forEach(b => b.onclick = e => { e.stopPropagation(); chooseGame([b.dataset.g], b.dataset.nm); });
        el.querySelectorAll('.bb-click').forEach(r => r.onclick = () => showUser(r.dataset.u));
      } catch (e) { el.innerHTML = `<div class="bb-mut">Freunde gerade nicht erreichbar.</div>`; }
    }
    load();
  }
  async function userView(body) {
    body.innerHTML = `<div class="bb-mut">Lade …</div>`;
    const id = viewId;
    try {
      const r = await fetch(`${API}?a=user&u=${id}`, { cache: 'no-store' }); const j = await r.json(); if (!j.user || id !== viewId) throw 0;
      const u = j.user, isFr = (P.fr || []).includes(id), sent = (P.sent || []).includes(id), inc = (P.req || []).includes(id);
      const since = u.since ? new Date(u.since * 1000).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : '';
      const btn = !logged() ? '' : isFr ? `<button class="bb-go" id="bbInv">🎮 Zum Spiel einladen</button><button class="bb-skip" id="bbUnf">Freund entfernen</button>` : inc ? `<button class="bb-go" id="bbAcc">✓ Anfrage annehmen</button>` : sent ? `<div class="bb-mut" style="padding:8px">Anfrage gesendet ✓</div>` : `<button class="bb-go" id="bbReq">+ Als Freund adden</button>`;
      body.innerHTML = `<button class="bb-back" id="bbBack">‹ Zurück</button>
        <div class="bb-uhead">${avH(u)}<div><b>${esc(u.name)}</b>${isFr ? '<span class="bb-tag">👥 Freund</span>' : ''}<small>${since ? 'Dabei seit ' + since + ' · ' : ''}${u.nfr} Freunde</small></div></div>
        <div class="bb-sec">Bestwerte</div>
        <div class="bb-best">${Object.entries(ON).map(([g, G]) => {
          const mine = P.best[g], his = u.best[g];
          const cmp = mine && his ? (better(g, his.s, mine.s) ? '<em class="up">vor dir</em>' : his.s === mine.s ? '<em>gleich</em>' : '<em class="dn">hinter dir</em>') : '';
          return `<div>${G.ico} ${esc(G.name)}<b>${his ? fmt(g, his.s) + (G.unit ? ' <small style="font-size:11px;color:#b5a07c">' + G.unit + '</small>' : '') : '–'}</b>${cmp}</div>`;
        }).join('')}</div>
        <div class="bb-sec">Erfolge ${u.nach}/${ACH.length}</div>
        <div class="bb-ach">${ACH.map(a => `<div class="${u.ach[a[0]] ? '' : 'lock'}"><i>${a[1]}</i><div><b>${esc(a[2])}</b><span>${esc(a[3])}</span></div></div>`).join('')}</div>
        <div style="margin-top:14px">${btn}</div>`;
      body.querySelector('#bbBack').onclick = () => { tab = prevTab === 'user' ? 'friends' : prevTab; render(); };
      const act = async (a, data) => { try { const x = await post(a, data); applyMe(x.me); } catch (e) {} render(); };
      const q = s => body.querySelector(s);
      if (q('#bbReq')) q('#bbReq').onclick = () => act('friend', { to: u.name });
      if (q('#bbAcc')) q('#bbAcc').onclick = () => act('accept', { u: id });
      if (q('#bbUnf')) q('#bbUnf').onclick = () => act('unfriend', { u: id });
      if (q('#bbInv')) q('#bbInv').onclick = () => chooseGame([id], u.name);
    } catch (e) { body.innerHTML = `<button class="bb-back" id="bbBack">‹ Zurück</button><div class="bb-mut">Profil nicht gefunden.</div>`; body.querySelector('#bbBack').onclick = () => { tab = prevTab; render(); }; }
  }
  function achs(body) {
    body.innerHTML = `<div class="bb-ach">${ACH.map(a => `<div class="${P.ach[a[0]] ? '' : 'lock'}"><i>${a[1]}</i><div><b>${esc(a[2])}</b><span>${esc(a[3])}</span></div></div>`).join('')}</div>`;
  }

  // ---------- Einladungen in Spiele ----------
  const INV = {
    quiz: { name: 'Bubatz-Quiz', ico: '🎤', what: 'Party-Quiz, alle am Handy', join: c => 'quiz/?c=' + encodeURIComponent(c), host: 'quiz/?host=1' },
    schach: { name: 'Schlagabtausch', ico: '♞', what: 'Schach online, 1 gegen 1', join: c => 'schach/?join=' + encodeURIComponent(c), host: 'schach/?online=1' }
  };
  const ss = { get(k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set(k, v) { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  let room = null; // { g, c } wenn auf dieser Seite gerade ein Raum offen ist
  // Spiel auswählen, zu dem Freunde eingeladen werden (aus Freundesliste oder Profil)
  function chooseGame(ids, names) {
    open('board'); tab = 'invg';
    ov.innerHTML = `<div class="bb-box"><button class="bb-x" aria-label="Schließen">✕</button><div class="bb-h">Einladen</div>
      <div class="bb-sub">Wozu willst du ${esc(names)} einladen? Du machst den Raum auf, ${ids.length > 1 ? 'sie bekommen' : 'er oder sie bekommt'} sofort eine Anfrage.</div>
      ${Object.entries(INV).map(([g, x]) => `<button class="bb-game" data-g="${g}"><i>${x.ico}</i><span><b>${esc(x.name)}</b><small>${esc(x.what)}</small></span>›</button>`).join('')}
      <button class="bb-back" id="bbBack" style="margin-top:10px">‹ Zurück</button></div>`;
    ov.querySelector('.bb-x').onclick = close;
    ov.querySelector('#bbBack').onclick = () => { tab = 'friends'; render(); };
    ov.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
      const g = b.dataset.g;
      if (room && room.g === g) { ids.forEach(id => post('invite', { to: id, g, c: room.c }).catch(() => {})); toast(`Einladung an ${esc(names)} geschickt`, '✉️'); return close(); }
      ss.set('bb_pend', { g, ids, names, t: Date.now() });
      location.href = ROOT + INV[g].host;
    });
  }
  // Freunde in einen offenen Raum einladen (aus dem Spiel heraus)
  async function invite(g, c) {
    room = { g, c };
    if (!logged()) { open('login'); return; }
    open('friends'); tab = 'invp';
    ov.innerHTML = `<div class="bb-box"><button class="bb-x" aria-label="Schließen">✕</button><div class="bb-h">Freunde einladen</div>
      <div class="bb-sub">${INV[g].ico} ${esc(INV[g].name)} · Code <b style="color:#f0d37a;letter-spacing:.15em">${esc(c.toUpperCase())}</b></div><div id="bbIl"><div class="bb-mut">Lade …</div></div></div>`;
    ov.querySelector('.bb-x').onclick = close;
    const el = ov.querySelector('#bbIl');
    try {
      const j = await post('friends'); applyMe(j.me);
      if (!j.fr.length) { el.innerHTML = `<div class="bb-mut">Du hast noch keine Freunde. <a href="#" id="bbToFr" style="color:#f0d37a">Freunde adden</a></div>`; el.querySelector('#bbToFr').onclick = e => { e.preventDefault(); tab = 'friends'; render(); }; return; }
      el.innerHTML = j.fr.map(x => liteRow(x, `<button class="bb-inv-b" data-i="${x.id}">Einladen</button>`)).join('');
      el.querySelectorAll('[data-i]').forEach(b => b.onclick = async e => {
        e.stopPropagation(); b.disabled = true; b.textContent = '…';
        try { await post('invite', { to: b.dataset.i, g, c }); b.textContent = 'Gesendet ✓'; b.classList.add('done'); } catch (x) { b.disabled = false; b.textContent = 'Nochmal'; }
      });
    } catch (e) { el.innerHTML = `<div class="bb-mut">Freunde gerade nicht erreichbar.</div>`; }
  }
  // Ein Spiel meldet: Raum ist offen. Wartende Einladungen rausschicken.
  function roomReady(g, c) {
    room = { g, c };
    const p = ss.get('bb_pend');
    if (!p || p.g !== g || Date.now() - p.t > 30 * 60000 || !logged()) return;
    ss.set('bb_pend', null);
    Promise.all(p.ids.map(id => post('invite', { to: id, g, c }))).then(() => toast(`Einladung an ${esc(p.names)} geschickt`, '✉️'), () => toast('Einladung hat nicht geklappt', '⚠️'));
  }
  // Posteingang: Spiel-Einladungen und Freundschaftsanfragen
  const seenInv = new Set(ss.get('bb_seen') || []); let knownReq = null;
  async function inbox() {
    if (!logged() || document.hidden) return;
    try {
      const j = await post('inbox');
      const before = knownReq; knownReq = j.me.req || [];
      P.fr = j.me.fr || []; P.req = knownReq; P.sent = j.me.sent || []; save(); listeners.forEach(f => f(P));
      if (before) knownReq.filter(x => !before.includes(x)).forEach(() => toast('Neue Freundschaftsanfrage! Schau unter 👥 Freunde.', '👥'));
      j.inv.forEach(showInvite);
    } catch (e) {}
  }
  function showInvite(v) {
    if (seenInv.has(v.id)) return; seenInv.add(v.id); ss.set('bb_seen', [...seenInv].slice(-50));
    if (room && room.c && room.c.toLowerCase() === String(v.c).toLowerCase()) return post('inv_done', { iid: v.id }).catch(() => {});
    addCss();
    let box = document.querySelector('.bb-invs');
    if (!box) { box = document.createElement('div'); box.className = 'bb-invs'; document.body.appendChild(box); ['pointerdown', 'pointerup', 'keydown', 'touchstart'].forEach(ev => box.addEventListener(ev, e => e.stopPropagation())); }
    const x = INV[v.g] || { name: v.g, ico: '🎮', join: c => '' };
    const card = document.createElement('div'); card.className = 'bb-invc';
    card.innerHTML = `${avH(v.from)}<div class="t"><b>${esc(v.from.name)}</b> lädt dich ein<br>${x.ico} ${esc(x.name)}</div><div class="a"><button class="bb-ok" data-y>Annehmen</button><button class="bb-no" data-n>Nein</button></div>`;
    box.appendChild(card);
    const done = () => { post('inv_done', { iid: v.id }).catch(() => {}); card.classList.add('out'); setTimeout(() => card.remove(), 400); };
    card.querySelector('[data-y]').onclick = () => { done(); location.href = ROOT + x.join(v.c); };
    card.querySelector('[data-n]').onclick = done;
    try { navigator.vibrate && navigator.vibrate([60, 60, 60]); } catch (e) {}
  }

  // Profil-Knopf für Startseite und Spiele
  const listeners = [];
  function chip(el) {
    addCss();
    const draw = () => { el.innerHTML = `<button class="bb-chip" type="button">${logged() ? avH(P) : `<img src="${IMG('artur')}" alt="">`}${logged() ? esc(P.name) + ` <small>🎖️ ${Object.keys(P.ach).length}</small>` + (P.req && P.req.length ? `<i class="bb-dot">${P.req.length}</i>` : '') : 'Anmelden'}</button>`; el.firstChild.onclick = e => { e.stopPropagation(); open(logged() ? 'profil' : 'login'); }; };
    draw(); listeners.push(draw);
  }
  // Anmeldung beim Start (Startseite)
  function gate() {
    let skip = false; try { skip = sessionStorage.getItem('bb_skip') === '1'; } catch (e) {}
    if (!logged() && !skip) open('login');
  }

  // Spielstände im Konto (geräteübergreifend)
  const cloudT = {}, cloudP = {};
  const cloud = {
    async put(g, obj, now) {
      if (!logged()) return;
      if (g === 'meta' && !mPulled) return; // erst abgleichen, sonst überschreibt ein frisches Gerät die Sammlung
      const wait = 4000 - (Date.now() - (cloudT[g] || 0));
      clearTimeout(cloudT[g + '_t']);
      if (wait > 0 && !now) { cloudP[g] = obj; cloudT[g + '_t'] = setTimeout(() => cloud.put(g, obj, true), wait); return; }
      delete cloudP[g]; cloudT[g] = Date.now();
      try { await post('gput', { g, data: JSON.stringify(obj) }); } catch (e) { cloudP[g] = obj; }
    },
    flush() { for (const g in cloudP) cloud.put(g, cloudP[g], true); },
    async get(g) { if (!logged()) return null; const j = await post('gget', { g }); return j.data ? JSON.parse(j.data) : null; }
  };
  // ---------- Bandengold & Kartensammlung ----------
  const RAR = { g: { n: 'Gewöhnlich', c: '#b5a07c', w: 64 }, s: { n: 'Selten', c: '#6ab0ff', w: 26 }, e: { n: 'Episch', c: '#c78bff', w: 8.5 }, l: { n: 'Legendär', c: '#ffb43a', w: 1.5 } };
  // [id, Name, Art, Seltenheit, Effekt-Text (x = Wert bei Stufe), Wert je Stufe, Spiel]
  const CARDS = [
    ['der-gruene-kobold', 'Der grüne Kobold', 'char', 'e', 'Kobold-Runner: +{x} % Punkte', 6, 'runner'],
    ['kleine-nille', 'Kleine Nille', 'char', 's', 'Kobold-Runner: Magnet hält {x} s länger', 1.5, 'runner'],
    ['der-graue-geist', 'Der Graue Geist', 'char', 'e', 'Kobold-Runner: {x} % Chance auf Startschild', 20, 'runner'],
    ['artur-king-kebab', 'Artur King Kebab', 'char', 's', 'Bandenkrieg: +{x} % Startgold', 8, 'krieg'],
    ['allan-king-kebab', 'Allan King Kebab', 'char', 's', 'Bandenkrieg: Einheiten +{x} % Schaden', 4, 'krieg'],
    ['marwin-der-pionier', 'Marwin der Pionier', 'char', 's', 'Bandenkrieg: Katapult +{x} % Schaden', 10, 'krieg'],
    ['der-koenig-von-deutschland', 'Der König von Deutschland', 'char', 'l', 'Bandenkrieg: Burg +{x} % Leben', 8, 'krieg'],
    ['mr-mollymann', 'Mr. Mollymann', 'char', 'e', 'Kräuter-Match: +{x} Züge pro Level', 1, 'match'],
    ['baumgeist', 'Baumgeist', 'char', 'l', 'Kräuter-Match: Helfer laden {x} % schneller', 10, 'match'],
    ['lg3', 'LG3', 'char', 'g', 'Bandenhof: Kräuter +{x} %', 10, 'hof'],
    ['fokuhilamann', 'Fokuhilamann', 'char', 'g', 'Bandenhof: Waffen +{x} %', 10, 'hof'],
    ['donpatron', 'DonPatron', 'char', 's', 'Bandenhof: Preise +{x} %', 6, 'hof'],
    ['der-kraeuterkoenig', 'Der Kräuterkönig', 'char', 'l', 'Bandenhof: alles +{x} %', 8, 'hof'],
    ['goldregen', 'Goldregen', 'item', 'e', '+{x} % Bandengold aus allen Spielen', 3, null],
    ['goldene-krone', 'Goldene Krone', 'item', 'l', '+{x} % Bandengold aus allen Spielen', 4, null],
    ['goldsack-gepluendert', 'Goldsack geplündert', 'item', 's', '+{x} % Bandengold aus allen Spielen', 2, null],
    ['doenerpause', 'Dönerpause', 'item', 'g', '+{x} % Bandengold aus allen Spielen', 1, null],
    ['koeniglicher-befehl', 'Königlicher Befehl', 'item', 's', '+{x} % Bandengold aus allen Spielen', 2, null],
    ['kraeuternebel', 'Kräuternebel', 'item', 'g', '+{x} % Bandengold aus allen Spielen', 1, null],
    ['pionier-werkzeug', 'Pionier-Werkzeug', 'item', 'g', '+{x} % Bandengold aus allen Spielen', 1, null],
    ['grauer-fluch', 'Grauer Fluch', 'item', 'e', '+{x} % Bandengold aus allen Spielen', 3, null],
    ['bubatz-alarm', 'Bubatz-Alarm', 'item', 'g', '+{x} % Bandengold aus allen Spielen', 1, null],
    ['der-zoll-kommt', 'Der Zoll kommt', 'item', 's', '+{x} % Bandengold aus allen Spielen', 2, null],
    ['kebab-koma', 'Kebab-Koma', 'item', 'g', '+{x} % Bandengold aus allen Spielen', 1, null],
    ['kraeuterexplosion', 'Kräuterexplosion', 'item', 'e', '+{x} % Bandengold aus allen Spielen', 3, null],
    ['falscher-koenig', 'Falscher König', 'item', 's', '+{x} % Bandengold aus allen Spielen', 2, null],
    ['kebab-spiess', 'Kebab-Spieß', 'item', 'g', '+{x} % Bandengold aus allen Spielen', 1, null],
    ['pionier-zirkel', 'Pionier-Zirkel', 'item', 'g', '+{x} % Bandengold aus allen Spielen', 1, null],
    ['schattenmantel', 'Schattenmantel', 'item', 'e', '+{x} % Bandengold aus allen Spielen', 3, null],
    ['schmiedehammer', 'Schmiedehammer', 'item', 's', '+{x} % Bandengold aus allen Spielen', 2, null]
  ].map(([id, name, kind, r, fx, per, game]) => ({ id, name, kind, r, fx, per, game, img: ROOT + 'bande/img/' + id + '.jpg' }));
  const NEED = [0, 0, 2, 4, 8, 15];        // Kopien für Stufe 2..5
  const UPCOST = [0, 0, 60, 150, 400, 1000]; // Bandengold für Stufe 2..5
  const PACKS = { beutel: { name: 'Kräuterbeutel', n: 3, cost: 120, img: 'goldsack-gepluendert' }, truhe: { name: 'Königstruhe', n: 5, cost: 400, img: 'goldene-krone', min: 'e' } };
  const MKEY = 'bb_meta';
  let M;
  try { M = JSON.parse(localStorage.getItem(MKEY) || 'null'); } catch (e) { M = null; }
  if (!M || typeof M !== 'object') M = { bg: 50, cards: {}, t: 0, day: '' };
  M.cards = M.cards || {};
  let mPulled = false;
  const msave = (now) => { M.t = Date.now(); try { localStorage.setItem(MKEY, JSON.stringify(M)); } catch (e) {} mput(now); mlisteners.forEach(f => f(M)); };
  const mlisteners = [];
  const lvl = id => (M.cards[id] && M.cards[id].lv) || 0;
  const cardVal = id => { const c = CARDS.find(x => x.id === id); return c ? lvl(id) * c.per : 0; };
  const bgBonus = () => CARDS.filter(c => c.kind === 'item').reduce((a, c) => a + lvl(c.id) * c.per, 0);
  function earn(n, why, quiet) {
    n = Math.round(n * (1 + bgBonus() / 100));
    if (!(n > 0)) return 0;
    M.bg += n; msave(); if (M.bg >= 10000) unlock('reich');
    if (!quiet) toast(`<b>+${n} Bandengold</b>${why ? '<br>' + esc(why) : ''}`, '🪙');
    return n;
  }
  function spend(n) { if (M.bg < n) return false; M.bg -= n; msave(); return true; }
  function rollRarity(min) {
    const order = ['g', 's', 'e', 'l'], pool = order.slice(min ? order.indexOf(min) : 0);
    const tot = pool.reduce((a, r) => a + RAR[r].w, 0); let x = Math.random() * tot;
    for (const r of pool) { x -= RAR[r].w; if (x <= 0) return r; } return pool[0];
  }
  function openPack(type) {
    const P0 = PACKS[type]; if (!P0 || !spend(P0.cost)) return null;
    const out = [];
    for (let i = 0; i < P0.n; i++) {
      const r = rollRarity(i === 0 && P0.min ? P0.min : null);
      const pool = CARDS.filter(c => c.r === r), c = pool[Math.floor(Math.random() * pool.length)];
      const had = M.cards[c.id]; const isNew = !had;
      M.cards[c.id] = had ? { lv: had.lv, n: had.n + 1 } : { lv: 1, n: 0 };
      out.push({ card: c, isNew });
    }
    msave(true);
    const owned = Object.keys(M.cards).length;
    if (owned >= 10) unlock('karten_10'); if (owned >= CARDS.length) unlock('karten_alle');
    return out;
  }
  function canUp(id) { const m = M.cards[id]; return m && m.lv < 5 && m.n >= NEED[m.lv + 1] && M.bg >= UPCOST[m.lv + 1]; }
  function upCard(id) {
    const m = M.cards[id]; if (!canUp(id)) return false;
    M.bg -= UPCOST[m.lv + 1]; m.n -= NEED[m.lv + 1]; m.lv++; msave(true);
    if (m.lv >= 5) unlock('karte_max');
    if (Object.values(M.cards).filter(c => c.lv >= 5).length >= 5) unlock('karten_gold');
    return true;
  }
  // Täglicher Bandengold-Bonus
  setTimeout(() => { const d = new Date().toDateString(); if (M.day !== d) { const first = !M.day; M.day = d; if (first) msave(); else earn(25, 'Tagesbonus fürs Vorbeischauen'); } }, 2500);
  // Sammlung aus dem Konto holen (anderes Gerät)
  // Karten werden zusammengeführt (höhere Stufe/mehr Kopien gewinnt), damit nie etwas verloren geht
  function mmerge(a, b) {
    const out = Object.assign({ bg: 0, cards: {}, t: 0, day: '' }, (b.t || 0) >= (a.t || 0) ? b : a), ac = a.cards || {}, bc = b.cards || {};
    out.cards = {};
    for (const id of new Set([...Object.keys(ac), ...Object.keys(bc)])) {
      const x = ac[id], y = bc[id];
      out.cards[id] = Object.assign({}, !x ? y : !y ? x : (x.lv > y.lv || (x.lv === y.lv && x.n >= y.n)) ? x : y);
    }
    out.day = [a.day, b.day].includes(new Date().toDateString()) ? new Date().toDateString() : out.day;
    return out;
  }
  let mDirty = false, mT = 0, mBusy = false;
  const mstore = () => { try { localStorage.setItem(MKEY, JSON.stringify(M)); } catch (e) {} };
  // Server-Stand übernehmen (kommt bei jedem Profil-Abruf mit)
  function mFromServer(sm) {
    const me = P.id; if (!me) return;
    if (M.owner && M.owner !== me) { M = { bg: 50, cards: {}, t: 0, day: M.day }; mDirty = false; } // Daten eines anderen Kontos verwerfen
    const guest = M.owner !== me, hadLocal = Object.keys(M.cards).length > 0;
    if (sm && sm.cards) {
      const merged = mmerge(M, sm);
      merged.bg = guest ? Math.max(sm.bg || 0, M.bg || 0) : merged.bg;
      if (guest || !mDirty) merged.t = Math.max(sm.t || 0, M.t || 0);
      M = merged;
    }
    M.owner = me; const first = !mPulled; mPulled = true; mstore(); mlisteners.forEach(f => f(M));
    if (first && (guest || mDirty || !sm) && (hadLocal || !sm)) { mDirty = true; mput(true, guest); }
  }
  function mput(now, guest) {
    mDirty = true;
    if (!logged() || !mPulled) return;
    clearTimeout(mT);
    if (!now) { mT = setTimeout(() => mput(true), 1500); return; }
    if (mBusy) { mT = setTimeout(() => mput(true), 400); return; }
    mBusy = true; mDirty = false;
    post('mput', { m: M, own: !guest && M.owner === P.id }).then(j => {
      if (j.meta) { const merged = mmerge(M, j.meta); merged.bg = M.bg; merged.t = M.t; merged.owner = M.owner; M = merged; mstore(); mlisteners.forEach(f => f(M)); }
    }).catch(() => { mDirty = true; }).finally(() => { mBusy = false; });
  }
  async function mpull() {
    if (!logged() || mPulled) return;
    try { const j = await post('me'); applyMe(j.me); } catch (e) {}
  }
  setTimeout(mpull, 800);

  // ---------- Geheim-Spiele (Code eingeben) ----------
  // Mit Konto: Freischaltung liegt im Profil (nur bei diesem Konto). Ohne Konto: nur auf diesem Gerät.
  const ULKEY = 'bb_unl';
  const ulLocal = () => { try { return JSON.parse(localStorage.getItem(ULKEY) || '{}') || {}; } catch (e) { return {}; } };
  const secret = k => logged() ? !!(P.unl && P.unl[k]) : !!ulLocal()[k];
  async function redeem(code) {
    const j = await post('code', { code: String(code || '') });
    if (j.me) applyMe(j.me);
    else if (!logged() && j.game) { const L = ulLocal(); L[j.game.g] = Date.now(); try { localStorage.setItem(ULKEY, JSON.stringify(L)); } catch (e) {} }
    return j.game;
  }
  // ---------- Lautstärke für alle Spiele ----------
  // m = Musik, s = Soundeffekte, jeweils 0..1 (0,5 = Standard)
  const VKEY = 'bb_vol';
  function volGet() {
    let v = null; try { v = JSON.parse(localStorage.getItem(VKEY) || 'null'); } catch (e) {}
    if (!v) { try { v = JSON.parse(localStorage.getItem('gb_vol') || 'null'); } catch (e) {} } // alter Wert aus dem Galaxie-Bohrer
    const c = x => typeof x === 'number' && isFinite(x) ? Math.max(0, Math.min(1, x)) : .5;
    return { m: c(v && v.m), s: c(v && v.s) };
  }
  function volSet(k, x) { const v = volGet(); v[k] = Math.max(0, Math.min(1, +x || 0)); try { localStorage.setItem(VKEY, JSON.stringify(v)); } catch (e) {} try { window.dispatchEvent(new CustomEvent('bb-vol', { detail: v })); } catch (e) {} return v; }

  try { addCss(); } catch (e) {}
  window.BB = {
    secret, redeem, vol: volGet, setVol: volSet,
    cloud, CARDS, RAR, PACKS, NEED, UPCOST, get meta() { return M; }, lvl, cardVal, bgBonus, earn, spend, openPack, canUp, upCard, onMeta: f => mlisteners.push(f),
    get profile() { return P; }, get loggedIn() { return logged(); }, GAMES, ACH, CHAR, AV,
    FRAMES, avH, home: () => { addCss(); return `<a class="bb-home" href="${ROOT}">🏠 Zur Startseite</a>`; }, record, unlock, stat, open, close, chip, showUser: id => { open('board'); showUser(id); }, invite, roomReady, gate, toast, fmt, avatar: () => avUrl(P), onChange: f => listeners.push(f),
    best: g => P.best[g] || null, has: id => !!P.ach[id]
  };
  // Beim Laden Profil vom Server holen (anderes Gerät könnte etwas geändert haben)
  if (logged()) setTimeout(async () => { try { const j = await post('me'); applyMe(j.me); sync(); } catch (e) {} inbox(); }, 400);
  setInterval(inbox, 9000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) inbox(); else { cloud.flush(); sync(); if (mDirty) mput(true); } });
  window.addEventListener('pagehide', () => { cloud.flush(); sync(); if (mDirty) mput(true); });
})();
