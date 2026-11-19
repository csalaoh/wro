/*
 * Kódfejtő Műhely – virtuális pálya, versenypályák (pályaleírók)
 *
 * Egy versenypálya leírása egy objektum, amit a KodfejtoChallenges.register()
 * jegyez be. Új szezon hozzáadása: új fájl a challenges/ mappában (minta:
 * challenges/proba.js), és egy <script> sor a palya/index.html-ben.
 *
 * A leíró részei:
 *   id, name, short         – azonosító, név a pályaválasztóban, rövid név
 *   mat: { key, image, width, height } – a pályakép (1 képpont = 1 mm)
 *        vagy mat: 'edzo' – egy meglévő pálya képe
 *   timeLimit               – ms (WRO: 120000)
 *   startZone               – a rajtterület (a robotnak teljesen benne kell állnia)
 *   start                   – az alap rajthelyzet {x, y, heading}
 *   drawZones               – a pályaképen NEM látszó célterületek (ezeket rárajzoljuk)
 *   tasks                   – a pontozólap fejezetei: [{ n, title }]
 *   setup(rand)             – a futam kiinduló állapota: { objects, triggers, draw }
 *                             (draw: a sorsolás szöveges leírása)
 *   score(ctx)              – pontozólap: { lines:[{task,text,pts}], total, max }
 *
 * Egységek: mm, fok; a pálya bal alsó sarka az origó (mint a sim.js-ben).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./world.js'));
  else root.KodfejtoChallenges = factory(root.KodfejtoWorld);
})(typeof self !== 'undefined' ? self : this, function (W) {
  'use strict';

  const list = [];
  function register(def) { list.push(def); }
  function get(id) { return list.find((c) => c.id === id) || null; }

  // Keverés (Fisher–Yates) egy adott véletlenszám-forrással.
  function shuffle(a, rand) {
    a = a.slice(); rand = rand || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // Ismételhető sorsolás egy számból (a tanár kiírhatja a táblára: „13-as sorsolás”).
  function seeded(seed) {
    let s = (seed >>> 0) || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }

  // ---- pontozási segédek -------------------------------------------------
  // A pontozó egy ctx objektumot kap:
  //   ctx.objects   – az elemek végső állapota (id szerint): x, y, a, carried, fixed, x0, y0, a0, …, és a méretei
  //   ctx.flags     – az akciózónák: id → mikor teljesült (ms)
  //   ctx.robot     – a robot végső helyzete és teste: { x, y, heading, poly }
  //   ctx.def       – a pályaleíró
  function objPoly(o) { return o.shape === 'circle' ? W.circlePoly(o.x, o.y, o.r) : W.rectPoly(o.x, o.y, o.w, o.h, o.a); }
  // teljesen benne van-e (mindkettő konvex: elég a csúcsokat nézni)
  function fullyIn(poly, zone) { const Z = W.zonePoly(zone); return poly.every((p) => W.pointInPoly(p, Z) || onEdge(p, Z)); }
  function touches(poly, zone) { return !!W.sat(poly, W.zonePoly(zone)) || fullyIn(poly, zone); }
  function onEdge(p, Z) {
    for (let i = 0; i < Z.length; i++) {
      const a = Z[i], b = Z[(i + 1) % Z.length];
      const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (Math.abs(cross) / len < 0.5 && p[0] >= Math.min(a[0], b[0]) - 0.5 && p[0] <= Math.max(a[0], b[0]) + 0.5 &&
        p[1] >= Math.min(a[1], b[1]) - 0.5 && p[1] <= Math.max(a[1], b[1]) + 0.5) return true;
    }
    return false;
  }
  // 2 = teljesen benne, 1 = részben (érinti), 0 = nem
  function level(o, zone) { if (o.carried) return 0; const P = objPoly(o); return fullyIn(P, zone) ? 2 : (touches(P, zone) ? 1 : 0); }
  // Elmozdult-e egy védett elem (a WRO-n: a bíró apró elcsúszást nem büntet).
  function moved(o, tolMm, tolDeg) {
    tolMm = tolMm == null ? 5 : tolMm; tolDeg = tolDeg == null ? 5 : tolDeg;
    return o.carried || Math.hypot(o.x - o.x0, o.y - o.y0) > tolMm || Math.abs(o.a - o.a0) > tolDeg;
  }

  // ---- a futás kiértékelése egy adott időpontban --------------------------
  // res: a runtime eredménye; setupObjects: a setup() elemei (méretek miatt);
  // t: eddig az időpontig nézzük (versenymód: időkorlát / Állj! gomb).
  function stateAt(res, setupObjects, t) {
    let fi = res.frames.length - 1;
    while (fi > 0 && res.frames[fi].t > t) fi--;
    const f = res.frames[fi];
    const objects = {};
    setupObjects.forEach((d, i) => {
      const o = Object.assign({}, d, { x0: d.x, y0: d.y, a0: d.a || 0, a: d.a || 0, carried: false, lifted: false });
      if (f.o && f.o[i]) { o.x = f.o[i][0]; o.y = f.o[i][1]; o.a = f.o[i][2]; o.carried = f.o[i][3] > 0; o.lifted = f.o[i][3] === 2; }
      objects[d.id] = o;
    });
    const flags = {};
    res.events.forEach((e) => { if (e.type === 'trigger' && e.t <= t && flags[e.id] == null) flags[e.id] = e.t; });
    (res.events || []).forEach((e) => { if (e.type === 'hide' && e.t <= t && objects[e.id]) objects[e.id].hidden = true; });
    return { frame: f, objects, flags, t: f.t };
  }

  function evaluate(def, res, setup, robot, t) {
    const st = stateAt(res, setup.objects, t == null ? Infinity : t);
    const f = st.frame, w = robot.bodyWidth / 2;
    const pose = { x: f.x, y: f.y, heading: f.h };
    const ctx = {
      objects: st.objects, flags: st.flags, def, t: st.t,
      robot: Object.assign({ poly: W.robotRect(pose, -robot.bodyRear, robot.bodyFront, -w, w) }, pose),
      start: { x: res.frames[0].x, y: res.frames[0].y, heading: res.frames[0].h, poly: W.robotRect({ x: res.frames[0].x, y: res.frames[0].y, heading: res.frames[0].h }, -robot.bodyRear, robot.bodyFront, -w, w) },
    };
    // elhagyta-e a robot valamikor teljesen a rajtterületet (a bónuszhoz)
    ctx.leftStart = res.frames.some((fr) => fr.t <= st.t && !touches(W.robotRect({ x: fr.x, y: fr.y, heading: fr.h }, -robot.bodyRear, robot.bodyFront, -w, w), def.startZone));
    const sheet = def.score(ctx);
    sheet.startOk = fullyIn(ctx.start.poly, def.startZone);
    sheet.t = st.t;
    return sheet;
  }

  return { register, get, list, shuffle, seeded, objPoly, fullyIn, touches, level, moved, stateAt, evaluate };
});
