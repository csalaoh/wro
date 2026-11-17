/*
 * WRO 2026 RoboMission Junior – „Heritage Heroes” (Robots Meet Culture)
 *
 * Forrás: WRO 2026 RoboMission Junior, magyar szabálykönyv (2025.12.15-i verzió),
 * 5 feladat, max. 230 pont. A pálya a hivatalos pályaképről, 1 px = 1 mm.
 *
 * FIGYELEM – 1. változat:
 *  - A koordinátákat egy kicsinyített (2560 px-es) pályaképről mértük ki, ezért
 *    néhány mm eltérés lehet. A nyomdai fájlból pontosítandó.
 *  - Az elemek MÉRETE becsült (a szabálykönyv fotóiból, LEGO-bütyökben
 *    számolva, 1 bütyök = 8 mm): az építési útmutatóból pontosítandó (SIZE).
 *  - Felülnézeti 2D modell: az elemek nem borulnak fel, ezért az „álló
 *    helyzet” feltétel mindig teljesül. A sárga torony tetejét a robot akkor
 *    teszi fel a talpra, ha elengedéskor a teteje közepe a talp fölött van.
 */
(function () {
  'use strict';
  const C = window.KodfejtoChallenges;
  const r = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
  const ctr = (z) => [(z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2];

  // Becsült elemméretek (mm) – a szabálykönyv alapján pontosítandó!
  // látogató: figura 4×3-as lapon; tornyok 6×6; műtárgy 4×4-es „kosár”; törmelék 2×4-es kocka
  const SIZE = { visitor: [32, 24], tower: [47, 47], top: [47, 47], base: [47, 47], artifact: [32, 32], dirt: [32, 16], barrierRed: [24, 224], barrierWhite: [224, 24], parrot: [24, 32] };

  const COL = { RED: '#C8323A', GREEN: '#2E7D45', BLUE: '#2F5BA8', BLACK: '#1D1D1D', YELLOW: '#F2D43C' };
  const HU = { RED: 'piros', GREEN: 'zöld', BLUE: 'kék', BLACK: 'fekete', YELLOW: 'sárga' };

  // ---- területek (a pályaképről kimérve) ----
  const START = r(358, 627, 440, 707);
  const MUSEUM = r(881, 1665, 959, 1143);                 // piros keretes múzeum
  const EXCAVATION = r(926, 1620, 0, 187);               // zöld keretes ásatás
  const BLACK_ZONE = r(2071, 2258, 781, 878);            // a macskakő fölötti fekete zóna
  const BLUE_ZONE = r(2071, 2258, 245, 343);             // a macskakő alatti kék zóna
  // A macskaköves terület (a szabálykönyv rózsaszín körvonala): a kék vonaltól jobbra,
  // a szürke zónával együtt, DE a két látogatható (fekete, kék) zóna nélkül. A vonalak nem részei.
  const COBBLE = r(1918, 2345, 270, 845);
  const DIRT_FIELD = r(1930, 2262, 352, 772);            // ide sorsoljuk a törmeléket (kék vonal és szürke zóna között)
  // kiállítási pontok a múzeumban (a színes négyzet)
  const SPOT = {
    RED: r(988, 1034, 1043, 1089), GREEN: r(1119, 1165, 1043, 1089), BLACK: r(1250, 1296, 1043, 1089),
    BLUE: r(1381, 1427, 1043, 1089), YELLOW: r(1512, 1558, 1043, 1089),
  };
  const RED_TARGET = [r(1590, 1667, 369, 446), r(1590, 1667, 700, 776)];   // narancs keretes piros
  const YELLOW_TARGET = [r(1768, 1830, 877, 938), r(1768, 1830, 208, 269)];// narancs keretes sárga
  const ART_SLOTS = [[1076, 75], [1208, 75], [1338, 75], [1469, 75]];      // a 4 fekete négyzet az ásatáson
  const GRAY_RED = r(2270, 2334, 445, 709);              // a piros korlát szürke zónája
  const GRAY_WHITE = r(1963, 2233, 1049, 1111);          // a fehér korlát szürke zónája
  const PARROT_ZONE = r(1912, 1974, 207, 285);           // a papagáj helye

  function NAME(id) {
    const m = /^(L|LE)_(\w+)$/.exec(id);
    if (m) return HU[m[2]] + (m[1] === 'L' ? ' látogató' : ' műtárgy');
    return { PT1: '1. vörös torony', PT2: '2. vörös torony', ST_TALP1: '1. sárga torony alap', ST_TALP2: '2. sárga torony alap', ST_TETO1: '1. sárga torony csúcs', ST_TETO2: '2. sárga torony csúcs', KORLAT_P: 'piros fal', KORLAT_F: 'fehér fal', PAPAGAJ: 'papagáj' }[id] || (/^K\d+$/.test(id) ? id.slice(1) + '. törmelék' : id);
  }

  // Érinti-e a törmelék a macskaköves területet (a látogatható zónák nem részei).
  function onCobble(o) {
    const P = C.objPoly(o), c = [o.x, o.y];
    const pts = P.concat([c], P.map((p, i) => [(p[0] + P[(i + 1) % 4][0]) / 2, (p[1] + P[(i + 1) % 4][1]) / 2]));
    const inR = (p, z) => p[0] >= z.x0 && p[0] <= z.x1 && p[1] >= z.y0 && p[1] <= z.y1;
    return pts.some((p) => inR(p, COBBLE) && !inR(p, BLACK_ZONE) && !inR(p, BLUE_ZONE));
  }

  C.register({
    id: 'wro2026j',
    name: 'WRO 2026 Junior: Örökségeink Megmentői',
    short: 'Örökségeink Megmentői (Junior 2026)',
    mat: { key: 'wro2026j', image: 'wro2026j.jpg', width: 2362, height: 1143, name: 'WRO 2026 Junior' },
    timeLimit: 120000,
    startZone: START,
    start: { x: 492, y: 520, heading: 90 },
    estimated: true,
    tasks: [
      { n: 1, title: '1. Látogatók körbevezetése' },
      { n: 2, title: '2. Tornyok újjáépítése' },
      { n: 3, title: '3. Műtárgyak elszállítása a múzeumba' },
      { n: 4, title: '4. Törmelék eltakarítása a macskaköves területről' },
      { n: 5, title: '5. Bónusz pontok' },
    ],
    // A pályán nem látszó határok (segédvonalként rajzoljuk, ha a „Célterületek” be van kapcsolva)
    drawZones: [
      { zone: START, color: '#2F6FED', label: 'RAJT' },
      { zone: MUSEUM, color: '#C8323A', label: 'múzeum' },
      { zone: EXCAVATION, color: '#2E7D45', label: 'ásatás' },
      { zone: COBBLE, color: '#FF5A5F', label: 'macskakő' },
      { zone: BLACK_ZONE, color: '#1D1D1D' }, { zone: BLUE_ZONE, color: '#2F5BA8' },
      ...RED_TARGET.map((z) => ({ zone: z, color: '#FF9F43' })), ...YELLOW_TARGET.map((z) => ({ zone: z, color: '#FF9F43' })),
      ...Object.values(SPOT).map((z) => ({ zone: z, color: '#8A5CF6' })),
      { zone: GRAY_RED, color: '#8A94A6' }, { zone: GRAY_WHITE, color: '#8A94A6' }, { zone: PARROT_ZONE, color: '#8A94A6' },
    ],
    hiddenZones: true, // a zónák alapból nem látszanak (a pályakép mutatja őket)
    help: 'Látogatók: zöld → ásatás, piros → múzeum, fekete → fekete zóna, kék → kék zóna (a macskakő mellett). Piros tornyok → narancs keretes piros négyzetek. Sárga torony: a csúcsát tedd a jobb oldali alapokra. Műtárgyak → az azonos színű kiállítási pont a múzeumban. A 10 törmeléket told le a macskakövekről. A falakhoz és a papagájhoz ne érj!',

    setup(rand) {
      rand = rand || Math.random;
      const o = [];
      const add = (id, label, color, size, x, y, extra) => o.push(Object.assign({ id, name: NAME(id), label, color, w: size[0], h: size[1], x, y }, extra || {}));
      // látogatók az utcán
      [['RED', 320], ['GREEN', 434.5], ['BLUE', 549], ['BLACK', 664]].forEach(([c, x]) => add('L_' + c, 'L', COL[c], SIZE.visitor, x, 85.5, { grab: true, group: 'visitor', col: c }));
      // piros tornyok a bal felső sarokban
      add('PT1', 'T', COL.RED, SIZE.tower, 93, 785, { grab: true, group: 'redTower' });
      add('PT2', 'T', COL.RED, SIZE.tower, 93, 930, { grab: true, group: 'redTower' });
      // sárga torony: a talpak jobb oldalt, a tetejük bal fent
      add('ST_TALP1', 'A', '#C9A227', SIZE.base, 1799, 907.5, { group: 'base' });
      add('ST_TALP2', 'A', '#C9A227', SIZE.base, 1799.5, 238.5, { group: 'base' });
      add('ST_TETO1', '▲', COL.YELLOW, SIZE.top, 238.5, 1074.5, { grab: true, group: 'top', stackOn: ['ST_TALP1', 'ST_TALP2'] });
      add('ST_TETO2', '▲', COL.YELLOW, SIZE.top, 383.5, 1074.5, { grab: true, group: 'top', stackOn: ['ST_TALP1', 'ST_TALP2'] });
      // leletek: 5-ből 4, véletlen sorrendben a 4 fekete négyzeten (műtárgyak)
      const arts = C.shuffle(['BLUE', 'RED', 'GREEN', 'BLACK', 'YELLOW'], rand).slice(0, 4);
      arts.forEach((c, i) => add('LE_' + c, 'L', COL[c], SIZE.artifact, ART_SLOTS[i][0], ART_SLOTS[i][1], { grab: true, group: 'artifact', col: c }));
      // 10 törmelék a macskakövön, nem egymáson
      const dirt = [];
      for (let tries = 0; dirt.length < 10 && tries < 2000; tries++) {
        const x = DIRT_FIELD.x0 + 15 + rand() * (DIRT_FIELD.x1 - DIRT_FIELD.x0 - 30);
        const y = DIRT_FIELD.y0 + 15 + rand() * (DIRT_FIELD.y1 - DIRT_FIELD.y0 - 30);
        if (dirt.every(([a, b]) => Math.hypot(a - x, b - y) > 40)) dirt.push([x, y]);
      }
      dirt.forEach(([x, y], i) => add('K' + (i + 1), '', '#111111', SIZE.dirt, Math.round(x), Math.round(y), { grab: true, group: 'dirt', a: Math.round(rand() * 90) }));
      // védett elemek
      add('KORLAT_P', '', COL.RED, SIZE.barrierRed, ...ctr(GRAY_RED), { protect: true });
      add('KORLAT_F', '', '#F4F4F4', SIZE.barrierWhite, ...ctr(GRAY_WHITE), { protect: true });
      add('PAPAGAJ', 'P', '#3BB273', SIZE.parrot, ...ctr(PARROT_ZONE), { protect: true });
      return {
        objects: o,
        triggers: [],
        draw: 'Műtárgyak az ásatáson (balról jobbra): ' + arts.map((c) => HU[c]).join(', ') + ' · a törmelék darabok helye is sorsolt',
      };
    },

    score(ctx) {
      const O = Object.values(ctx.objects), lines = [];
      const add = (task, text, pts) => lines.push({ task, text, pts });
      // 1. látogatók
      const VZ = { GREEN: [EXCAVATION, 'az ásatáson'], RED: [MUSEUM, 'a múzeumban'], BLACK: [BLACK_ZONE, 'a fekete zónában'], BLUE: [BLUE_ZONE, 'a kék zónában'] };
      O.filter((o) => o.group === 'visitor').forEach((o) => {
        const l = C.level(o, VZ[o.col][0]);
        add(1, HU[o.col] + ' látogató ' + (l === 2 ? 'teljesen ' : l === 1 ? 'részben ' : 'nincs ') + VZ[o.col][1], l === 2 ? 10 : l === 1 ? 5 : 0);
      });
      // 2. piros tornyok: célterületenként egy torony számít
      const usedT = new Set();
      RED_TARGET.forEach((z, i) => {
        let best = 0, who = null;
        O.filter((o) => o.group === 'redTower' && !usedT.has(o.id)).forEach((o) => { const l = C.level(o, z); if (l > best) { best = l; who = o; } });
        if (who) usedT.add(who.id);
        add(2, 'Piros torony a(z) ' + (i + 1) + '. piros célterületen: ' + (best === 2 ? 'teljesen' : best === 1 ? 'részben' : 'nincs'), best === 2 ? 15 : best === 1 ? 10 : 0);
      });
      // 2. sárga tornyok: a teteje a talpon, a talp a sárga célterületen
      ['ST_TALP1', 'ST_TALP2'].forEach((bid, i) => {
        const b = ctx.objects[bid];
        const top = O.find((o) => o.group === 'top' && !o.carried && Math.hypot(o.x - b.x, o.y - b.y) <= 12);
        const l = C.level(b, YELLOW_TARGET[i]);
        const pts = top ? (l === 2 ? 25 : l === 1 ? 15 : 0) : 0;
        add(2, (i + 1) + '. sárga torony: ' + (top ? 'a csúcs az alapon' : 'nincs csúcs az alapon') + (top ? ', az alap ' + (l === 2 ? 'teljesen a kiindulási területén' : l === 1 ? 'részben a kiindulási területén' : 'kint') : ''), pts);
      });
      // 3. leletek
      O.filter((o) => o.group === 'artifact').forEach((o) => {
        const l = C.level(o, SPOT[o.col]);
        add(3, HU[o.col] + ' műtárgy ' + (l === 2 ? 'teljesen a kiállítóhelyén' : l === 1 ? 'részben a kiállítóhelyén' : 'nincs a kiállítóhelyén'), l === 2 ? 15 : l === 1 ? 5 : 0);
      });
      // 4. kosz
      const dirt = O.filter((o) => o.group === 'dirt');
      const clean = dirt.filter((o) => !o.carried && !onCobble(o)).length;
      add(4, clean + ' / 10 törmelék nem ér a macskakőhöz', clean * 2);
      // 5. bónusz – „elmozdítva”: bármely része a szürke kiindulási területén kívül ér a pályához
      const ok = (o, z) => !o.carried && C.fullyIn(C.objPoly(o), z);
      add(5, 'Piros fal ' + (ok(ctx.objects.KORLAT_P, GRAY_RED) ? 'a helyén' : 'elmozdult'), ok(ctx.objects.KORLAT_P, GRAY_RED) ? 10 : 0);
      add(5, 'Fehér fal ' + (ok(ctx.objects.KORLAT_F, GRAY_WHITE) ? 'a helyén' : 'elmozdult'), ok(ctx.objects.KORLAT_F, GRAY_WHITE) ? 10 : 0);
      add(5, 'Papagáj ' + (ok(ctx.objects.PAPAGAJ, PARROT_ZONE) ? 'a helyén' : 'elmozdult'), ok(ctx.objects.PAPAGAJ, PARROT_ZONE) ? 10 : 0);
      return { lines, total: lines.reduce((s, l) => s + l.pts, 0), max: 230 };
    },
  });
})();
