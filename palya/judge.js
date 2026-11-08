/*
 * Kódfejtő Műhely – virtuális pálya, a bíró
 * Házi WRO 2026 Elementary – Pálya1: „Ébred a farm” (bejárós szint)
 *
 * A bíró a futás idővonalából dolgozik, ugyanúgy, mint a valódi bíró:
 *  - FELVÉTEL: a középső gomb zöldre vált, és a robot utána legalább 0,8 mp-ig áll.
 *    Ha a mutató vége egy kártyán van, a kártya „a robotnál van”.
 *  - LERAKÁS: a gomb kékre vált, és a robot áll. Az elsőként felvett kártya
 *    közepe a mutató vége alá kerül.
 *  - Egyszerre legfeljebb 2 kártya lehet a robotnál.
 *  - A védett elemek (kerítések, kutya, madárijesztő): ha a robot hozzáér,
 *    „elmozdult”, és elvész a bónusz.
 * Minden méret mm-ben, a pálya bal alsó sarkától (x jobbra, y felfelé),
 * a versenykiírás koordinátái szerint.
 */
(function (root) {
  'use strict';

  const CARD = 40; // a kártyák 4 × 4 cm-esek
  const STILL_MS = 800, STILL_MM = 2, STILL_DEG = 1;

  const r = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
  const sq = (cx, cy, half) => r(cx - half, cx + half, cy - half, cy + half);

  const ZONES = {
    start: r(20, 220, 40, 270),
    parcelLeft: [r(145, 400, 665, 918)],
    parcelMid: [r(440, 680, 390, 500), r(560, 800, 280, 390)],
    shop: [r(585, 835, 606, 804)],
    market: [r(890, 1090, 185, 385)],
    red: [sq(503, 446, 32), sq(624, 332, 32), sq(739, 332, 32)],
    black: [sq(624, 446, 32)],
    yellow: [sq(313, 134, 32)],
  };
  const STORE = [[943, 851], [943, 753], [943, 654], [943, 556]]; // terményraktár, fentről lefelé

  const PROTECTED = [
    { id: 'fenceA', name: 'Kerítés A', zone: r(555, 570, 620, 780) },
    { id: 'fenceB', name: 'Kerítés B', zone: r(855, 870, 400, 520) },
    { id: 'dog', name: 'Kutya', zone: r(430, 470, 80, 120) },
    { id: 'scarecrow', name: 'Madárijesztő', zone: r(190, 230, 710, 750) },
  ];

  const CROP_NAMES = { RED: 'piros', YELLOW: 'sárga', BLACK: 'fekete' };

  // Sorsolás: a négy termény (2 piros, 1 sárga, 1 fekete) véletlen sorrendben
  function draw(rand) {
    rand = rand || Math.random;
    const a = ['RED', 'RED', 'YELLOW', 'BLACK'];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function initialCards(order) {
    const c = (id, kind, label, color, x, y) => ({ id, kind, label, color, x, y, carried: false });
    const cards = [
      c('K1', 'basket', 'K', '#8A5CF6', 90, 495),
      c('K2', 'basket', 'K', '#8A5CF6', 170, 495),
      c('ME', 'scale', 'MÉ', '#18A3B8', 504, 866),
      c('Z1', 'crate', 'Z', '#FF9F43', 805, 471),
      c('Z2', 'crate', 'Z', '#FF9F43', 473, 249),
      c('Z3', 'crate', 'Z', '#FF9F43', 790, 65),
    ];
    order.forEach((col, i) => cards.push(c('T' + (i + 1), 'crop', 'T', { RED: '#E8343C', YELLOW: '#FFD400', BLACK: '#1D2B44' }[col], STORE[i][0], STORE[i][1])));
    cards.forEach((k, i) => { if (k.kind === 'crop') k.crop = order[i - 6]; });
    return cards;
  }

  // ---- geometria
  function cardRect(k) { return r(k.x - CARD / 2, k.x + CARD / 2, k.y - CARD / 2, k.y + CARD / 2); }
  function overlap(a, b) { return Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)); }
  function inside(pt, z) { return pt[0] >= z.x0 && pt[0] <= z.x1 && pt[1] >= z.y0 && pt[1] <= z.y1; }
  // teljesen bent van-e a kártya a (több téglalapból álló) zónában: 5×5 mintapont
  function fullyIn(k, zs) {
    const rc = cardRect(k);
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) {
      const p = [rc.x0 + (rc.x1 - rc.x0) * i / 4, rc.y0 + (rc.y1 - rc.y0) * j / 4];
      if (!zs.some((z) => inside(p, z))) return false;
    }
    return true;
  }
  function partlyIn(k, zs) { const rc = cardRect(k); return zs.some((z) => overlap(rc, z) > 0); }
  function level(k, zs) { return fullyIn(k, zs) ? 2 : (partlyIn(k, zs) ? 1 : 0); }

  // a robot teste (téglalap) egy adott helyzetben
  function robotPoly(robot, p) {
    const h = p.heading * Math.PI / 180, f = [Math.sin(h), Math.cos(h)], s = [Math.cos(h), -Math.sin(h)], w = robot.bodyWidth / 2;
    return [[robot.bodyFront, w], [robot.bodyFront, -w], [-robot.bodyRear, -w], [-robot.bodyRear, w]]
      .map(([a, b]) => [p.x + f[0] * a + s[0] * b, p.y + f[1] * a + s[1] * b]);
  }
  function polyHitsRect(poly, z) {
    // elválasztó tengelyek tétele (téglalap–forgatott téglalap)
    const rp = [[z.x0, z.y0], [z.x1, z.y0], [z.x1, z.y1], [z.x0, z.y1]];
    const axes = [[1, 0], [0, 1]];
    for (let i = 0; i < 2; i++) { const a = poly[i], b = poly[i + 1]; axes.push([b[1] - a[1], a[0] - b[0]]); }
    return axes.every(([ax, ay]) => {
      const pr = (pts) => pts.map(([x, y]) => x * ax + y * ay);
      const p1 = pr(poly), p2 = pr(rp);
      return Math.max(...p1) >= Math.min(...p2) && Math.max(...p2) >= Math.min(...p1);
    });
  }

  function poseAt(frames, t) {
    let i = 0;
    while (i < frames.length - 1 && frames[i + 1].t <= t) i++;
    const a = frames[i], b = frames[Math.min(i + 1, frames.length - 1)];
    if (b.t === a.t || t <= a.t) return { x: a.x, y: a.y, heading: a.h };
    const u = Math.min(1, (t - a.t) / (b.t - a.t));
    return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, heading: a.h + (b.h - a.h) * u };
  }
  function standsStill(frames, t) {
    const a = poseAt(frames, t);
    for (const f of frames) {
      if (f.t < t) continue;
      if (f.t > t + STILL_MS) break;
      if (Math.hypot(f.x - a.x, f.y - a.y) > STILL_MM || Math.abs(f.h - a.heading) > STILL_DEG) return false;
    }
    const end = frames[frames.length - 1].t;
    return end >= t + STILL_MS || end === frames[frames.length - 1].t; // a futás vége is „állás”
  }

  // ---- a futás kiértékelése: bírói idővonal és végső állapot
  function evaluate(result, order, robot) {
    const frames = result.frames;
    const cards = initialCards(order);
    const timeline = [];
    const carried = [];
    const tip = (p) => { const h = p.heading * Math.PI / 180; return [p.x + Math.sin(h) * robot.pointer, p.y + Math.cos(h) * robot.pointer]; };
    const fmtS = (t) => (t / 1000).toFixed(1).replace('.', ',');

    // rajt: a robot teljesen a rajtterületen belül álljon
    const startPoly = robotPoly(robot, { x: frames[0].x, y: frames[0].y, heading: frames[0].h });
    const startOk = startPoly.every((p) => inside(p, ZONES.start));

    // felvétel / lerakás a fényjelzésből
    for (const ev of result.events) {
      if (ev.type !== 'light' || (ev.color !== 'GREEN' && ev.color !== 'BLUE')) continue;
      const p = poseAt(frames, ev.t), tp = tip(p);
      if (!standsStill(frames, ev.t)) {
        timeline.push({ t: ev.t, type: 'note', text: fmtS(ev.t) + ' mp: jelzett, de nem állt meg 1 mp-re – a bíró ezt nem fogadja el.' });
        continue;
      }
      if (ev.color === 'GREEN') {
        const k = cards.find((c) => !c.carried && inside(tp, cardRect(c)));
        if (!k) { timeline.push({ t: ev.t, type: 'note', text: fmtS(ev.t) + ' mp: felvétel, de a mutató vége nincs kártyán.' }); continue; }
        if (carried.length >= 2) { timeline.push({ t: ev.t, type: 'note', text: fmtS(ev.t) + ' mp: már 2 elem van a robotnál, többet nem vihet.' }); continue; }
        k.carried = true; carried.push(k);
        timeline.push({ t: ev.t, type: 'pick', id: k.id, text: fmtS(ev.t) + ' mp: felvette: ' + label(k) });
      } else {
        const k = carried.shift();
        if (!k) { timeline.push({ t: ev.t, type: 'note', text: fmtS(ev.t) + ' mp: lerakás, de nincs nála semmi.' }); continue; }
        k.carried = false; k.x = tp[0]; k.y = tp[1];
        timeline.push({ t: ev.t, type: 'drop', id: k.id, x: k.x, y: k.y, text: fmtS(ev.t) + ' mp: letette: ' + label(k) });
      }
    }

    // védett elemek: hozzáért-e a robot
    const hits = {};
    for (const f of frames) {
      const poly = robotPoly(robot, { x: f.x, y: f.y, heading: f.h });
      for (const pr of PROTECTED) {
        if (!hits[pr.id] && polyHitsRect(poly, pr.zone)) {
          hits[pr.id] = f.t;
          timeline.push({ t: f.t, type: 'hit', id: pr.id, text: fmtS(f.t) + ' mp: hozzáért: ' + pr.name + ' – elmozdult!' });
        }
      }
    }
    timeline.sort((a, b) => a.t - b.t);
    const score = scoreSheet(cards, hits);
    return { cards, timeline, hits, score, startOk, carriedAtEnd: carried.map((k) => k.id) };
  }

  function label(k) {
    if (k.kind === 'basket') return 'kosár (' + k.id + ')';
    if (k.kind === 'scale') return 'mérleg';
    if (k.kind === 'crate') return 'zöldségláda (' + k.id + ')';
    return CROP_NAMES[k.crop] + ' termény (' + k.id + ')';
  }

  // ---- pontozólap
  function scoreSheet(cards, hits) {
    const lines = [];
    const add = (task, text, pts) => lines.push({ task, text, pts });
    const onMat = cards.filter((c) => !c.carried);

    // 1. kosarak: parcellánként a legjobb kosár
    ['parcelLeft', 'parcelMid'].forEach((pz) => {
      const name = pz === 'parcelLeft' ? 'bal felső' : 'középső';
      let best = 0, who = null;
      onMat.filter((c) => c.kind === 'basket').forEach((c) => { const l = level(c, ZONES[pz]); if (l > best) { best = l; who = c; } });
      if (best === 2) add(1, 'Kosár teljesen a ' + name + ' parcellán (' + who.id + ')', 15);
      else if (best === 1) add(1, 'Kosár részben a ' + name + ' parcellán (' + who.id + ')', 5);
      else add(1, 'Nincs kosár a ' + name + ' parcellán', 0);
    });
    // 2. mérleg és ládák
    const me = cards.find((c) => c.id === 'ME');
    const lm = me.carried ? 0 : level(me, ZONES.shop);
    add(2, lm === 2 ? 'Mérleg teljesen a boltban' : (lm === 1 ? 'Mérleg részben a boltban' : 'A mérleg nincs a boltban'), lm === 2 ? 20 : (lm === 1 ? 10 : 0));
    cards.filter((c) => c.kind === 'crate').forEach((c) => {
      const l = c.carried ? 0 : level(c, ZONES.market);
      add(2, c.id + (l === 2 ? ' teljesen a piactéren' : (l === 1 ? ' csak részben a piactéren (0 pont)' : ' nincs a piactéren')), l === 2 ? 15 : 0);
    });
    // 3. termények: négyzetenként a legjobb megfelelő színű termény
    const used = new Set();
    [['RED', ZONES.red], ['BLACK', ZONES.black], ['YELLOW', ZONES.yellow]].forEach(([col, squares]) => {
      squares.forEach((s, i) => {
        let best = 0, who = null;
        onMat.filter((c) => c.kind === 'crop' && c.crop === col && !used.has(c.id)).forEach((c) => { const l = level(c, [s]); if (l > best) { best = l; who = c; } });
        if (who) used.add(who.id);
        if (col === 'RED' && i === 2 && best === 0) return; // a harmadik piros négyzet csak tartalék
        const sqName = CROP_NAMES[col] + ' négyzet' + (squares.length > 1 ? ' ' + (i + 1) : '');
        add(3, best === 2 ? CROP_NAMES[col] + ' termény teljesen a(z) ' + sqName + 'en' : (best === 1 ? CROP_NAMES[col] + ' termény részben a(z) ' + sqName + 'en' : 'Üres: ' + sqName), best === 2 ? 20 : (best === 1 ? 10 : 0));
      });
    });
    // 4. bónusz
    PROTECTED.forEach((p) => add(4, p.name + (hits[p.id] != null ? ' elmozdult' : ' a helyén maradt'), hits[p.id] != null ? 0 : 10));
    const total = lines.reduce((s, l) => s + l.pts, 0);
    return { lines, total, max: 215 };
  }

  root.KodfejtoJudge = { draw, initialCards, evaluate, ZONES, PROTECTED, STORE, CARD, CROP_NAMES, cardRect };
})(typeof self !== 'undefined' ? self : this);
