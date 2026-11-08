/*
 * Kódfejtő Műhely – játékok
 *  #robot : Légy te a robot! – hová ér a robot, és merre néz a program végén?
 *  #fok   : Fok-tippelő – hány fokot kell fordulni? (robotfok / kerékfok)
 * A játékok a csapathoz igazodnak: a blokkosok blokkot látnak, a pythonosok Pythont,
 * de bárki átválthat.
 */
(function () {
  'use strict';
  const K = window.Kodfejto;
  K.header('games');
  const app = document.getElementById('app');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const group = K.GROUPS[K.store.get('group', '')];
  let mode = K.store.get('gameMode', group && group.mode === 'blocks' ? 'blocks' : 'python');
  const ROUNDS = 8;

  function modeSwitch() {
    return `<div class="seg" role="group" aria-label="Nyelv"><button data-mode="blocks" class="${mode === 'blocks' ? 'on' : ''}">Blokk</button><button data-mode="python" class="${mode === 'python' ? 'on' : ''}">Python</button></div>`;
  }
  function bindMode(restart) {
    app.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => {
      if (b.dataset.mode === mode) return;
      mode = b.dataset.mode; K.store.set('gameMode', mode); restart();
    });
  }
  const stars = (pts, max) => { const r = pts / max; return r >= 0.9 ? '★★★' : r >= 0.65 ? '★★☆' : r >= 0.4 ? '★☆☆' : '☆☆☆'; };

  // ------------------------------------------------------------ robot rajz (felülnézet, fölfelé néz)
  function robotSVG(size) {
    const s = size / 100;
    return `<g>
      <rect x="${-38 * s}" y="${-16 * s}" width="${12 * s}" height="${32 * s}" rx="${3 * s}" fill="#1D2B44"/>
      <rect x="${26 * s}" y="${-16 * s}" width="${12 * s}" height="${32 * s}" rx="${3 * s}" fill="#1D2B44"/>
      <rect x="${-27 * s}" y="${-40 * s}" width="${54 * s}" height="${68 * s}" rx="${8 * s}" fill="#fff" stroke="#1D2B44" stroke-width="${3 * s}"/>
      <rect x="${-14 * s}" y="${-6 * s}" width="${28 * s}" height="${30 * s}" rx="${3 * s}" fill="#FFC93C" stroke="#1D2B44" stroke-width="${2 * s}"/>
      <path d="M0 ${-56 * s} L${-11 * s} ${-38 * s} L${11 * s} ${-38 * s} Z" fill="#FF5A5F"/>
    </g>`;
  }

  // ------------------------------------------------------------ főmenü
  function menu() {
    const best = (k) => K.store.get('game.' + k + '.best', null);
    const bl = (k) => best(k) ? `<span class="best">Legjobb eredményed: ${best(k)}</span>` : '';
    app.innerHTML = `<div class="hero card"><span class="kicker">Játékok</span><h1>Edzés a fejednek!</h1>
      <p>Rövid játékok, amelyek ugyanazt gyakoroltatják, mint a robot: előre kell gondolkodni, mit csinál majd a program.</p></div>
      <div class="gamelist">
        <a class="card gcard" href="#robot"><span class="ico" style="background:#FFE7F2">🤖</span><span><h2>Légy te a robot!</h2>
          <p>Elolvasod a programot, és megmondod, hová ér a robot, és merre néz a végén.</p>${bl('robot')}</span></a>
        <a class="card gcard" href="#fok"><span class="ico" style="background:#E8F0FF">📐</span><span><h2>Fok-tippelő</h2>
          <p>Mennyit kell fordulnia a robotnak? Tippelj! Blokkban kerékfokban, Pythonban robotfokban.</p>${bl('fok')}</span></a>
        <a class="card gcard" href="#hiba"><span class="ico" style="background:#E8F8EF">🐞</span><span><h2>Hibavadász</h2>
          <p>A robot nem azt csinálta, amit kellett. Melyik sorban bújik a hiba?</p>${bl('hiba')}</span></a>
        <a class="card gcard" href="#sorba"><span class="ico" style="background:#EEF0FF">🧩</span><span><h2>Rakd sorba!</h2>
          <p>Összekeveredtek a program sorai. Rakd őket jó sorrendbe!</p>${bl('sorba')}</span></a>
      </div>`;
  }

  // ============================================================ 1. Légy te a robot!
  const N = 6, CELL = 80, PAD = 30, DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // 0 = fel, 1 = jobbra, 2 = le, 3 = balra
  const ARROWS = ['↑', '→', '↓', '←'];

  function levelOf(round) { return Math.min(4, Math.floor(round / 2) + 1); }

  // parancsok: {t:'fwd'|'back', n} {t:'turn', d: 1 (jobbra 90) | -1 (balra 90) | 2 (180)} {t:'rep', k, body}
  function genProgram(level) {
    for (let tries = 0; tries < 500; tries++) {
      const start = { x: rnd(0, N - 1), y: rnd(0, N - 1), h: level === 1 ? 0 : rnd(0, 3) };
      const prog = [];
      const turn = () => ({ t: 'turn', d: level >= 3 && Math.random() < 0.3 ? 2 : pick([1, -1]) });
      const move = (back) => ({ t: back ? 'back' : 'fwd', n: rnd(1, 3) });
      if (level === 1) {
        if (Math.random() < 0.5) prog.push(move(), turn()); else prog.push(turn(), move());
      } else if (level === 2) {
        const len = rnd(3, 4);
        for (let i = 0; i < len; i++) prog.push(i % 2 === 0 ? move(Math.random() < 0.3) : turn());
      } else if (level === 3) {
        const len = rnd(4, 5);
        for (let i = 0; i < len; i++) prog.push(i % 2 === 0 ? move(Math.random() < 0.35) : turn());
      } else {
        if (Math.random() < 0.5) prog.push(move());
        prog.push({ t: 'rep', k: rnd(2, 3), body: [move(), { t: 'turn', d: pick([1, -1]) }] });
      }
      const path = run(start, prog);
      if (!path) continue;
      const end = path[path.length - 1];
      if (end.x === start.x && end.y === start.y && end.h === start.h) continue; // túl könnyű
      return { start, prog, path };
    }
    return null;
  }
  // lépésenként végrehajtja; null, ha kimenne a tábláról
  function run(start, prog) {
    const p = Object.assign({}, start), path = [Object.assign({}, p)];
    let ok = true;
    const exec = (c) => {
      if (!ok) return;
      if (c.t === 'rep') { for (let i = 0; i < c.k; i++) c.body.forEach(exec); return; }
      if (c.t === 'turn') { p.h = (p.h + (c.d === 2 ? 2 : c.d) + 4) % 4; path.push(Object.assign({}, p)); return; }
      const s = c.t === 'fwd' ? 1 : -1;
      for (let i = 0; i < c.n; i++) {
        p.x += DIRS[p.h][0] * s; p.y += DIRS[p.h][1] * s;
        if (p.x < 0 || p.y < 0 || p.x >= N || p.y >= N) { ok = false; return; }
        path.push(Object.assign({}, p));
      }
    };
    prog.forEach(exec);
    return ok ? path : null;
  }

  function progHTML(prog) {
    if (mode === 'python') {
      const lines = [];
      const line = (c, ind) => {
        const pad = '    '.repeat(ind);
        if (c.t === 'rep') { lines.push(pad + `for i in range(${c.k}):`); c.body.forEach((b) => line(b, ind + 1)); return; }
        if (c.t === 'fwd') lines.push(pad + `robot.straight(${c.n * 200})`);
        else if (c.t === 'back') lines.push(pad + `robot.straight(-${c.n * 200})`);
        else lines.push(pad + `robot.turn(${c.d === 2 ? 180 : c.d * 90})`);
      };
      prog.forEach((c) => line(c, 0));
      return `<pre class="code">${esc(lines.join('\n'))}</pre>`;
    }
    const out = ['<div class="blk events">when program starts</div>'];
    const blk = (c, ind) => {
      const st = `style="margin-left:${ind * 22}px"`;
      if (c.t === 'rep') { out.push(`<div class="blk control" ${st}>repeat ${c.k}</div>`); c.body.forEach((b) => blk(b, ind + 1)); return; }
      if (c.t === 'fwd') out.push(`<div class="blk movement" ${st}>move ↑ for ${c.n * 20} cm</div>`);
      else if (c.t === 'back') out.push(`<div class="blk movement" ${st}>move ↓ for ${c.n * 20} cm</div>`);
      else if (c.d === 2) out.push(`<div class="blk movement" ${st}>move right: 100 for 360 degrees</div>`);
      else out.push(`<div class="blk movement" ${st}>move ${c.d === 1 ? 'right' : 'left'}: 100 for 180 degrees</div>`);
    };
    prog.forEach((c) => blk(c, 0));
    return `<div class="bstack">${out.join('')}</div>`;
  }

  const cx = (x) => PAD + x * CELL + CELL / 2, cy = (y) => PAD + (N - 1 - y) * CELL + CELL / 2;

  function robotGame() {
    const G = { round: 0, points: 0, cur: null, sel: null, head: null, done: false };
    const W = PAD * 2 + N * CELL;

    function board() {
      let g = '';
      for (let i = 0; i <= N; i++) {
        g += `<line x1="${PAD + i * CELL}" y1="${PAD}" x2="${PAD + i * CELL}" y2="${PAD + N * CELL}" stroke="#D3E3F8" stroke-width="2"/>`;
        g += `<line x1="${PAD}" y1="${PAD + i * CELL}" x2="${PAD + N * CELL}" y2="${PAD + i * CELL}" stroke="#D3E3F8" stroke-width="2"/>`;
      }
      for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
        g += `<rect class="cellhit" data-x="${x}" data-y="${y}" x="${PAD + x * CELL + 2}" y="${PAD + (N - 1 - y) * CELL + 2}" width="${CELL - 4}" height="${CELL - 4}" rx="10" fill="transparent"/>`;
      }
      const st = G.cur.start;
      g += `<rect x="${PAD + st.x * CELL + 6}" y="${PAD + (N - 1 - st.y) * CELL + 6}" width="${CELL - 12}" height="${CELL - 12}" rx="10" fill="none" stroke="#FFC93C" stroke-width="4" stroke-dasharray="8 6"/>`;
      g += `<text x="${PAD}" y="${PAD - 10}" font-size="14" font-weight="800" fill="#55657F">1 négyzet = 20 cm · a sárga keret a rajt</text>`;
      g += '<polyline id="trail" fill="none" stroke="#2F6FED" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" points=""/>';
      g += '<g id="mark"></g>';
      g += `<g id="robot" transform="translate(${cx(st.x)} ${cy(st.y)}) rotate(${st.h * 90})" style="pointer-events:none">${robotSVG(62)}</g>`;
      return `<svg class="board" id="bd" viewBox="0 0 ${W} ${W}" role="img" aria-label="Pálya 6×6 négyzettel">${g}</svg>`;
    }

    function newRound() {
      G.cur = genProgram(levelOf(G.round));
      G.sel = null; G.head = null; G.done = false;
      draw();
    }

    function draw() {
      app.innerHTML = `<div class="topline"><h1>🤖 Légy te a robot!</h1>
        <div class="stats"><span class="stat">${G.round + 1}. kör / ${ROUNDS}</span><span class="stat">${levelOf(G.round)}. szint</span><span class="stat">${G.points} pont</span>${modeSwitch()}</div></div>
        <div class="game">
          <div class="card panel">
            <p class="task">A robot a <b>sárga keretben</b> áll, és a piros orra felé néz. Mit csinál ez a program?</p>
            ${progHTML(G.cur.prog)}
            <p class="task"><b>1.</b> Kattints arra a négyzetre, ahová a robot a végén ér!<br><b>2.</b> Merre néz a végén?</p>
            <div class="heads">${ARROWS.map((a, i) => `<button data-h="${i}" class="${G.head === i ? 'on' : ''}" aria-label="${['fel', 'jobbra', 'le', 'balra'][i]}">${a}</button>`).join('')}</div>
            <div class="row" style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-green" id="check" ${G.sel && G.head !== null && !G.done ? '' : 'disabled'}>Ellenőrzöm!</button>
              <button class="btn btn-blue" id="next" ${G.done ? '' : 'hidden'}>${G.round + 1 >= ROUNDS ? 'Eredmény' : 'Következő →'}</button>
            </div>
            <div class="msg" id="msg" role="status"></div>
            <a href="#" style="font-weight:800">← Vissza a játékokhoz</a>
          </div>
          <div>${board()}</div>
        </div>`;
      bindMode(() => { G.round = 0; G.points = 0; newRound(); });
      app.querySelectorAll('.cellhit').forEach((c) => c.onclick = () => { if (G.done) return; G.sel = { x: +c.dataset.x, y: +c.dataset.y }; mark(); upd(); });
      app.querySelectorAll('[data-h]').forEach((b) => b.onclick = () => { if (G.done) return; G.head = +b.dataset.h; app.querySelectorAll('[data-h]').forEach((x) => x.classList.toggle('on', x === b)); mark(); upd(); });
      app.querySelector('#check').onclick = check;
      app.querySelector('#next').onclick = () => { G.round++; if (G.round >= ROUNDS) end(); else newRound(); };
      mark();
    }
    function upd() { app.querySelector('#check').disabled = !(G.sel && G.head !== null) || G.done; }
    function mark() {
      const m = app.querySelector('#mark');
      if (!G.sel) { m.innerHTML = ''; return; }
      const x = cx(G.sel.x), y = cy(G.sel.y);
      m.innerHTML = `<circle cx="${x}" cy="${y}" r="${CELL / 2 - 8}" fill="rgba(47,111,237,.15)" stroke="#2F6FED" stroke-width="4"/>`
        + (G.head !== null ? `<text x="${x}" y="${y + 13}" text-anchor="middle" font-size="38" font-weight="800" fill="#2F6FED">${ARROWS[G.head]}</text>` : '');
    }

    function check() {
      G.done = true; upd();
      const path = G.cur.path, end = path[path.length - 1];
      animate(path, () => {
        const okCell = G.sel.x === end.x && G.sel.y === end.y, okHead = G.head === end.h;
        const pts = (okCell ? 2 : 0) + (okHead ? 1 : 0);
        G.points += pts;
        const msg = app.querySelector('#msg');
        msg.className = 'msg ' + (pts === 3 ? 'ok' : 'err');
        msg.textContent = pts === 3 ? 'Telitalálat! +3 pont' : (okCell ? 'Jó helyre tippeltél, de nem arra néz! +2 pont'
          : okHead ? 'Az irány jó, a hely nem. +1 pont' : 'Most nem talált. Kövesd végig lépésenként a kék nyomot!');
        app.querySelector('.stats .stat:nth-child(3)').textContent = G.points + ' pont';
        app.querySelector('#next').hidden = false;
      });
    }

    function animate(path, done) {
      const robot = app.querySelector('#robot'), trail = app.querySelector('#trail');
      const pts = [[cx(path[0].x), cy(path[0].y)]];
      let i = 1, ang = path[0].h * 90;
      function step() {
        if (i >= path.length) { done(); return; }
        const a = path[i - 1], b = path[i];
        const from = { x: cx(a.x), y: cy(a.y), r: ang };
        let dr = (b.h - a.h) * 90;
        if (dr > 180) dr -= 360; if (dr < -180) dr += 360;
        // 180-as fordulásnál a parancs iránya számít (a „jobbra 360 kerékfok” jobbra fordul)
        if (Math.abs(dr) === 180) dr = 180;
        const to = { x: cx(b.x), y: cy(b.y), r: ang + dr };
        const dur = dr ? 420 : 320, t0 = performance.now();
        (function frame(now) {
          const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          const x = from.x + (to.x - from.x) * e, y = from.y + (to.y - from.y) * e, r = from.r + (to.r - from.r) * e;
          robot.setAttribute('transform', `translate(${x} ${y}) rotate(${r})`);
          trail.setAttribute('points', pts.concat([[x, y]]).map((p) => p.join(',')).join(' '));
          if (k < 1) requestAnimationFrame(frame);
          else { pts.push([to.x, to.y]); ang = to.r; i++; setTimeout(step, 80); }
        })(t0);
      }
      step();
    }

    function end() {
      const max = ROUNDS * 3;
      saveBest('robot', G.points, max);
      app.innerHTML = `<div class="card endbox"><h1>🤖 Légy te a robot!</h1><div class="big">${stars(G.points, max)}</div>
        <p style="font-size:22px;margin:0"><b>${G.points}</b> pont a ${max}-ból</p>
        <p class="muted" style="margin:0">${G.points >= max * 0.9 ? 'Igazi robotagy vagy!' : G.points >= max * 0.6 ? 'Szép munka! A végén jönnek a ciklusok, azoknál figyelj a sorrendre.' : 'Gyakorold még: olvasd a programot soronként, és közben mutasd az ujjaddal, merre megy a robot!'}</p>
        <div style="display:flex;gap:12px"><button class="btn btn-green" id="again">Újra játszom</button><a class="btn btn-plain" href="#">Másik játék</a></div></div>`;
      app.querySelector('#again').onclick = () => { G.round = 0; G.points = 0; newRound(); };
    }

    newRound();
  }

  // ============================================================ 2. Fok-tippelő
  function fokGame() {
    const G = { round: 0, points: 0, cur: null, done: false, side: 'right' };
    const W = 440, C = W / 2, R = 170;

    function newRound() {
      const start = rnd(0, 23) * 15;
      const mag = rnd(1, 12) * 15;            // 15 … 180
      const sign = mag === 180 ? 1 : pick([1, -1]);
      G.cur = { start, delta: mag * sign };
      G.done = false; G.side = 'right';
      draw();
    }
    const pt = (deg, r) => [C + r * Math.sin(deg * Math.PI / 180), C - r * Math.cos(deg * Math.PI / 180)];

    function boardSVG() {
      let g = `<circle cx="${C}" cy="${C}" r="${R}" fill="#F7FAFF" stroke="#D3E3F8" stroke-width="2"/>`;
      for (let a = 0; a < 360; a += 15) {
        const [x1, y1] = pt(a, R - (a % 90 === 0 ? 16 : a % 45 === 0 ? 11 : 6)), [x2, y2] = pt(a, R);
        g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#B5C9E6" stroke-width="${a % 90 === 0 ? 3 : 2}"/>`;
      }
      const tgt = G.cur.start + G.cur.delta;
      const [tx, ty] = pt(tgt, R + 4);
      g += `<line x1="${C}" y1="${C}" x2="${tx}" y2="${ty}" stroke="#FF5A5F" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round"/>`;
      const [hx, hy] = pt(tgt, R + 4);
      g += `<circle cx="${hx}" cy="${hy}" r="13" fill="#FF5A5F"/><text x="${hx}" y="${hy + 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">!</text>`;
      g += '<path id="arc" fill="none" stroke="#2F6FED" stroke-width="6" stroke-linecap="round" d=""/>';
      g += `<g id="robot" transform="translate(${C} ${C}) rotate(${G.cur.start})">${robotSVG(118)}</g>`;
      return `<svg class="board" viewBox="0 0 ${W} ${W}" role="img" aria-label="A robot és a cél iránya">${g}</svg>`;
    }

    function inputHTML() {
      if (mode === 'python') {
        return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:600">
          robot.turn( <input class="numin" id="num" type="number" step="5" inputmode="numeric" aria-label="fok"> )</div>
          <p class="muted" style="margin:0">Jobbra pozitív szám, balra negatív: például <code>-90</code>.</p>`;
      }
      return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span class="blk movement" style="display:inline-flex;align-items:center;gap:8px;font-size:17px">move
          <span class="seg" style="background:rgba(255,255,255,.25)"><button data-side="right" class="${G.side === 'right' ? 'on' : ''}">right:</button><button data-side="left" class="${G.side === 'left' ? 'on' : ''}">left:</button></span>
          <span style="white-space:nowrap">100 for</span> <input class="numin" id="num" type="number" step="5" min="0" inputmode="numeric" aria-label="kerékfok" style="font-size:22px;width:110px;padding:2px 8px"> degrees</span></div>
        <p class="muted" style="margin:0">Vigyázz: blokkban <b>kerékfokot</b> írsz! (Emlékszel? Ha a robot 90 fokot fordul, a kereke 180-at.)</p>`;
    }

    function draw() {
      app.innerHTML = `<div class="topline"><h1>📐 Fok-tippelő</h1>
        <div class="stats"><span class="stat">${G.round + 1}. kör / ${ROUNDS}</span><span class="stat" id="pts">${G.points} pont</span>${modeSwitch()}</div></div>
        <div class="game">
          <div class="card panel">
            <p class="task">A robot a piros orra felé néz. Fordítsd úgy, hogy a <b style="color:#C9393E">piros szaggatott vonal</b> felé nézzen!
              ${mode === 'python' ? 'Hány fokot forduljon a robot?' : 'Hány kerékfokot írsz a blokkba?'}</p>
            ${inputHTML()}
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-green" id="go">Fordulj!</button>
              <button class="btn btn-blue" id="next" hidden>${G.round + 1 >= ROUNDS ? 'Eredmény' : 'Következő →'}</button></div>
            <div class="msg" id="msg" role="status"></div>
            <p class="muted" style="margin:0">A kör szélén a kis vonások 15 fokonként vannak, a hosszabbak 45 és 90 foknál.</p>
            <a href="#" style="font-weight:800">← Vissza a játékokhoz</a>
          </div>
          <div>${boardSVG()}</div>
        </div>`;
      bindMode(() => { G.round = 0; G.points = 0; newRound(); });
      app.querySelectorAll('[data-side]').forEach((b) => b.onclick = () => { G.side = b.dataset.side; app.querySelectorAll('[data-side]').forEach((x) => x.classList.toggle('on', x === b)); });
      const num = app.querySelector('#num');
      num.focus();
      num.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      app.querySelector('#go').onclick = go;
      app.querySelector('#next').onclick = () => { G.round++; if (G.round >= ROUNDS) end(); else newRound(); };
    }

    function go() {
      if (G.done) return;
      const v = parseFloat(app.querySelector('#num').value);
      const msg = app.querySelector('#msg');
      if (!isFinite(v)) { msg.className = 'msg err'; msg.textContent = 'Írj be egy számot!'; return; }
      G.done = true;
      app.querySelector('#go').disabled = true;
      // a robot valódi fordulása (robotfok, jobbra pozitív)
      const robotTurn = mode === 'python' ? v : (G.side === 'right' ? 1 : -1) * Math.abs(v) / 2;
      const want = G.cur.delta;
      let err = Math.abs(want - robotTurn);
      err = Math.min(err, Math.abs(360 - err)); // a 180-nál mindkét irány jó
      const pts = err <= 5 ? 3 : err <= 15 ? 2 : err <= 30 ? 1 : 0;
      const robot = app.querySelector('#robot'), arc = app.querySelector('#arc');
      const t0 = performance.now(), dur = 600 + Math.min(900, Math.abs(robotTurn) * 4);
      (function frame(now) {
        const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const a = G.cur.start + robotTurn * e;
        robot.setAttribute('transform', `translate(${C} ${C}) rotate(${a})`);
        const [x1, y1] = pt(G.cur.start, 110), [x2, y2] = pt(a, 110);
        const large = Math.abs(robotTurn * e) > 180 ? 1 : 0, sweep = robotTurn >= 0 ? 1 : 0;
        arc.setAttribute('d', Math.abs(robotTurn * e) < 0.5 ? '' : `M${x1} ${y1} A110 110 0 ${large} ${sweep} ${x2} ${y2}`);
        if (k < 1) { requestAnimationFrame(frame); return; }
        G.points += pts;
        app.querySelector('#pts').textContent = G.points + ' pont';
        const ans = mode === 'python' ? `robot.turn(${want})`
          : `move ${want >= 0 ? 'right' : 'left'}: 100 for ${Math.abs(want) * 2} degrees`;
        const turned = Math.round(Math.abs(robotTurn) * 10) / 10;
        msg.className = 'msg ' + (pts >= 2 ? 'ok' : 'err');
        msg.innerHTML = (pts === 3 ? 'Telitalálat! +3 pont' : pts === 2 ? 'Nagyon közel! +2 pont' : pts === 1 ? 'Majdnem! +1 pont' : 'Ez most messze volt.')
          + `<br><span style="font-weight:700;color:var(--ink)">A robot ${turned} fokot fordult ${robotTurn >= 0 ? 'jobbra' : 'balra'}. A pontos válasz: <code>${esc(ans)}</code></span>`
          + (mode === 'blocks' && Math.abs(Math.abs(v) - Math.abs(want)) <= 5 && Math.abs(want) >= 30 ? '<br><span style="color:var(--red-d)">Robotfokot írtál! Blokkban a kerékfok kell, az kétszer annyi.</span>' : '');
        app.querySelector('#next').hidden = false;
        app.querySelector('#next').focus();
      })(t0);
    }

    function end() {
      const max = ROUNDS * 3;
      saveBest('fok', G.points, max);
      app.innerHTML = `<div class="card endbox"><h1>📐 Fok-tippelő</h1><div class="big">${stars(G.points, max)}</div>
        <p style="font-size:22px;margin:0"><b>${G.points}</b> pont a ${max}-ból</p>
        <p class="muted" style="margin:0">${G.points >= max * 0.9 ? 'Szögmérő-szemed van!' : 'Tipp: a derékszög (90°) a kör negyede, a 45° annak a fele. Ezekhez mérd a többit!'}</p>
        <div style="display:flex;gap:12px"><button class="btn btn-green" id="again">Újra játszom</button><a class="btn btn-plain" href="#">Másik játék</a></div></div>`;
      app.querySelector('#again').onclick = () => { G.round = 0; G.points = 0; newRound(); };
    }

    newRound();
  }


  // ============================================================ 3. Hibavadász
  // Minden feladatban pontosan egy hibás sor van. A sorok: Python – szöveg; blokk – [kategória, szöveg, behúzás]
  const EV = ['events', 'when program starts', 0];
  const BUGS = {
    python: [
      { goal: 'Menj előre 20 cm-t!', lines: ['bal = Motor(Port.A)', 'jobb = Motor(Port.B)', 'robot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)', 'robot.straight(200)'], bug: 0,
        saw: 'A robot helyben pörög, mint egy búgócsiga. 🌀', why: 'A bal motor fordítva ül a robotban. Meg kell neki mondani, hogy neki a fordított forgás az előre.', fix: 'bal = Motor(Port.A, Direction.COUNTERCLOCKWISE)' },
      { goal: 'Menj előre 20 cm-t, aztán csipogj!', lines: ['robot.straight(20)', 'hub.speaker.beep()'], bug: 0,
        saw: 'A robot alig mozdult: csak 2 centit ment.', why: 'Pythonban milliméterben adjuk meg a távolságot: 20 cm = 200 mm.', fix: 'robot.straight(200)' },
      { goal: 'Csipogj, várj 1 másodpercet, aztán csipogj újra!', lines: ['hub.speaker.beep()', 'wait(1)', 'hub.speaker.beep()'], bug: 1,
        saw: 'A két csipogás szinte egybeolvadt.', why: 'A wait() ezredmásodpercben számol: 1 másodperc = 1000.', fix: 'wait(1000)' },
      { goal: 'Menj 20 cm-t, fordulj BALRA, aztán menj még 10 cm-t!', lines: ['robot.straight(200)', 'robot.turn(90)', 'robot.straight(100)'], bug: 1,
        saw: 'A robot jobbra fordult.', why: 'Pythonban a pozitív szám jobbra fordít. Balra negatív számmal: -90.', fix: 'robot.turn(-90)' },
      { goal: 'Rajzolj négyzetet!', lines: ['for i in range(3):', '    robot.straight(200)', '    robot.turn(90)'], bug: 0,
        saw: 'A négyzetnek csak 3 oldala lett.', why: 'A négyzetnek 4 oldala van, ezért a ciklusnak 4-szer kell ismételnie.', fix: 'for i in range(4):' },
      { goal: 'Rajzolj négyzetet!', lines: ['for i in range(4):', '    robot.straight(200)', 'robot.turn(90)'], bug: 2,
        saw: 'A robot 80 cm-t ment egyenesen, és csak a legvégén fordult egyet.', why: 'A fordulás nincs beljebb húzva, ezért nem tartozik a ciklushoz: csak egyszer fut le, a végén.', fix: '    robot.turn(90)' },
      { goal: 'Rajzolj négyzetet a negyzet szóval!', lines: ['def negyzet():', '    for i in range(4):', '        robot.straight(150)', '        robot.turn(90)', '', 'negyzet'], bug: 5,
        saw: 'A robot meg sem mozdult.', why: 'Kimondáskor kell a zárójel. Zárójel nélkül a robot csak gondol a szóra, de nem csinálja meg.', fix: 'negyzet()' },
      { goal: 'Rajzolj négyzetet a negyzet szóval!', lines: ['negyzet()', '', 'def negyzet():', '    for i in range(4):', '        robot.straight(150)', '        robot.turn(90)'], bug: 0,
        saw: "Hibaüzenet: NameError: name 'negyzet' is not defined", why: 'A robot fentről lefelé olvas. A szót előbb meg kell tanítani (def), és csak utána lehet kimondani.', fix: 'a negyzet() sort a def rész alá kell tenni' },
      { goal: 'Ha a színszenzor pirosat lát, csipogj!', lines: ['if szem.color() = Color.RED:', '    hub.speaker.beep(800, 200)'], bug: 0,
        saw: 'Hibaüzenet: SyntaxError – a robot nem érti a programot.', why: 'Összehasonlításhoz két egyenlőségjel kell: ==. Az egy egyenlőségjel névadás.', fix: 'if szem.color() == Color.RED:' },
      { goal: 'Menj előre 20 cm-t!', lines: ['bal = Motor(Port.A, Direction.COUNTERCLOCKWISE)', 'jobb = Motor(Port.C)', 'robot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)', 'robot.straight(200)'], bug: 1,
        saw: 'Hibaüzenet: ENODEV – ezen a kapun nincs motor.', why: 'Az iskolai robotnál a jobb motor a B kapuban van. A C kapuban a színszenzor ül.', fix: 'jobb = Motor(Port.B)' },
      { goal: 'Menj előre 20 cm-t!', lines: ['robot = DriveBase(bal, jobb, wheel_diameter=5.6, axle_track=112)', 'robot.straight(200)'], bug: 0,
        saw: 'A robot nagyon messzire ment, és nekiment a falnak.', why: 'A kerék átmérője is milliméterben kell: 56. Ha 5.6-ot írsz, a robot azt hiszi, pici a kereke, ezért tízszer annyit forgatja.', fix: 'robot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)' },
      { goal: 'Menj előre 20 cm-t, aztán tolass vissza a rajtra!', lines: ['robot.straight(200)', 'robot.straight(200)'], bug: 1,
        saw: 'A robot 40 cm-t ment előre.', why: 'Hátrafelé mínusz számmal megy a robot.', fix: 'robot.straight(-200)' },
    ],
    blocks: [
      { goal: 'Menj 20 cm-t, fordulj derékszögben jobbra, aztán menj még 20 cm-t!', lines: [EV, ['movement', 'move ↑ for 20 cm'], ['movement', 'move right: 100 for 90 degrees'], ['movement', 'move ↑ for 20 cm']], bug: 2,
        saw: 'A robot csak félig fordult el.', why: 'A blokk a KERÉK fordulását adja meg. A robot 90 fokos fordulásához 180 kerékfok kell.', fix: 'move right: 100 for 180 degrees' },
      { goal: 'Menj ELŐRE 20 cm-t!', lines: [EV, ['movement', 'set movement motors to A+B'], ['movement', 'move ↓ for 20 cm']], bug: 2,
        saw: 'A robot hátrafelé ment.', why: 'A lefelé mutató nyíl (↓) hátramenetet jelent, előre a felfelé mutató (↑) kell.', fix: 'move ↑ for 20 cm' },
      { goal: 'Rajzolj négyzetet!', lines: [EV, ['control', 'repeat 3'], ['movement', 'move ↑ for 20 cm', 1], ['movement', 'move right: 100 for 180 degrees', 1]], bug: 1,
        saw: 'A négyzetnek csak 3 oldala lett.', why: 'A négyzetnek 4 oldala van, ezért 4-szer kell ismételni.', fix: 'repeat 4' },
      { goal: 'Csipogj, várj 1 másodpercet, aztán csipogj újra!', lines: [EV, ['sound', 'play beep 72 for 0.2 seconds'], ['control', 'wait 1000 seconds'], ['sound', 'play beep 72 for 0.2 seconds']], bug: 2,
        saw: 'A második csipogás nem jött… a robot még mindig vár.', why: 'Blokkban a várakozás másodpercben van: 1 másodperc = 1. Az 1000 a Python-csapat számolása!', fix: 'wait 1 seconds' },
      { goal: 'Menj 20 cm-t, fordulj BALRA, aztán menj még 10 cm-t!', lines: [EV, ['movement', 'move ↑ for 20 cm'], ['movement', 'move right: 100 for 180 degrees'], ['movement', 'move ↑ for 10 cm']], bug: 2,
        saw: 'A robot jobbra fordult.', why: 'A fordulás irányát a blokkban kell kiválasztani: right = jobbra, left = balra.', fix: 'move left: 100 for 180 degrees' },
      { goal: 'Rajzolj négyzetet!', lines: [EV, ['control', 'repeat 4'], ['movement', 'move ↑ for 20 cm', 1], ['movement', 'move right: 100 for 180 degrees', 0]], bug: 3,
        saw: 'A robot 80 cm-t ment egyenesen, és csak a legvégén fordult egyet.', why: 'A fordulás blokk nincs a repeat belsejében, ezért csak egyszer fut le, a végén.', fix: 'a fordulás blokkot a repeat belsejébe kell húzni' },
      { goal: 'Menj előre 20 cm-t!', lines: [EV, ['movement', 'set 1 motor rotation to 1.75 cm'], ['movement', 'move ↑ for 20 cm']], bug: 1,
        saw: 'A robot nagyon messzire ment, és nekiment a falnak.', why: 'Egy kerékfordulattal 17,5 cm-t gurul a robot. Ha 1,75-öt írsz, azt hiszi, alig halad, ezért tízszer annyit forgatja a kereket.', fix: 'set 1 motor rotation to 17.5 cm' },
      { goal: 'Menj előre 20 cm-t!', lines: [EV, ['movement', 'set movement speed to 50 %'], ['movement', 'move ↑ for 20 seconds']], bug: 2,
        saw: 'A robot 20 másodpercig ment, és nekiment a falnak.', why: 'A move blokkban a mértékegységet is ki kell választani. Most másodperc (seconds) van beállítva, centi (cm) kellene.', fix: 'move ↑ for 20 cm' },
      { goal: 'Menj 20 cm-t, fordulj meg (hátraarc), és gyere vissza a rajtra!', lines: [EV, ['movement', 'move ↑ for 20 cm'], ['movement', 'move right: 100 for 180 degrees'], ['movement', 'move ↑ for 20 cm']], bug: 2,
        saw: 'A robot csak derékszögben fordult, és oldalra ment el.', why: 'A hátraarc 180 fokos robotfordulás, ehhez 360 kerékfok kell.', fix: 'move right: 100 for 360 degrees' },
      { goal: 'Menj előre 20 cm-t!', lines: [EV, ['movement', 'set movement motors to A+C'], ['movement', 'move ↑ for 20 cm']], bug: 1,
        saw: 'Hibaüzenet: a C kapun nincs motor.', why: 'Az iskolai robotnál a kerekek motorjai az A és a B kapuban vannak. A C kapuban a színszenzor ül.', fix: 'set movement motors to A+B' },
    ],
  };
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  function bugGame() {
    const G = { round: 0, points: 0, list: [], tries: 0, done: false };
    function start() { G.round = 0; G.points = 0; G.list = shuffle(BUGS[mode]).slice(0, ROUNDS); newRound(); }
    function newRound() { G.tries = 0; G.done = false; draw(); }
    function lineHTML(l, i, cur) {
      if (mode === 'python') {
        if (l === '') return '<div style="height:12px"></div>';
        return `<button class="pyline" data-i="${i}">${esc(l)}</button>`;
      }
      const [cat, t, ind] = l;
      return `<button class="blk ${cat} bline" data-i="${i}" style="margin-left:${(ind || 0) * 22}px">${esc(t)}</button>`;
    }
    function draw() {
      const cur = G.list[G.round];
      app.innerHTML = `<style>
          .pyline { display:block; width:100%; text-align:left; background:none; border:2px solid transparent; border-radius:8px; color:#E6EDF7; font:600 16px 'JetBrains Mono',monospace; padding:4px 8px; cursor:pointer; white-space:pre; }
          .pyline:hover { border-color:#5B7DB8; }
          .pyline.bad, .bline.bad { outline:4px solid #FF5A5F; outline-offset:2px; }
          .pyline.good, .bline.good { outline:4px solid #2BB673; outline-offset:2px; }
          .bline { border:0; cursor:pointer; font:inherit; font-weight:800; }
          .bline:hover { filter:brightness(1.1); }
          .codebox { background:#14203A; border-radius:14px; padding:10px; }
          .saw { background:#FFF1D6; border-left:6px solid var(--yellow-d); border-radius:0 14px 14px 0; padding:12px 16px; font-size:18px; }
          .fixbox { background:#E8F8EF; border-radius:14px; padding:12px 16px; }
        </style>
        <div class="topline"><h1>🐞 Hibavadász</h1>
          <div class="stats"><span class="stat">${G.round + 1}. kör / ${ROUNDS}</span><span class="stat" id="pts">${G.points} pont</span>${modeSwitch()}</div></div>
        <div class="game">
          <div class="card panel">
            <p class="task"><b>A feladat:</b> ${esc(cur.goal)}</p>
            <div class="saw"><b>Mi történt?</b> ${esc(cur.saw)}</div>
            <p class="task">Kattints arra a ${mode === 'python' ? 'sorra' : 'blokkra'}, amelyikben a hiba van!</p>
            <div class="msg" id="msg" role="status"></div>
            <div id="fix"></div>
            <div style="display:flex;gap:12px"><button class="btn btn-blue" id="next" hidden>${G.round + 1 >= ROUNDS ? 'Eredmény' : 'Következő →'}</button></div>
            <a href="#" style="font-weight:800">← Vissza a játékokhoz</a>
          </div>
          <div class="card">${mode === 'python' ? `<p class="muted" style="margin:0 0 8px">A szokásos import sorok most nem látszanak.</p><div class="codebox">${cur.lines.map((l, i) => lineHTML(l, i)).join('')}</div>`
            : `<div class="bstack">${cur.lines.map((l, i) => lineHTML(l, i)).join('')}</div>`}</div>
        </div>`;
      bindMode(start);
      app.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => guess(+b.dataset.i, b));
      app.querySelector('#next').onclick = () => { G.round++; if (G.round >= ROUNDS) end(); else newRound(); };
    }
    function guess(i, el) {
      if (G.done) return;
      const cur = G.list[G.round], msg = app.querySelector('#msg');
      if (i === 0 && mode === 'blocks') { msg.className = 'msg err'; msg.textContent = 'A „when program starts” mindig jó, azzal nincs baj. Keresd tovább!'; return; }
      G.tries++;
      if (i !== cur.bug) {
        el.classList.add('bad');
        if (G.tries < 2) { msg.className = 'msg err'; msg.textContent = 'Ez a sor rendben van. Még egy próbád van!'; return; }
      }
      G.done = true;
      const pts = i === cur.bug ? (G.tries === 1 ? 2 : 1) : 0;
      G.points += pts;
      app.querySelector('#pts').textContent = G.points + ' pont';
      app.querySelector(`[data-i="${cur.bug}"]`).classList.add('good');
      msg.className = 'msg ' + (pts ? 'ok' : 'err');
      msg.textContent = pts === 2 ? 'Megvan a hiba! +2 pont' : pts === 1 ? 'Másodikra megvan! +1 pont' : 'Most nem találtad el. A zöld keretes a hibás.';
      const fixIsCode = !/^a /.test(cur.fix);
      app.querySelector('#fix').innerHTML = `<div class="fixbox"><b>Miért?</b> ${esc(cur.why)}<br><b>Javítás:</b> ${fixIsCode ? `<code style="font-size:16px">${esc(cur.fix.trim())}</code>` : esc(cur.fix) + '.'}</div>`;
      app.querySelector('#next').hidden = false;
    }
    function end() {
      const max = ROUNDS * 2;
      saveBest('hiba', G.points, max);
      app.innerHTML = `<div class="card endbox"><h1>🐞 Hibavadász</h1><div class="big">${stars(G.points, max)}</div>
        <p style="font-size:22px;margin:0"><b>${G.points}</b> pont a ${max}-ból</p>
        <p class="muted" style="margin:0">${G.points >= max * 0.9 ? 'Igazi hibavadász vagy! A pályán is így keresd a hibát: mit kellett volna csinálnia, és mit csinált?' : 'Tipp: először gondold végig, mit csinált a robot, aztán keresd azt a sort, amelyik ezt okozhatta!'}</p>
        <div style="display:flex;gap:12px"><button class="btn btn-green" id="again">Újra játszom</button><a class="btn btn-plain" href="#">Másik játék</a></div></div>`;
      app.querySelector('#again').onclick = start;
    }
    start();
  }

  // ============================================================ 4. Rakd sorba!
  // A sorok a helyes sorrendben vannak megadva; a játék megkeveri őket.
  const ORDER = {
    python: [
      { goal: 'Menj előre 20 cm-t, fordulj jobbra, aztán menj még 10 cm-t!', lines: ['robot.straight(200)', 'robot.turn(90)', 'robot.straight(100)'] },
      { goal: 'Számolj vissza 3-tól 1-ig (minden szám után várj 1 másodpercet), a végén csipogj!', lines: ['hub.display.text("3")', 'wait(1000)', 'hub.display.text("2")', 'wait(1000)', 'hub.display.text("1")', 'hub.speaker.beep()'] },
      { goal: 'Rajzolj négyzetet (minden oldalnál előbb menj, aztán fordulj), a végén csipogj!', lines: ['for i in range(4):', '    robot.straight(200)', '    robot.turn(90)', 'hub.speaker.beep()'] },
      { goal: 'Taníts meg a robotnak egy „csipog” szót (csipogjon, aztán várjon), és mondd ki kétszer!', lines: ['def csipog():', '    hub.speaker.beep(800, 100)', '    wait(200)', 'csipog()', 'csipog()'] },
      { goal: 'Kapcsold be a giroszkópot, várd meg, amíg kész, aztán fordulj 90 fokot!', lines: ['robot.use_gyro(True)', 'while not hub.imu.ready():', '    wait(10)', 'robot.turn(90)'] },
      { goal: 'Ha a színszenzor pirosat lát, csipogj magasat, különben mélyet!', lines: ['if szem.color() == Color.RED:', '    hub.speaker.beep(800, 200)', 'else:', '    hub.speaker.beep(300, 200)'] },
      { goal: 'Házi WRO: menj a kosárhoz, vedd fel (zöld fény, várj), vidd el, és tedd le (kék fény, várj)!', lines: ['robot.straight(258)', 'hub.light.on(Color.GREEN)', 'wait(1000)', 'robot.straight(370)', 'hub.light.on(Color.BLUE)', 'wait(1000)'] },
      { goal: 'Menj előre 20 cm-t, fordulj meg, és gyere vissza a rajtra!', lines: ['robot.straight(200)', 'robot.turn(180)', 'robot.straight(200)'] },
    ],
    blocks: [
      { goal: 'Menj előre 20 cm-t, fordulj jobbra, aztán menj még 10 cm-t!', lines: [['movement', 'move ↑ for 20 cm'], ['movement', 'move right: 100 for 180 degrees'], ['movement', 'move ↑ for 10 cm']] },
      { goal: 'Számolj vissza 3-tól 1-ig (minden szám után várj 1 másodpercet), a végén csipogj!', lines: [['light', 'write 3'], ['control', 'wait 1 seconds'], ['light', 'write 2'], ['control', 'wait 1 seconds'], ['light', 'write 1'], ['sound', 'play beep 72 for 0.2 seconds']] },
      { goal: 'Rajzolj négyzetet (minden oldalnál előbb menj, aztán fordulj), a végén csipogj!', lines: [['control', 'repeat 4'], ['movement', 'move ↑ for 20 cm', 1], ['movement', 'move right: 100 for 180 degrees', 1], ['sound', 'play beep 72 for 0.2 seconds']] },
      { goal: 'Előbb állítsd be a motorokat és a sebességet, aztán menj előre 20 cm-t!', lines: [['movement', 'set movement motors to A+B'], ['movement', 'set movement speed to 50 %'], ['movement', 'move ↑ for 20 cm']] },
      { goal: 'Villogj örökké: piros fény, várj fél másodpercet, kék fény, várj fél másodpercet!', lines: [['control', 'forever'], ['light', 'set Center Button light to red', 1], ['control', 'wait 0.5 seconds', 1], ['light', 'set Center Button light to blue', 1], ['control', 'wait 0.5 seconds', 1]] },
      { goal: 'Ha a színszenzor pirosat lát, csipogj magasat, különben mélyet!', lines: [['control', 'if C is color red ? then'], ['sound', 'play beep 80 for 0.2 seconds', 1], ['control', 'else'], ['sound', 'play beep 60 for 0.2 seconds', 1]] },
      { goal: 'Házi WRO: menj a kosárhoz, vedd fel (zöld fény, várj), vidd el, és tedd le (kék fény, várj)!', lines: [['movement', 'move ↑ for 25.8 cm'], ['light', 'set Center Button light to green'], ['control', 'wait 1 seconds'], ['movement', 'move ↑ for 37 cm'], ['light', 'set Center Button light to blue'], ['control', 'wait 1 seconds']] },
      { goal: 'Menj előre 20 cm-t, fordulj meg (hátraarc), és gyere vissza a rajtra!', lines: [['movement', 'move ↑ for 20 cm'], ['movement', 'move right: 100 for 360 degrees'], ['movement', 'move ↑ for 20 cm']] },
    ],
  };

  function orderGame() {
    const G = { round: 0, points: 0, list: [], placed: [], pool: [], tries: 0, done: false };
    const key = (l) => mode === 'python' ? l : l.join('|');
    function start() { G.round = 0; G.points = 0; G.list = shuffle(ORDER[mode]).slice(0, ROUNDS); newRound(); }
    function newRound() {
      const cur = G.list[G.round];
      do { G.pool = shuffle(cur.lines.map((l, i) => ({ l, i }))); } while (G.pool.every((x, k) => key(x.l) === key(cur.lines[k])));
      G.placed = []; G.tries = 0; G.done = false; G.wrongAt = -1;
      draw();
    }
    function item(x, where, k) {
      const bad = where === 'prog' && k === G.wrongAt ? ' bad' : '', good = where === 'prog' && G.done ? ' good' : '';
      if (mode === 'python') return `<button class="pyline${bad}${good}" data-w="${where}" data-k="${k}">${esc(x.l)}</button>`;
      const [cat, t, ind] = x.l;
      return `<button class="blk ${cat} bline${bad}" data-w="${where}" data-k="${k}" style="margin-left:${(where === 'prog' ? (ind || 0) * 22 : 0)}px">${esc(t)}</button>`;
    }
    function draw() {
      const cur = G.list[G.round], all = G.pool.length === 0;
      app.innerHTML = `<style>
          .pyline { display:block; width:100%; text-align:left; background:none; border:2px solid transparent; border-radius:8px; color:#E6EDF7; font:600 16px 'JetBrains Mono',monospace; padding:5px 8px; cursor:pointer; white-space:pre; }
          .pyline:hover { border-color:#5B7DB8; }
          .pyline.bad, .bline.bad { outline:4px solid #FF5A5F; outline-offset:2px; }
          .bline { border:0; cursor:pointer; font:inherit; font-weight:800; }
          .codebox { background:#14203A; border-radius:14px; padding:10px; min-height:60px; }
          .zone { display:flex; flex-direction:column; gap:3px; min-height:60px; }
          .zone .empty { color:var(--muted); font-weight:700; padding:12px; border:3px dashed var(--line); border-radius:12px; }
          .codebox .empty { color:#8FA3C4; border-color:#33476B; }
        </style>
        <div class="topline"><h1>🧩 Rakd sorba!</h1>
          <div class="stats"><span class="stat">${G.round + 1}. kör / ${ROUNDS}</span><span class="stat" id="pts">${G.points} pont</span>${modeSwitch()}</div></div>
        <div class="game">
          <div class="card panel">
            <p class="task"><b>A feladat:</b> ${esc(cur.goal)}</p>
            <p class="muted" style="margin:0">Kattints a ${mode === 'python' ? 'sorokra' : 'blokkokra'} abban a sorrendben, ahogy a programban jönnek! Ha mellényúltál, a programban lévőre kattintva visszaveheted.${mode === 'python' ? ' A behúzás már jó, csak a sorrend a kérdés.' : ''}</p>
            <div><div class="opt-title" style="font-weight:800;margin-bottom:6px">Összekevert ${mode === 'python' ? 'sorok' : 'blokkok'}:</div>
              ${mode === 'python' ? `<div class="codebox zone">${G.pool.map((x, k) => item(x, 'pool', k)).join('') || '<div class="empty">Elfogytak – nézd meg a programot!</div>'}</div>`
                : `<div class="zone">${G.pool.map((x, k) => item(x, 'pool', k)).join('') || '<div class="empty">Elfogytak – nézd meg a programot!</div>'}</div>`}</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-green" id="check" ${all && !G.done ? '' : 'disabled'}>Ellenőrzöm!</button>
              <button class="btn btn-plain" id="reset" ${G.done ? 'hidden' : ''}>Újrakezdem</button>
              <button class="btn btn-blue" id="next" ${G.done ? '' : 'hidden'}>${G.round + 1 >= ROUNDS ? 'Eredmény' : 'Következő →'}</button></div>
            <div class="msg" id="msg" role="status">${G.msg || ''}</div>
            <a href="#" style="font-weight:800">← Vissza a játékokhoz</a>
          </div>
          <div class="card"><div style="font-weight:800;margin-bottom:8px">A programod:</div>
            ${mode === 'python' ? `<div class="codebox zone">${G.placed.map((x, k) => item(x, 'prog', k)).join('') || '<div class="empty">Ide kerülnek a sorok…</div>'}</div>`
              : `<div class="zone"><div class="blk events">when program starts</div>${G.placed.map((x, k) => item(x, 'prog', k)).join('')}</div>`}
          </div>
        </div>`;
      G.msg = '';
      bindMode(start);
      app.querySelectorAll('[data-w]').forEach((b) => b.onclick = () => {
        if (G.done) return;
        const k = +b.dataset.k;
        if (b.dataset.w === 'pool') G.placed.push(G.pool.splice(k, 1)[0]);
        else G.pool.push(G.placed.splice(k, 1)[0]);
        G.wrongAt = -1; draw();
      });
      app.querySelector('#check').onclick = check;
      app.querySelector('#reset').onclick = () => { G.pool = shuffle(G.pool.concat(G.placed)); G.placed = []; G.wrongAt = -1; draw(); };
      app.querySelector('#next').onclick = () => { G.round++; if (G.round >= ROUNDS) end(); else newRound(); };
    }
    function check() {
      const cur = G.list[G.round];
      const wrong = G.placed.findIndex((x, k) => key(x.l) !== key(cur.lines[k]));
      G.tries++;
      if (wrong < 0) {
        const pts = G.tries === 1 ? 3 : G.tries === 2 ? 2 : 1;
        G.points += pts; G.done = true;
        G.msg = `<span class="ok" style="color:var(--green-d)">${G.tries === 1 ? 'Elsőre tökéletes! +3 pont' : 'Megvan! +' + pts + ' pont'}</span>`;
        return draw();
      }
      if (G.tries >= 3) {
        G.placed = cur.lines.map((l, i) => ({ l, i })); G.pool = []; G.done = true;
        G.msg = '<span style="color:var(--red-d)">Itt a helyes sorrend. Olvasd végig, és nézd meg, mi miért jön egymás után!</span>';
        return draw();
      }
      // a hibás helytől kezdve visszakerül minden a kupacba
      G.wrongAt = wrong;
      G.msg = `<span style="color:var(--red-d)">A ${wrong + 1}. ${mode === 'python' ? 'sor' : 'blokk'} nem oda való. Javítsd ki! (Még ${3 - G.tries} próbád van.)</span>`;
      draw();
    }
    function end() {
      const max = ROUNDS * 3;
      saveBest('sorba', G.points, max);
      app.innerHTML = `<div class="card endbox"><h1>🧩 Rakd sorba!</h1><div class="big">${stars(G.points, max)}</div>
        <p style="font-size:22px;margin:0"><b>${G.points}</b> pont a ${max}-ból</p>
        <p class="muted" style="margin:0">${G.points >= max * 0.9 ? 'Pontosan tudod, mi után mi jön!' : 'Tipp: a robot fentről lefelé, egyesével hajtja végre a parancsokat. Mondd végig hangosan, mit csinál!'}</p>
        <div style="display:flex;gap:12px"><button class="btn btn-green" id="again">Újra játszom</button><a class="btn btn-plain" href="#">Másik játék</a></div></div>`;
      app.querySelector('#again').onclick = start;
    }
    start();
  }

  function saveBest(key, pts, max) {
    const k = 'game.' + key + '.best', prev = K.store.get(k + 'Pts', -1);
    if (pts > prev) { K.store.set(k + 'Pts', pts); K.store.set(k, pts + ' / ' + max + ' pont'); }
  }

  function route() {
    const h = location.hash.slice(1);
    if (h === 'robot') robotGame(); else if (h === 'fok') fokGame(); else if (h === 'hiba') bugGame(); else if (h === 'sorba') orderGame(); else menu();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
