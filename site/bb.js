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
  const GAMES = {
    krieg: { name: 'Bandenkrieg', ico: '⚔️', unit: 'Punkte', what: 'Bester Sieg', url: 'krieg/', meta: m => m && m.d ? `${m.d}${m.t ? ' · ' + fmtTime(m.t).replace(/\.\d$/, '') : ''}` : '' },
    match: { name: 'Kräuter-Match', ico: '🌿', unit: 'Sterne', what: 'Sterne gesamt', url: 'match/', meta: m => m && m.lv ? `bis Level ${m.lv}` : '' },
    quiz: { name: 'Bubatz-Quiz', ico: '🎤', unit: 'Punkte', what: 'Solo-Highscore', url: 'quiz/', meta: m => m && m.n ? `${m.r}/${m.n} richtig` : '' },
    duell: { name: 'Kneipen-Duell', ico: '🍺', unit: 'Kneipenpunkte', what: 'Siege gegen den Wirt', url: 'duell/', meta: m => m && m.w ? `${m.w} Siege` : '' },
    schach: { name: 'Schlagabtausch', ico: '♞', unit: '', what: 'Schnellster Sieg gegen Herrn Holz', url: 'schach/', asc: true, fmt: fmtTime, meta: m => m && m.d ? String(m.d) : '' }
  };
  const ACH = [
    ['profil', '🪪', 'Teil der Bande', 'Profil angelegt'],
    ['krieg_win', '🏰', 'Burgstürmer', 'Bandenkrieg gewonnen'],
    ['krieg_hart', '💀', 'Spießerschreck', 'Bandenkrieg auf Schwer gewonnen'],
    ['krieg_fast', '⚡', 'Blitzkrieg', 'Bandenkrieg in unter 10 Minuten gewonnen'],
    ['krieg_kills', '🗡️', 'Aufräumer', '120 Gegner in einem Bandenkrieg besiegt'],
    ['match_3', '⭐', 'Perfektionist', '3 Sterne in einem Kräuter-Level'],
    ['match_10', '🌿', 'Kräuterkenner', 'Kräuter-Match Level 10 geschafft'],
    ['match_30', '🌟', 'Sternensammler', '30 Sterne im Kräuter-Match'],
    ['quiz_10', '🧠', 'Schlaumeier', 'Mindestens 10 richtige in einer Solo-Runde'],
    ['quiz_perfekt', '🎓', 'Alleswisser', 'Solo-Runde mit mindestens 10 Fragen ohne Fehler'],
    ['quiz_party', '🎤', 'Partykönig', 'Ein Online-Quiz mit mindestens 2 Leuten gewonnen'],
    ['duell_win', '🍺', 'Stammgast', 'Kneipen-Duell gegen den Wirt gewonnen'],
    ['duell_hart', '👑', 'Kneipenkönig', 'Den harten Wirt geschlagen'],
    ['duell_null', '🧹', 'Zu null', 'Ein Kneipen-Duell 3:0 gewonnen'],
    ['duell_prost', '🤠', 'Schnellste Hand', 'Prost-Duell in unter 250 ms'],
    ['schach_win', '♚', 'Matt!', 'Herrn Holz im Schach geschlagen'],
    ['schach_duelle', '🥊', 'Duellant', '10 Ego-Duelle im Schach gewonnen'],
    ['allrounder', '🏆', 'Allrounder', 'In allen 5 Spielen auf der Bestenliste']
  ];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hex = n => { const a = new Uint8Array(n); (crypto || window.msCrypto).getRandomValues(a); return Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); };

  // ---------- Speicher ----------
  // P: Konto (id, token) + Profil-Cache + Fortschritt. Ohne Konto wird der Fortschritt lokal gesammelt und beim Anmelden übernommen.
  const KEY = 'bb_acc';
  const fresh = () => ({ id: null, token: null, user: '', name: '', av: 'artur', img: 0, best: {}, ach: {}, stats: {}, dirty: false });
  let P;
  try { P = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { P = null; }
  if (!P || typeof P !== 'object') P = fresh();
  P = Object.assign(fresh(), P);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };
  const logged = () => !!(P.id && P.token);
  const avUrl = (o) => o && o.img && o.id ? `${API}?a=img&u=${o.id}&v=${o.img}` : IMG((o && o.av) || 'artur');

  // ---------- Server ----------
  async function post(a, body) {
    const r = await fetch(API + '?a=' + a, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign(logged() ? { id: P.id, token: P.token } : {}, body || {})) });
    let j = {}; try { j = await r.json(); } catch (e) { throw new Error('net'); }
    if (j.e === 'auth') { logoutLocal(); }
    if (!r.ok || j.e) throw new Error(j.e || 'net');
    return j;
  }
  function applyMe(me) {
    P.id = me.id; P.user = me.user; P.name = me.name; P.av = me.av; P.img = me.img || 0;
    for (const g in me.best) { if (!P.best[g] || !better(g, P.best[g].s, me.best[g].s)) P.best[g] = me.best[g]; else P.dirty = true; }
    for (const k in me.ach) P.ach[k] = P.ach[k] || me.ach[k];
    for (const k in me.stats) P.stats[k] = Math.max(P.stats[k] || 0, me.stats[k]);
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
  function logoutLocal() { P = fresh(); save(); listeners.forEach(f => f(P)); }

  // ---------- Toast ----------
  let css = false;
  function addCss() {
    if (css) return; css = true;
    const st = document.createElement('style');
    st.textContent = `
.bb-toasts{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;width:min(92vw,420px)}
.bb-toast{display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:12px;background:linear-gradient(#2a1e0c,#140e06);border:1px solid #d4af37;color:#f4e6c6;font:15px/1.3 Georgia,serif;box-shadow:0 10px 30px rgba(0,0,0,.7),0 0 20px rgba(212,175,55,.25);animation:bbIn .4s ease-out}
.bb-toast b{font-family:Cinzel,Georgia,serif;color:#f0d37a}.bb-toast .i{font-size:28px}
.bb-toast.out{opacity:0;transform:translateY(10px);transition:.4s}
@keyframes bbIn{from{opacity:0;transform:translateY(20px) scale(.9)}}
.bb-ov{position:fixed;inset:0;z-index:9990;background:rgba(5,4,2,.8);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:max(14px,env(safe-area-inset-top)) 12px 24px;font:15px/1.4 Georgia,serif;color:#f1e6c8;-webkit-user-select:text;user-select:text}
.bb-box{position:relative;width:100%;max-width:620px;margin:auto 0;background:linear-gradient(rgba(24,26,14,.97),rgba(10,11,6,.98));border:1px solid #d4af37;outline:1px solid #3a3418;outline-offset:4px;border-radius:12px;box-shadow:0 24px 70px rgba(0,0,0,.85);padding:18px}
.bb-x{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:50%;border:1px solid #7a6128;background:#151a0e;color:#f0d37a;font-size:18px;cursor:pointer}
.bb-h{font:900 26px "Cinzel Decorative",Cinzel,Georgia,serif;text-align:center;background:linear-gradient(#fff6d6,#f0d37a 45%,#b8902c);-webkit-background-clip:text;background-clip:text;color:transparent;margin:2px 30px 10px}
.bb-tabs{display:flex;gap:6px;margin-bottom:14px}
.bb-tabs button,.bb-gs button{flex:1;padding:9px 6px;border-radius:8px;border:1px solid #4a3c18;background:#10150b;color:#f1e6c8;font:800 13px Cinzel,Georgia,serif;cursor:pointer}
.bb-tabs button.on,.bb-gs button.on{border-color:#d4af37;background:linear-gradient(#3e7530,#1c3f15);color:#f8e9b4}
.bb-gs{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px}.bb-gs button{flex:1 1 30%;font-size:12px}
.bb-me{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.bb-me img{width:78px;height:78px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:3px solid #d4af37;box-shadow:0 0 18px rgba(212,175,55,.4)}
.bb-in{width:100%;padding:11px 13px;border-radius:8px;border:1px solid #6b5228;background:#0b1009;color:#f1e6c8;font:17px Georgia,serif;outline:none}
.bb-in:focus{border-color:#f0d37a}
.bb-avs{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px;margin:10px 0}
.bb-avs button{aspect-ratio:1;border-radius:50%;border:2px solid #3a3418;padding:0;overflow:hidden;background:#0b1009;cursor:pointer}
.bb-avs img{width:100%;height:100%;object-fit:cover;object-position:50% 15%;display:block}
.bb-avs button.on{border-color:#f0d37a;box-shadow:0 0 0 3px rgba(240,211,122,.35)}
.bb-go{display:block;width:100%;padding:12px;border:1px solid #d4af37;border-radius:8px;background:linear-gradient(#3e7530,#1c3f15);color:#f8e9b4;font:800 16px Cinzel,Georgia,serif;letter-spacing:.1em;cursor:pointer}
.bb-msg{text-align:center;font-size:14px;min-height:20px;margin:6px 0}
.bb-sec{font:800 14px Cinzel,Georgia,serif;color:#f0d37a;margin:16px 0 8px}
.bb-best{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bb-best div{padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.3);border:1px solid #3a3418;font-size:13px;color:#b5a07c}
.bb-best b{display:block;font:800 17px Cinzel,Georgia,serif;color:#fff3c4}
.bb-row{display:flex;align-items:center;gap:10px;padding:7px 6px;border-bottom:1px solid rgba(212,175,55,.12)}
.bb-row.you{background:linear-gradient(90deg,rgba(62,117,48,.45),rgba(62,117,48,.1));border-radius:8px}
.bb-row .n{width:30px;text-align:center;font:800 16px Cinzel,Georgia,serif;color:#f0d37a}
.bb-row img{width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:2px solid #d4af37}
.bb-row .nm{flex:1;min-width:0;font:800 15px Cinzel,Georgia,serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bb-row .nm small{display:block;font:12px Georgia,serif;color:#b5a07c}
.bb-row .s{font:800 16px Cinzel,Georgia,serif;color:#fff3c4;text-align:right}
.bb-row .s small{display:block;font:11px Georgia,serif;color:#b5a07c}
.bb-ach{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.bb-ach>div{display:flex;gap:9px;align-items:center;padding:9px;border-radius:9px;border:1px solid #6b5228;background:linear-gradient(#2a2410,#14110a)}
.bb-ach>div.lock{filter:grayscale(1);opacity:.4;border-color:#333}
.bb-ach i{font-style:normal;font-size:26px}.bb-ach b{display:block;font:800 13px Cinzel,Georgia,serif;color:#f0d37a}.bb-ach span{font-size:12px;color:#c9b88f}
.bb-mut{color:#b5a07c;text-align:center;font-size:14px;padding:16px 0}
.bb-chip{display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 5px;border-radius:99px;border:1px solid #d4af37;background:linear-gradient(#2a1e0c,#140e06);color:#f4e6c6;font:800 14px Cinzel,Georgia,serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.5);text-decoration:none}
.bb-chip img{width:30px;height:30px;border-radius:50%;object-fit:cover;object-position:50% 15%;border:2px solid #f0d37a}
.bb-chip small{font:12px Georgia,serif;color:#b5a07c;margin-left:2px}
.bb-auth{max-width:440px;overflow:hidden}
.bb-hero{display:block;width:calc(100% + 36px);margin:-18px -18px 6px;max-height:170px;object-fit:cover;object-position:50% 30%;-webkit-mask-image:linear-gradient(#000 60%,transparent);mask-image:linear-gradient(#000 60%,transparent)}
.bb-sub{text-align:center;color:#d9c9a3;font-size:14px;margin:-4px 0 14px}
.bb-l{display:block;font-size:13px;color:#b5a07c;margin:10px 0 4px}.bb-l .bb-in{margin-top:4px}
.bb-skip{display:block;margin:14px auto 0;background:none;border:0;color:#b5a07c;text-decoration:underline;font:14px Georgia,serif;cursor:pointer}
.bb-go.alt{background:linear-gradient(#2a1e0c,#140e06);color:#f0d37a;margin-top:8px}
.bb-pic{position:relative;flex:none;cursor:pointer}.bb-pic span{position:absolute;right:-2px;bottom:-2px;width:30px;height:30px;border-radius:50%;background:#1c3f15;border:2px solid #d4af37;display:flex;align-items:center;justify-content:center;font-size:15px}
.bb-pw{margin-top:16px;border-top:1px solid rgba(212,175,55,.15);padding-top:10px}.bb-pw summary{cursor:pointer;color:#f0d37a;font:800 14px Cinzel,Georgia,serif}.bb-pw .bb-in{margin-top:8px}
`;
    document.head.appendChild(st);
  }
  function toast(html, ico) {
    addCss();
    let box = document.querySelector('.bb-toasts');
    if (!box) { box = document.createElement('div'); box.className = 'bb-toasts'; document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'bb-toast'; t.innerHTML = (ico ? `<span class="i">${ico}</span>` : '') + `<div>${html}</div>`;
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 450); }, 3800);
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
    if (Object.keys(GAMES).every(k => P.best[k])) unlock('allrounder');
    return !!old;
  }
  function unlock(id) {
    if (P.ach[id]) return false;
    const a = ACH.find(x => x[0] === id); if (!a) return false;
    P.ach[id] = Date.now(); P.dirty = true; save(); soon();
    toast(`<b>Erfolg freigeschaltet</b><br>${esc(a[2])}`, a[1]);
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
  let ov = null, tab = 'profil', curGame = 'krieg', authMode = 'login';
  function open(t, g) {
    addCss();
    if (t) tab = t; if (g && GAMES[g]) curGame = g;
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
      <div class="bb-h">${tab === 'board' ? 'Bestenliste' : tab === 'ach' ? 'Erfolge' : 'Dein Profil'}</div>
      <div class="bb-tabs"><button data-t="profil">🪪 ${logged() ? 'Profil' : 'Anmelden'}</button><button data-t="board">🏆 Bestenliste</button><button data-t="ach">🎖️ ${Object.keys(P.ach).length}/${ACH.length}</button></div>
      <div id="bbBody"></div></div>`;
    ov.querySelector('.bb-x').onclick = close;
    ov.querySelectorAll('[data-t]').forEach(b => { b.classList.toggle('on', b.dataset.t === tab); b.onclick = () => { tab = b.dataset.t === 'profil' && !logged() ? 'login' : b.dataset.t; render(); }; });
    const body = ov.querySelector('#bbBody');
    if (tab === 'profil') profil(body); else if (tab === 'board') board(body); else achs(body);
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
        P = Object.assign(fresh(), keep, { token: j.token }); applyMe(j.me);
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
    const bests = Object.entries(GAMES).map(([g, G]) => `<div>${G.ico} ${esc(G.name)}<b>${P.best[g] ? fmt(g, P.best[g].s) + (G.unit ? ' <small style="font-size:11px;color:#b5a07c">' + G.unit + '</small>' : '') : '–'}</b></div>`).join('');
    body.innerHTML = `<div class="bb-me"><label class="bb-pic" title="Foto hochladen"><img id="bbAv" src="${cur()}" alt=""><span>📷</span><input type="file" id="bbFile" accept="image/*" hidden></label>
        <div style="flex:1;min-width:0"><div class="bb-l" style="margin:0 0 4px">Anzeigename <small style="color:#b5a07c">· Login: ${esc(P.user)}</small></div><input class="bb-in" id="bbName" maxlength="16" value="${esc(P.name)}"></div></div>
      <div class="bb-l">Profilbild: tipp aufs Bild für ein eigenes Foto oder nimm eine Figur aus der Bande</div>
      <div class="bb-avs">${AV.map(k => `<button data-av="${k}" class="${!P.img && k === av ? 'on' : ''}" title="${esc(CHAR[k])}"><img src="${IMG(k)}" alt=""></button>`).join('')}</div>
      <div class="bb-msg" id="bbMsg"></div>
      <button class="bb-go" id="bbSave">Speichern</button>
      <div class="bb-sec">Deine Bestwerte</div><div class="bb-best">${bests}</div>
      <details class="bb-pw"><summary>Passwort ändern</summary>
        <input class="bb-in" id="bbOld" type="password" placeholder="Altes Passwort" autocomplete="current-password">
        <input class="bb-in" id="bbNew" type="password" placeholder="Neues Passwort" autocomplete="new-password">
        <button class="bb-go alt" id="bbPw">Passwort ändern</button><div class="bb-msg" id="bbPwMsg"></div></details>
      <button class="bb-skip" id="bbOut">Abmelden</button>`;
    const pic = body.querySelector('#bbAv'), msg = body.querySelector('#bbMsg');
    body.querySelectorAll('[data-av]').forEach(b => b.onclick = () => { av = b.dataset.av; img = ''; body.querySelectorAll('[data-av]').forEach(x => x.classList.toggle('on', x === b)); pic.src = cur(); });
    body.querySelector('#bbFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { img = await cropPhoto(f); pic.src = img; body.querySelectorAll('[data-av]').forEach(x => x.classList.remove('on')); msg.style.color = '#b5a07c'; msg.textContent = 'Foto gewählt. Jetzt speichern.'; }
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
  async function board(body) {
    body.innerHTML = `<div class="bb-gs">${Object.entries(GAMES).map(([g, G]) => `<button data-g="${g}" class="${g === curGame ? 'on' : ''}">${G.ico} ${esc(G.name)}</button>`).join('')}</div>
      <div style="text-align:center;font-size:13px;color:#b5a07c;margin-bottom:6px">${esc(GAMES[curGame].what)}</div><div id="bbList"><div class="bb-mut">Lade …</div></div>
      <a class="bb-go" style="margin-top:14px;text-align:center;text-decoration:none;display:block" href="${ROOT + GAMES[curGame].url}">${GAMES[curGame].ico} ${esc(GAMES[curGame].name)} spielen</a>`;
    body.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { curGame = b.dataset.g; board(body); });
    const g = curGame, el = body.querySelector('#bbList');
    await sync();
    try {
      const r = await fetch(`${API}?a=top&g=${g}&u=${P.id || ''}`, { cache: 'no-store' });
      const j = await r.json(); if (g !== curGame) return;
      if (!j.list) throw 0;
      const row = (x, i) => `<div class="bb-row ${x.you ? 'you' : ''}"><span class="n">${i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span><img src="${avUrl(x)}" alt=""><span class="nm">${esc(x.name)}${x.you ? ' (du)' : ''}<small>${esc(GAMES[g].meta(x.m) || '')}</small></span><span class="s">${fmt(g, x.s)}<small>${GAMES[g].unit}</small></span></div>`;
      el.innerHTML = j.list.length ? j.list.map(row).join('') + (j.me && j.me.rank > j.list.length ? `<div class="bb-mut">… du bist auf Platz ${j.me.rank} von ${j.n}</div>` : '')
        : `<div class="bb-mut">Noch keiner drauf. Sei der Erste!</div>`;
      if (!logged()) el.innerHTML += `<div class="bb-mut">${P.best[g] ? `Dein Bestwert: <b style="color:#fff3c4">${fmt(g, P.best[g].s)}</b>. ` : ''}<a href="#" id="bbLog" style="color:#f0d37a">Melde dich an</a>, um mitzumachen.</div>`;
      else if (!j.me) el.innerHTML += `<div class="bb-mut">Du stehst noch nicht drauf. Spiel eine Runde ${esc(GAMES[g].name)}!</div>`;
      const lg = el.querySelector('#bbLog'); if (lg) lg.onclick = e => { e.preventDefault(); tab = 'login'; render(); };
    } catch (e) { el.innerHTML = `<div class="bb-mut">Bestenliste gerade nicht erreichbar.${P.best[g] ? `<br>Dein Bestwert: <b style="color:#fff3c4">${fmt(g, P.best[g].s)}</b>` : ''}</div>`; }
  }
  function achs(body) {
    body.innerHTML = `<div class="bb-ach">${ACH.map(a => `<div class="${P.ach[a[0]] ? '' : 'lock'}"><i>${a[1]}</i><div><b>${esc(a[2])}</b><span>${esc(a[3])}</span></div></div>`).join('')}</div>`;
  }

  // Profil-Knopf für Startseite und Spiele
  const listeners = [];
  function chip(el) {
    addCss();
    const draw = () => { el.innerHTML = `<button class="bb-chip" type="button"><img src="${logged() ? avUrl(P) : IMG('artur')}" alt="">${logged() ? esc(P.name) + ` <small>🎖️ ${Object.keys(P.ach).length}</small>` : 'Anmelden'}</button>`; el.firstChild.onclick = e => { e.stopPropagation(); open(logged() ? 'profil' : 'login'); }; };
    draw(); listeners.push(draw);
  }
  // Anmeldung beim Start (Startseite)
  function gate() {
    let skip = false; try { skip = sessionStorage.getItem('bb_skip') === '1'; } catch (e) {}
    if (!logged() && !skip) open('login');
  }

  window.BB = {
    get profile() { return P; }, get loggedIn() { return logged(); }, GAMES, ACH, CHAR, AV,
    record, unlock, stat, open, close, chip, gate, toast, fmt, avatar: () => avUrl(P), onChange: f => listeners.push(f),
    best: g => P.best[g] || null, has: id => !!P.ach[id]
  };
  // Beim Laden Profil vom Server holen (anderes Gerät könnte etwas geändert haben)
  if (logged()) setTimeout(async () => { try { const j = await post('me'); applyMe(j.me); sync(); } catch (e) {} }, 400);
})();
