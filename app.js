/* ═══════════════════════════════════════════════════
   Aippy Demo — app.js
   Core interactions + Kimi K2.5 AI Game Generation
═══════════════════════════════════════════════════ */

// ── Config ──────────────────────────────────────
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const KIMI_MODEL   = 'kimi-k2.5';
const KIMI_KEY     = 'sk-CmRiuApZFgAwrlgPamwVWiXwHqC6XNugJUSGcn44DjV9rinu';

const SYSTEM_PROMPT = `You are Aippy Game Engine, an expert at creating fun, playable mini-games in a single HTML file.

RULES:
1. Respond with ONLY a complete, self-contained HTML file starting with <!DOCTYPE html>
2. The game MUST be mobile-first: touch-friendly, viewport-sized, no scroll
3. Use <canvas> for game rendering with requestAnimationFrame
4. Include touch/click controls (tap, swipe, drag) — no keyboard-only controls
5. Game area fills the full viewport: canvas width/height = window.innerWidth/innerHeight
6. Include a score display and "Game Over" state with restart
7. Make it visually appealing: gradients, particles, smooth animations
8. Keep code under 2000 tokens — simple but polished
9. NO external dependencies, NO API calls, NO images — pure CSS/JS
10. Add viewport meta tag: <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
11. The page background must be dark (#0a0a0a or similar)
12. Do NOT wrap the HTML in markdown code blocks — output raw HTML only`;

// ── DOM refs ────────────────────────────────────
const likeButtons    = document.querySelectorAll('.like-toggle');
const remixButtons   = document.querySelectorAll('.remix-button');
const navTabs        = document.querySelectorAll('.nav-tab');
const pageViews      = document.querySelectorAll('.page-view');
const feed           = document.getElementById('feed');
const gameCards      = document.querySelectorAll('.feed-card[data-game]');
const discoverJumpCards = document.querySelectorAll('.mini-card-jump[data-game-target]');
const remixOverlay   = document.getElementById('remix-overlay');
const remixSheet     = document.getElementById('remix-sheet');
const remixSheetTitle = document.getElementById('remix-sheet-title');
const remixInput     = document.getElementById('remix-input');
const remixSubmit    = document.getElementById('remix-submit');
const detailBackBtn  = document.getElementById('detail-back-btn');
const detailGameContainer = document.getElementById('detail-game-container');

const planeSurface = document.getElementById('plane-surface');
const planeTrack   = document.getElementById('plane-track');
const planePlayer  = document.getElementById('plane-player');
const planeScore   = document.getElementById('plane-score');
const planeLives   = document.getElementById('plane-lives');
const planeTip     = document.getElementById('plane-tip');
const planeLeft    = document.getElementById('plane-left');
const planeRight   = document.getElementById('plane-right');

const candyBoard   = document.getElementById('candy-board');
const candyScore   = document.getElementById('candy-score');
const candyBest    = document.getElementById('candy-best');
const candyReset   = document.getElementById('candy-reset');

const shooterArena     = document.getElementById('shooter-arena');
const shooterCrosshair = document.getElementById('shooter-crosshair');
const shooterTarget    = document.getElementById('shooter-target');
const shooterFire      = document.getElementById('shooter-fire');
const shooterHits      = document.getElementById('shooter-hits');
const shooterShots     = document.getElementById('shooter-shots');
const shooterTip       = document.getElementById('shooter-tip');

const musicSurface = document.getElementById('music-surface');
const musicDisc    = document.getElementById('music-disc');
const musicToggle  = document.getElementById('music-toggle');
const musicStatus  = document.getElementById('music-status');
const musicProgress = document.getElementById('music-progress');

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

let activeRemixCard = null;
let remixHideTimer  = null;

// ── Built-in game source HTML for remix ──────────
const builtinGameHTML = {};

builtinGameHTML.plane = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>Plane Dodge</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;height:100vh;overflow:hidden;display:flex;flex-direction:column;align-items:center}
.track{position:relative;width:90%;max-width:360px;height:70vh;margin:12vh auto 0;background:rgba(255,255,255,.04);border-radius:12px;border:1px solid rgba(255,255,255,.08);overflow:hidden}
.player{position:absolute;bottom:8%;width:32px;height:32px;background:linear-gradient(135deg,#7dff94,#0096ff);border-radius:50%;transform:translateX(-50%);transition:left 80ms ease;box-shadow:0 0 18px rgba(0,150,255,.5)}
.bullet{position:absolute;width:10px;height:10px;border-radius:50%;background:#ff4466;box-shadow:0 0 8px rgba(255,68,102,.6)}
.hud{position:absolute;top:0;left:0;right:0;padding:12px 16px;display:flex;justify-content:space-between;font-size:14px;font-weight:700;z-index:2}
.tip{position:absolute;bottom:24%;left:0;right:0;text-align:center;font-size:13px;opacity:.5;z-index:2}
.controls{display:flex;gap:12px;margin-top:12px}
.controls button{flex:1;max-width:160px;padding:14px;border:none;border-radius:24px;background:rgba(255,255,255,.08);color:#fff;font-size:16px;font-weight:600;cursor:pointer}
.controls button:active{background:rgba(255,255,255,.16)}
</style>
</head>
<body>
<div class="track" id="track"><div class="hud"><span>Score: <b id="score">0</b></span><span>Lives: <b id="lives">3</b></span></div><div class="player" id="player"></div><div class="tip" id="tip">Tap left / right to dodge</div></div>
<div class="controls"><button id="bl">← Left</button><button id="br">Right →</button></div>
<script>
const P=document.getElementById("player"),T=document.getElementById("track"),S=document.getElementById("score"),L=document.getElementById("lives"),TI=document.getElementById("tip");let x=50,lives=3,score=0,bs=[],tick=0,locked=false;const render=()=>{P.style.left=x+"%"};const hud=()=>{S.textContent=score;L.textContent=lives};const hit=()=>{if(locked)return;lives--;hud();T.style.boxShadow="0 0 20px rgba(255,68,102,.5)";setTimeout(()=>T.style.boxShadow="",200);if(lives<=0){locked=true;TI.textContent="Game Over! Tapping restarts...";return}TI.textContent=lives+" lives left"};const reset=()=>{bs.forEach(b=>b.el.remove());bs=[];x=50;lives=3;score=0;locked=false;TI.textContent="Tap left / right to dodge";render();hud()};const move=d=>{if(locked)return;x=Math.min(90,Math.max(10,x+d*12));render()};const spawn=()=>{if(locked)return;const e=document.createElement("div");e.className="bullet";const b={el:e,bx:12+Math.random()*76,by:-12,sp:3+Math.random()*1.4};e.style.left=b.bx+"%";e.style.top=b.by+"%";T.appendChild(e);bs.push(b)};const tick_=()=>{tick++;if(tick%14===0)spawn();bs=bs.filter(b=>{b.by+=b.sp;b.el.style.top=b.by+"%";if(b.by>80&&Math.abs(b.bx-x)<12){b.el.remove();hit();return false}if(b.by>108){b.el.remove();if(!locked){score++;hud();if(score%5===0)TI.textContent="Nice dodge streak!"}return false}return true})};render();hud();setInterval(tick_,50);document.getElementById("bl").addEventListener("click",()=>move(-1));document.getElementById("br").addEventListener("click",()=>move(1));T.addEventListener("click",e=>{if(e.target.closest("button"))return;const r=T.getBoundingClientRect();move(e.clientX<r.left+r.width/2?-1:1)});document.addEventListener("click",()=>{if(locked)reset()},{once:false});
</script>
</body>
</html>`;

builtinGameHTML.candy = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>Candy Pop</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;height:100vh;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
.hud{margin-bottom:12px;font-size:16px;font-weight:700}
.board{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;width:min(88vw,340px);aspect-ratio:1}
.cell{width:100%;aspect-ratio:1;border-radius:12px;border:none;cursor:pointer;transition:transform .12s}
.cell:active{transform:scale(.88)}
.c0{background:linear-gradient(135deg,#ff6b9d,#c44dff)}.c1{background:linear-gradient(135deg,#4dff91,#00b4d8)}.c2{background:linear-gradient(135deg,#ffd93d,#ff6b6b)}.c3{background:linear-gradient(135deg,#6bcbff,#4d7cff)}.c4{background:linear-gradient(135deg,#ff9a76,#ff6b9d)}
.cell.is-single{animation:shake .18s}
@keyframes shake{0%,100%{transform:translateX(0)}50%{transform:translateX(-4px)}}
.reset{margin-top:14px;padding:10px 28px;border:none;border-radius:20px;background:rgba(255,255,255,.1);color:#fff;font-size:14px;cursor:pointer}
</style>
</head>
<body>
<div class="hud">Score: <b id="sc">0</b> · Best cluster: <b id="bst">0</b></div>
<div class="board" id="bd"></div>
<button class="reset" id="rs">Reset</button>
<script>
const B=document.getElementById("bd"),SC=document.getElementById("sc"),BST=document.getElementById("bst");const N=5,CC=5;let cells=[],score=0,best=0;const rc=()=>Math.floor(Math.random()*CC);const render=()=>{B.innerHTML="";cells.forEach((c,i)=>{const e=document.createElement("button");e.className="cell c"+c;e.dataset.i=i;B.appendChild(e)})};const neighbors=i=>{const r=Math.floor(i/N),c=i%N,a=[];if(r>0)a.push(i-N);if(r<N-1)a.push(i+N);if(c>0)a.push(i-1);if(c<N-1)a.push(i+1);return a};const cluster=si=>{const tc=cells[si];if(tc==null)return[];const q=[si],v=new Set([si]);while(q.length){const cur=q.shift();neighbors(cur).forEach(n=>{if(!v.has(n)&&cells[n]===tc){v.add(n);q.push(n)}})}return[...v]};const collapse=()=>{for(let c=0;c<N;c++){const vals=[];for(let r=N-1;r>=0;r--){const v=cells[r*N+c];if(v!==null)vals.push(v)}let p=0;for(let r=N-1;r>=0;r--){cells[r*N+c]=vals[p]??rc();p++}}};const reset=()=>{cells=Array.from({length:N*N},rc);score=0;best=0;SC.textContent=0;BST.textContent=0;render()};B.addEventListener("click",e=>{const btn=e.target.closest(".cell");if(!btn)return;const idx=+btn.dataset.i,cl=cluster(idx);if(cl.length<2){btn.classList.add("is-single");setTimeout(()=>btn.classList.remove("is-single"),180);return}cl.forEach(ci=>cells[ci]=null);score+=cl.length*12;best=Math.max(best,cl.length);collapse();SC.textContent=score;BST.textContent=best;render()});document.getElementById("rs").addEventListener("click",reset);reset();
</script>
</body>
</html>`;

builtinGameHTML.shooter = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>Scope Shot</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;height:100vh;overflow:hidden;display:flex;flex-direction:column;align-items:center}
.arena{position:relative;width:90%;max-width:360px;height:55vh;margin:8vh auto 0;background:rgba(255,255,255,.03);border-radius:12px;border:1px solid rgba(255,255,255,.08);overflow:hidden}
.crosshair{position:absolute;top:50%;left:50%;width:24px;height:24px;transform:translate(-50%,-50%);border:2px solid #7dff94;border-radius:50%;transition:left 60ms ease,top 60ms ease;box-shadow:0 0 12px rgba(125,255,148,.3)}
.target{position:absolute;top:60%;left:50%;width:28px;height:28px;transform:translate(-50%,-50%);background:radial-gradient(circle,#ff4466,#cc0033);border-radius:50%;transition:left 40ms linear,top 40ms linear;box-shadow:0 0 16px rgba(255,68,102,.5)}
.target.is-hit{background:radial-gradient(circle,#ffd700,#ff8800);box-shadow:0 0 24px rgba(255,215,0,.8);transform:translate(-50%,-50%) scale(1.3)}
.hud{margin-top:14px;font-size:16px;font-weight:700}
.fire{margin-top:12px;padding:14px 40px;border:none;border-radius:24px;background:linear-gradient(135deg,#ff4466,#cc0033);color:#fff;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(255,68,102,.4)}
.fire:active{transform:scale(.95)}
.tip{margin-top:8px;font-size:13px;opacity:.5}
</style>
</head>
<body>
<div class="arena" id="ar"><div class="crosshair" id="ch"></div><div class="target" id="tg"></div></div>
<div class="hud">Hits: <b id="hits">0</b> / Shots: <b id="shots">0</b></div>
<button class="fire" id="fire">Fire!</button>
<div class="tip" id="tip">Drag to aim, then fire</div>
<script>
const AR=document.getElementById("ar"),CH=document.getElementById("ch"),TG=document.getElementById("tg"),HI=document.getElementById("hits"),SH=document.getElementById("shots"),TI=document.getElementById("tip");let aimX=50,aimY=48,targetX=50,targetY=60,hits=0,shots=0,phaseX=0,phaseY=1.2,drag=false;const render=()=>{CH.style.left=aimX+"%";CH.style.top=aimY+"%";TG.style.left=targetX+"%";TG.style.top=targetY+"%"};const hud=()=>{HI.textContent=hits;SH.textContent=shots};const setAim=(cx,cy)=>{const r=AR.getBoundingClientRect();aimX=Math.min(92,Math.max(8,((cx-r.left)/r.width)*100));aimY=Math.min(88,Math.max(10,((cy-r.top)/r.height)*100));render()};const fire=()=>{shots++;const dx=aimX-targetX,dy=aimY-targetY,d=Math.sqrt(dx*dx+dy*dy);if(d<10){hits++;TI.textContent="Hit! Great shot";TG.classList.add("is-hit");setTimeout(()=>TG.classList.remove("is-hit"),180);phaseX+=Math.PI/2;phaseY+=Math.PI/3}else TI.textContent="Miss — drag and try again";hud()};render();hud();setInterval(()=>{phaseX+=.08;phaseY+=.06;targetX=14+((Math.sin(phaseX)+1)/2)*72;targetY=25+((Math.sin(phaseY)+1)/2)*45;render()},40);AR.addEventListener("pointerdown",e=>{drag=true;setAim(e.clientX,e.clientY)});AR.addEventListener("pointermove",e=>{if(drag)setAim(e.clientX,e.clientY)});AR.addEventListener("pointerleave",()=>drag=false);AR.addEventListener("click",e=>setAim(e.clientX,e.clientY));document.getElementById("fire").addEventListener("click",fire);document.addEventListener("pointerup",()=>drag=false);
</script>
</body>
</html>`;

builtinGameHTML.music = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>Pocket Beats</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;height:100vh;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center}
.player{display:flex;flex-direction:column;align-items:center;gap:18px;width:85%;max-width:320px}
.disc{width:160px;height:160px;border-radius:50%;background:conic-gradient(from 0deg,#1a1a2e,#16213e,#0f3460,#1a1a2e);border:3px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;transition:transform .3s}
.disc.playing{animation:spin 2s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.disc::after{content:"♫";font-size:32px;opacity:.6}
.meta{text-align:center}
.meta p{opacity:.5;font-size:14px}
.meta strong{font-size:18px}
.progress{width:100%;height:4px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
.progress span{display:block;height:100%;width:0;background:linear-gradient(90deg,#7dff94,#0096ff);border-radius:2px;transition:width .2s}
.bars{display:flex;gap:4px;height:24px;align-items:flex-end}
.bars span{width:6px;background:rgba(255,255,255,.2);border-radius:3px;transition:height .15s}
.bars.playing span{animation:bar .6s ease infinite alternate}
.bars.playing span:nth-child(2){animation-delay:.1s}
.bars.playing span:nth-child(3){animation-delay:.2s}
.bars.playing span:nth-child(4){animation-delay:.3s}
@keyframes bar{to{height:20px}}
.btn{padding:14px 40px;border:none;border-radius:24px;background:linear-gradient(135deg,#7dff94,#0096ff);color:#000;font-size:16px;font-weight:700;cursor:pointer}
</style>
</head>
<body>
<div class="player">
<div class="disc" id="disc"></div>
<div class="meta"><p>Demo synth loop</p><strong id="st">Paused</strong></div>
<div class="progress"><span id="pg"></span></div>
<div class="bars" id="bars"><span></span><span></span><span></span><span></span></div>
<button class="btn" id="tg">Play Music</button>
</div>
<script>
const D=document.getElementById("disc"),ST=document.getElementById("st"),PG=document.getElementById("pg"),BA=document.getElementById("bars"),TG=document.getElementById("tg");const notes=[261.63,329.63,392,523.25,440,392,329.63,293.66];let ctx=null,osc=null,gain=null,timer=null,playing=false,step=0;const stop=()=>{if(timer){clearInterval(timer);timer=null}if(osc){osc.stop();osc.disconnect();osc=null}if(gain){gain.disconnect();gain=null}playing=false;PG.style.width="0%";ST.textContent="Paused";TG.textContent="Play Music";D.classList.remove("playing");BA.classList.remove("playing")};const play=async()=>{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;if(!ctx)ctx=new A();if(ctx.state==="suspended")await ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";g.gain.value=.035;o.connect(g);g.connect(ctx.destination);o.start();osc=o;gain=g;playing=true;const adv=()=>{o.frequency.setValueAtTime(notes[step%notes.length],ctx.currentTime);step++;PG.style.width=((step%notes.length)/notes.length)*100+"%"};adv();timer=setInterval(adv,320);ST.textContent="Now playing";TG.textContent="Pause Music";D.classList.add("playing");BA.classList.add("playing")};TG.addEventListener("click",async()=>{if(playing)stop();else await play()});
</script>
</body>
</html>`;

// ── AI state ────────────────────────────────────
let aiConversationHistory = [];
let currentGameHTML       = null;
let currentGameName       = '';
let isGenerating          = false;
let remixSourceHTML       = null;
let remixSourceName       = '';

const toggleRemixSubmit = () => {
  const hasValue = Boolean(remixInput?.value.trim());
  if (remixSubmit) remixSubmit.disabled = !hasValue;
};

const closeRemixSheet = () => {
  remixOverlay?.classList.remove('is-visible');
  remixSheet?.classList.remove('is-visible');
  remixSheet?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('sheet-open');
  if (remixHideTimer) window.clearTimeout(remixHideTimer);
  remixHideTimer = window.setTimeout(() => {
    remixOverlay?.setAttribute('hidden', 'hidden');
  }, 220);
  activeRemixCard = null;
};

const openRemixSheet = (card) => {
  activeRemixCard = card;
  const title = card.querySelector('.feed-meta-bottom p')?.textContent?.trim() || 'Untitled';
  if (remixHideTimer) window.clearTimeout(remixHideTimer);
  if (remixSheetTitle) remixSheetTitle.textContent = title;
  if (remixInput) remixInput.value = '';
  toggleRemixSubmit();
  remixOverlay?.removeAttribute('hidden');
  requestAnimationFrame(() => {
    remixOverlay?.classList.add('is-visible');
    remixSheet?.classList.add('is-visible');
    remixSheet?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sheet-open');
    remixInput?.focus();
  });
};

const activatePage = (target) => {
  closeRemixSheet();
  pageViews.forEach((view) => view.classList.toggle('is-active', view.dataset.page === target));
  navTabs.forEach((tab)  => tab.classList.toggle('active', tab.dataset.target === target));
};

const highlightGameCard = (card) => {
  card.classList.remove('is-highlighted');
  void card.offsetWidth;
  card.classList.add('is-highlighted');
  window.setTimeout(() => card.classList.remove('is-highlighted'), 1200);
};

// ── 详情页数据 ───────────────────────────────
const GAME_DETAIL_DATA = {
  plane: {
    title: 'Plane Dodge',
    author: 'Alex Jet',
    avatar: '✈',
    views: '196K',
    likes: '31.8K',
    comments: '908',
    shares: '1.4K',
    saves: '2.1K',
    gradient: 'theme-hunter',
    surfaceId: 'plane-surface',
    gameSurface: `
      <div class="game-surface plane-surface" id="plane-surface">
        <div class="plane-tip" id="plane-tip">Tap left / right to dodge</div>
        <div class="plane-track" id="plane-track">
          <div class="plane-player" id="plane-player"></div>
        </div>
        <div class="plane-controls control-row">
          <button class="game-pill" id="plane-left" type="button">← Left</button>
          <button class="game-pill" id="plane-right" type="button">Right →</button>
        </div>
      </div>`
  },
  candy: {
    title: 'Candy Pop',
    author: 'Sugar Lab',
    avatar: '🍬',
    views: '88K',
    likes: '14.2K',
    comments: '730',
    shares: '800',
    saves: '1.1K',
    gradient: 'theme-timer',
    surfaceId: 'candy-board',
    gameSurface: `
      <div class="game-surface candy-surface">
        <div class="candy-board" id="candy-board"></div>
        <div class="candy-footer">
          <span class="surface-hint">Small board, instant clear</span>
          <button class="game-pill small-pill" id="candy-reset" type="button">Reset</button>
        </div>
      </div>`
  },
  shooter: {
    title: 'Scope Shot',
    author: 'Scope Club',
    avatar: '🎯',
    views: '124K',
    likes: '19.7K',
    comments: '1.1K',
    shares: '900',
    saves: '1.1K',
    gradient: 'theme-meme',
    surfaceId: 'shooter-arena',
    gameSurface: `
      <div class="game-surface shooter-surface" id="shooter-arena">
        <div class="shooter-tip" id="shooter-tip">Drag to move the camera</div>
        <div class="shooter-target" id="shooter-target">
          <div class="shooter-person-head"></div>
          <div class="shooter-person-body"></div>
          <div class="shooter-person-arm left"></div>
          <div class="shooter-person-arm right"></div>
          <div class="shooter-person-leg left"></div>
          <div class="shooter-person-leg right"></div>
        </div>
        <div class="shooter-crosshair" id="shooter-crosshair"></div>
        <div class="shooter-controls control-row">
          <button class="game-pill fire-pill" id="shooter-fire" type="button">FIRE</button>
        </div>
      </div>`
  },
  music: {
    title: 'Pocket Beats',
    author: 'Night Loop',
    avatar: '♫',
    views: '66K',
    likes: '10.9K',
    comments: '600',
    shares: '500',
    saves: '800',
    gradient: 'theme-neon',
    surfaceId: 'music-surface',
    gameSurface: `
      <div class="game-surface music-surface" id="music-surface">
        <div class="music-player">
          <div class="music-art">
            <div class="music-disc" id="music-disc"></div>
          </div>
          <div class="music-meta">
            <p>Demo synth loop</p>
            <strong id="music-status">Paused</strong>
          </div>
          <div class="music-progress"><span id="music-progress"></span></div>
          <div class="music-bars" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <button class="music-play-button" id="music-toggle" type="button">Play Music</button>
        </div>
      </div>`
  }
};

const buildDetailCard = (data) => `
  <section class="feed-card ${data.gradient}">
    ${data.gameSurface}
    <div class="feed-meta-bottom">
      <div class="feed-stats-row">
        <div class="primary-stat">
          <img src="icons/浏览量.png" width="28" height="28" alt="">
          <strong>${data.views}</strong>
        </div>
        <div class="stats-trail">
          <button class="mini-metric save-toggle">
            <img src="icons/收藏.png" width="28" height="20" alt="">
            <strong>${data.saves}</strong>
          </button>
          <button class="mini-metric like-toggle">
            <img src="icons/点赞.png" width="21" height="21" alt="">
            <strong>${data.likes}</strong>
          </button>
          <button class="mini-metric comment-btn">
            <img src="icons/comment.png" width="20" height="20" alt="">
            <strong>${data.comments}</strong>
          </button>
          <button class="mini-metric share-btn">
            <img src="icons/分享.png" width="20" height="20" alt="">
            <strong>${data.shares}</strong>
          </button>
        </div>
      </div>
      <div class="feed-author-row">
        <div class="creator-block">
          <div class="avatar">
            <span>${data.avatar}</span>
          </div>
          <div>
            <div class="author-name-row">
              <strong>${data.author}</strong>
            </div>
            <p>${data.title}</p>
          </div>
        </div>
        <div class="author-actions">
          <button class="remix-button" aria-label="remix">
            <img src="icons/remix.png" width="26" height="26" alt="">
          </button>
        </div>
      </div>
    </div>
  </section>`;

const openGameFromDiscover = (gameName) => {
  const data = GAME_DETAIL_DATA[gameName];
  if (!data || !detailGameContainer) return;
  // 用模板构建详情页内容
  detailGameContainer.innerHTML = buildDetailCard(data);
  // 标记 body 用于隐藏底部导航
  document.body.classList.add('detail-open');
  // 跳转到详情页
  activatePage('detail');
  // 重新初始化该游戏的 JS（内置游戏的事件绑定）
  initBuiltinGame(gameName);
};

const closeDetailPage = () => {
  stopBuiltinGame();
  document.body.classList.remove('detail-open');
  detailGameContainer.innerHTML = '';
  activatePage('discover');
};

detailBackBtn?.addEventListener('click', closeDetailPage);

navTabs.forEach((tab) => tab.addEventListener('click', () => activatePage(tab.dataset.target)));
likeButtons.forEach((btn) => btn.addEventListener('click', () => btn.classList.toggle('active')));

// 全局触感反馈（支持 Vibration API 的移动设备）
document.addEventListener('click', (e) => {
  const el = e.target.closest('button, .tab, .feed-card, .game-surface');
  if (el && navigator.vibrate) {
    navigator.vibrate(10); // 1ms 极短震动 = 按键触感
  }
}, true);

remixButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.feed-card');
    if (card) openRemixSheet(card);
  });
});

discoverJumpCards.forEach((card) => {
  card.addEventListener('click', () => {
    openGameFromDiscover(card.dataset.gameTarget);
  });
});

// Filter chip tabs — sliding green indicator
const filterStrip = document.getElementById('filter-strip');
const indicator = filterStrip?.querySelector('.tab-indicator');
const filterChips = filterStrip
  ? Array.from(filterStrip.querySelectorAll('.filter-chip'))
  : [];

function positionIndicator(chip, animate = true) {
  if (!indicator || !chip) return;
  const cs = getComputedStyle(chip);
  // Use getBoundingClientRect for precise rendered text width (more accurate than clientWidth - padding for buttons)
  const chipRect = chip.getBoundingClientRect();
  const textWidth = chipRect.width -
    parseFloat(cs.paddingLeft) -
    parseFloat(cs.paddingRight);
  const left = chip.offsetLeft + parseFloat(cs.paddingLeft);
  if (!animate) {
    indicator.style.transition = 'none';
  } else {
    indicator.style.transition = '';
  }
  indicator.style.transform = `translateX(${left}px)`;
  indicator.style.width = `${textWidth}px`;
  // Scroll chip into view if needed (especially for 5th+ tabs)
  chip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

if (filterChips.length) {
  // Initial position
  requestAnimationFrame(() => positionIndicator(filterChips[0], false));

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      // Restore previous chip's short label if applicable
      filterChips.forEach((c) => {
        if (c.dataset.full && !c.classList.contains('active')) {
          c.textContent = c.textContent.slice(0, 3);
          c.style.maxWidth = '52px';
        }
      });
      // Apply new active chip
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      // Expand 5th tab to full text
      if (chip.dataset.full) {
        chip.textContent = chip.dataset.full;
        chip.style.maxWidth = '';
      }
      positionIndicator(chip, true);
    });
  });
}

remixOverlay?.addEventListener('click', closeRemixSheet);
remixInput?.addEventListener('input', toggleRemixSubmit);

remixSubmit?.addEventListener('click', () => {
  if (!activeRemixCard || remixSubmit.disabled) return;
  // Capture remix source info before closing
  const card = activeRemixCard;
  const title = card.querySelector('.feed-meta-bottom p')?.textContent?.trim() || 'Game';
  const iframe = card.querySelector('.ai-game-iframe');
  const gameName = card.dataset.game;
  // For built-in games, use the pre-defined HTML; for AI games, use iframe srcdoc
  remixSourceHTML = iframe ? iframe.srcdoc : (builtinGameHTML[gameName] || null);
  remixSourceName = title;
  closeRemixSheet();
  window.dispatchEvent(new CustomEvent('remix:submit', { detail: { sourceName: title, sourceHTML: remixSourceHTML } }));
});

// ══════════════════════════════════════════════════
//  AI GAME GENERATION (Kimi K2.5)
// ══════════════════════════════════════════════════

async function callKimiAPI(messages) {
  const res = await fetch(KIMI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_KEY}`
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages,
      max_tokens: 8192,
      temperature: 1
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

function extractHTML(text) {
  // Try to extract HTML from potential markdown code blocks
  let html = text.trim();
  // Remove ```html ... ``` wrapper if present
  const mdMatch = html.match(/```(?:html)?\s*\n([\s\S]*?)```/);
  if (mdMatch) html = mdMatch[1].trim();
  // Ensure it starts with <!DOCTYPE or <html
  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html') && !html.startsWith('<HTML')) {
    // Try to find the HTML start
    const idx = html.indexOf('<!DOCTYPE');
    if (idx !== -1) html = html.substring(idx);
    else {
      const idx2 = html.indexOf('<html');
      if (idx2 !== -1) html = html.substring(idx2);
    }
  }
  return html;
}

function addChatMessage(role, content) {
  const messagesEl = document.getElementById('ai-chat-messages');
  if (!messagesEl) return;

  if (role === 'user') {
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-user';
    div.innerHTML = `<p>${content.replace(/</g, '&lt;')}</p>
      <div class="ai-msg-user-av">
        <svg width="18" height="18" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="20" r="11" fill="rgba(255,255,255,0.22)"/><path d="M8 48c0-9.941 8.059-18 18-18s18 8.059 18 18" fill="rgba(255,255,255,0.14)"/></svg>
      </div>`;
    messagesEl.appendChild(div);
  } else {
    // Remove previous generating indicator if any
    const prevGen = messagesEl.querySelector('.ai-msg-ai:last-child .ai-generating-pill');
    if (prevGen) {
      const prevMsg = prevGen.closest('.ai-msg-ai');
      if (prevMsg) prevMsg.remove();
    }
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-ai';
    const isGenerating = content === '__GENERATING__';
    if (isGenerating) {
      div.innerHTML = `<div class="ai-msg-ai-av">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="12" rx="5"/><line x1="7" y1="13" x2="7" y2="15.5"/><line x1="5.5" y1="14.25" x2="8.5" y2="14.25"/><circle cx="16" cy="12.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg>
          <span>aippy</span>
        </div>
        <div class="ai-generating-pill">
          <span class="ai-generating-orb"></span>
          Generating your game...
        </div>`;
    } else {
      div.innerHTML = `<div class="ai-msg-ai-av">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="12" rx="5"/><line x1="7" y1="13" x2="7" y2="15.5"/><line x1="5.5" y1="14.25" x2="8.5" y2="14.25"/><circle cx="16" cy="12.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg>
          <span>aippy</span>
        </div>
        <div class="ai-game-ready-pill">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Game ready! Tap <strong>Preview</strong> to play →
        </div>`;
    }
    messagesEl.appendChild(div);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderPreviewIframe(html) {
  const canvas = document.querySelector('.ai-preview-canvas');
  if (!canvas) return;
  // Clear previous static content
  canvas.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.className = 'ai-preview-iframe';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.srcdoc = html;
  canvas.appendChild(iframe);
}

async function generateGame(prompt) {
  if (isGenerating) return;
  isGenerating = true;

  const messagesEl = document.getElementById('ai-chat-messages');

  // Add user message
  addChatMessage('user', prompt);
  addChatMessage('ai', '__GENERATING__');

  // Build conversation for API
  const apiMessages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];
  // Include history for context, but keep system prompt first
  apiMessages.push(...aiConversationHistory);
  apiMessages.push({ role: 'user', content: prompt });

  try {
    const raw = await callKimiAPI(apiMessages);
    const html = extractHTML(raw);

    if (html && html.length > 100) {
      currentGameHTML = html;
      // Extract game name from first <title> tag
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      currentGameName = titleMatch ? titleMatch[1] : 'My Game';

      // Update conversation history
      aiConversationHistory.push({ role: 'user', content: prompt });
      aiConversationHistory.push({ role: 'assistant', content: 'Game generated successfully: ' + currentGameName });

      // Show "game ready" in chat
      addChatMessage('ai', 'ready');

      // Render preview
      renderPreviewIframe(html);

      // Auto-switch to preview tab
      if (typeof switchAiTab === 'function') switchAiTab('preview');
    } else {
      addChatMessage('ai', 'ready');
      // Update chat to show error
      const lastMsg = messagesEl?.querySelector('.ai-msg-ai:last-child .ai-game-ready-pill');
      if (lastMsg) lastMsg.innerHTML = '⚠️ Generation failed. Please try again with a different description.';
    }
  } catch (err) {
    console.error('AI generation error:', err);
    // Remove generating indicator
    const genPill = messagesEl?.querySelector('.ai-msg-ai:last-child .ai-generating-pill');
    if (genPill) {
      const parent = genPill.closest('.ai-msg-ai');
      if (parent) parent.remove();
    }
    // Show error in chat
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-ai';
    div.innerHTML = `<div class="ai-msg-ai-av">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="12" rx="5"/><line x1="7" y1="13" x2="7" y2="15.5"/><line x1="5.5" y1="14.25" x2="8.5" y2="14.25"/><circle cx="16" cy="12.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg>
        <span>aippy</span>
      </div>
      <div class="ai-game-error-pill">
        ⚠️ Error: ${err.message || 'Unknown error'}. Try again.
      </div>`;
    messagesEl.appendChild(div);
  }

  isGenerating = false;
}

async function remixGame(sourceHTML, sourceName, modification) {
  if (isGenerating) return;
  isGenerating = true;

  const messagesEl = document.getElementById('ai-chat-messages');

  addChatMessage('user', `Remix "${sourceName}": ${modification}`);
  addChatMessage('ai', '__GENERATING__');

  const remixSystemPrompt = SYSTEM_PROMPT + `\n\nIMPORTANT: The user wants to REMIX an existing game. Here is the current game HTML code:\n\`\`\`html\n${sourceHTML}\n\`\`\`\n\nModify this game according to the user's instructions. Keep the core gameplay but apply the requested changes. Output the COMPLETE modified HTML file.`;

  const apiMessages = [
    { role: 'system', content: remixSystemPrompt },
    { role: 'user', content: `Remix the game "${sourceName}": ${modification}` }
  ];

  try {
    const raw = await callKimiAPI(apiMessages);
    const html = extractHTML(raw);

    if (html && html.length > 100) {
      currentGameHTML = html;
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      currentGameName = titleMatch ? titleMatch[1] : sourceName + ' (Remix)';

      aiConversationHistory = [
        { role: 'user', content: `Remix "${sourceName}": ${modification}` },
        { role: 'assistant', content: 'Game remixed successfully: ' + currentGameName }
      ];

      addChatMessage('ai', 'ready');
      renderPreviewIframe(html);
      if (typeof switchAiTab === 'function') switchAiTab('preview');
    } else {
      addChatMessage('ai', 'ready');
      const lastMsg = messagesEl?.querySelector('.ai-msg-ai:last-child .ai-game-ready-pill');
      if (lastMsg) lastMsg.innerHTML = '⚠️ Remix failed. Please try again.';
    }
  } catch (err) {
    console.error('AI remix error:', err);
    const genPill = messagesEl?.querySelector('.ai-msg-ai:last-child .ai-generating-pill');
    if (genPill) { const p = genPill.closest('.ai-msg-ai'); if (p) p.remove(); }
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-ai';
    div.innerHTML = `<div class="ai-msg-ai-av">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="12" rx="5"/><line x1="7" y1="13" x2="7" y2="15.5"/><line x1="5.5" y1="14.25" x2="8.5" y2="14.25"/><circle cx="16" cy="12.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="15.5" r="1.3" fill="currentColor" stroke="none"/></svg>
        <span>aippy</span>
      </div>
      <div class="ai-game-error-pill">
        ⚠️ Error: ${err.message || 'Unknown error'}. Try again.
      </div>`;
    messagesEl.appendChild(div);
  }

  isGenerating = false;
  remixSourceHTML = null;
  remixSourceName = '';
}

// ── Publish: add new game card to Feed ──────────
function addGameToFeed(html, name) {
  if (!feed) return;
  const themeClasses = ['theme-hunter', 'theme-timer', 'theme-meme', 'theme-dice', 'theme-neon'];
  const theme = themeClasses[Math.floor(Math.random() * themeClasses.length)];
  const emoji = ['🎮','🎯','⚡','🔥','💎','🚀','🎪','🌟'][Math.floor(Math.random() * 8)];
  const authorNames = ['You', 'AI Creator', 'Game Studio'];
  const authorName = 'You';
  const viewCount = Math.floor(Math.random() * 50);
  const gameId = 'user-' + Date.now();

  const card = document.createElement('section');
  card.className = `feed-card ${theme}`;
  card.dataset.game = gameId;
  card.innerHTML = `
    <div class="feed-meta-top compact">
      <div>
        <p class="eyebrow">AI Generated</p>
        <h2>${name.replace(/</g, '&lt;')}</h2>
      </div>
      <div class="pill-muted">Tap to play</div>
    </div>
    <div class="game-surface ai-game-surface">
      <iframe class="ai-game-iframe" sandbox="allow-scripts allow-same-origin" srcdoc="${html.replace(/"/g, '&quot;')}"></iframe>
    </div>
    <div class="feed-meta-bottom">
      <div class="feed-stats-row">
        <div class="primary-stat">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <strong>${viewCount}K</strong>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        </div>
        <div class="stats-trail">
          <button class="mini-metric save-toggle">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <strong>0</strong>
          </button>
          <button class="mini-metric like-toggle">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <strong>0</strong>
          </button>
          <button class="mini-metric comment-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <strong>0</strong>
          </button>
          <button class="mini-metric share-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <strong>0</strong>
          </button>
        </div>
      </div>
      <div class="feed-author-row">
        <div class="creator-block">
          <div class="avatar avatar-with-plus" style="background:linear-gradient(135deg,#7dff94,#0096ff)">
            <span>${emoji}</span>
            <div class="avatar-plus-ring">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="6" y1="2" x2="6" y2="10" stroke="white" stroke-width="1.8" stroke-linecap="round"/><line x1="2" y1="6" x2="10" y2="6" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>
            </div>
          </div>
          <div>
            <div class="author-name-row">
              <strong>${authorName}</strong>
              <svg class="verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <p>${name.replace(/</g, '&lt;')}</p>
          </div>
        </div>
        <div class="author-actions">
          <button class="author-action-btn" aria-label="screenshot">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <button class="remix-button" aria-label="remix">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
          </button>
        </div>
      </div>
    </div>`;

  // Insert at top of feed
  feed.insertBefore(card, feed.firstChild);

  // Re-bind interactive elements on new card
  card.querySelector('.like-toggle')?.addEventListener('click', function() { this.classList.toggle('active'); });
  card.querySelector('.save-toggle')?.addEventListener('click', function() { this.classList.toggle('active'); });
  card.querySelector('.remix-button')?.addEventListener('click', function() {
    openRemixSheet(card);
  });
  card.querySelector('.comment-btn')?.addEventListener('click', function() {
    if (typeof openCommentSheet === 'function') openCommentSheet(card);
  });
  card.querySelector('.share-btn')?.addEventListener('click', function() {
    if (typeof openShareSheet === 'function') openShareSheet(card);
  });

  // Scroll to top
  feed.scrollTo({ top: 0, behavior: 'smooth' });
  highlightGameCard(card);
}

// ══════════════════════════════════════════════════
//  BUILT-IN GAMES
// ══════════════════════════════════════════════════

// ── Plane Dodge ─────────────────────────────────
const planeState = { x: 50, lives: 3, score: 0, bullets: [], tick: 0, locked: false };

const renderPlanePlayer = () => { if (planePlayer) { planePlayer.style.left = `${planeState.x}%`; planePlayer.style.transform = 'translateX(-50%)'; } };
const updatePlaneHud   = () => {
  if (planeScore) planeScore.textContent = String(planeState.score);
  if (planeLives) planeLives.textContent = String(planeState.lives);
};
const clearPlaneBullets = () => { planeState.bullets.forEach(b => b.el.remove()); planeState.bullets = []; };
const resetPlaneGame = () => {
  clearPlaneBullets();
  planeState.x = 50; planeState.lives = 3; planeState.score = 0; planeState.locked = false;
  if (planeTip) planeTip.textContent = 'Tap left / right to dodge';
  renderPlanePlayer(); updatePlaneHud();
};
const movePlane = (dir) => { if (planeState.locked) return; planeState.x = clamp(planeState.x + dir * 12, 10, 90); renderPlanePlayer(); };
const spawnPlaneBullet = () => {
  if (!planeTrack || planeState.locked) return;
  const bullet = document.createElement('div'); bullet.className = 'plane-bullet';
  const b = { el: bullet, x: 12 + Math.random() * 76, y: -12, speed: 3 + Math.random() * 1.4 };
  bullet.style.left = `${b.x}%`; bullet.style.top = `${b.y}%`;
  planeTrack.appendChild(bullet); planeState.bullets.push(b);
};
const hitPlane = () => {
  if (planeState.locked) return;
  planeState.lives -= 1; updatePlaneHud();
  planeSurface?.classList.remove('plane-hit'); void planeSurface?.offsetWidth; planeSurface?.classList.add('plane-hit');
  if (planeState.lives <= 0) { planeState.locked = true; if (planeTip) planeTip.textContent = 'Boom! Restarting...'; window.setTimeout(resetPlaneGame, 900); return; }
  if (planeTip) planeTip.textContent = `Hit! ${planeState.lives} lives left`;
};
const tickPlaneGame = () => {
  if (!planeTrack) return;
  planeState.tick += 1;
  if (planeState.tick % 14 === 0) spawnPlaneBullet();
  planeState.bullets = planeState.bullets.filter(b => {
    b.y += b.speed; b.el.style.top = `${b.y}%`;
    if (b.y > 80 && Math.abs(b.x - planeState.x) < 12) { b.el.remove(); hitPlane(); return false; }
    if (b.y > 108) { b.el.remove(); if (!planeState.locked) { planeState.score += 1; updatePlaneHud(); if (planeState.score > 0 && planeState.score % 5 === 0 && planeTip) planeTip.textContent = 'Nice dodge streak'; } return false; }
    return true;
  });
};
if (planeSurface && planeTrack && planePlayer) {
  resetPlaneGame(); window.setInterval(tickPlaneGame, 50);
  planeLeft?.addEventListener('click', () => movePlane(-1));
  planeRight?.addEventListener('click', () => movePlane(1));
  planeSurface.addEventListener('click', (e) => {
    if (e.target instanceof HTMLElement && e.target.closest('button')) return;
    const rect = planeSurface.getBoundingClientRect();
    movePlane(e.clientX < rect.left + rect.width / 2 ? -1 : 1);
  });
}

// ── Candy Pop ───────────────────────────────────
const candyState = { cells: [], score: 0, best: 0 };
const boardSize = 5, candyColorCount = 5;
const randomCandy = () => Math.floor(Math.random() * candyColorCount);
const updateCandyHud = () => { if (candyScore) candyScore.textContent = String(candyState.score); if (candyBest) candyBest.textContent = String(candyState.best); };
const renderCandyBoard = () => {
  if (!candyBoard) return;
  candyBoard.innerHTML = '';
  candyState.cells.forEach((color, i) => {
    const cell = document.createElement('button'); cell.className = `candy-cell color-${color}`; cell.type = 'button'; cell.dataset.index = String(i); cell.setAttribute('aria-label', `Candy ${i + 1}`);
    candyBoard.appendChild(cell);
  });
};
const getCandyNeighbors = (i) => {
  const r = Math.floor(i / boardSize), c = i % boardSize, n = [];
  if (r > 0) n.push(i - boardSize); if (r < boardSize - 1) n.push(i + boardSize);
  if (c > 0) n.push(i - 1); if (c < boardSize - 1) n.push(i + 1);
  return n;
};
const findCandyCluster = (si) => {
  const tc = candyState.cells[si]; if (tc == null) return [];
  const q = [si], v = new Set([si]);
  while (q.length) { const c = q.shift(); getCandyNeighbors(c).forEach(n => { if (!v.has(n) && candyState.cells[n] === tc) { v.add(n); q.push(n); } }); }
  return Array.from(v);
};
const collapseCandyBoard = () => {
  for (let c = 0; c < boardSize; c += 1) {
    const vals = [];
    for (let r = boardSize - 1; r >= 0; r -= 1) { const v = candyState.cells[r * boardSize + c]; if (v !== null) vals.push(v); }
    let p = 0;
    for (let r = boardSize - 1; r >= 0; r -= 1) { candyState.cells[r * boardSize + c] = vals[p] ?? randomCandy(); p += 1; }
  }
};
const resetCandyBoard = () => { candyState.cells = Array.from({ length: boardSize * boardSize }, randomCandy); candyState.score = 0; candyState.best = 0; updateCandyHud(); renderCandyBoard(); };
if (candyBoard) {
  resetCandyBoard();
  candyBoard.addEventListener('click', (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest('.candy-cell') : null;
    if (!(btn instanceof HTMLButtonElement)) return;
    const idx = Number(btn.dataset.index), cluster = findCandyCluster(idx);
    if (cluster.length < 2) { btn.classList.add('is-single'); window.setTimeout(() => btn.classList.remove('is-single'), 180); return; }
    cluster.forEach(ci => { candyState.cells[ci] = null; });
    candyState.score += cluster.length * 12; candyState.best = Math.max(candyState.best, cluster.length);
    collapseCandyBoard(); updateCandyHud(); renderCandyBoard();
  });
  candyReset?.addEventListener('click', resetCandyBoard);
}

// ── Scope Shot ──────────────────────────────────
const shooterState = { aimX: 50, aimY: 48, targetX: 50, targetY: 60, hits: 0, shots: 0, phaseX: 0, phaseY: 1.2, dragging: false };
const renderShooter = () => {
  if (shooterCrosshair) { shooterCrosshair.style.left = `${shooterState.aimX}%`; shooterCrosshair.style.top = `${shooterState.aimY}%`; }
  if (shooterTarget) { shooterTarget.style.left = `${shooterState.targetX}%`; shooterTarget.style.bottom = `${100 - shooterState.targetY}%`; }
};
const updateShooterHud = () => { if (shooterHits) shooterHits.textContent = String(shooterState.hits); if (shooterShots) shooterShots.textContent = String(shooterState.shots); };
const setShooterAim = (cx, cy) => {
  if (!shooterArena) return;
  const r = shooterArena.getBoundingClientRect();
  shooterState.aimX = clamp(((cx - r.left) / r.width) * 100, 8, 92);
  shooterState.aimY = clamp(((cy - r.top) / r.height) * 100, 10, 88);
  renderShooter();
};
const fireShot = () => {
  shooterState.shots += 1;
  const dx = shooterState.aimX - shooterState.targetX;
  const dy = shooterState.aimY - shooterState.targetY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 10) { shooterState.hits += 1; if (shooterTip) shooterTip.textContent = 'Hit! Great shot'; shooterTarget?.classList.add('is-hit'); window.setTimeout(() => shooterTarget?.classList.remove('is-hit'), 180); shooterState.phaseX += Math.PI / 2; shooterState.phaseY += Math.PI / 3; }
  else if (shooterTip) shooterTip.textContent = 'Miss — drag and try again';
  updateShooterHud();
};
if (shooterArena && shooterCrosshair && shooterTarget) {
  renderShooter(); updateShooterHud();
  window.setInterval(() => {
    shooterState.phaseX += 0.08; shooterState.phaseY += 0.06;
    shooterState.targetX = 14 + ((Math.sin(shooterState.phaseX) + 1) / 2) * 72;
    shooterState.targetY = 25 + ((Math.sin(shooterState.phaseY) + 1) / 2) * 45;
    renderShooter();
  }, 40);
  shooterArena.addEventListener('pointerdown', (e) => { shooterState.dragging = true; setShooterAim(e.clientX, e.clientY); });
  shooterArena.addEventListener('pointermove', (e) => { if (shooterState.dragging) setShooterAim(e.clientX, e.clientY); });
  shooterArena.addEventListener('pointerleave', () => { shooterState.dragging = false; });
  shooterArena.addEventListener('click', (e) => setShooterAim(e.clientX, e.clientY));
  shooterFire?.addEventListener('click', fireShot);
  document.addEventListener('pointerup', () => { shooterState.dragging = false; });
}

// ── Pocket Beats ────────────────────────────────
const musicNotes = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66];
const musicState = { context: null, oscillator: null, gain: null, timer: null, playing: false, step: 0 };
const updateMusicUi = (label) => { if (musicStatus) musicStatus.textContent = label; if (musicToggle) musicToggle.textContent = musicState.playing ? 'Pause Music' : 'Play Music'; musicSurface?.classList.toggle('is-playing', musicState.playing); musicDisc?.classList.toggle('is-playing', musicState.playing); };
const ensureAudioContext = () => { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; if (!musicState.context) musicState.context = new A(); return musicState.context; };
const stopMusic = () => {
  if (musicState.timer) { window.clearInterval(musicState.timer); musicState.timer = null; }
  if (musicState.oscillator) { musicState.oscillator.stop(); musicState.oscillator.disconnect(); musicState.oscillator = null; }
  if (musicState.gain) { musicState.gain.disconnect(); musicState.gain = null; }
  musicState.playing = false; if (musicProgress) musicProgress.style.width = '0%'; updateMusicUi('Paused');
};
const playMusic = async () => {
  const ctx = ensureAudioContext(); if (!ctx) { updateMusicUi('Audio unavailable'); return; }
  if (ctx.state === 'suspended') await ctx.resume();
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'triangle'; gain.gain.value = 0.035; osc.connect(gain); gain.connect(ctx.destination); osc.start();
  musicState.oscillator = osc; musicState.gain = gain; musicState.playing = true;
  const advance = () => { osc.frequency.setValueAtTime(musicNotes[musicState.step % musicNotes.length], ctx.currentTime); musicState.step += 1; if (musicProgress) musicProgress.style.width = `${((musicState.step % musicNotes.length) / musicNotes.length) * 100}%`; };
  advance(); musicState.timer = window.setInterval(advance, 320); updateMusicUi('Now playing');
};
musicToggle?.addEventListener('click', async () => { if (musicState.playing) stopMusic(); else await playMusic(); });
updateMusicUi('Paused');

// ── Built-in Game Lifecycle (for detail page) ───
let currentBuiltinInterval = null;

const stopBuiltinGame = () => {
  if (currentBuiltinInterval) {
    clearInterval(currentBuiltinInterval);
    currentBuiltinInterval = null;
  }
  // 停止音乐
  stopMusic();
};

const initBuiltinGame = (gameName) => {
  stopBuiltinGame();
  if (gameName === 'plane') {
    resetPlaneGame();
    currentBuiltinInterval = window.setInterval(tickPlaneGame, 50);
    const surface = document.getElementById('plane-surface');
    const leftBtn = document.getElementById('plane-left');
    const rightBtn = document.getElementById('plane-right');
    leftBtn?.addEventListener('click', () => movePlane(-1));
    rightBtn?.addEventListener('click', () => movePlane(1));
    surface?.addEventListener('click', (e) => {
      if (e.target instanceof HTMLElement && e.target.closest('button')) return;
      const rect = surface.getBoundingClientRect();
      movePlane(e.clientX < rect.left + rect.width / 2 ? -1 : 1);
    });
  } else if (gameName === 'candy') {
    resetCandyBoard();
    const board = document.getElementById('candy-board');
    const resetBtn = document.getElementById('candy-reset');
    if (board) {
      board.addEventListener('click', (e) => {
        const btn = e.target instanceof HTMLElement ? e.target.closest('.candy-cell') : null;
        if (!(btn instanceof HTMLButtonElement)) return;
        const idx = Number(btn.dataset.index), cluster = findCandyCluster(idx);
        if (cluster.length < 2) { btn.classList.add('is-single'); window.setTimeout(() => btn.classList.remove('is-single'), 180); return; }
        cluster.forEach(ci => { candyState.cells[ci] = null; });
        candyState.score += cluster.length * 12; candyState.best = Math.max(candyState.best, cluster.length);
        collapseCandyBoard(); updateCandyHud(); renderCandyBoard();
      });
    }
    resetBtn?.addEventListener('click', resetCandyBoard);
  } else if (gameName === 'shooter') {
    renderShooter(); updateShooterHud();
    currentBuiltinInterval = window.setInterval(() => {
      shooterState.phaseX += 0.08; shooterState.phaseY += 0.06;
      shooterState.targetX = 14 + ((Math.sin(shooterState.phaseX) + 1) / 2) * 72;
      shooterState.targetY = 25 + ((Math.sin(shooterState.phaseY) + 1) / 2) * 45;
      renderShooter();
    }, 40);
    const arena = document.getElementById('shooter-arena');
    const fireBtn = document.getElementById('shooter-fire');
    if (arena) {
      arena.addEventListener('pointerdown', (e) => { shooterState.dragging = true; setShooterAim(e.clientX, e.clientY); });
      arena.addEventListener('pointermove', (e) => { if (shooterState.dragging) setShooterAim(e.clientX, e.clientY); });
      arena.addEventListener('pointerleave', () => { shooterState.dragging = false; });
      arena.addEventListener('click', (e) => setShooterAim(e.clientX, e.clientY));
    }
    fireBtn?.addEventListener('click', fireShot);
    document.addEventListener('pointerup', () => { shooterState.dragging = false; });
  } else if (gameName === 'music') {
    updateMusicUi('Paused');
    const toggleBtn = document.getElementById('music-toggle');
    toggleBtn?.addEventListener('click', async () => { if (musicState.playing) stopMusic(); else await playMusic(); });
  }
};

// ── Feed Swipe Navigation ────────────────────────
let currentFeedIndex = 0;
let feedCards = [];
let isDragging = false;
let startY = 0;
let currentTranslate = 0;
let swipeZoneStart = false;

function updateFeedCards(instant = false) {
  feedCards = document.querySelectorAll('.feed-card');
  feedCards.forEach((card, index) => {
    const baseOffset = (index - currentFeedIndex) * 100;
    card.style.transform = `translateY(${baseOffset}%)`;
    card.style.transition = instant ? 'none' : 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)';
    card.style.zIndex = index === currentFeedIndex ? 1 : 0;
  });
}

function switchToFeed(index) {
  if (index < 0 || index >= feedCards.length) return;
  currentFeedIndex = index;
  updateFeedCards(false);
}

function onDragStart(y, inSwipeZone) {
  if (!inSwipeZone) return;
  isDragging = true;
  startY = y;
  currentTranslate = 0;
  swipeZoneStart = true;
  
  feedCards.forEach(card => {
    card.style.transition = 'none';
  });
}

function onDragMove(y) {
  if (!isDragging) return;
  
  const deltaY = y - startY;
  const screenHeight = window.innerHeight;
  
  currentTranslate = (deltaY / screenHeight) * 100;
  
  feedCards.forEach((card, index) => {
    const baseOffset = (index - currentFeedIndex) * 100;
    card.style.transform = `translateY(${baseOffset + currentTranslate}%)`;
  });
}

function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;
  
  const threshold = 10; // 降低阈值，更容易触发
  
  feedCards.forEach(card => {
    card.style.transition = 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)';
  });
  
  // currentTranslate: positive = dragged DOWN, negative = dragged UP
  // Swipe UP (negative) = next feed, Swipe DOWN (positive) = previous feed
  if (currentTranslate < -threshold && currentFeedIndex < feedCards.length - 1) {
    // Swiped UP → go to next
    switchToFeed(currentFeedIndex + 1);
  } else if (currentTranslate > threshold && currentFeedIndex > 0) {
    // Swiped DOWN → go to previous
    switchToFeed(currentFeedIndex - 1);
  } else {
    updateFeedCards(false);
  }
  
  swipeZoneStart = false;
}

// Listen on document to capture all touch events
document.addEventListener('touchstart', (e) => {
  const touchY = e.touches[0].clientY;
  const screenHeight = window.innerHeight;
  const inSwipeZone = touchY > screenHeight * 0.45;
  
  if (inSwipeZone) {
    onDragStart(touchY, true);
  }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  
  const touchY = e.touches[0].clientY;
  onDragMove(touchY);
}, { passive: false });

document.addEventListener('touchend', () => {
  if (isDragging) {
    onDragEnd();
  }
});

// Mouse support
let isMouseDragging = false;

document.addEventListener('mousedown', (e) => {
  const screenHeight = window.innerHeight;
  if (e.clientY > screenHeight * 0.45) {
    isMouseDragging = true;
    onDragStart(e.clientY, true);
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isMouseDragging) return;
  e.preventDefault();
  onDragMove(e.clientY);
});

document.addEventListener('mouseup', () => {
  if (isMouseDragging) {
    isMouseDragging = false;
    onDragEnd();
  }
});

// Initialize
updateFeedCards(true);

// Keyboard shortcuts ──────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && remixSheet?.classList.contains('is-visible')) { closeRemixSheet(); return; }
  if (document.querySelector('[data-page="home"]')?.classList.contains('is-active') && !remixSheet?.classList.contains('is-visible')) {
    if (e.key === 'ArrowLeft') movePlane(-1);
    if (e.key === 'ArrowRight') movePlane(1);
  }
});
