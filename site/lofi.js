/* Bubatzbande · Lofi-Radio
   Hintergrundmusik, die live im Browser erzeugt wird (Web Audio API).
   Keine Audiodatei, kein fremder Song → komplett frei von Copyright.
   Lautstärke folgt BB.vol().m (Einstellungen → Musik), An/Aus in localStorage „bb_lofi“. */
(function () {
  'use strict';
  const KEY = 'bb_lofi';
  const BPM = 72, BEAT = 60 / BPM, STEP = BEAT / 4; // 16tel
  // 4 Takte, je ein Akkord (MIDI). Jede zweite Runde endet auf Am9 statt Cmaj9.
  const PROG = [
    { n: [53, 57, 60, 64, 67], b: 41 }, // Fmaj9
    { n: [52, 55, 59, 62, 69], b: 40 }, // Em7(11)
    { n: [50, 53, 57, 60, 64], b: 38 }, // Dm9
    { n: [48, 52, 55, 59, 62], b: 36 }  // Cmaj9
  ];
  const ALT = { n: [45, 48, 52, 55, 59, 64], b: 45 }; // Am9
  const PENTA = [72, 74, 76, 79, 81, 84];             // C-Dur-Pentatonik für die Melodie
  const KICK = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
  const KICK2 = [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0];
  const SNARE = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0];
  const f = m => 440 * Math.pow(2, (m - 69) / 12);

  let ctx = null, master, keysBus, drumBus, melBus, wob, noiseBuf, vinyl, timer = 0;
  let step = 0, bar = 0, next = 0, on = true, started = false;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (e) {}

  function vol() { try { return window.BB && BB.vol ? BB.vol().m : 0.5; } catch (e) { return 0.5; } }
  function level() { return on ? Math.pow(vol(), 1.4) * 0.55 : 0; }

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master = ctx.createGain(); master.gain.value = 0;
    const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 5200; // alles etwas „Kassette“
    master.connect(warm); warm.connect(comp); comp.connect(ctx.destination);

    // Tape-Wobble: leichtes Leiern der Tonhöhe
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.33;
    wob = ctx.createGain(); wob.gain.value = 9; lfo.connect(wob); lfo.start();

    keysBus = ctx.createGain(); keysBus.gain.value = 0.16;
    const kf = ctx.createBiquadFilter(); kf.type = 'lowpass'; kf.frequency.value = 1500; kf.Q.value = 0.4;
    keysBus.connect(kf); kf.connect(master);

    drumBus = ctx.createGain(); drumBus.gain.value = 0.7;
    const df = ctx.createBiquadFilter(); df.type = 'lowpass'; df.frequency.value = 3800;
    drumBus.connect(df); df.connect(master);

    // Melodie mit Echo
    melBus = ctx.createGain(); melBus.gain.value = 0.07;
    const dl = ctx.createDelay(1.5); dl.delayTime.value = BEAT * 0.75;
    const fb = ctx.createGain(); fb.gain.value = 0.38;
    const mf = ctx.createBiquadFilter(); mf.type = 'lowpass'; mf.frequency.value = 2400;
    melBus.connect(mf); mf.connect(master); mf.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(master);

    // Rauschen (für Snare/Hats) + Vinyl-Knistern
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const vb = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate), vd = vb.getChannelData(0);
    for (let i = 0; i < vd.length; i++) {
      vd[i] = (Math.random() * 2 - 1) * 0.012;
      if (Math.random() < 0.0004) vd[i] += (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.5);
    }
    vinyl = ctx.createBufferSource(); vinyl.buffer = vb; vinyl.loop = true;
    const vf = ctx.createBiquadFilter(); vf.type = 'bandpass'; vf.frequency.value = 2600; vf.Q.value = 0.6;
    const vg = ctx.createGain(); vg.gain.value = 0.5;
    vinyl.connect(vf); vf.connect(vg); vg.connect(master); vinyl.start();
    return true;
  }

  function env(g, t, a, peak, d, sus, r, len) {
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * sus, t + a, d);
    g.gain.setTargetAtTime(0, t + len, r);
  }
  function key(m, t, len, v) {
    const g = ctx.createGain(); g.connect(keysBus);
    env(g, t, 0.025, v, 0.5, 0.45, 0.35, len);
    [['sine', 0], ['triangle', 6]].forEach(([type, det], i) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f(m); o.detune.value = det;
      wob.connect(o.detune);
      const og = ctx.createGain(); og.gain.value = i ? 0.35 : 1; o.connect(og); og.connect(g);
      o.start(t); o.stop(t + len + 2);
    });
  }
  function chord(c, t, len, v) { c.n.forEach((m, i) => key(m, t + i * 0.022 + Math.random() * 0.01, len, v * (0.85 + Math.random() * 0.3))); }
  function bass(m, t, len) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f(m);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    const g = ctx.createGain(); env(g, t, 0.02, 0.5, 0.3, 0.6, 0.12, len);
    o.connect(lp); lp.connect(g); g.connect(master); o.start(t); o.stop(t + len + 1);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(g); g.connect(drumBus); o.start(t); o.stop(t + 0.5);
  }
  function noise(t, type, fr, q, peak, dec) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = 0.9 + Math.random() * 0.2;
    const bf = ctx.createBiquadFilter(); bf.type = type; bf.frequency.value = fr; bf.Q.value = q;
    const g = ctx.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.001, t + dec);
    s.connect(bf); bf.connect(g); g.connect(drumBus); s.start(t, Math.random() * 0.5); s.stop(t + dec + 0.05);
  }
  function snare(t) {
    noise(t, 'bandpass', 1700, 0.8, 0.42, 0.22);
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = 185;
    g.gain.setValueAtTime(0.22, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o.connect(g); g.connect(drumBus); o.start(t); o.stop(t + 0.15);
  }
  function hat(t, v) { noise(t, 'highpass', 7200, 0.5, v, 0.045); }
  function mel(m, t) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f(m); wob.connect(o.detune);
    const g = ctx.createGain(); env(g, t, 0.03, 1, 0.25, 0.3, 0.3, BEAT * 0.6);
    o.connect(g); g.connect(melBus); o.start(t); o.stop(t + 2.5);
  }

  function play(s, t) {
    const loop = Math.floor(bar / 4), bi = bar % 4;
    const c = (bi === 3 && loop % 2) ? ALT : PROG[bi];
    const drums = loop % 8 !== 0 || bar < 4 ? 1 : 0;            // ab und zu 4 Takte nur Keys (Break)
    const sw = (s % 4 === 2) ? STEP * 0.3 : 0;                   // Swing auf den Achteln
    const tt = t + sw;
    if (s === 0) { chord(c, t, BEAT * 2.6, 0.5); bass(c.b, t, BEAT * 1.7); }
    if (s === 10) { chord(c, tt, BEAT * 1.3, 0.3); bass(c.b + (bi % 2 ? 7 : 12), tt, BEAT * 0.8); }
    if (s === 14 && Math.random() < 0.4) bass(c.b + 7, tt, BEAT * 0.4);
    if (drums && bar >= 2) {
      if ((bi % 2 ? KICK2 : KICK)[s]) kick(t);
      if (SNARE[s]) snare(t + 0.012);
      if (s % 2 === 0) hat(tt, s % 4 === 0 ? 0.07 : 0.045);
      else if (Math.random() < 0.12) hat(t, 0.025);
    }
    if (bar >= 4 && s % 2 === 0 && Math.random() < (s % 8 === 0 ? 0.28 : 0.13)) mel(PENTA[Math.floor(Math.random() * PENTA.length)], tt);
  }

  function tick() {
    if (!ctx) return;
    while (next < ctx.currentTime + 0.15) {
      play(step, next);
      next += STEP; step = (step + 1) % 16; if (!step) bar++;
    }
  }
  function fade(to, sec) {
    if (!ctx) return;
    const g = master.gain, t = ctx.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(to, t + (sec || 0.4));
  }
  function start() {
    if (!on || !vol()) return;
    if (!ctx && !build()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!started) { started = true; next = ctx.currentTime + 0.1; timer = setInterval(tick, 30); }
    fade(level(), 2.5);
    try { window.dispatchEvent(new CustomEvent('bb-lofi', { detail: on })); } catch (e) {}
  }
  function stop() {
    if (!ctx) return;
    fade(0, 0.4);
    setTimeout(() => { if (!on && ctx) ctx.suspend(); }, 500);
  }
  function set(v) {
    on = !!v; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    on ? start() : stop();
    try { window.dispatchEvent(new CustomEvent('bb-lofi', { detail: on })); } catch (e) {}
  }

  // Browser erlauben Ton erst nach einer Berührung/Taste → beim ersten Antippen starten
  const first = e => { if (e && e.target && e.target.closest && e.target.closest('[data-mu]')) return; ['pointerdown', 'keydown', 'touchend'].forEach(e => removeEventListener(e, first, true)); start(); };
  ['pointerdown', 'keydown', 'touchend'].forEach(e => addEventListener(e, first, true));
  addEventListener('bb-vol', () => { if (!ctx) { start(); return; } if (on && ctx.state === 'suspended' && vol()) ctx.resume(); fade(level(), 0.15); });
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on && vol()) ctx.resume();
  });
  // Beim Wechsel in ein Spiel kurz ausblenden statt hart abschneiden
  addEventListener('pagehide', () => { if (ctx) fade(0, 0.1); });

  window.BBLofi = { on: () => on, set, toggle: () => { if (on && !started) start(); else set(!on); } };
})();
