/*
 * Próbaverseny az Edzőpályán (WRO-méret, 2362 × 1143 mm): „Mintagyűjtő állomás”
 *
 * Ez a pályaleírók mintája: minden versenyelem-típus szerepel benne
 * (sorsolt fogható elemek, tolható láda, akciózóna, védett elemek, parkolás).
 * A célterületek nincsenek a pályaképen, ezért a drawZones rárajzolja őket.
 */
(function () {
  'use strict';
  const C = window.KodfejtoChallenges;

  const r = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
  const COLORS = { RED: '#E0282C', BLUE: '#2B5FDB', GREEN: '#25A94E', YELLOW: '#FAD02C' };
  const NAMES = { RED: 'piros', BLUE: 'kék', GREEN: 'zöld', YELLOW: 'sárga' };
  // a pályakép színes négyzetei (kimérve a képről)
  const LABS = { RED: r(1060, 1111, 1010, 1061), BLUE: r(1140, 1191, 1010, 1061), GREEN: r(1220, 1271, 1010, 1061), YELLOW: r(1300, 1351, 1010, 1061) };
  // a 6 mintahely (a 4 mintát ezekre sorsoljuk), az A vonal fölött, a B vonaltól balra
  const SLOTS = [[450, 900], [600, 900], [750, 900], [450, 750], [600, 750], [750, 750]];
  const STORE = r(2000, 2362, 0, 190);   // raktár a jobb alsó sarokban
  const BEACON = { x: 1820, y: 570 };    // jeladó a kör közepén

  C.register({
    id: 'proba',
    name: 'Próbaverseny: Mintagyűjtő állomás (Edzőpálya)',
    short: 'Mintagyűjtő állomás',
    mat: 'edzo',
    timeLimit: 120000,
    startZone: r(0, 295, 0, 297),
    start: { x: 150, y: 110, heading: 0 },
    drawZones: [
      { zone: STORE, color: '#FF9F43', label: 'RAKTÁR' },
      { zone: { cx: BEACON.x, cy: BEACON.y, r: 110 }, color: '#8A5CF6', label: 'jeladó zóna' },
      ...SLOTS.map(([x, y]) => ({ zone: r(x - 25, x + 25, y - 25, y + 25), color: '#8A94A6' })),
    ],
    tasks: [
      { n: 1, title: '1. Minták a laborba' },
      { n: 2, title: '2. A konténer a raktárba' },
      { n: 3, title: '3. A jeladó bekapcsolása' },
      { n: 4, title: '4. Parkolás' },
      { n: 5, title: '5. Bónusz: sziklák és korlát' },
    ],
    help: 'A 4 színes mintát (4 × 4 cm) vidd a pálya tetején lévő, azonos színű négyzetbe! A narancs konténert told a raktárba. A jeladót a kar lecsapásával kapcsolod be (a kar vége legyen a lila körben). A végén állj vissza a rajtterületre! A szürke sziklákhoz és a korláthoz ne érj!',

    setup(rand) {
      const order = C.shuffle(['RED', 'BLUE', 'GREEN', 'YELLOW', null, null], rand);
      const objects = [];
      order.forEach((col, i) => {
        if (!col) return;
        objects.push({ id: 'M_' + col, name: NAMES[col] + ' minta', label: 'M', color: COLORS[col], w: 40, h: 40, x: SLOTS[i][0], y: SLOTS[i][1], grab: true, group: 'sample', col });
      });
      objects.push({ id: 'KONT', name: 'konténer', label: 'K', color: '#FF9F43', w: 100, h: 100, x: 1300, y: 330, grab: false });
      objects.push({ id: 'JEL', name: 'jeladó', label: 'J', color: '#8A5CF6', w: 50, h: 50, x: BEACON.x, y: BEACON.y, fixed: true });
      [[1000, 380], [1250, 780], [1650, 140]].forEach(([x, y], i) =>
        objects.push({ id: 'SZ' + (i + 1), name: (i + 1) + '. szikla', label: '', color: '#8A94A6', w: 30, h: 30, x, y, protect: true }));
      objects.push({ id: 'KOR', name: 'korlát', label: '', color: '#55657F', w: 200, h: 16, x: 2180, y: 210, protect: true });
      return {
        objects,
        triggers: [{ id: 'beacon', name: 'a jeladó bekapcsolt', need: 'arm', zone: { cx: BEACON.x, cy: BEACON.y, r: 110 }, recolor: { JEL: '#25A94E' } }],
        draw: 'Minták a 6 helyen (balról jobbra, fent majd lent): ' + order.map((c) => (c ? NAMES[c] : 'üres')).join(', '),
      };
    },

    score(ctx) {
      const lines = [];
      const add = (task, text, pts) => lines.push({ task, text, pts });
      const O = ctx.objects;
      // 1. minták: laboronként a legjobb minta, egy minta csak egyszer számít
      const used = new Set();
      Object.keys(LABS).forEach((col) => {
        let best = 0, who = null;
        Object.values(O).filter((o) => o.group === 'sample' && !used.has(o.id)).forEach((o) => {
          const l = C.level(o, LABS[col]);
          const pts = l === 2 ? (o.col === col ? 15 : 5) : (l === 1 ? 5 : 0);
          if (pts > best) { best = pts; who = o; }
        });
        if (who) used.add(who.id);
        add(1, who ? NAMES[who.col] + ' minta a ' + NAMES[col] + ' laborban' + (best === 15 ? '' : best === 5 && who.col === col ? ' (csak részben)' : ' (rossz szín vagy csak részben)') : 'Üres: ' + NAMES[col] + ' labor', best);
      });
      // 2. konténer
      const k = C.level(O.KONT, STORE);
      add(2, k === 2 ? 'A konténer teljesen a raktárban' : k === 1 ? 'A konténer részben a raktárban' : 'A konténer nincs a raktárban', k === 2 ? 20 : k === 1 ? 10 : 0);
      // 3. jeladó
      add(3, ctx.flags.beacon != null ? 'A jeladó bekapcsolt (' + (ctx.flags.beacon / 1000).toFixed(1).replace('.', ',') + ' mp)' : 'A jeladó nem kapcsolt be', ctx.flags.beacon != null ? 15 : 0);
      // 4. parkolás
      const park = C.fullyIn(ctx.robot.poly, ctx.def.startZone);
      add(4, park ? 'A robot teljesen a rajtterületen áll' : 'A robot nem teljesen a rajtterületen áll', park ? 15 : 0);
      // 5. bónusz (csak ha a robot szerzett már pontot – mint a WRO-n)
      const earned = lines.reduce((s, l) => s + l.pts, 0) > 0;
      ['SZ1', 'SZ2', 'SZ3'].forEach((id, i) => add(5, (i + 1) + '. szikla ' + (C.moved(O[id]) ? 'elmozdult' : 'a helyén'), !C.moved(O[id]) && earned ? 5 : 0));
      add(5, 'A korlát ' + (C.moved(O.KOR) ? 'elmozdult' : 'a helyén'), !C.moved(O.KOR) && earned ? 10 : 0);
      const total = lines.reduce((s, l) => s + l.pts, 0);
      return { lines, total, max: 60 + 20 + 15 + 15 + 25 };
    },
  });
})();
