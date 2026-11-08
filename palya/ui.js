/*
 * Kódfejtő Műhely – virtuális pálya, felület
 * Szerkesztő, pályarajz, lejátszó, hub-panel, konzol.
 */
(function () {
  'use strict';
  const Sim = window.KodfejtoSim, RT = window.KodfejtoRuntime;
  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------ minták
  const HEAD = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\n';
  const SAMPLES = {
    square: HEAD + '# 1. Ébresztjük az agyat\nhub = PrimeHub()\n\n# 2. Névadás a motoroknak (a bal motor fordítva van beépítve)\nbal_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb_motor = Motor(Port.B)\n\n# 3. A Szuper-sofőr: kerékátmérő 56 mm, tengelytáv 112 mm\nauto = DriveBase(bal_motor, jobb_motor, wheel_diameter=56, axle_track=112)\n\nhub.display.text("GO")\nhub.speaker.beep(600, 150)\n\n# 4. A bűvös négyzet\nfor i in range(4):\n    auto.straight(200)\n    wait(200)\n    auto.turn(90)\n    wait(200)\n\nhub.display.text("V")\nhub.speaker.beep(800, 300)\n',
    gyro: HEAD + 'hub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\nrobot.settings(straight_speed=240)\nrobot.use_gyro(True)\n\n# Várunk, amíg a giroszkóp bekalibrálja magát\nwhile not hub.imu.ready():\n    wait(10)\n\nfor i in range(4):\n    robot.straight(300)\n    robot.turn(90)\n\nprint("A robot szerint:", robot.angle())\nprint("A giroszkóp szerint:", hub.imu.heading())\n',
    beep: 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nmotor = Motor(Port.A)\n\nhub.display.text("3")\nwait(1000)\nhub.speaker.beep(frequency=600, duration=200)\n\n# Figyeld meg: most csak a bal kerék forog!\nmotor.run_angle(500, 360)\n',
    color: 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction, Color\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nauto = DriveBase(bal, jobb, 56, 112)\nszem = ColorSensor(Port.C)\n\n# Menj előre, és 5 cm-enként írd ki, mit lát a színszenzor\nfor i in range(8):\n    print(i * 5, "cm:", szem.color(), szem.reflection())\n    auto.straight(50)\n',
  };

  SAMPLES.k3 = 'from pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\nrobot.settings(straight_speed=240)\n\nrobot.straight(200)\nrobot.turn(90)\n';

  SAMPLES.wro = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction, Color\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nrobot = DriveBase(Motor(Port.A, Direction.COUNTERCLOCKWISE), Motor(Port.B), 56, 112)\n\n# A bírónak szóló jelzések (házi WRO, 4.4 pont)\ndef felvesz():\n    hub.light.on(Color.GREEN)\n    hub.speaker.beep(800, 200)\n    wait(1000)\n\ndef lerak():\n    hub.light.on(Color.BLUE)\n    hub.speaker.beep(400, 200)\n    wait(1000)\n\n# Odamegyünk a jobb oldali kosárhoz (K2), és felvesszük\nrobot.turn(7.6)\nrobot.straight(258)\nfelvesz()\n\n# Most te jössz: vidd a kosarat a bal felső parcellára, és ott: lerak()\n';

  // A küldetések kiinduló programja (a Küldetések oldal „Kipróbálom a pályán” gombja: #k2-python)
  const MISSION_START = {
    k1: { python: 'beep', blocks: 'k1' },
    k2: { python: 'square', blocks: 'square', mat: 'palya2' },
    k3: { python: 'k3', blocks: 'turn' },
    k4: { python: 'gyro' },
  };

  const DEFAULT_START = {
    palya1: { x: 120, y: 120, heading: 0 },
    palya2: { x: 495, y: 110, heading: 0 },
  };

  // ------------------------------------------------------------ tárolás
  const store = {
    get(k, d) { try { const v = localStorage.getItem('kodfejto.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kodfejto.' + k, JSON.stringify(v)); } catch (e) { /* nincs tárolás */ } },
  };

  // ------------------------------------------------------------ állapot
  const state = {
    mat: store.get('mat', 'palya1'),
    starts: Object.assign({}, DEFAULT_START, store.get('starts', {})),
    pyodide: null, shim: null,
    images: {}, pixels: {},
    result: null, ghost: null,
    play: null, pose: null,
    tape: [], tapeFromRobot: false, ang: null, aim: null, dragging: false,
    audio: null,
    wro: null, // házi WRO küldetés állapota (ha be van kapcsolva)
    mode: store.get('mode', store.get('group', '') === 'blokk3' ? 'blocks' : 'python'), ws: null, lastBlock: null,
  };

  // ------------------------------------------------------------ szerkesztő
  const ta = $('code'), hl = $('hl'), gutter = $('gutter');
  const KW = new Set(['from', 'import', 'for', 'in', 'while', 'if', 'elif', 'else', 'def', 'return', 'and', 'or', 'not', 'True', 'False', 'None', 'break', 'continue', 'pass', 'class', 'try', 'except', 'as', 'is', 'lambda', 'with', 'global']);
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function highlight(src) {
    const re = /(#[^\n]*)|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g;
    let out = '', m;
    while ((m = re.exec(src))) {
      if (m[1]) out += '<span class="tk-com">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="tk-str">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="tk-num">' + m[3] + '</span>';
      else if (m[4]) out += KW.has(m[4]) ? '<span class="tk-kw">' + m[4] + '</span>' : (/^[A-Z]/.test(m[4]) ? '<span class="tk-name">' + m[4] + '</span>' : m[4]);
      else out += esc(m[5]);
    }
    return out + '\n';
  }
  let errLine = 0;
  function refreshEditor() {
    hl.innerHTML = highlight(ta.value);
    const n = ta.value.split('\n').length;
    let g = '';
    for (let i = 1; i <= n; i++) g += '<div' + (i === errLine ? ' class="err"' : '') + '>' + i + '</div>';
    gutter.innerHTML = g;
    syncScroll();
  }
  function syncScroll() { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; gutter.scrollTop = ta.scrollTop; }
  ta.addEventListener('input', () => { errLine = 0; refreshEditor(); store.set('code', ta.value); });
  ta.addEventListener('scroll', syncScroll);
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.value = ta.value.slice(0, s) + '    ' + ta.value.slice(en);
      ta.selectionStart = ta.selectionEnd = s + 4;
      ta.dispatchEvent(new Event('input'));
    } else if (e.key === 'Enter') {
      // az új sor megtartja az előző sor behúzását, kettőspont után beljebb kezd
      e.preventDefault();
      const s = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf('\n', s - 1) + 1;
      const line = ta.value.slice(lineStart, s);
      let indent = (line.match(/^ */) || [''])[0];
      if (/:\s*$/.test(line)) indent += '    ';
      ta.value = ta.value.slice(0, s) + '\n' + indent + ta.value.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = s + 1 + indent.length;
      ta.dispatchEvent(new Event('input'));
    }
  });
  const PY_SAMPLE_LABELS = { square: 'Bűvös négyzet (2. óra)', gyro: 'Négyzet giroszkóppal', beep: 'Első csipogás (1. óra)', color: 'Mit lát a színszenzor?', wro: 'Házi WRO: felvesz és lerak' };
  function fillSamples() {
    const sel = $('sampleSel');
    const list = state.mode === 'blocks'
      ? Object.entries(window.KodfejtoBlocks.SAMPLES).map(([k, v]) => [k, v.label])
      : Object.entries(PY_SAMPLE_LABELS);
    sel.innerHTML = '';
    const first = document.createElement('option'); first.value = ''; first.textContent = 'Minta betöltése…'; sel.appendChild(first);
    list.forEach(([k, label]) => { const o = document.createElement('option'); o.value = k; o.textContent = label; sel.appendChild(o); });
  }
  $('sampleSel').addEventListener('change', (e) => {
    const k = e.target.value;
    if (!k) return;
    if (state.mode === 'blocks') {
      if (state.ws.getAllBlocks(false).length) log('A minta lecserélte a blokkokat. A Ctrl+Z visszahozza a régieket.', 'c-muted');
      Blockly.Events.setGroup(true);
      state.ws.clear();
      Blockly.serialization.workspaces.load(window.KodfejtoBlocks.SAMPLES[k].ws, state.ws);
      Blockly.Events.setGroup(false);
    } else {
      // A mintát "beírjuk", így Ctrl+Z-vel visszahozható a korábbi program.
      if (ta.value.trim()) log('A minta lecserélte a programodat. A Ctrl+Z visszahozza a régit.', 'c-muted');
      ta.focus();
      ta.select();
      document.execCommand && document.execCommand('insertText', false, SAMPLES[k]);
      if (ta.value !== SAMPLES[k]) ta.value = SAMPLES[k];
      errLine = 0; refreshEditor(); store.set('code', ta.value);
    }
    e.target.value = '';
  });

  // ------------------------------------------------------------ blokkos mód
  function ensureBlockly() {
    if (state.ws) return;
    Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE = 'define';
    Blockly.Msg.PROCEDURES_DEFNORETURN_PROCEDURE = 'saját_blokk';
    state.ws = Blockly.inject('blocklyDiv', {
      toolbox: window.KodfejtoBlocks.toolbox,
      renderer: 'zelos',
      // Külső képeket és hangokat az oldal nem tölthet be, ezért ezek nélkül megy:
      // nagyítás Ctrl+görgővel, törlés a blokk eszköztárba húzásával.
      trashcan: false,
      sounds: false,
      media: '',
      zoom: { controls: false, wheel: true, startScale: 0.75, maxScale: 1.6, minScale: 0.4 },
      grid: { spacing: 24, length: 2, colour: '#DCE6F5', snap: false },
      move: { scrollbars: true, drag: true, wheel: false },
      theme: Blockly.Theme.defineTheme('kodfejto', { base: Blockly.Themes.Zelos, fontStyle: { family: 'Nunito, sans-serif', weight: '700', size: 12 } }),
    });
    const saved = store.get('blocks', null);
    try {
      Blockly.serialization.workspaces.load(saved || window.KodfejtoBlocks.SAMPLES.fwd.ws, state.ws);
    } catch (e) {
      Blockly.serialization.workspaces.load(window.KodfejtoBlocks.SAMPLES.fwd.ws, state.ws);
    }
    state.ws.addChangeListener((ev) => {
      if (ev.isUiEvent) return;
      store.set('blocks', Blockly.serialization.workspaces.save(state.ws));
    });
  }
  function setMode(mode) {
    state.mode = mode; store.set('mode', mode);
    $('tabPy').classList.toggle('on', mode === 'python');
    $('tabBlk').classList.toggle('on', mode === 'blocks');
    $('pyEditor').hidden = mode === 'blocks';
    $('blocklyDiv').hidden = mode !== 'blocks';
    if (mode === 'blocks') { ensureBlockly(); Blockly.svgResize(state.ws); }
    fillSamples();
  }
  $('tabPy').addEventListener('click', () => { stopPlayback(false); setMode('python'); });
  $('tabBlk').addEventListener('click', () => { stopPlayback(false); setMode('blocks'); });
  window.addEventListener('resize', () => { if (state.ws && state.mode === 'blocks') Blockly.svgResize(state.ws); });
  function markBlock(id) { if (state.ws) { try { state.ws.highlightBlock(id); } catch (e) { /* törölt blokk */ } } }


  // ------------------------------------------------------------ konzol, hub
  const con = $('console');
  function log(text, cls) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = text;
    con.appendChild(d);
    con.scrollTop = con.scrollHeight;
  }
  const matrix = $('matrix');
  for (let i = 0; i < 25; i++) { const d = document.createElement('div'); d.className = 'px'; matrix.appendChild(d); }
  function showPixels(p) {
    const cells = matrix.children;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
      const b = (p[r] && p[r][c]) || 0;
      cells[r * 5 + c].style.background = b > 0 ? `rgba(255, 201, 60, ${0.25 + 0.75 * b / 100})` : '#33415C';
    }
  }
  function setPixel(r, c, b) {
    const cell = matrix.children[r * 5 + c];
    if (cell) cell.style.background = b > 0 ? `rgba(255, 201, 60, ${0.25 + 0.75 * b / 100})` : '#33415C';
  }
  const LIGHTS = { NONE: '#E4ECF7', WHITE: '#FFFFFF', RED: '#FF5A5F', ORANGE: '#FF9F43', YELLOW: '#FFC93C', GREEN: '#2BB673', CYAN: '#33D1E0', BLUE: '#2F6FED', VIOLET: '#8A5CF6', MAGENTA: '#E0459B', BROWN: '#8A6A3A', GRAY: '#A0AEC0', BLACK: '#1D2B44' };
  function setLight(name) { $('btnlight').style.background = LIGHTS[name] || LIGHTS.WHITE; }
  function resetHub() { showPixels([]); setLight('NONE'); $('speaker').textContent = ''; }

  function beep(freq, durMs) {
    $('speaker').textContent = '♪ ' + Math.round(freq) + ' Hz';
    setTimeout(() => { $('speaker').textContent = ''; }, Math.max(150, durMs));
    try {
      const ac = state.audio;
      if (!ac) return;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square'; o.frequency.value = freq;
      g.gain.value = 0.05;
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + durMs / 1000);
    } catch (e) { /* nincs hang */ }
  }

  // Gyerekbarát magyarázat a gyakori hibákhoz
  function hintFor(err) {
    if (/ENODEV/.test(err)) return 'Ezen a porton nincs ilyen eszköz. Az iskolai robotnál: A = bal motor, B = jobb motor, C = színszenzor, D = távolságérzékelő.';
    if (/expected ':'/.test(err)) return 'Hiányzik egy kettőspont (:) a sor végéről. A for, while, if és def sorok kettősponttal végződnek.';
    if (/IndentationError|unindent|expected an indented block/.test(err)) return 'A behúzással van baj: a ciklus belsejében minden sor ugyanannyival (4 szóközzel) beljebb kezdődjön.';
    if (/NameError/.test(err)) return 'A robot nem ismeri ezt a nevet. Elírtad, vagy kis- és nagybetűt kevertél (PrimeHub, Motor, Port, DriveBase), vagy kimaradt egy import?';
    if (/was never closed|unmatched|EOF/.test(err)) return 'Valahol hiányzik egy zárójel vagy idézőjel.';
    if (/SyntaxError/.test(err)) return 'A robot nem érti ezt a sort. Nézd meg a zárójeleket, vesszőket és idézőjeleket!';
    if (/TypeError/.test(err)) return 'Egy parancs nem azt kapta a zárójelben, amit vár. Nézd meg a kódszótárban, mi kell bele!';
    if (/túl sokáig fut/.test(err)) return 'Tegyél wait()-et vagy mozgást a ciklusba.';
    return '';
  }

  // ------------------------------------------------------------ pálya
  const canvas = $('mat'), ctx = canvas.getContext('2d');
  function matInfo() { return Sim.MATS[state.mat]; }
  function scale() { return canvas.width / matInfo().width; }
  function fitCanvas() {
    const m = matInfo();
    const maxW = 640, maxH = 640;
    const s = Math.min(maxW / m.width, maxH / m.height);
    canvas.width = Math.round(m.width * s);
    canvas.height = Math.round(m.height * s);
  }
  function toPx(x, y) { const s = scale(); return [x * s, (matInfo().height - y) * s]; }
  function toMm(px, py) { const s = scale(); return [px / s, matInfo().height - py / s]; }

  function loadImage(key) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        try { state.pixels[key] = g.getImageData(0, 0, img.width, img.height); } catch (e) { state.pixels[key] = null; }
        state.images[key] = img;
        resolve();
      };
      img.onerror = reject;
      img.src = key + '.png';
    });
  }
  // A színszenzor egy kb. 8 mm-es foltot lát: 5×5 pontot átlagolunk.
  function sampler(x, y) {
    const data = state.pixels[state.mat];
    const m = matInfo();
    if (!data) return [255, 255, 255];
    let r = 0, g = 0, b = 0, n = 0;
    for (let dx = -4; dx <= 4; dx += 2) for (let dy = -4; dy <= 4; dy += 2) {
      const px = Math.round(x + dx), py = Math.round(m.height - (y + dy));
      if (px < 0 || py < 0 || px >= data.width || py >= data.height) continue;
      const i = (py * data.width + px) * 4;
      r += data.data[i]; g += data.data[i + 1]; b += data.data[i + 2]; n++;
    }
    return n ? [r / n, g / n, b / n] : [255, 255, 255];
  }

  function drawPath(frames, uptoT, color, dashed) {
    if (!frames || frames.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (dashed) ctx.setLineDash([7, 6]);
    ctx.beginPath();
    let first = true;
    for (const f of frames) {
      if (f.t > uptoT) break;
      const [px, py] = toPx(f.x, f.y);
      if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawRobot(pose, alpha) {
    const R = Sim.ROBOT_DEFAULT, s = scale();
    const [px, py] = toPx(pose.x, pose.y);
    ctx.save();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.translate(px, py);
    ctx.rotate(pose.heading * Math.PI / 180);
    const w = R.bodyWidth * s, f = R.bodyFront * s, b = R.bodyRear * s;
    const ww = R.wheelWidth * s, wr = R.wheelDiameter / 2 * s, at = R.axleTrack / 2 * s;
    // kerekek
    ctx.fillStyle = '#1D2B44';
    ctx.fillRect(-at - ww / 2, -wr, ww, wr * 2);
    ctx.fillRect(at - ww / 2, -wr, ww, wr * 2);
    // test
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.strokeStyle = '#1D2B44'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-w / 2 + ww, -f, w - 2 * ww, f + b, 6) : ctx.rect(-w / 2 + ww, -f, w - 2 * ww, f + b);
    ctx.fill(); ctx.stroke();
    // hub
    ctx.fillStyle = '#FFC93C';
    ctx.fillRect(-22 * s, -10 * s, 44 * s, 56 * s);
    ctx.strokeRect(-22 * s, -10 * s, 44 * s, 56 * s);
    // színszenzor (lila) és távolságérzékelő (türkiz)
    ctx.fillStyle = '#8A5CF6';
    ctx.fillRect((R.colorSensor.side - 7) * s, -(R.colorSensor.forward + 7) * s, 14 * s, 14 * s);
    ctx.fillStyle = '#18A3B8';
    ctx.fillRect(-18 * s, -(R.distanceSensor.forward + 5) * s, 36 * s, 8 * s);
    // mutató
    ctx.strokeStyle = '#FF5A5F'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -f); ctx.lineTo(0, -R.pointer * s); ctx.stroke();
    ctx.fillStyle = '#FF5A5F';
    ctx.beginPath(); ctx.arc(0, -R.pointer * s, 3.5, 0, Math.PI * 2); ctx.fill();
    // tengely közepe
    ctx.fillStyle = '#FF5A5F';
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawTape() {
    if ($('toolSel').value !== 'tape' || state.tape.length === 0) return;
    ctx.save();
    ctx.strokeStyle = '#E0459B'; ctx.fillStyle = '#E0459B'; ctx.lineWidth = 2.5;
    const pts = state.tape.map((p) => toPx(p[0], p[1]));
    pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); });
    if (pts.length === 2) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.stroke();
      const d = Math.hypot(state.tape[1][0] - state.tape[0][0], state.tape[1][1] - state.tape[0][1]);
      const warn = tapeWarning();
      const label = (d / 10).toFixed(1).replace('.', ',') + ' cm' + (warn && warn.bad ? ' ⚠' : '');
      if (warn && warn.bad) { ctx.strokeStyle = '#C9393E'; ctx.setLineDash([8, 6]); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(pts[1][0], pts[1][1]); ctx.stroke(); ctx.setLineDash([]); }
      const mx = (pts[0][0] + pts[1][0]) / 2, my = (pts[0][1] + pts[1][1]) / 2;
      ctx.font = '800 14px Nunito, sans-serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#fff'; ctx.fillRect(mx - tw / 2 - 6, my - 22, tw + 12, 20);
      ctx.fillStyle = warn && warn.bad ? '#C9393E' : '#E0459B'; ctx.fillText(label, mx - tw / 2, my - 7);
    }
    ctx.restore();
  }

  // A robot eleje (a mutató vége) a mostani helyzetben
  function robotTip() {
    const p = state.pose || state.starts[state.mat];
    const P = Sim.ROBOT_DEFAULT.pointer, h = p.heading * Math.PI / 180;
    return [p.x + Math.sin(h) * P, p.y + Math.cos(h) * P];
  }
  // Ha a robot elejétől mérünk, de a robot még nem a cél felé néz, figyelmeztetünk:
  // fordulás közben az eleje elmozdul, így a lemért távolság nem lesz jó.
  function tapeWarning() {
    if (!state.tapeFromRobot || state.tape.length < 2) return null;
    const p = state.pose || state.starts[state.mat];
    const tgt = state.tape[1];
    const off = norm180(bearing([p.x, p.y], tgt) - p.heading);
    const d = Math.hypot(tgt[0] - state.tape[0][0], tgt[1] - state.tape[0][1]);
    if (Math.abs(off) <= 1) {
      return { bad: false, text: 'A robot a cél felé néz: ha ' + fmt(d / 10, 1) + ' cm-t megy előre, az eleje a célba ér.' };
    }
    return {
      bad: true,
      text: 'Vigyázz! A robot még ' + fmt(Math.abs(off), 1) + '°-kal el van fordulva a céltól. Fordulás közben az eleje elmozdul, ezért ez a távolság nem lesz jó. Fordulj előbb, és utána mérj, vagy használd a célzást.',
    };
  }

  // Irányszög (fok) a-ból b felé: 0° = a pálya teteje, jobbra nő (mint a robot iránya).
  function bearing(a, b) { return Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI; }
  function norm180(d) { d = ((d % 360) + 360) % 360; return d > 180 ? d - 360 : d; }

  // Szögmérő: egy félkör alakú, átlátszó szögmérő a szög csúcsán, az első szárhoz
  // igazítva, beosztással 0–180°-ig, a mért szög kiemelve.
  function drawProtractor() {
    const a = state.ang;
    const tl = $('toolSel').value;
    if ((tl !== 'angle' && tl !== 'aim') || !a) return;
    const s = scale(), R = 150 * s;
    const [cx, cy] = toPx(a.c[0], a.c[1]);
    const toCanvas = (h) => (h - 90) * Math.PI / 180; // irányszög → vászonszög
    ctx.save();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#8A5CF6'; ctx.fillStyle = '#8A5CF6';
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    if (a.b1 == null) { ctx.restore(); return; }
    const d = a.b2 == null ? 0 : norm180(a.b2 - a.b1);
    const side = d < 0 ? -1 : 1;           // a szögmérő a második szár felé nyílik
    const a0 = toCanvas(a.b1);
    // a szögmérő teste
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, a0, a0 + side * Math.PI, side < 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.fill();
    ctx.strokeStyle = 'rgba(138,92,246,0.9)'; ctx.lineWidth = 1.5; ctx.stroke();
    // beosztás
    ctx.fillStyle = '#5B3FC4'; ctx.font = '700 11px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let k = 0; k <= 180; k += 5) {
      const ang = a0 + side * k * Math.PI / 180;
      const len = k % 30 === 0 ? 14 : (k % 10 === 0 ? 9 : 5);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      ctx.lineTo(cx + Math.cos(ang) * (R - len), cy + Math.sin(ang) * (R - len));
      ctx.stroke();
      if (k % 30 === 0) ctx.fillText(String(k), cx + Math.cos(ang) * (R - 24), cy + Math.sin(ang) * (R - 24));
    }
    // szárak
    ctx.strokeStyle = '#8A5CF6'; ctx.lineWidth = 2.5;
    const arm = (h, dash) => {
      ctx.save(); if (dash) ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(toCanvas(h)) * R * 1.25, cy + Math.sin(toCanvas(h)) * R * 1.25);
      ctx.stroke(); ctx.restore();
    };
    arm(a.b1, !!a.robot);
    if (a.b2 != null) {
      arm(a.b2, false);
      // a mért szög íve
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.45, a0, a0 + d * Math.PI / 180, d < 0);
      ctx.closePath(); ctx.fillStyle = 'rgba(138,92,246,0.28)'; ctx.fill();
      const label = fmt(Math.abs(d), 1) + '°' + (Math.abs(d) < 0.05 ? '' : (d > 0 ? ' jobbra' : ' balra'));
      const mid = a0 + d * Math.PI / 360;
      const lx = cx + Math.cos(mid) * R * 0.7, ly = cy + Math.sin(mid) * R * 0.7;
      ctx.font = '800 15px Nunito, sans-serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#fff'; ctx.fillRect(lx - tw / 2 - 6, ly - 11, tw + 12, 22);
      ctx.fillStyle = '#5B3FC4'; ctx.fillText(label, lx, ly + 1);
    }
    ctx.restore();
  }

  // A célzás rajza: célkereszt, a robot útja és a robot szellemképe a végén.
  function drawAim() {
    if ($('toolSel').value !== 'aim') return;
    const d = aimData();
    if (!d) return;
    const s = scale(), P = Sim.ROBOT_DEFAULT.pointer * s;
    const [tx, ty] = toPx(state.aim[0], state.aim[1]);
    const [cx, cy] = toPx(d.c[0], d.c[1]);
    const [ax, ay] = toPx(d.tipAfter[0], d.tipAfter[1]);
    const toCanvas = (h) => (h - 90) * Math.PI / 180;
    ctx.save();
    ctx.strokeStyle = '#E0459B'; ctx.fillStyle = '#E0459B'; ctx.lineWidth = 2.5;
    // 1. a robot eleje fordulás közben ezen az íven mozog
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, P, toCanvas(d.heading), toCanvas(d.heading + d.turn), d.turn < 0);
    ctx.stroke();
    // 2. fordulás után innen indul egyenesen a célig
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(ax, ay, 4, 0, Math.PI * 2); ctx.fill();
    // célkereszt
    ctx.beginPath(); ctx.arc(tx, ty, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 14, ty); ctx.lineTo(tx + 14, ty); ctx.moveTo(tx, ty - 14); ctx.lineTo(tx, ty + 14); ctx.stroke();
    // a megtett út felirata a vonal közepén
    if (Math.abs(d.travel) >= 5) {
      const label = (d.travel > 0 ? '' : 'tolass ') + fmt(Math.abs(d.travel) / 10, 1) + ' cm';
      const mx = (ax + tx) / 2, my = (ay + ty) / 2;
      ctx.font = '800 14px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = '#fff'; ctx.fillRect(mx - tw / 2 - 6, my - 11, tw + 12, 22);
      ctx.fillStyle = '#E0459B'; ctx.fillText(label, mx, my + 1);
    }
    ctx.restore();
    // 3. így állna a robot a végén: az eleje a célon
    const h = d.b * Math.PI / 180;
    drawRobot({ x: state.aim[0] - Math.sin(h) * Sim.ROBOT_DEFAULT.pointer, y: state.aim[1] - Math.cos(h) * Sim.ROBOT_DEFAULT.pointer, heading: d.b }, 0.35);
  }

  function render() {
    if (state.aim && $('toolSel').value === 'aim') updateAim();
    // a robot elejéhez kötött mérőszalag együtt mozog a robottal
    if (state.tapeFromRobot && state.tape.length) state.tape[0] = robotTip();
    if ($('toolSel').value === 'tape' && state.tape.length === 2 && state.tapeFromRobot) updateToolHint();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = state.images[state.mat];
    if (img) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    if ($('optGhost').checked && state.ghost && state.ghost.mat === state.mat) {
      drawPath(state.ghost.frames, Infinity, 'rgba(85,101,127,0.75)', true);
      drawRobot(state.ghost.final, 0.3);
    }
    const playT = state.play ? state.play.t : (state.result ? Infinity : -1);
    if ($('optTrail').checked && state.result && state.result.mat === state.mat) drawPath(state.result.frames, playT, '#2F6FED', false);
    const pose = state.pose || state.starts[state.mat];
    drawWro(pose);
    drawRobot(pose, 1);
    drawTape();
    drawProtractor();
    drawAim();
    updateTele(pose, state.play ? state.play.t : null);
  }

  function fmt(v, d) { return v.toFixed(d).replace('.', ','); }
  function updateTele(p, t) {
    // a műszerfal a robot ELEJÉNEK (a mutató végének) helyét mutatja
    const P = Sim.ROBOT_DEFAULT.pointer, hr = p.heading * Math.PI / 180;
    $('tx').textContent = fmt((p.x + Math.sin(hr) * P) / 10, 1) + ' cm';
    $('ty').textContent = fmt((p.y + Math.cos(hr) * P) / 10, 1) + ' cm';
    const h = ((p.heading % 360) + 360) % 360;
    $('th').textContent = fmt(h, 1) + '°';
    $('tt').textContent = t == null ? '–' : fmt(t / 1000, 1) + ' mp';
  }

  // ------------------------------------------------------------ rajthelyzet, mérőszalag
  function eventMm(e) {
    const r = canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) * canvas.width / r.width;
    const py = (e.clientY - r.top) * canvas.height / r.height;
    return toMm(px, py);
  }
  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = eventMm(e);
    const tool = $('toolSel').value;
    if (tool === 'tape') {
      if (state.tape.length >= 2) { state.tape = []; state.tapeFromRobot = false; }
      let pt = [x, y];
      // Az első pont rácsúszik a robot elejére (a piros jelre), ha a közelébe kattintasz.
      if (state.tape.length === 0) {
        const tip = robotTip();
        state.tapeFromRobot = Math.hypot(x - tip[0], y - tip[1]) < 30;
        if (state.tapeFromRobot) pt = tip;
      }
      state.tape.push(pt);
      updateToolHint();
      render();
      return;
    }
    if (tool === 'aim') {
      state.aim = [x, y];
      updateAim();
      render();
      return;
    }
    if (tool === 'angle') {
      // 1. kattintás: a szög csúcsa, 2.: az első szár, 3.: a második szár
      const a = state.ang;
      if (!a || a.b2 != null) state.ang = { c: [x, y], b1: null, b2: null };
      else if (a.b1 == null) a.b1 = bearing(a.c, [x, y]);
      else a.b2 = bearing(a.c, [x, y]);
      updateToolHint();
      render();
      return;
    }
    if (state.play) return;
    const st = state.starts[state.mat];
    if (Math.hypot(x - st.x, y - st.y) < 110) {
      state.dragging = { dx: st.x - x, dy: st.y - y };
      state.pose = null; state.result = null;
      canvas.setPointerCapture(e.pointerId);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!state.dragging) return;
    const [x, y] = eventMm(e);
    const st = state.starts[state.mat];
    st.x = x + state.dragging.dx; st.y = y + state.dragging.dy;
    render();
  });
  canvas.addEventListener('pointerup', () => {
    if (!state.dragging) return;
    state.dragging = false;
    const st = state.starts[state.mat];
    st.x = Math.round(st.x); st.y = Math.round(st.y);
    store.set('starts', state.starts);
    render();
  });
  document.querySelectorAll('[data-rot]').forEach((b) => b.addEventListener('click', () => {
    if (state.play) return;
    const st = state.starts[state.mat];
    st.heading = (((st.heading + Number(b.dataset.rot)) % 360) + 360) % 360;
    state.pose = null; state.result = null;
    store.set('starts', state.starts);
    render();
  }));
  ['optTrail', 'optGhost'].forEach((id) => $(id).addEventListener('change', render));
  function updateToolHint() {
    const tool = $('toolSel').value, h = $('toolHint');
    $('robotAngleBtn').hidden = tool !== 'angle';
    if (tool === 'tape') {
      const w = tapeWarning();
      h.style.color = w && w.bad ? '#C9393E' : '';
      if (w) h.textContent = w.text;
      else h.textContent = 'Kattints a pályán két pontra: kiírja a távolságukat. Ha a robot elejétől mérsz, kattints a piros jel közelébe.';
    }
    else if (tool === 'angle') {
      const a = state.ang;
      if (!a || a.b2 != null) h.textContent = 'Kattints a szög csúcsára, aztán az egyik, majd a másik szárára.';
      else if (a.b1 == null) h.textContent = 'Most kattints az első szárra.';
      else h.textContent = 'Most kattints a második szárra.';
    } else if (tool === 'aim') {
      h.style.color = '';
      if (!state.aim) h.textContent = 'Kattints oda, ahová a robotnak el kell jutnia. Megmutatja, mennyit forduljon és mennyit menjen.';
    } else h.textContent = '';
  }
  // Célzás: a robot mostani helyzetéből mennyit forduljon, és mennyit menjen,
  // hogy a cél felé nézzen, majd odaérjen (a tengely közepével vagy a mutatóval).
  // A robot a két kereke közti pont (a tengely közepe) körül fordul, ezért a
  // fordulás szöge onnan számít. A távolságot viszont a robot ELEJÉTŐL (a mutató
  // végétől, a piros jeltől) mérjük, mert az eleje viszi a karokat, fogókat.
  function aimData() {
    if (!state.aim) return null;
    const p = state.pose || state.starts[state.mat];
    const P = Sim.ROBOT_DEFAULT.pointer;
    const c = [p.x, p.y];
    const b = bearing(c, state.aim);
    const turn = norm180(b - p.heading);
    const dist = Math.hypot(state.aim[0] - c[0], state.aim[1] - c[1]);
    const hb = b * Math.PI / 180, hp = p.heading * Math.PI / 180;
    return {
      c, heading: p.heading, b, turn, dist,
      travel: dist - P,                                         // ennyit menjen az eleje
      tipNow: [c[0] + Math.sin(hp) * P, c[1] + Math.cos(hp) * P], // az eleje most
      tipAfter: [c[0] + Math.sin(hb) * P, c[1] + Math.cos(hb) * P], // az eleje fordulás után
    };
  }
  function updateAim() {
    const d = aimData();
    if (!d) { updateToolHint(); return; }
    state.ang = { c: d.c, b1: d.heading, b2: d.b, robot: true };
    const dir = Math.abs(d.turn) < 0.05 ? '' : (d.turn > 0 ? ' jobbra' : ' balra');
    let t = 'Fordulj ' + fmt(Math.abs(d.turn), 1) + '°-ot' + dir;
    if (Math.abs(d.travel) < 5) t += '. A robot eleje ezzel már a célnál van.';
    else if (d.travel > 0) t += ', aztán menj előre ' + fmt(d.travel / 10, 1) + ' cm-t: a robot eleje (a piros jel) pont a célba ér.';
    else t += ', aztán tolass ' + fmt(-d.travel / 10, 1) + ' cm-t: a cél közelebb van, mint a robot eleje.';
    $('toolHint').textContent = t;
  }
  $('toolSel').addEventListener('change', () => { state.tape = []; state.tapeFromRobot = false; state.ang = null; state.aim = null; updateToolHint(); render(); });
  // Szögmérő a robotra: a csúcs a tengely közepe, az első szár a rajtirány,
  // a második a robot mostani iránya. Így látszik, mennyit fordult.
  $('robotAngleBtn').addEventListener('click', () => {
    const st = state.starts[state.mat];
    const p = state.pose || st;
    state.ang = { c: [p.x, p.y], b1: st.heading, b2: p.heading, robot: true };
    updateToolHint();
    render();
  });

  $('matSel').addEventListener('change', (e) => {
    stopPlayback(false);
    const v = e.target.value;
    setWro(v === 'wro1');
    state.mat = v === 'wro1' ? 'palya1' : v; store.set('mat', state.mat);
    state.pose = null; state.result = null; state.ghost = null; state.tape = []; state.ang = null;
    fitCanvas(); render();
  });

  // ------------------------------------------------------------ házi WRO: Ébred a farm
  const J = window.KodfejtoJudge;
  const CROP_COLORS = { RED: '#E8343C', YELLOW: '#FFD400', BLACK: '#1D2B44' };
  function setWro(on) {
    store.set('wro', !!on);
    $('wroPanel').hidden = !on;
    if (on) newDraw(store.get('wroOrder', null)); else state.wro = null;
  }
  function newDraw(order) {
    order = order || J.draw();
    store.set('wroOrder', order);
    state.wro = { order, cards: J.initialCards(order), judge: null, ti: 0, hits: {} };
    $('wroOrder').innerHTML = order.map((c, i) => `<span class="crop" style="background:${CROP_COLORS[c]}" title="${i + 1}. ${J.CROP_NAMES[c]}"></span>`).join('');
    $('wroOrderTxt').textContent = 'Fentről lefelé: ' + order.map((c) => J.CROP_NAMES[c]).join(', ');
    $('wroScore').textContent = '';
    $('wroSheetBtn').hidden = true;
  }
  function resetWroCards() { if (state.wro) { state.wro.cards = J.initialCards(state.wro.order); state.wro.ti = 0; state.wro.hits = {}; } }
  $('wroDrawBtn').addEventListener('click', () => { stopPlayback(false); state.pose = null; state.result = null; newDraw(); render(); log('🎲 Új sorsolás: ' + state.wro.order.map((c) => J.CROP_NAMES[c]).join(', ') + ' (fentről lefelé).', 'c-hint'); });
  $('optZones').addEventListener('change', render);
  $('wroSheetBtn').addEventListener('click', showSheet);
  $('sheetClose').addEventListener('click', () => $('sheetDlg').close());

  // a bírói idővonal lejátszása (felvesz, lerak, ütközés)
  function applyJudge(t) {
    const w = state.wro;
    if (!w || !w.judge) return;
    while (w.ti < w.judge.timeline.length && w.judge.timeline[w.ti].t <= t) {
      const e = w.judge.timeline[w.ti++];
      log('⚖ ' + e.text, e.type === 'hit' || e.type === 'note' ? 'c-err' : 'c-hint');
      const k = e.id && w.cards.find((c) => c.id === e.id);
      if (e.type === 'pick' && k) k.carried = true;
      if (e.type === 'drop' && k) { k.carried = false; k.x = e.x; k.y = e.y; }
      if (e.type === 'hit') w.hits[e.id] = true;
    }
  }

  function drawWro(pose) {
    const w = state.wro;
    if (!w) return;
    const s = scale();
    const rectPx = (z) => { const [x0, y0] = toPx(z.x0, z.y1); return [x0, y0, (z.x1 - z.x0) * s, (z.y1 - z.y0) * s]; };
    ctx.save();
    if ($('optZones').checked) {
      ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      const zs = [['parcelLeft', '#8A5CF6'], ['parcelMid', '#8A5CF6'], ['shop', '#18A3B8'], ['market', '#FF9F43'], ['red', '#E8343C'], ['black', '#1D2B44'], ['yellow', '#B8860B']];
      zs.forEach(([k, c]) => { ctx.strokeStyle = c; J.ZONES[k].forEach((z) => ctx.strokeRect(...rectPx(z))); });
      ctx.strokeStyle = '#ffffff'; ctx.strokeRect(...rectPx(J.ZONES.start));
      ctx.setLineDash([]);
    }
    // védett elemek
    J.PROTECTED.forEach((p) => {
      const [x, y, ww, hh] = rectPx(p.zone);
      ctx.fillStyle = w.hits[p.id] ? '#FF5A5F' : '#8A94A6';
      ctx.strokeStyle = '#1D2B44'; ctx.lineWidth = 1.5;
      ctx.fillRect(x, y, ww, hh); ctx.strokeRect(x, y, ww, hh);
      if (w.hits[p.id]) { ctx.fillStyle = '#fff'; ctx.font = '800 12px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', x + ww / 2, y + hh / 2); }
    });
    // kártyák (a robotnál lévők a mutató mellett, kicsiben)
    const tip = (() => { const h = pose.heading * Math.PI / 180, P = Sim.ROBOT_DEFAULT.pointer; return [pose.x + Math.sin(h) * P, pose.y + Math.cos(h) * P]; })();
    let carriedN = 0;
    w.cards.forEach((k) => {
      let cx = k.x, cy = k.y, size = J.CARD;
      if (k.carried) { cx = tip[0] + 18 + carriedN * 30; cy = tip[1] + 18; size = 26; carriedN++; }
      const [px, py] = toPx(cx, cy), half = size * s / 2;
      ctx.fillStyle = k.color; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.fillRect(px - half, py - half, half * 2, half * 2); ctx.strokeRect(px - half, py - half, half * 2, half * 2);
      ctx.fillStyle = k.color === '#FFD400' ? '#1D2B44' : '#ffffff';
      ctx.font = `800 ${Math.max(9, Math.round(13 * size / J.CARD))}px Nunito, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(k.label, px, py + 1);
    });
    ctx.restore();
  }

  function showSheet() {
    const j = state.wro && state.wro.judge;
    if (!j) return;
    const titles = { 1: '1. Kosarak a parcellákra', 2: '2. A piac előkészítése', 3: '3. Termények a helyükre', 4: '4. Bónusz pontok' };
    let html = '';
    [1, 2, 3, 4].forEach((t) => {
      html += `<tr class="sec"><td colspan="2">${titles[t]}</td></tr>`;
      j.score.lines.filter((l) => l.task === t).forEach((l) => { html += `<tr><td>${l.text}</td><td class="pts">${l.pts}</td></tr>`; });
    });
    html += `<tr class="tot"><td>A futamon gyűjtött pontszám</td><td class="pts">${j.score.total} / ${j.score.max}</td></tr>`;
    html += `<tr><td>Idő (csak tájékoztató)</td><td class="pts">${Math.round(state.result.duration / 1000)} mp</td></tr>`;
    $('sheetBody').innerHTML = html;
    $('sheetOrder').textContent = 'Termények sorrendje (fentről lefelé): ' + state.wro.order.map((c) => J.CROP_NAMES[c]).join(', ');
    if (typeof $('sheetDlg').showModal === 'function') $('sheetDlg').showModal(); else $('sheetDlg').setAttribute('open', '');
  }
  $('resetBtn').addEventListener('click', () => {
    stopPlayback(false);
    state.pose = null;
    if (state.result) { state.ghost = state.result; state.result = null; }
    resetWroCards();
    resetHub();
    render();
  });

  // ------------------------------------------------------------ futtatás és lejátszás
  async function run() {
    if (!state.pyodide) return;
    if (!state.audio) { try { state.audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { state.audio = null; } }
    stopPlayback(false);
    if (state.result) state.ghost = state.result;
    errLine = 0; refreshEditor();
    con.textContent = '';
    resetHub();
    log('▶ Program indul…', 'c-muted');
    $('runBtn').disabled = true;
    const start = Object.assign({}, state.starts[state.mat]);
    let code = ta.value;
    state.lastBlock = null;
    if (state.mode === 'blocks') {
      state.ws.getAllBlocks(false).forEach((b) => b.setWarningText(null));
      const out = window.KodfejtoBlocks.toPython(state.ws);
      out.warnings.forEach((w) => log('💡 ' + w, 'c-hint'));
      code = out.code;
    }
    let res;
    try {
      res = await RT.runProgram(state.pyodide, state.shim, code, { mat: state.mat, start }, sampler);
    } catch (e) {
      log('A szimulátor hibába futott: ' + e, 'c-err');
      $('runBtn').disabled = false;
      return;
    }
    res.mat = state.mat;
    state.result = res;
    if (state.wro) {
      resetWroCards();
      state.wro.judge = J.evaluate(res, state.wro.order, Sim.ROBOT_DEFAULT);
      if (!state.wro.judge.startOk) log('⚖ A robot nem teljesen a rajtterületen állt (fehér keret). A versenyen ez szabálytalan rajt!', 'c-err');
      $('wroScore').textContent = ''; $('wroSheetBtn').hidden = true;
    }
    state.play = { t: 0, wall: performance.now(), speed: Number($('speedSel').value), fi: 0, ei: 0 };
    $('stopBtn').disabled = false;
    requestAnimationFrame(tick);
  }

  function poseAt(frames, t, hint) {
    let i = hint || 0;
    while (i < frames.length - 1 && frames[i + 1].t <= t) i++;
    const a = frames[i], b = frames[Math.min(i + 1, frames.length - 1)];
    if (b.t === a.t || t <= a.t) return [{ x: a.x, y: a.y, heading: a.h }, i];
    const u = Math.min(1, (t - a.t) / (b.t - a.t));
    return [{ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, heading: a.h + (b.h - a.h) * u }, i];
  }

  function handleEvent(ev) {
    switch (ev.type) {
      case 'display': showPixels(ev.pixels); break;
      case 'pixel': setPixel(ev.r, ev.c, ev.b); break;
      case 'light': setLight(ev.color); break;
      case 'beep': beep(ev.freq, ev.dur / state.play.speed); break;
      case 'print': log(ev.text); break;
      case 'stall': log(fmt(ev.t / 1000, 1) + ' mp: a robot nekiment a falnak.', 'c-hint'); break;
      case 'error': {
        ev.text.split('\n').forEach((l) => log(l, 'c-err'));
        const h = hintFor(ev.text);
        if (h) log('💡 ' + h, 'c-hint');
        if (state.mode === 'blocks') {
          const b = state.lastBlock && state.ws.getBlockById(state.lastBlock);
          if (b) b.setWarningText(hintFor(ev.text) || ev.text.split('\n').pop());
        } else { errLine = ev.line || 0; refreshEditor(); }
        break;
      }
      case 'block': state.lastBlock = ev.id; markBlock(ev.id); break;
      case 'end': break;
    }
  }

  function tick(now) {
    const p = state.play;
    if (!p) return;
    p.t = (now - p.wall) * p.speed;
    const r = state.result;
    while (p.ei < r.events.length && r.events[p.ei].t <= p.t) handleEvent(r.events[p.ei++]);
    applyJudge(p.t);
    const [pose, fi] = poseAt(r.frames, Math.min(p.t, r.duration), p.fi);
    p.fi = fi;
    state.pose = pose;
    render();
    if (p.t >= r.duration && p.ei >= r.events.length) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  }

  function finish() {
    const r = state.result;
    state.play = null;
    if (!r.error) markBlock(null);
    state.pose = { x: r.final.x, y: r.final.y, heading: r.final.heading };
    $('stopBtn').disabled = true;
    $('runBtn').disabled = false;
    if (!r.error && !r.timeout) log('✓ Kész · ' + fmt(r.duration / 1000, 1) + ' mp', 'c-ok');
    if (state.wro && state.wro.judge) {
      applyJudge(Infinity);
      const sc = state.wro.judge.score;
      log('🏁 Pontszám: ' + sc.total + ' / ' + sc.max, 'c-ok');
      $('wroScore').textContent = sc.total + ' / ' + sc.max + ' pont';
      $('wroSheetBtn').hidden = false;
      showSheet();
    }
    render();
    updateTele(state.pose, r.duration);
  }

  function stopPlayback(announce) {
    if (!state.play) return;
    state.lastStopT = state.play.t;
    state.play = null;
    markBlock(null);
    $('stopBtn').disabled = true;
    $('runBtn').disabled = !state.pyodide;
    if (announce) log('■ Megállítottad a robotot.', 'c-muted');
    if (announce && state.wro && state.wro.judge && state.result) {
      // A versenyen a „Stop” véget vet a futamnak: az addigi állapotot pontozzuk.
      const t = state.lastStopT || 0;
      const cut = Object.assign({}, state.result, { frames: state.result.frames.filter((f) => f.t <= t), events: state.result.events.filter((e) => e.t <= t) });
      if (cut.frames.length) {
        state.wro.judge = J.evaluate(cut, state.wro.order, Sim.ROBOT_DEFAULT);
        state.result = Object.assign({}, state.result, { duration: t });
        const sc = state.wro.judge.score;
        log('🏁 Pontszám a megállításkor: ' + sc.total + ' / ' + sc.max, 'c-ok');
        $('wroScore').textContent = sc.total + ' / ' + sc.max + ' pont'; $('wroSheetBtn').hidden = false;
      }
    }
    render();
  }

  $('runBtn').addEventListener('click', run);
  $('stopBtn').addEventListener('click', () => stopPlayback(true));
  $('speedSel').addEventListener('change', (e) => {
    if (state.play) { const sp = Number(e.target.value); state.play.wall = performance.now() - state.play.t / sp; state.play.speed = sp; }
  });

  // ------------------------------------------------------------ indulás
  ta.value = store.get('code', SAMPLES.square);
  refreshEditor();
  if (!Sim.MATS[state.mat]) state.mat = 'palya1';
  $('matSel').value = store.get('wro', false) ? 'wro1' : state.mat;
  if (store.get('wro', false)) { state.mat = 'palya1'; setWro(true); }
  fitCanvas();
  resetHub();
  setMode(state.mode === 'blocks' ? 'blocks' : 'python');
  // Küldetés megnyitása a címből: #k2-python vagy #k2-blocks
  (function openMission() {
    const m = /^#(k\d+)-(python|blocks)$/.exec(location.hash);
    if (!m || !MISSION_START[m[1]]) return;
    const ms = MISSION_START[m[1]], mode = ms[m[2]] ? m[2] : 'python';
    setMode(mode);
    if (ms.mat && ms.mat !== state.mat) {
      setWro(false);
      state.mat = ms.mat; store.set('mat', state.mat); $('matSel').value = state.mat; fitCanvas();
    }
    const key = ms[mode];
    if (mode === 'blocks') {
      state.ws.clear();
      Blockly.serialization.workspaces.load(window.KodfejtoBlocks.SAMPLES[key].ws, state.ws);
    } else {
      ta.value = SAMPLES[key]; errLine = 0; refreshEditor(); store.set('code', ta.value);
    }
    log('📜 Betöltöttem a(z) ' + m[1].slice(1) + '. küldetés kiinduló programját.', 'c-hint');
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* nem baj */ }
  })();
  updateToolHint();
  log('Írd meg a programot, aztán nyomd meg az Indulj! gombot.', 'c-muted');

  Promise.all([loadImage('palya1'), loadImage('palya2')]).then(render).catch(() => log('A pályakép nem töltődött be.', 'c-err'));
  render();

  (async () => {
    try {
      const [py, shim] = await Promise.all([
        window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' }),
        Promise.resolve(window.PYBRICKS_SHIM || Promise.reject(new Error('hiányzik a pybricks_shim.js'))),
      ]);
      state.pyodide = py; state.shim = shim;
      $('loading').remove();
      $('runBtn').disabled = false;
    } catch (e) {
      $('loading').textContent = 'A Python nem töltődött be. Frissítsd az oldalt! (' + (e && e.message || e) + ')';
    }
  })();
})();
