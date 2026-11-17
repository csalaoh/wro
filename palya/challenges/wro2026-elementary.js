/*
 * WRO 2026 RoboMission Elementary – „Robot Sztárzenészek” (Robots Meet Culture)
 *
 * Forrás: WRO 2026 RoboMission Elementary, magyar szabálykönyv (2025.12.15-i
 * verzió), 4 feladat, max. 255 pont. A pálya a hivatalos nyomdai fájlból
 * (TIF), 1 px = 1 mm-re kicsinyítve; a területeket arról mértük ki.
 *
 * FIGYELEM – 1. változat:
 *  - Az elemek MÉRETE becsült (a szabálykönyv fotóiból és a pályán jelölt
 *    kiindulási helyekből, 1 bütyök = 8 mm). Az építési útmutatóból pontosítandó (SIZE).
 *  - Felülnézeti 2D modell: az elemek nem borulnak fel, ezért az „álló
 *    helyzet” feltétel mindig teljesül.
 */
(function () {
  'use strict';
  const C = window.KodfejtoChallenges;
  const r = (x0, x1, y0, y1) => ({ x0, x1, y0, y1 });
  const grow = (z, d) => r(z.x0 - d, z.x1 + d, z.y0 - d, z.y1 + d);

  // Becsült elemméretek (mm) – az építési útmutató alapján pontosítandó!
  const SIZE = {
    cable: [150, 24], note: [32, 32], mic: [40, 40], guitar: [32, 48], synth: [56, 40], conga: [64, 32],
    clef: [46, 30], speaker: [26, 45], amp: [46, 94],
  };
  const COL = { RED: '#D9262B', GREEN: '#22A447', BLUE: '#2450D8', YELLOW: '#F5D423', WHITE: '#F4F4F4', BLACK: '#1D1D1D' };
  const HU = { RED: 'piros', GREEN: 'zöld', BLUE: 'kék', YELLOW: 'sárga', WHITE: 'fehér', BLACK: 'fekete' };

  // ---- területek (a nyomdai pályaképről kimérve, mm) ----
  const START = r(2039, 2312, 435, 708);                  // kék keretes rajtterület
  const MIC_TARGET = r(221, 300, 695, 791);               // világoszöld terület a színpadon
  const BACKSTAGE = r(0, 396, 0, 318);                    // rózsaszín terület a bal alsó sarokban (a szürke vonal nélkül)
  // szürke kábel-célterületek (ferde téglalapok a színpadon)
  const CABLE_ZONES = [
    { poly: [[56, 1045], [20, 842], [97, 828], [133, 1031]] },
    { poly: [[97, 659], [20, 645], [56, 442], [133, 456]] },
  ];
  // hangjegy-célterületek: a színes négyzet + a 16 mm-es szürke keret
  const NOTE_TARGET = {
    YELLOW: grow(r(1042, 1089, 528, 574), 16), BLACK: grow(r(1197, 1245, 469, 517), 16), RED: grow(r(1358, 1405, 503, 550), 16),
    GREEN: grow(r(1525, 1572, 572, 619), 16), BLUE: grow(r(1667, 1714, 635, 683), 16), WHITE: grow(r(1835, 1882, 732, 778), 16),
  };
  // hangjegyek kiindulási helyei a pálya tetején (balról jobbra)
  const NOTE_START = { LG1: [1231, 1059.5], LG2: [1363, 1059.5], RED: [1494.5, 1059.5], GREEN: [1627, 1059.5], LG3: [1758.5, 1059.5], LG4: [1890.5, 1059.5] };
  // védett elemek kiindulási területei
  const CLEF_ZONE = r(830, 878, 534, 566);                // türkiz jel a kotta bal végén
  const AMP_ZONE = r(37, 85, 695, 791);                   // fekete jel a színpadon
  const SPEAKER_ZONES = [
    { poly: [[101, 1102], [85, 1058], [111, 1048], [128, 1092]] },
    { poly: [[111, 439], [85, 430], [101, 385], [128, 395]] },
  ];

  const NAMES = {
    KABEL1: 'felső kábel', KABEL2: 'alsó kábel', MIKROFON: 'mikrofon', GITAR: 'gitár', SZINTI: 'szintetizátor', KONGA: 'konga',
    KULCS: 'violinkulcs', ERŐSÍTŐ: 'erősítő', HANGFAL1: 'felső hangfal', HANGFAL2: 'alsó hangfal',
  };

  C.register({
    id: 'wro2026e',
    name: 'WRO 2026 Elementary: Robot Sztárzenészek',
    short: 'Robot Sztárzenészek (Elementary 2026)',
    mat: { key: 'wro2026e', image: 'wro2026e.jpg', width: 2362, height: 1143, name: 'WRO 2026 Elementary' },
    timeLimit: 120000,
    startZone: START,
    start: { x: 2230, y: 571.5, heading: 270 },
    estimated: true,
    tasks: [
      { n: 1, title: '1. Erősítő összekapcsolása a hangfalakkal' },
      { n: 2, title: '2. Show előkészítése' },
      { n: 3, title: '3. Dallam lejátszása' },
      { n: 4, title: '4. Bónusz pontok' },
    ],
    drawZones: [
      { zone: START, color: '#2F6FED', label: 'RAJT' },
      { zone: MIC_TARGET, color: '#1E8A55', label: 'mikrofon' },
      { zone: BACKSTAGE, color: '#C2185B', label: 'backstage' },
      ...CABLE_ZONES.map((z) => ({ zone: z, color: '#55657F', label: 'kábel' })),
      ...Object.values(NOTE_TARGET).map((z) => ({ zone: z, color: '#8A5CF6' })),
      { zone: CLEF_ZONE, color: '#18A3B8' }, { zone: AMP_ZONE, color: '#18A3B8' },
      ...SPEAKER_ZONES.map((z) => ({ zone: z, color: '#18A3B8' })),
    ],
    hiddenZones: true,
    help: 'A két kábelt vidd a színpad szürke területeire (a hangfalak és az erősítő közé). A mikrofont a színpad világoszöld területére, a három hangszert a bal alsó rózsaszín backstage területre. A hat hangjegyet tedd a kotta azonos színű négyzeteire. A violinkulcshoz, a hangfalakhoz és az erősítőhöz ne érj!',

    setup(rand) {
      rand = rand || Math.random;
      const o = [];
      const add = (id, label, color, size, x, y, extra) => o.push(Object.assign({ id, name: NAMES[id] || id, label, color, w: size[0], h: size[1], x, y }, extra || {}));
      // kábelek a rózsaszín jeleken (a színpad mellett, fent és lent)
      add('KABEL1', '', '#2B2B2B', SIZE.cable, 634, 1053, { grab: true, group: 'cable' });
      add('KABEL2', '', '#2B2B2B', SIZE.cable, 634, 89.5, { grab: true, group: 'cable' });
      // a teherautóban: mikrofon, konga, gitár, szintetizátor (mindig ugyanott)
      add('MIKROFON', 'M', '#EDEDED', SIZE.mic, 1139.5, 96, { grab: true, group: 'mic' });
      add('KONGA', 'K', '#E9D8A6', SIZE.conga, 1288, 97, { grab: true, group: 'instrument' });
      add('GITAR', 'G', '#C8323A', SIZE.guitar, 1436.5, 95.5, { grab: true, group: 'instrument' });
      add('SZINTI', 'Sz', '#F4F4F4', SIZE.synth, 1579.5, 95, { grab: true, group: 'instrument' });
      // hangjegyek: a piros és a zöld mindig ugyanott, a másik négy sorsolt
      const rnd = C.shuffle(['BLACK', 'WHITE', 'YELLOW', 'BLUE'], rand);
      const place = { RED: NOTE_START.RED, GREEN: NOTE_START.GREEN, [rnd[0]]: NOTE_START.LG1, [rnd[1]]: NOTE_START.LG2, [rnd[2]]: NOTE_START.LG3, [rnd[3]]: NOTE_START.LG4 };
      Object.entries(place).forEach(([c, [x, y]]) => add('HJ_' + c, '♪', COL[c], SIZE.note, x, y, { name: HU[c] + ' hangjegy', grab: true, group: 'note', col: c }));
      // védett elemek
      add('KULCS', '𝄞', '#2450D8', SIZE.clef, 854, 550, { protect: true });
      add('ERŐSÍTŐ', 'E', '#1D1D1D', SIZE.amp, 61, 743, { protect: true });
      add('HANGFAL1', 'H', '#2450D8', SIZE.speaker, 106.5, 1075, { protect: true, a: 20 });
      add('HANGFAL2', 'H', '#2450D8', SIZE.speaker, 106.5, 412, { protect: true, a: -20 });
      return {
        objects: o,
        triggers: [],
        draw: 'Hangjegyek a pálya tetején (balról jobbra): ' + [rnd[0], rnd[1], 'RED', 'GREEN', rnd[2], rnd[3]].map((c) => HU[c]).join(', '),
      };
    },

    score(ctx) {
      const O = Object.values(ctx.objects), lines = [];
      const add = (task, text, pts) => lines.push({ task, text, pts });
      // 1. kábelek: szürke területenként egy kábel számít
      const used = new Set();
      CABLE_ZONES.forEach((z, i) => {
        let best = 0, who = null;
        O.filter((o) => o.group === 'cable' && !used.has(o.id)).forEach((o) => { const l = C.level(o, z); if (l > best) { best = l; who = o; } });
        if (who) used.add(who.id);
        add(1, (i ? 'Alsó' : 'Felső') + ' szürke terület: ' + (best === 2 ? 'kábel teljes terjedelmével' : best === 1 ? 'kábel csak részben' : 'nincs kábel'), best === 2 ? 15 : best === 1 ? 5 : 0);
      });
      // 2. mikrofon és hangszerek
      const mic = C.level(ctx.objects.MIKROFON, MIC_TARGET);
      add(2, 'Mikrofon ' + (mic === 2 ? 'teljes terjedelmével' : mic === 1 ? 'csak részben' : 'nincs') + ' a célterületen', mic === 2 ? 20 : mic === 1 ? 10 : 0);
      O.filter((o) => o.group === 'instrument').forEach((o) => {
        const l = C.level(o, BACKSTAGE);
        add(2, o.name[0].toUpperCase() + o.name.slice(1) + (l === 2 ? ' teljes terjedelmével a backstage területen' : l === 1 ? ' csak részben a backstage területen (0 pont)' : ' nincs a backstage területen'), l === 2 ? 15 : 0);
      });
      // 3. hangjegyek
      O.filter((o) => o.group === 'note').forEach((o) => {
        const l = C.level(o, NOTE_TARGET[o.col]);
        add(3, HU[o.col] + ' hangjegy ' + (l === 2 ? 'teljes terjedelmével' : l === 1 ? 'csak részben' : 'nincs') + ' a helyén', l === 2 ? 20 : l === 1 ? 10 : 0);
      });
      // 4. bónusz – „elmozdítva”: már nem érintkezik a kiindulási területével, vagy nem úgy áll, mint induláskor
      const stays = (o, z) => !o.carried && C.touches(C.objPoly(o), z) && Math.abs(o.a - o.a0) <= 10;
      add(4, 'Violinkulcs ' + (stays(ctx.objects.KULCS, CLEF_ZONE) ? 'a helyén' : 'elmozdult'), stays(ctx.objects.KULCS, CLEF_ZONE) ? 10 : 0);
      ['HANGFAL1', 'HANGFAL2'].forEach((id, i) => add(4, (i ? 'Alsó' : 'Felső') + ' hangfal ' + (stays(ctx.objects[id], SPEAKER_ZONES[i]) ? 'a helyén' : 'elmozdult'), stays(ctx.objects[id], SPEAKER_ZONES[i]) ? 10 : 0));
      add(4, 'Erősítő ' + (stays(ctx.objects['ERŐSÍTŐ'], AMP_ZONE) ? 'a helyén' : 'elmozdult'), stays(ctx.objects['ERŐSÍTŐ'], AMP_ZONE) ? 10 : 0);
      return { lines, total: lines.reduce((s, l) => s + l.pts, 0), max: 255 };
    },
  });
})();
