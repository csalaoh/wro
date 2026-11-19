/*
 * Kódfejtő Műhely – a foglalkozások (órai feladatsorok)
 *
 * Egy foglalkozás = egy óra. A tanár a tanári felületen nyitja meg és zárja le.
 * A feladatok sorban nyílnak: a következőhöz az előzőt be kell fejezni.
 *
 *  type: 'pipa' – a felület egy részét kell kipróbálni, a diák maga pipálja ki;
 *        'sim'  – a virtuális pályán kell megoldani (a pálya bírálja), aztán a valódi
 *                 robottal kipróbálni, és beírni, mennyivel tévedett.
 *  route: a célok sorban, a gyakorló feladatok célpontjaival (assets/practice.js SPOTS).
 *         'elore300' = 30 cm-rel a rajt előtt, 'haza' = vissza a rajtra.
 *  real:  true = csak Valóság módban elfogadott.
 *  needs: Pythonban ennek a szövegnek benne kell lennie a programban (pl. 'use_gyro(True)').
 *  tool:  melyik részét tanulja meg a webappnak; help: a Súgó fejezete.
 *
 * Új foglalkozás: másold le az egyiket, adj neki új azonosítót (f + osztály _ sorszám),
 * a feladatok azonosítója: <foglalkozás>_<sorszám>.
 */
(function () {
  'use strict';

  const LESSONS = [
    {
      id: 'f3_1',
      title: 'Ismerkedés a Műhellyel',
      groups: ['blokk3', 'python3'],
      mat: 'palya1',
      story: 'Ma megtanulod használni a virtuális pályát és az eszközeit. Minden feladatot előbb itt oldasz meg, aztán kipróbálod a valódi robottal is. A blokkos és a Python-csapat ugyanazokat a feladatokat kapja, a végén összehasonlítjuk, melyik volt pontosabb!',
      tasks: [
        { n: 1, type: 'pipa', title: 'Ügynök-igazolvány', stars: 1, tool: 'Avatár',
          text: 'Kattints a jobb felső sarokban az ügynöködre, és építsd meg az avatárodat: fej, szem, kiegészítő, szín. Ha kész, nyomd meg a „Kész, ez vagyok én!” gombot.',
          tip: 'Az avatárodat a tanárod is látja. Bármikor átállíthatod.' },
        { n: 2, type: 'sim', title: 'Első futás', stars: 1, tool: 'Szerkesztő, Indulj!, konzol', help: 'palya',
          route: ['elore300'],
          text: 'Menj egyenesen előre úgy, hogy a robot eleje (a piros pöcök) pontosan 30 cm-rel kerüljön előrébb!',
          tip: { python: 'Egy sor kell az alapprogram végére: robot.straight(300). A robot milliméterben számol. Nyomd meg az Indulj! gombot, és olvasd el, mit ír a konzol. A Vissza a rajtra gomb visszateszi a robotot.',
                 blocks: 'Húzz egy move ↑ for 30 cm blokkot a többi alá. Nyomd meg az Indulj! gombot, és olvasd el, mit ír a konzol. A Vissza a rajtra gomb visszateszi a robotot.' },
          realTip: 'A valódi pályán a cél 58 cm-re van az alsó széltől (a robot eleje a rajtnál 28 cm-nél áll). Tegyetek oda egy cellux-csíkot.' },
        { n: 3, type: 'sim', title: 'A célzás eszköz', stars: 1, tool: '🎯 Célzás', help: 'eszkozok',
          route: ['piros1'],
          text: 'Állj meg a bal felső négyzetcsoport bal felső piros négyzetén!',
          tip: 'Megjelenítés panel → Mérés → célzás. Kattints a célra: megmondja, mennyit fordulj és mennyit menj. Ezt a két számot írd a programodba.' },
        { n: 4, type: 'sim', title: 'Mérd ki magad!', stars: 1, tool: '📏 Mérőszalag, 📐 Szögmérő', help: 'eszkozok',
          route: ['kfekete'],
          text: 'Állj meg a kis fekete négyzeten! Most ne a célzással dolgozz: mérd ki a fordulást a szögmérővel, a távolságot a mérőszalaggal.',
          tip: 'Először a szögmérő: 1. kattintás a robot közepére, 2. amerre most néz, 3. a célra. Aztán fordulj, futtasd le, és csak utána mérj a mérőszalaggal a robot elejétől a célig. Fordulás közben a robot eleje elmozdul!' },
        { n: 5, type: 'sim', title: 'Két állomás', stars: 2, tool: '🧭 Útvonaltervező', help: 'eszkozok',
          route: ['piros1', 'piros2'],
          text: 'Előbb a bal felső piros négyzethez menj, onnan a mellette lévő jobb felső pirosra!',
          tip: 'Mérés → útvonaltervező. Kattints sorban a két célra, aztán: ⤓ Beírom a programba. A tervező a második szakaszt onnan számolja, ahol a robot az első után áll.' },
        { n: 6, type: 'sim', title: 'Oda és haza', stars: 2, tool: '🧭 Útvonaltervező: ⌂ Haza', help: 'eszkozok',
          route: ['jfekete', 'haza'],
          text: 'Menj a jobb oldali oszlop fekete négyzetéhez, aztán gyere vissza a rajtra, és állj meg felfelé nézve, ugyanott, ahonnan indultál!',
          tip: 'Az útvonaltervezőben a célra kattintás után nyomd meg a ⌂ Haza a rajtra gombot. A rajtnál 2 cm és 5° eltérés fér bele.',
          realTip: 'A valódi robotnál azt mérd: mennyire áll el a robot a narancs rajtkerettől (a hátulja és a bal oldala).' },
        { n: 7, type: 'sim', title: 'Valóság mód', stars: 3, tool: '🎲 Valóság mód', help: 'robot', bonus: true,
          route: ['piros2', 'kpiros2'], real: true,
          text: 'A jobb felső piros négyzet, aztán lent középen a kis piros négyzet. Ezt csak Valóság módban fogadjuk el!',
          tip: 'Robot panel → Valóság mód. Ilyenkor minden futásnál kicsit más a robot, mint a valódi. Futtasd le 3-szor: ha mindháromszor célba ér, jó eséllyel a valódi robot is célba ér.' },
      ],
    },
    {
      id: 'f7_1',
      title: 'Ismerkedés a Műhellyel',
      groups: ['python7'],
      mat: 'palya1',
      story: 'Ma megtanulod a virtuális pálya eszközeit, és megnézzük, mennyire egyezik a szimulátor a valódi robottal. Minden feladatot előbb itt oldasz meg, aztán a valódi robottal mérsz. A méréseitekből állítjuk be a szimulátort.',
      tasks: [
        { n: 1, type: 'pipa', title: 'Ügynök és robot', stars: 1, tool: 'Avatár, ⚙ Robot méretei', help: 'robot',
          text: 'Építsd meg az avatárodat (jobb felső sarok). Aztán a pályán nyisd meg a ⚙ Robot méretei ablakot, és keresd meg: mekkora a kerékátmérő és a tengelytáv? Ne változtass rajta!',
          tip: 'Ez a két szám kerül a programodba: DriveBase(…, wheel_diameter=…, axle_track=…). Ha a valódi robot rosszul fordul, általában a tengelytáv a hibás.' },
        { n: 2, type: 'sim', title: 'Egyenesen, gyróval', stars: 1, tool: 'Szerkesztő, konzol', help: 'palya',
          route: ['elore500'], needs: 'use_gyro(True)',
          text: 'Menj egyenesen előre 50 cm-t úgy, hogy a giroszkóp tartsa az irányt!',
          tip: 'Az alapprogram végére: robot.use_gyro(True), aztán robot.straight(500). A use_gyro nélkül ezt a feladatot nem fogadjuk el.',
          realTip: 'A valódi pályán a cél 78 cm-re van az alsó széltől. Tegyetek oda egy cellux-csíkot.' },
        { n: 3, type: 'sim', title: 'Kis célpont', stars: 1, tool: '🎯 Célzás', help: 'eszkozok',
          route: ['kpiros1'],
          text: 'Állj meg a bal oldali kis piros négyzeten! Ez csak 2 cm-es, itt pontosnak kell lenni.',
          tip: 'Mérés → célzás. A pöttyözött ív mutatja, merre mozdul a robot eleje fordulás közben.' },
        { n: 4, type: 'sim', title: 'Három állomás', stars: 2, tool: '🧭 Útvonaltervező', help: 'eszkozok',
          route: ['piros1', 'kfekete', 'kpiros3'],
          text: 'A bal felső piros négyzet, aztán a kis fekete, végül lent jobbra a kis piros négyzet.',
          tip: 'Útvonaltervező, három kattintás. Írj megjegyzést (#) a programba: melyik sor melyik állomáshoz visz.' },
        { n: 5, type: 'sim', title: 'Tolatva haza', stars: 2, tool: '🧭 Útvonaltervező: ⌂ Haza', help: 'eszkozok',
          route: ['jfekete', 'jpiros', 'haza'],
          text: 'A jobb oldali oszlop fekete négyzete, fölötte a piros, aztán vissza a rajtra, felfelé nézve.',
          tip: 'A ⌂ Haza a rajtra előtt pipáld be a „hazafelé tolasson” négyzetet. A rajtnál 2 cm és 5° fér bele.',
          realTip: 'Azt mérd: mennyire áll el a robot a rajtkerettől.' },
        { n: 6, type: 'sim', title: 'Valóság mód', stars: 3, tool: '🎲 Valóság mód', help: 'robot',
          route: ['kpiros2', 'kpiros3', 'kfekete'], real: true,
          text: 'Járd végig a három kis négyzetet: lent középen a pirosat, jobbra a pirosat, végül a kis feketét. Csak Valóság módban fogadjuk el!',
          tip: 'Futtasd le 5-ször Valóság módban. Hányszor ért célba? Ha nem mindig, lassíts: robot.settings(straight_speed=…, turn_rate=…).' },
        { n: 7, type: 'sim', title: 'Nagy kör hazáig', stars: 3, tool: 'Minden eszköz', help: 'gyakorlas', bonus: true,
          route: ['sarga', 'kpiros3', 'jfekete', 'jpiros', 'haza'], real: true,
          text: 'Sárga mező → lent jobbra a kis piros → a jobb oldali oszlop fekete → fölötte a piros → haza a rajtra. Valóság módban!',
          tip: 'A sárga mező mögötted van, és közel a rajthoz: gondold végig, merre kell fordulni!',
          realTip: 'Azt mérd: mennyire áll el a robot a rajtkerettől.' },
      ],
    },
  ];

  const DIRS = [
    ['pontos', '🎯 Pontosan célban'],
    ['elotte', '⬇ Előtte állt meg'],
    ['tulment', '⬆ Túlment'],
    ['balra', '⬅ Balra ment mellé'],
    ['jobbra', '➡ Jobbra ment mellé'],
  ];

  const ALL = [];
  LESSONS.forEach((l) => l.tasks.forEach((t) => { t.id = l.id + '_' + t.n; t.lesson = l.id; ALL.push(t); }));
  const task = (id) => ALL.find((t) => t.id === id) || null;
  const lesson = (id) => LESSONS.find((l) => l.id === id) || null;
  const pick = (v, mode) => (v && typeof v === 'object') ? (v[mode] || v.python) : (v || '');

  window.KodfejtoClass = { LESSONS, DIRS, task, lesson, pick };
})();
