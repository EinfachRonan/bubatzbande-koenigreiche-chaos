/* Bubatzbande: gemeinsame Titelbilder für alle Spiele (Startseite und Spielmenüs).
   BBArt.html('krieg' | 'schach' | 'match' | 'quiz' | 'duell') liefert ein fertiges Bild als HTML. */
(function () {
  'use strict';
  const ROOT = new URL('.', document.currentScript ? document.currentScript.src : location.href).href;
  const P = k => ROOT + 'krieg/img/' + k + '.jpg';
  let ready = false;
  function setup() {
    if (ready) return; ready = true;
    const st = document.createElement('style');
    st.textContent = `
.ba{position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;background:#070a05;isolation:isolate;container-type:inline-size}
.ba>*{position:absolute}
.ba.fade{-webkit-mask-image:linear-gradient(#000 80%,transparent);mask-image:linear-gradient(#000 80%,transparent)}
.ba-head{display:block;margin:-20px -20px 4px;border-radius:12px 12px 0 0;overflow:hidden}
.ba-bg{inset:-4%;background:url(${ROOT}krieg/img/hoehle.jpg) center/cover;filter:brightness(.62) saturate(1.1);z-index:-2;transition:transform 1.2s ease}
.ba-glow{inset:0;z-index:-1;background:radial-gradient(ellipse at 50% 60%,var(--glow,rgba(140,220,90,.28)),transparent 62%)}
.ba-vig{inset:0;z-index:5;pointer-events:none;background:radial-gradient(ellipse at 50% 45%,transparent 45%,rgba(0,0,0,.65) 100%),linear-gradient(transparent 70%,rgba(5,7,3,.7))}
.ba-motes{inset:0;z-index:4;pointer-events:none;background-image:radial-gradient(1.6px 1.6px at 12% 30%,#d8ff9a,transparent),radial-gradient(1.4px 1.4px at 78% 22%,#f0d37a,transparent),radial-gradient(1.8px 1.8px at 64% 66%,#bfff7a,transparent),radial-gradient(1.2px 1.2px at 30% 74%,#f0d37a,transparent),radial-gradient(1.5px 1.5px at 88% 58%,#d8ff9a,transparent),radial-gradient(1.3px 1.3px at 45% 18%,#fff3c4,transparent);animation:baMote 7s ease-in-out infinite alternate;opacity:.85}
@keyframes baMote{to{transform:translateY(-4%)}}
.ba-med{border-radius:50%;object-fit:cover;object-position:50% 15%;border:.45cqw solid #d4af37;box-shadow:0 0 0 .3cqw #0a0d06,0 1.4cqw 3cqw rgba(0,0,0,.7)}
/* Bandenkrieg */
.ba-krieg{--glow:rgba(255,160,70,.26)}
.ba-krieg .ba-bg{background-position:50% 70%}
.ba-krieg svg.cs{left:0;right:0;bottom:0;width:100%;height:100%}
.ba-krieg .march{left:23%;bottom:15%;display:flex;gap:2cqw;align-items:flex-end}
.ba-krieg .march img{width:11cqw;height:11cqw;animation:baBob 1.1s ease-in-out infinite}
.ba-krieg .march img:nth-child(2){animation-delay:-.35s;width:9.5cqw;height:9.5cqw}.ba-krieg .march img:nth-child(3){animation-delay:-.7s;width:10cqw;height:10cqw}
.ba-krieg .foe{right:23%;bottom:15%;display:flex;gap:1.4cqw}
.ba-krieg .foe i{width:5cqw;height:8cqw;border-radius:2.5cqw 2.5cqw 1cqw 1cqw;background:linear-gradient(#e8e0d0 30%,#b3261e 30%);box-shadow:0 0 0 .3cqw #2a0a08;animation:baBob 1.2s ease-in-out infinite}
.ba-krieg .foe i:nth-child(2){animation-delay:-.4s}.ba-krieg .foe i:nth-child(3){animation-delay:-.8s}
@keyframes baBob{50%{transform:translateY(-.8cqw)}}
.ba-krieg .shot{left:15%;top:10%;width:70%;height:55%}
.ba-krieg .rock{offset-path:path('M0 60 Q 50 -30 100 40');animation:baFly 2.6s linear infinite}
/* Schach */
.ba-schach{--glow:rgba(190,150,255,.22);perspective:60cqw}
.ba-schach .ba-bg{background-position:30% 40%;filter:brightness(.5) saturate(.8) hue-rotate(40deg)}
.ba-schach .brd{left:8%;right:8%;bottom:-24%;height:70%;transform:rotateX(58deg);transform-origin:50% 100%;background:repeating-conic-gradient(#e9dcc0 0 25%,#3a2a1a 0 50%) 0 0/12.5% 25%;border:1.2cqw solid #5a3a1c;box-shadow:0 0 6cqw rgba(0,0,0,.8);border-radius:.6cqw}
.ba-schach .pc{bottom:16%;font:400 26cqw/1 "Noto Sans Symbols 2","Segoe UI Symbol","Apple Symbols",serif;filter:drop-shadow(0 1.5cqw 1.5cqw rgba(0,0,0,.8))}
.ba-schach .pc.w{left:18%;color:#fff6dc;text-shadow:0 0 4cqw rgba(255,240,190,.55)}
.ba-schach .pc.b{right:18%;color:#1b1410;-webkit-text-stroke:.35cqw #d4af37;text-shadow:0 0 4cqw rgba(212,175,55,.35)}
.ba-schach .clash{left:50%;top:38%;width:16cqw;height:16cqw;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,#fff6c8,rgba(255,200,90,.6) 30%,transparent 70%);animation:baPulse 1.8s ease-in-out infinite}
.ba-schach .swords{left:50%;top:38%;transform:translate(-50%,-50%);font-size:11cqw;filter:drop-shadow(0 0 2cqw rgba(255,220,140,.8))}
@keyframes baPulse{50%{transform:translate(-50%,-50%) scale(1.25);opacity:.7}}
/* Kräuter-Match */
.ba-match{--glow:rgba(120,230,90,.32)}
.ba-match .ba-bg{background-position:50% 50%}
.ba-match .grid{left:50%;top:52%;display:grid;grid-template-columns:repeat(5,11.5cqw);gap:1.4cqw;transform:translate(-50%,-50%) rotate(-7deg)}
.ba-match .grid b{height:11.5cqw;border-radius:2.6cqw;background:linear-gradient(#24341b,#101a0b);border:.25cqw solid #5d4a20;box-shadow:inset 0 .3cqw 0 rgba(255,240,180,.14),0 1cqw 2cqw rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}
.ba-match .grid svg{width:84%;height:84%}
.ba-match .grid b.hi{border-color:#f0d37a;box-shadow:0 0 3cqw rgba(240,211,122,.8),inset 0 .3cqw 0 rgba(255,240,180,.3);animation:baHi 1.6s ease-in-out infinite}
.ba-match .grid b.pop{animation:baPop 2.4s ease-in-out infinite}
@keyframes baHi{50%{transform:scale(1.1)}}@keyframes baPop{0%,60%,100%{transform:none;opacity:1}75%{transform:scale(1.25);opacity:.2}}
.ba-match .helper{right:5%;bottom:7%;width:15cqw;height:15cqw}.ba-match .helper2{left:5%;bottom:7%;width:13cqw;height:13cqw}
/* Quiz */
.ba-quiz{--glow:rgba(240,200,90,.3)}
.ba-quiz .ba-bg{background-position:70% 40%}
.ba-quiz .q{left:50%;top:10%;transform:translateX(-50%);width:72%;padding:2.2cqw;text-align:center;font:800 4.2cqw/1.2 Cinzel,Georgia,serif;color:#fff3c4;background:rgba(10,12,6,.82);border:.3cqw solid #d4af37;border-radius:1.6cqw;box-shadow:0 1.2cqw 3cqw rgba(0,0,0,.6)}
.ba-quiz .ans{left:14%;right:14%;top:36%;display:grid;grid-template-columns:1fr 1fr;gap:1.6cqw}
.ba-quiz .ans i{height:9.5cqw;border-radius:1.4cqw;display:flex;align-items:center;justify-content:center;color:#fff;font:normal 4.5cqw/1 Georgia,serif;box-shadow:inset 0 -.8cqw 0 rgba(0,0,0,.25),0 1cqw 2cqw rgba(0,0,0,.5)}
.ba-quiz .ans i:nth-child(1){background:linear-gradient(#d4473a,#9a2a20)}.ba-quiz .ans i:nth-child(2){background:linear-gradient(#2f7fc0,#1c4f80)}.ba-quiz .ans i:nth-child(3){background:linear-gradient(#c9a227,#8a6c10)}
.ba-quiz .ans i:nth-child(4){background:linear-gradient(#2e9a52,#1a6634);box-shadow:0 0 0 .5cqw #fff3c4,0 0 4cqw rgba(255,240,180,.7);animation:baHi 1.6s ease-in-out infinite}
.ba-quiz .crowd{left:0;right:0;bottom:4%;display:flex;justify-content:center;gap:1.6cqw}
.ba-quiz .crowd img{width:9.5cqw;height:9.5cqw}
.ba-quiz .crowd span{position:relative}.ba-quiz .crowd em{position:absolute;left:50%;top:-4.5cqw;transform:translateX(-50%);font:800 3cqw Cinzel,Georgia,serif;font-style:normal;color:#9fe36a;text-shadow:0 .3cqw 0 #000;animation:baUp 2.2s ease-out infinite}
@keyframes baUp{0%{opacity:0;transform:translate(-50%,1cqw)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-3cqw)}}
/* Kneipen-Duell */
.ba-duell{--glow:rgba(255,170,60,.36)}
.ba-duell .ba-bg{background-position:20% 60%;filter:brightness(.55) saturate(1.2) sepia(.35)}
.ba-duell .bar{left:-2%;right:-2%;bottom:0;height:24%;background:linear-gradient(#8c5726,#5a3414 30%,#2e1a0a);border-top:.8cqw solid #a8703a;box-shadow:0 -1cqw 3cqw rgba(0,0,0,.6)}
.ba-duell .l{left:6%;bottom:14%;width:27cqw;height:27cqw}.ba-duell .r{right:6%;bottom:14%;width:27cqw;height:27cqw;transform:scaleX(-1)}
.ba-duell .l{border-color:#7fd65a}.ba-duell .r{border-color:#ff8a5c}
.ba-duell .mugs{left:50%;bottom:18%;transform:translateX(-50%);font-size:15cqw;line-height:1;display:flex;gap:0;filter:drop-shadow(0 1.5cqw 1.5cqw rgba(0,0,0,.7))}
.ba-duell .mugs span{display:inline-block;animation:baClink 2.4s ease-in-out infinite}
.ba-duell .mugs span:last-child{animation-name:baClink2}
@keyframes baClink{0%,65%,100%{transform:rotate(0)}78%{transform:translateX(2cqw) rotate(16deg)}}
@keyframes baClink2{0%,65%,100%{transform:scaleX(-1) rotate(0)}78%{transform:scaleX(-1) translateX(2cqw) rotate(16deg)}}
.ba-duell .vs{left:50%;top:13%;transform:translateX(-50%);font:900 9cqw/1 "Cinzel Decorative",Cinzel,Georgia,serif;color:#f0d37a;text-shadow:0 0 4cqw rgba(255,190,80,.7),0 .5cqw 0 #2a1608}
/* Kobold-Runner */
.ba-runner{--glow:rgba(140,230,90,.3);perspective:50cqw}
.ba-runner .ba-bg{background-position:50% 30%}
.ba-runner .road{left:18%;right:18%;bottom:-18%;height:90%;transform:rotateX(60deg);transform-origin:50% 100%;background:linear-gradient(90deg,transparent 32.6%,rgba(120,180,60,.5) 33.3%,transparent 34%,transparent 65.9%,rgba(120,180,60,.5) 66.6%,transparent 67.3%),repeating-linear-gradient(#5a4e34 0 8%,#3a3222 8% 9%),#4a4030;background-size:100% 100%,100% 200%;animation:baRoad .8s linear infinite;box-shadow:0 0 8cqw rgba(0,0,0,.8)}
@keyframes baRoad{to{background-position:0 0,0 100%}}
.ba-runner .kob{left:50%;bottom:7%;width:17cqw;height:17cqw;transform:translateX(-50%);animation:baJump 1.6s ease-in-out infinite}
@keyframes baJump{0%,55%,100%{transform:translate(-50%,0)}70%{transform:translate(-50%,-9cqw)}}
.ba-runner .pot{left:50%;bottom:34%;width:9cqw;height:5.5cqw;transform:translateX(-50%);background:radial-gradient(ellipse at 50% 0,#c8ff7a 0 35%,transparent 36%),#141414;border-radius:0 0 50% 50%/0 0 80% 80%;box-shadow:0 -1.5cqw 4cqw rgba(160,255,90,.5)}
.ba-runner .guard{left:30%;bottom:42%;width:3cqw;height:6cqw;border-radius:1.5cqw 1.5cqw .5cqw .5cqw;background:linear-gradient(#e8e0d0 30%,#b3261e 30%);box-shadow:0 0 0 .2cqw #2a0a08}
.ba-runner .coins{left:62%;bottom:24%;display:flex;flex-direction:column-reverse;gap:1.4cqw;align-items:center}
.ba-runner .coins i{width:4.4cqw;height:4.4cqw;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff2b0,#f0c94a 55%,#8a6212);box-shadow:0 0 2cqw rgba(240,201,74,.7);animation:baSpin 1s linear infinite}
.ba-runner .coins i:nth-child(2){width:3.4cqw;height:3.4cqw}.ba-runner .coins i:nth-child(3){width:2.6cqw;height:2.6cqw}
@keyframes baSpin{50%{transform:scaleX(.25)}}
/* Bandenhof */
.ba-hof{--glow:rgba(240,190,90,.3)}
.ba-hof .ba-bg{background-position:80% 60%;filter:brightness(.55) saturate(1.1) sepia(.15)}
.ba-hof svg.vil{left:0;right:0;bottom:12%;width:100%;height:60%}
.ba-hof .crew{left:0;right:0;bottom:5%;display:flex;justify-content:center;gap:5cqw}
.ba-hof .crew span{position:relative;display:flex;flex-direction:column;align-items:center}
.ba-hof .crew img{width:17cqw;height:17cqw}
.ba-hof .crew em{position:absolute;top:-6cqw;font-style:normal;font-size:7cqw;filter:drop-shadow(0 .5cqw 1cqw rgba(0,0,0,.7));animation:baFloat 2.4s ease-in-out infinite}
.ba-hof .crew span:nth-child(2) em{animation-delay:-.8s}.ba-hof .crew span:nth-child(3) em{animation-delay:-1.6s}
@keyframes baFloat{50%{transform:translateY(-1.5cqw)}}
.ba-hof .gold{right:7%;top:9%;font:900 5cqw Cinzel,Georgia,serif;color:#f0d37a;text-shadow:0 0 3cqw rgba(240,200,90,.7),0 .4cqw 0 #2a1608}
@keyframes baFly{0%{offset-distance:0%;opacity:0}10%{opacity:1}90%{opacity:1}100%{offset-distance:100%;opacity:0}}
@media (prefers-reduced-motion:reduce){.ba *{animation:none!important}}
`;
    document.head.appendChild(st);
    const sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sv.setAttribute('width', '0'); sv.setAttribute('height', '0'); sv.style.position = 'absolute'; sv.setAttribute('aria-hidden', 'true');
    sv.innerHTML = `<defs> <radialGradient id="ba-gLeaf" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="#b8f27a"/><stop offset=".55" stop-color="#4caa3c"/><stop offset="1" stop-color="#1d5a1e"/></radialGradient> <linearGradient id="ba-gCry" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0d8ff"/><stop offset=".45" stop-color="#b57bff"/><stop offset="1" stop-color="#4a1f8a"/></linearGradient> <radialGradient id="ba-gCoin" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#f0c94a"/><stop offset="1" stop-color="#8a6212"/></radialGradient> <radialGradient id="ba-gCap" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#ff9a7a"/><stop offset=".55" stop-color="#d63a28"/><stop offset="1" stop-color="#6a1410"/></radialGradient> <radialGradient id="ba-gPot" cx="40%" cy="40%" r="70%"><stop offset="0" stop-color="#c8f0ff"/><stop offset=".45" stop-color="#3fa0e8"/><stop offset="1" stop-color="#123c7a"/></radialGradient> <radialGradient id="ba-gFire" cx="50%" cy="70%" r="70%"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ff9a2a"/><stop offset="1" stop-color="#b8300c"/></radialGradient> <linearGradient id="ba-gStar" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a8a"/><stop offset=".25" stop-color="#ffd36a"/><stop offset=".5" stop-color="#9fe36a"/><stop offset=".75" stop-color="#6ac8ff"/><stop offset="1" stop-color="#c38bff"/></linearGradient> <symbol id="ba-t0" viewBox="0 0 64 64"><circle cx="32" cy="34" r="27" fill="#0e2a0e" opacity=".55"/><g fill="url(#ba-gLeaf)" stroke="#123d12" stroke-width="1.4"> <path d="M32 50 C27 36 26 22 32 6 C38 22 37 36 32 50Z"/><path d="M32 50 C24 40 16 32 9 22 C22 26 29 36 32 50Z"/><path d="M32 50 C40 40 48 32 55 22 C42 26 35 36 32 50Z"/> <path d="M32 50 C24 48 15 46 8 40 C20 38 27 43 32 50Z"/><path d="M32 50 C40 48 49 46 56 40 C44 38 37 43 32 50Z"/></g> <path d="M32 50 L32 59" stroke="#2c5a1c" stroke-width="3" stroke-linecap="round"/><path d="M32 46 L32 12" stroke="#d8ffb0" stroke-width="1" opacity=".6"/></symbol> <symbol id="ba-t1" viewBox="0 0 64 64"><path d="M32 4 L52 20 L46 58 L18 58 L12 20Z" fill="url(#ba-gCry)" stroke="#2a0f55" stroke-width="1.6"/> <path d="M32 4 L32 58 M12 20 L32 30 L52 20 M18 58 L32 30 L46 58" stroke="#f3e2ff" stroke-width="1" opacity=".55" fill="none"/><path d="M32 4 L22 20 L32 30Z" fill="#fff" opacity=".35"/></symbol> <symbol id="ba-t2" viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="url(#ba-gCoin)" stroke="#6a4a0a" stroke-width="2"/><circle cx="32" cy="32" r="20" fill="none" stroke="#a87a1a" stroke-width="2"/> <path d="M21 38 L21 26 L27 31 L32 22 L37 31 L43 26 L43 38Z" fill="#a87a1a"/><path d="M18 18 A20 20 0 0 1 36 10" stroke="#fff8d0" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/></symbol> <symbol id="ba-t3" viewBox="0 0 64 64"><path d="M26 36 L24 56 Q32 60 40 56 L38 36Z" fill="#efe6d0" stroke="#5a4a30" stroke-width="1.5"/> <path d="M6 38 Q8 10 32 8 Q56 10 58 38 Q32 46 6 38Z" fill="url(#ba-gCap)" stroke="#5a0e0a" stroke-width="1.6"/> <circle cx="20" cy="24" r="4" fill="#fff4e8"/><circle cx="36" cy="17" r="3.2" fill="#fff4e8"/><circle cx="45" cy="29" r="4" fill="#fff4e8"/><circle cx="30" cy="32" r="2.6" fill="#fff4e8"/></symbol> <symbol id="ba-t4" viewBox="0 0 64 64"><rect x="25" y="5" width="14" height="9" rx="2" fill="#8a5a32" stroke="#4a2a12" stroke-width="1.4"/><path d="M26 14 L26 22 Q10 28 10 41 Q10 58 32 58 Q54 58 54 41 Q54 28 38 22 L38 14Z" fill="#20384a" stroke="#0e1c28" stroke-width="1.6" opacity=".9"/> <path d="M13 40 Q13 56 32 56 Q51 56 51 40 Q42 36 32 40 Q22 44 13 40Z" fill="url(#ba-gPot)"/><circle cx="24" cy="46" r="2.5" fill="#e0f6ff" opacity=".8"/><circle cx="38" cy="50" r="1.6" fill="#e0f6ff" opacity=".7"/> <path d="M17 30 Q15 36 16 40" stroke="#fff" stroke-width="2.5" opacity=".5" fill="none" stroke-linecap="round"/></symbol> <symbol id="ba-t5" viewBox="0 0 64 64"><path d="M32 4 C38 16 52 22 50 40 C49 52 41 60 32 60 C23 60 15 52 14 40 C13 30 20 24 22 14 C26 22 28 24 30 26 C30 18 30 12 32 4Z" fill="url(#ba-gFire)" stroke="#7a1a06" stroke-width="1.6"/> <path d="M32 30 C36 38 42 42 40 50 C38 56 35 58 32 58 C27 58 24 54 24 49 C24 43 30 40 32 30Z" fill="#ffe9a0"/></symbol> <symbol id="ba-t6" viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#ffffff" opacity=".12"/><path d="M32 3 L40 24 L61 32 L40 40 L32 61 L24 40 L3 32 L24 24Z" fill="url(#ba-gStar)" stroke="#2a1a3a" stroke-width="1.5"/> <path d="M32 14 L36 28 L50 32 L36 36 L32 50 L28 36 L14 32 L28 28Z" fill="#fff" opacity=".75"/></symbol> </defs>`;
    (document.body || document.documentElement).appendChild(sv);
  }
  const sym = (n, cls) => `<b class="${cls || ''}"><svg viewBox="0 0 64 64"><use href="#ba-t${n}"/></svg></b>`;
  const ART = {
    krieg: () => `<svg class="cs" viewBox="0 0 160 100" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs><linearGradient id="baStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a3a"/><stop offset="1" stop-color="#1e1e16"/></linearGradient></defs>
        <path d="M0 86 Q40 80 80 84 T160 85 V100 H0Z" fill="#141a0c"/>
        <g fill="url(#baStone)" stroke="#0a0a06" stroke-width=".6"><rect x="2" y="52" width="26" height="34"/><rect x="6" y="36" width="10" height="50"/><rect x="19" y="44" width="8" height="42"/>
          <path d="M5 36 l6 -9 6 9z" fill="#2c4a1c"/><path d="M18 44 l5 -7 5 7z" fill="#2c4a1c"/><path d="M2 52 h3v-3h3v3h3v-3h3v3h3v-3h3v3h3v-3h3v3h2v2H2z"/></g>
        <path d="M11 27 v-8 l6 2.5 -6 2.5" fill="#4caa3c" stroke="#123d12" stroke-width=".4"/>
        <g fill="url(#baStone)" stroke="#0a0a06" stroke-width=".6"><rect x="132" y="54" width="26" height="32"/><rect x="144" y="34" width="11" height="52"/><rect x="133" y="44" width="8" height="42"/>
          <path d="M143 34 h2v-3h2v3h2v-3h2v3h2v-3h2v3h1v2h-13z"/><path d="M132 44 l5 -7 5 7z" fill="#5a1a14"/></g>
        <path d="M150 31 v-8 l-6 2.5 6 2.5" fill="#c0392b" stroke="#3a0a08" stroke-width=".4"/>
        <g fill="#ffbf6a" opacity=".9"><rect x="10" y="44" width="2" height="3"/><rect x="22" y="52" width="1.6" height="3"/><rect x="148" y="42" width="2" height="3"/><rect x="136" y="52" width="1.6" height="3"/></g>
        <path d="M30 44 Q80 -6 128 46" fill="none" stroke="rgba(255,190,90,.35)" stroke-width=".6" stroke-dasharray="2 2"/>
        <circle r="2.2" fill="#ffcf6a"><animateMotion dur="2.6s" repeatCount="indefinite" path="M30 44 Q80 -6 128 46"/></circle>
      </svg>
      <div class="march"><img class="ba-med" src="${P('artur')}" alt=""><img class="ba-med" src="${P('kobold')}" alt=""><img class="ba-med" src="${P('nille')}" alt=""></div>
      <div class="foe"><i></i><i></i><i></i></div>`,
    schach: () => `<div class="brd"></div><div class="clash"></div><div class="pc w">♞</div><div class="pc b">♚</div><div class="swords">⚔️</div>`,
    match: () => `<div class="grid">${[0, 1, 3, 2, 4, 5, 0, 6, 0, 0, 2, 3, 1, 5, 4].map((n, i) => sym(n, i === 7 ? 'hi' : (i === 8 || i === 9 || i === 6) ? 'pop' : '')).join('')}</div>
      <img class="ba-med helper2" src="${P('kobold')}" alt=""><img class="ba-med helper" src="${P('fokuhila')}" alt="">`,
    quiz: () => `<div class="q">Wer weiß es? 🤔</div><div class="ans"><i>▲</i><i>◆</i><i>●</i><i>■</i></div>
      <div class="crowd">${['artur', 'nille', 'molly', 'kraeuter', 'don'].map((k, i) => `<span><img class="ba-med" src="${P(k)}" alt="">${i === 1 || i === 3 ? `<em style="animation-delay:${i * .5}s">+${i === 1 ? 950 : 720}</em>` : ''}</span>`).join('')}</div>`,
    runner: () => `<div class="road"></div><div class="guard"></div><div class="pot"></div><div class="coins"><i></i><i></i><i></i></div><img class="ba-med kob" src="${P('kobold')}" alt="">`,
    hof: () => `<svg class="vil" viewBox="0 0 160 60" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <g fill="#1a140c" stroke="#0a0805" stroke-width=".5"><path d="M10 60 V36 L24 26 L38 36 V60Z"/><path d="M62 60 V30 L80 16 L98 30 V60Z"/><path d="M122 60 V38 L136 28 L150 38 V60Z"/><rect x="88" y="14" width="5" height="10"/></g>
        <g fill="#ffbf6a" opacity=".85"><rect x="20" y="42" width="5" height="6"/><rect x="74" y="36" width="5" height="7"/><rect x="83" y="36" width="5" height="7"/><rect x="132" y="44" width="5" height="6"/></g>
        <g fill="rgba(200,200,200,.25)"><circle cx="90" cy="9" r="3"><animate attributeName="cy" values="10;-4" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="3s" repeatCount="indefinite"/></circle></g>
      </svg>
      <div class="gold">+1.250 🪙</div>
      <div class="crew"><span><em>⚒️</em><img class="ba-med" src="${P('fokuhila')}" alt=""></span><span><em>🌿</em><img class="ba-med" src="${P('lg3')}" alt=""></span><span><em>💰</em><img class="ba-med" src="${P('don')}" alt=""></span></div>`,
    duell: () => `<div class="bar"></div><img class="ba-med l" src="${P('artur')}" alt=""><img class="ba-med r" src="${P('don')}" alt=""><div class="mugs"><span>🍺</span><span>🍺</span></div><div class="vs">VS</div>`
  };
  const auto = () => document.querySelectorAll('[data-ba]').forEach(e => { if (!e.firstChild) e.innerHTML = window.BBArt.html(e.dataset.ba, true); });
  window.BBArt = {
    html(k, fade) { setup(); return `<div class="ba ba-${k}${fade ? ' fade' : ''}" aria-hidden="true"><div class="ba-bg"></div><div class="ba-glow"></div>${ART[k] ? ART[k]() : ''}<div class="ba-motes"></div><div class="ba-vig"></div></div>`; },
    head(k) { return `<div class="ba-head">${this.html(k, true)}</div>`; },
    setup, auto
  };
  auto(); document.addEventListener('DOMContentLoaded', auto);
})();
