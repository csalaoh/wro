/*
 * Kódfejtő Műhely – virtuális pálya, Python-futtató
 *
 * Összeköti a Pyodide-ban futó ál-pybricks csomagot a szimulációs maggal.
 * A program egyben, előre lefut (a szimulált idő közben halad), az eredmény
 * egy idővonal: képkockák a robot helyzetéről és események (kijelző, fény,
 * hang, konzol). A felület ezt játssza le valós időben.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./sim.js'));
  else root.KodfejtoRuntime = factory(root.KodfejtoSim);
})(typeof self !== 'undefined' ? self : this, function (Sim) {
  'use strict';

  const LINE_LIMIT = 300000;

  // 5×5-ös betűkészlet a hub kijelzőjéhez (soronként, # = világít)
  const FONT = {
    '0': ['.###.', '#..##', '#.#.#', '##..#', '.###.'], '1': ['..#..', '.##..', '..#..', '..#..', '.###.'],
    '2': ['.###.', '#...#', '..##.', '.#...', '#####'], '3': ['####.', '....#', '.###.', '....#', '####.'],
    '4': ['#..#.', '#..#.', '#####', '...#.', '...#.'], '5': ['#####', '#....', '####.', '....#', '####.'],
    '6': ['.###.', '#....', '####.', '#...#', '.###.'], '7': ['#####', '...#.', '..#..', '.#...', '.#...'],
    '8': ['.###.', '#...#', '.###.', '#...#', '.###.'], '9': ['.###.', '#...#', '.####', '....#', '.###.'],
    'A': ['.###.', '#...#', '#####', '#...#', '#...#'], 'B': ['####.', '#...#', '####.', '#...#', '####.'],
    'C': ['.####', '#....', '#....', '#....', '.####'], 'D': ['####.', '#...#', '#...#', '#...#', '####.'],
    'E': ['#####', '#....', '####.', '#....', '#####'], 'F': ['#####', '#....', '####.', '#....', '#....'],
    'G': ['.####', '#....', '#..##', '#...#', '.###.'], 'H': ['#...#', '#...#', '#####', '#...#', '#...#'],
    'I': ['.###.', '..#..', '..#..', '..#..', '.###.'], 'J': ['..###', '...#.', '...#.', '#..#.', '.##..'],
    'K': ['#..#.', '#.#..', '##...', '#.#..', '#..#.'], 'L': ['#....', '#....', '#....', '#....', '#####'],
    'M': ['#...#', '##.##', '#.#.#', '#...#', '#...#'], 'N': ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
    'O': ['.###.', '#...#', '#...#', '#...#', '.###.'], 'P': ['####.', '#...#', '####.', '#....', '#....'],
    'Q': ['.###.', '#...#', '#...#', '#..#.', '.##.#'], 'R': ['####.', '#...#', '####.', '#..#.', '#...#'],
    'S': ['.####', '#....', '.###.', '....#', '####.'], 'T': ['#####', '..#..', '..#..', '..#..', '..#..'],
    'U': ['#...#', '#...#', '#...#', '#...#', '.###.'], 'V': ['#...#', '#...#', '#...#', '.#.#.', '..#..'],
    'W': ['#...#', '#...#', '#.#.#', '##.##', '#...#'], 'X': ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
    'Y': ['#...#', '.#.#.', '..#..', '..#..', '..#..'], 'Z': ['#####', '...#.', '..#..', '.#...', '#####'],
    ' ': ['.....', '.....', '.....', '.....', '.....'], '-': ['.....', '.....', '.###.', '.....', '.....'],
    '.': ['.....', '.....', '.....', '.....', '..#..'], '!': ['..#..', '..#..', '..#..', '.....', '..#..'],
    '?': ['.###.', '...#.', '..#..', '.....', '..#..'], ':': ['.....', '..#..', '.....', '..#..', '.....'],
  };
  const ACCENT = { 'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ö': 'O', 'Ő': 'O', 'Ú': 'U', 'Ü': 'U', 'Ű': 'U' };

  function glyph(ch) {
    let c = ch.toUpperCase();
    c = ACCENT[c] || c;
    const rows = FONT[c] || FONT['?'];
    return rows.map((r) => [...r].map((p) => (p === '#' ? 100 : 0)));
  }
  const BLANK = glyph(' ');

  // A pályakép színének besorolása (a színszenzor color() értéke).
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d > 0) {
      if (mx === r) h = 60 * (((g - b) / d) % 6);
      else if (mx === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    return [h, mx === 0 ? 0 : (d / mx) * 100, mx * 100];
  }
  function classify(h, s, v) {
    if (v < 20) return 'BLACK';
    if (s < 25) return v > 70 ? 'WHITE' : (v < 35 ? 'BLACK' : 'GRAY');
    if (h < 15 || h >= 330) return 'RED';
    if (h < 45) return v < 60 ? 'BROWN' : 'ORANGE';
    if (h < 70) return 'YELLOW';
    if (h < 160) return 'GREEN';
    if (h < 200) return 'CYAN';
    if (h < 260) return 'BLUE';
    return 'VIOLET';
  }

  function createApi(sim) {
    const bases = [];
    let lastOmega = 0;

    const api = {
      now: () => sim.t,
      wait: (ms) => { sim.advance(ms); },
      device: (port) => {
        const d = sim.robot.ports[port];
        if (!d) return 'none';
        return d.startsWith('motor') ? 'motor' : d;
      },
      stalled: () => sim.stalled,

      // hub
      display_text: (text, on, off) => {
        for (const ch of text) {
          sim.event('display', { pixels: glyph(ch) });
          sim.advance(on);
          sim.event('display', { pixels: BLANK });
          sim.advance(off);
        }
      },
      display_char: (ch) => sim.event('display', { pixels: glyph(ch) }),
      display_number: (s) => {
        // A valódi hub két számjegyet kicsiben mutat; itt az utolsó számjegyet.
        sim.event('display', { pixels: glyph(s.slice(-1)) });
      },
      display_icon: (rows) => sim.event('display', { pixels: rows.toJs ? rows.toJs() : rows }),
      display_pixel: (r, c, b) => sim.event('pixel', { r, c, b }),
      display_off: () => sim.event('display', { pixels: BLANK }),
      light: (name) => { sim.light = name; sim.event('light', { color: name }); },
      beep: (freq, dur) => { sim.event('beep', { freq, dur }); sim.advance(dur); },
      imu_ready: () => sim.imuReady(),
      imu_heading: () => sim.imuHeading(),
      imu_reset_heading: (a) => { sim.startHeading = sim.heading - a; },
      imu_turn_rate: () => lastOmega,

      // motorok
      motor_angle: (port, dir) => sim.motorUserAngle(port, dir),
      motor_speed: (port, dir) => sim.motors[port].rawSpeed * dir,
      motor_run: (port, dir, speed) => sim.setMotorUserSpeed(port, speed, dir),
      motor_run_angle: (port, dir, speed, angle) => sim.runMotorAngle(port, dir, speed, angle),

      // hajtásbázis
      drivebase_new: (lp, ld, rp, rd, wd, at) => {
        bases.push({ left: { port: lp, dir: ld }, right: { port: rp, dir: rd }, wheelDiameter: wd, axleTrack: at, gyro: false, d0: 0, a0: 0 });
        return bases.length - 1;
      },
      drivebase_defaults: (id) => {
        // A Pybricks úgy választ alapértéket, hogy a robot a maximális
        // sebességének kb. 40%-ával menjen. A pontos számokat kalibráljuk.
        const b = bases[id];
        const k = Math.PI * b.wheelDiameter / 360;
        const vmax = sim.robot.motorMaxSpeed * k;
        const speed = 0.4 * vmax;
        const rate = 0.4 * (vmax / (b.axleTrack / 2)) * 180 / Math.PI;
        return [Math.round(speed), Math.round(speed * 3.75), Math.round(rate), Math.round(rate * 3.75)];
      },
      drivebase_gyro: (id, on) => { bases[id].gyro = !!on; },
      drivebase_move: (id, kind, amount, speed, acc) => {
        const h0 = sim.heading, t0 = sim.t;
        sim.driveProfile(bases[id], kind, amount, speed, acc);
        lastOmega = 0;
        void h0; void t0;
      },
      drivebase_drive: (id, speed, rate) => sim.driveContinuous(bases[id], speed, rate),
      drivebase_distance: (id) => {
        const b = bases[id], k = Math.PI * b.wheelDiameter / 360;
        const l = sim.motorUserAngle(b.left.port, b.left.dir), r = sim.motorUserAngle(b.right.port, b.right.dir);
        return (l + r) / 2 * k - b.d0;
      },
      drivebase_angle: (id) => {
        const b = bases[id], k = Math.PI * b.wheelDiameter / 360;
        if (b.gyro) return sim.imuHeading() - b.a0;
        const l = sim.motorUserAngle(b.left.port, b.left.dir), r = sim.motorUserAngle(b.right.port, b.right.dir);
        return ((l - r) / 2 * k) / (b.axleTrack / 2) * 180 / Math.PI - b.a0;
      },
      drivebase_reset: (id, d, a) => {
        const b = bases[id];
        b.d0 = 0; b.a0 = 0;
        b.d0 = api.drivebase_distance(id) - d;
        b.a0 = api.drivebase_angle(id) - a;
      },

      // SPIKE App blokkok
      block: (id) => sim.event('block', { id }),
      tank_move: (lp, rp, dl, dr, v) => sim.tankProfile(lp, rp, dl, dr, v),
      tank_run: (lp, rp, vl, vr) => { sim.setMotorUserSpeed(lp, vl, -1); sim.setMotorUserSpeed(rp, vr, 1); },
      tank_time: (lp, rp, vl, vr, ms) => {
        sim.setMotorUserSpeed(lp, vl, -1); sim.setMotorUserSpeed(rp, vr, 1);
        sim.advance(ms);
        sim.setMotorUserSpeed(lp, 0, -1); sim.setMotorUserSpeed(rp, 0, 1);
      },

      // szenzorok
      color_hsv: () => { const [r, g, b] = sim.colorUnderSensor(); return rgbToHsv(r, g, b).map(Math.round); },
      color_reflection: () => { const [r, g, b] = sim.colorUnderSensor(); return Math.round((0.299 * r + 0.587 * g + 0.114 * b) / 255 * 100); },
      color_name: () => { const [r, g, b] = sim.colorUnderSensor(); const [h, s, v] = rgbToHsv(r, g, b); return classify(h, s, v); },
      distance: () => sim.distanceAhead(),
    };
    return api;
  }

  // Egy program lefuttatása. pyodide: betöltött Pyodide, shimSource: a pybricks_shim.py szövege.
  // Visszaad: { frames, events, error, errorLine, timeout, lint }
  async function runProgram(pyodide, shimSource, code, simOptions, sampler) {
    const sim = new Sim.Simulation(simOptions);
    if (sampler) sim.sampleColor = sampler;
    const api = createApi(sim);
    pyodide.registerJsModule('_sim', api);
    // a modulokat minden futás előtt frissen töltjük, hogy ne maradjon állapot
    pyodide.runPython(`
import sys
for _k in [k for k in list(sys.modules) if k == "pybricks" or k.startswith("pybricks.") or k in ("_sim", "_kodfejto_shim", "_spike_blocks")]:
    del sys.modules[_k]
`);
    pyodide.setStdout({ batched: (line) => sim.event('print', { text: line }) });
    pyodide.setStderr({ batched: (line) => sim.event('print', { text: line }) });
    const shimMod = pyodide.runPython(`
import types, sys
_m = types.ModuleType("_kodfejto_shim")
sys.modules["_kodfejto_shim"] = _m
_m
`);
    pyodide.runPython(shimSource, { globals: shimMod.__dict__ });
    const runner = shimMod.__dict__.get('_run_user_program');
    let error = null, errorLine = 0, timeout = false, lint = [];
    try {
      const linter = shimMod.__dict__.get('_lint_user_program');
      const lr = linter(code);
      lint = lr.toJs();
      lr.destroy && lr.destroy(); linter.destroy && linter.destroy();
    } catch (e) { lint = []; }
    try {
      const res = runner(code, LINE_LIMIT);
      const arr = res.toJs();
      res.destroy && res.destroy();
      if (arr[0] === 'TIMEOUT') timeout = true;
      else if (arr[0]) { error = arr[0]; errorLine = arr[1]; }
    } catch (e) {
      if (e instanceof Sim.SimTimeout || String(e).includes('SIM_TIMEOUT')) timeout = true;
      else { error = String(e && e.message || e); }
    }
    runner.destroy && runner.destroy();
    sim.record(true);
    if (timeout) sim.event('print', { text: '⏱ A futás elérte a 3 perces korlátot, a szimulátor leállította.' });
    if (error) sim.event('error', { text: error, line: errorLine });
    sim.event('end');
    return { frames: sim.frames, events: sim.events, error, errorLine, timeout, lint, duration: sim.t, final: { x: sim.x, y: sim.y, heading: sim.heading } };
  }

  return { runProgram, createApi, glyph, LINE_LIMIT };
});
