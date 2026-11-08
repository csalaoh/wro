/*
 * Kódfejtő Műhely – virtuális pálya, szimulációs mag
 *
 * Egységek: hossz mm, szög fok, idő ms.
 * Koordináták: a pálya bal alsó sarka az origó, x jobbra, y felfelé.
 * Irány (heading): 0° = a pálya teteje felé, az óramutató járásával nő
 * (ugyanaz, mint a Pybricks: a pozitív fordulás jobbra fordít).
 *
 * A mag nem tud semmit a képernyőről: parancsokat kap (a Python-rétegtől),
 * lépteti a szimulált időt, és egy idővonalat ír (frames + events),
 * amit a lejátszó később valós időben visszajátszik.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KodfejtoSim = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---- Az iskolai szabvány robot (Driving Base 2) --------------------------
  // BECSÜLT értékek: a hétfői mérés után pontosítjuk (robot.json).
  const ROBOT_DEFAULT = {
    name: 'Driving Base 2 (iskolai szabvány)',
    wheelDiameter: 56,      // mm
    axleTrack: 112,         // mm, kerékközép–kerékközép
    bodyFront: 100,         // a robot eleje ennyivel van a tengely előtt (mm) – becsült
    bodyRear: 60,           // a robot hátulja ennyivel van a tengely mögött (mm) – becsült
    bodyWidth: 128,         // teljes szélesség kerekekkel (mm) – becsült
    wheelWidth: 14,
    pointer: 120,           // a mutató vége a tengely előtt (mm) – becsült
    colorSensor: { forward: 80, side: 0 },   // becsült
    distanceSensor: { forward: 95, side: 0 }, // becsült
    motorMaxSpeed: 1000,    // fok/s, a kalibráláskor pontosítjuk
    ports: { A: 'motor-left', B: 'motor-right', C: 'color', D: 'ultrasonic', E: null, F: null },
  };

  const MATS = {
    palya1: { name: 'Pálya1', width: 1120, height: 990 },
    palya2: { name: 'Pálya2', width: 990, height: 1120 },
    rajzlap: { name: 'Rajzlap', width: 1000, height: 800 },
  };

  const DT = 5;              // szimulációs lépés (ms)
  const FRAME_EVERY = 20;    // ennyi ms-onként mentünk képkockát
  const MAX_TIME = 180000;   // egy futás legfeljebb 3 perc szimulált idő
  const STALL_GIVE_UP = 1000; // ennyi ms elakadás után a parancs feladja (kalibrálandó)
  const IMU_READY_AFTER = 400;

  class SimTimeout extends Error {}

  function rad(d) { return d * Math.PI / 180; }

  // Trapéz sebességprofil: megtett út t időpontban (előjel nélkül).
  function trapezoid(dist, vmax, acc) {
    const d = Math.abs(dist);
    if (d === 0) return { T: 0, pos: () => 0 };
    let ta = vmax / acc;
    let da = 0.5 * acc * ta * ta;
    let tc, vpeak;
    if (2 * da >= d) {          // háromszög profil: nem éri el a csúcssebességet
      ta = Math.sqrt(d / acc);
      vpeak = acc * ta;
      tc = 0;
      da = d / 2;
    } else {
      vpeak = vmax;
      tc = (d - 2 * da) / vmax;
    }
    const T = 2 * ta + tc;
    const pos = (t) => {
      if (t <= 0) return 0;
      if (t >= T) return d;
      if (t < ta) return 0.5 * acc * t * t;
      if (t < ta + tc) return da + vpeak * (t - ta);
      const r = T - t;
      return d - 0.5 * acc * r * r;
    };
    return { T: T * 1000, pos: (ms) => pos(ms / 1000) };
  }

  class Simulation {
    constructor(opts) {
      opts = opts || {};
      this.robot = Object.assign({}, ROBOT_DEFAULT, opts.robot || {});
      this.mat = MATS[opts.mat || 'palya1'];
      const s = opts.start || { x: 120, y: 155, heading: 0 };
      this.x = s.x; this.y = s.y; this.heading = s.heading;
      this.startHeading = s.heading;
      this.t = 0;
      this.frames = [];
      this.events = [];
      this.lastFrameT = -Infinity;
      // Motorok: a "raw" szög a motor saját forgása; a kerék a beépítés miatt
      // balra tükrözve van, ezért a bal kerék előre-gurulása = -raw.
      this.motors = {};
      for (const p of 'ABCDEF') {
        if (this.robot.ports[p] && this.robot.ports[p].startsWith('motor')) {
          this.motors[p] = { raw: 0, rawSpeed: 0, side: this.robot.ports[p] === 'motor-left' ? 'left' : 'right' };
        }
      }
      this.stalled = false;
      this.stallTime = 0;
      this.light = 'none';
      this.record(true);
    }

    // --- segédek ---------------------------------------------------------
    mmPerDeg() { return Math.PI * this.robot.wheelDiameter / 360; }

    wheelSpeeds() {
      // a két kerék talajhoz viszonyított sebessége (mm/s), előre pozitív
      let vl = 0, vr = 0;
      for (const p in this.motors) {
        const m = this.motors[p];
        const v = m.rawSpeed * this.mmPerDeg();
        if (m.side === 'left') vl += -v; else vr += v;
      }
      return [vl, vr];
    }

    corners(x, y, h) {
      const r = this.robot, f = [Math.sin(rad(h)), Math.cos(rad(h))];
      const side = [Math.cos(rad(h)), -Math.sin(rad(h))]; // jobb oldal felé
      const w = r.bodyWidth / 2;
      const pts = [[r.bodyFront, w], [r.bodyFront, -w], [-r.bodyRear, -w], [-r.bodyRear, w]];
      return pts.map(([a, b]) => [x + f[0] * a + side[0] * b, y + f[1] * a + side[1] * b]);
    }

    insideWalls(x, y, h) {
      return this.corners(x, y, h).every(([cx, cy]) =>
        cx >= 0 && cx <= this.mat.width && cy >= 0 && cy <= this.mat.height);
    }

    pointOnRobot(forward, side) {
      const h = rad(this.heading);
      return {
        x: this.x + Math.sin(h) * forward + Math.cos(h) * side,
        y: this.y + Math.cos(h) * forward - Math.sin(h) * side,
      };
    }

    record(force) {
      if (force || this.t - this.lastFrameT >= FRAME_EVERY) {
        this.frames.push({ t: this.t, x: this.x, y: this.y, h: this.heading });
        this.lastFrameT = this.t;
      }
    }

    event(type, data) { this.events.push(Object.assign({ t: this.t, type }, data || {})); }

    // Egy DT hosszú lépés: a motorok aktuális sebességével gurul a robot.
    step(dt) {
      if (this.t + dt > MAX_TIME) throw new SimTimeout('SIM_TIMEOUT');
      for (const p in this.motors) this.motors[p].raw += this.motors[p].rawSpeed * dt / 1000;
      const [vl, vr] = this.wheelSpeeds();
      const v = (vl + vr) / 2;
      const omega = (vl - vr) / this.robot.axleTrack * 180 / Math.PI; // fok/s, jobbra pozitív
      const s = dt / 1000;
      const hMid = this.heading + omega * s / 2;
      const nx = this.x + Math.sin(rad(hMid)) * v * s;
      const ny = this.y + Math.cos(rad(hMid)) * v * s;
      const nh = this.heading + omega * s;
      if (this.insideWalls(nx, ny, nh)) {
        this.x = nx; this.y = ny; this.heading = nh;
        if (this.stalled) { this.stalled = false; this.stallTime = 0; }
      } else {
        // A fal megállítja a robotot. A kerék itt megcsúszik, a motor szöge nő tovább.
        if (!this.stalled) this.event('stall');
        this.stalled = true;
        this.stallTime += dt;
      }
      this.t += dt;
      this.record(false);
    }

    advance(ms) {
      let left = ms;
      while (left > 0) {
        const dt = Math.min(DT, left);
        this.step(dt);
        left -= dt;
      }
      this.record(true);
    }

    // --- motorok ---------------------------------------------------------
    // userSpeed: a program által látott sebesség (fok/s), dir: +1 vagy -1
    setMotorUserSpeed(port, userSpeed, dir) {
      const m = this.motors[port];
      m.rawSpeed = userSpeed * dir;
    }
    motorUserAngle(port, dir) { return this.motors[port].raw * dir; }

    // Egy motor forgatása adott szöggel (run_angle). Blokkoló.
    runMotorAngle(port, dir, speed, angle) {
      const m = this.motors[port];
      const sign = Math.sign(angle) * Math.sign(speed || 1);
      const prof = trapezoid(Math.abs(angle), Math.min(Math.abs(speed), this.robot.motorMaxSpeed), 2000);
      const start = m.raw;
      let elapsed = 0;
      this.stallTime = 0;
      while (elapsed < prof.T) {
        const dt = Math.min(DT, prof.T - elapsed);
        const target = start + dir * sign * prof.pos(elapsed + dt);
        m.rawSpeed = (target - m.raw) / (dt / 1000);
        this.step(dt);
        elapsed += dt;
        if (this.stallTime >= STALL_GIVE_UP) break;
      }
      m.rawSpeed = 0;
      this.record(true);
    }

    // --- hajtásbázis -----------------------------------------------------
    // A DriveBase a programban MEGADOTT kerékátmérővel és tengelytávval számol
    // (base.wheelDiameter, base.axleTrack), a fizika viszont a valódi robot
    // méreteivel. Ha a program rossz számot ad meg, a robot rosszul fordul –
    // pontosan úgy, mint a valóságban.
    // base: {left:{port,dir}, right:{port,dir}, wheelDiameter, axleTrack, gyro}
    // kind: 'straight' | 'turn'
    driveProfile(base, kind, amount, speed, acc) {
      const k = Math.PI * base.wheelDiameter / 360;   // mm / felhasználói fok
      const halfTrack = base.axleTrack / 2;
      const prof = trapezoid(amount, speed, acc);
      const sign = Math.sign(amount);
      const L = base.left, R = base.right;
      const startL = this.motorUserAngle(L.port, L.dir);
      const startR = this.motorUserAngle(R.port, R.dir);
      const startH = this.imuHeading();
      const maxUser = this.robot.motorMaxSpeed;
      const clamp = (v) => Math.max(-maxUser, Math.min(maxUser, v));
      let elapsed = 0;
      this.stallTime = 0;
      const total = prof.T + (base.gyro ? 300 : 0); // gyroval rövid utánállítás
      while (elapsed < total) {
        const dt = Math.min(DT, total - elapsed);
        const p = sign * prof.pos(Math.min(elapsed + dt, prof.T));
        const curL = this.motorUserAngle(L.port, L.dir) - startL;
        const curR = this.motorUserAngle(R.port, R.dir) - startR;
        // a kívánt előrehaladás és elfordulás (felhasználói kerékfokban)
        let fwd, diff;
        if (kind === 'straight') { fwd = p / k; diff = 0; }
        else { fwd = 0; diff = rad(p) * halfTrack / k; }
        const curFwd = (curL + curR) / 2;
        let curDiff = (curL - curR) / 2;
        if (base.gyro) {
          // gyroval az elfordulást a giroszkóp méri, nem a kerekek
          curDiff = rad(this.imuHeading() - startH) * halfTrack / k;
        }
        const s = dt / 1000;
        const vF = (fwd - curFwd) / s;
        const vD = (diff - curDiff) / s;
        this.setMotorUserSpeed(L.port, clamp(vF + vD), L.dir);
        this.setMotorUserSpeed(R.port, clamp(vF - vD), R.dir);
        this.step(dt);
        elapsed += dt;
        if (this.stallTime >= STALL_GIVE_UP) break;
      }
      this.setMotorUserSpeed(L.port, 0, L.dir);
      this.setMotorUserSpeed(R.port, 0, R.dir);
      this.record(true);
    }

    // SPIKE App mozgásblokk: a két kerék adott fokot fordul (felhasználói fok),
    // összehangolt trapéz profillal; a gyorsabb kerék sebessége vmax (fok/s).
    // A bal motor a beépítés miatt tükrözve forog – ezt a SPIKE App magától
    // kezeli, ezért itt a bal motor iránya -1.
    tankProfile(lp, rp, degL, degR, vmax, acc) {
      const big = Math.max(Math.abs(degL), Math.abs(degR));
      if (big === 0 || vmax === 0) return;
      const prof = trapezoid(big, Math.min(Math.abs(vmax), this.robot.motorMaxSpeed), acc || 4000);
      const startL = this.motorUserAngle(lp, -1), startR = this.motorUserAngle(rp, 1);
      const rl = degL / big, rr = degR / big;
      let elapsed = 0;
      this.stallTime = 0;
      while (elapsed < prof.T) {
        const dt = Math.min(DT, prof.T - elapsed);
        const p = prof.pos(elapsed + dt);
        const s = dt / 1000;
        this.setMotorUserSpeed(lp, (rl * p - (this.motorUserAngle(lp, -1) - startL)) / s, -1);
        this.setMotorUserSpeed(rp, (rr * p - (this.motorUserAngle(rp, 1) - startR)) / s, 1);
        this.step(dt);
        elapsed += dt;
        if (this.stallTime >= STALL_GIVE_UP) break;
      }
      this.setMotorUserSpeed(lp, 0, -1);
      this.setMotorUserSpeed(rp, 0, 1);
      this.record(true);
    }

    // Folyamatos hajtás (drive): beállítja a kerekek sebességét, és visszatér.
    driveContinuous(base, speed, turnRate) {
      const k = Math.PI * base.wheelDiameter / 360;
      const vF = speed / k;
      const vD = rad(turnRate) * (base.axleTrack / 2) / k;
      this.setMotorUserSpeed(base.left.port, vF + vD, base.left.dir);
      this.setMotorUserSpeed(base.right.port, vF - vD, base.right.dir);
    }

    // A szenzor alatti pont színe a pályaképből (a felület adja a mintavevőt).
    colorUnderSensor() {
      const c = this.robot.colorSensor;
      const p = this.pointOnRobot(c.forward, c.side);
      if (this.sampleColor) return this.sampleColor(p.x, p.y);
      return [255, 255, 255];
    }

    // Távolságérzékelő: a falig mért távolság (mm), a pályaelemek az 1. verzióban még nem.
    distanceAhead() {
      const d = this.robot.distanceSensor;
      const p = this.pointOnRobot(d.forward, d.side);
      const h = rad(this.heading), dx = Math.sin(h), dy = Math.cos(h);
      let best = 2000;
      const W = this.mat.width, H = this.mat.height;
      if (dx > 1e-9) best = Math.min(best, (W - p.x) / dx);
      if (dx < -1e-9) best = Math.min(best, -p.x / dx);
      if (dy > 1e-9) best = Math.min(best, (H - p.y) / dy);
      if (dy < -1e-9) best = Math.min(best, -p.y / dy);
      return best < 40 ? 2000 : Math.round(Math.min(best, 2000));
    }

    // --- szenzorok, hub ------------------------------------------------
    imuHeading() { return this.heading - this.startHeading; }
    imuReady() { return this.t >= IMU_READY_AFTER; }
  }

  return { Simulation, SimTimeout, trapezoid, ROBOT_DEFAULT, MATS, MAX_TIME };
});
