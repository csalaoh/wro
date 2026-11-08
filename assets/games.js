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
        <div class="card gcard soon"><span class="ico" style="background:#EEF0FF">🧩</span><span><h2>Rakd sorba!</h2><p>Hamarosan</p></span></div>
        <div class="card gcard soon"><span class="ico" style="background:#E8F8EF">🐞</span><span><h2>Hibavadász</h2><p>Hamarosan</p></span></div>
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

  function saveBest(key, pts, max) {
    const k = 'game.' + key + '.best', prev = K.store.get(k + 'Pts', -1);
    if (pts > prev) { K.store.set(k + 'Pts', pts); K.store.set(k, pts + ' / ' + max + ' pont'); }
  }

  function route() {
    const h = location.hash.slice(1);
    if (h === 'robot') robotGame(); else if (h === 'fok') fokGame(); else menu();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);
  route();
})();
