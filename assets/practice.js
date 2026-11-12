/*
 * Kódfejtő Műhely – gyakorló feladatok az alapmozgásokhoz (Pálya1)
 *
 * Mindegyik a 10,10-es alaprajtról indul: a robot hátulja 10 cm-re az alsó,
 * a bal oldala 10 cm-re a bal pályaszéltől, felfelé néz.
 * A célokat sorban kell elérni: a robot ELEJE (a piros mutató) álljon meg a célon.
 * Ha csak átsuhan rajta, az nem számít.
 *
 * A célpontok a Pálya1 elemeinek közepe (mm, a bal alsó saroktól mérve).
 */
(function () {
  'use strict';

  const SPOTS = {
    piros1: { x: 212, y: 852, r: 25, name: 'bal felső piros négyzet' },
    piros2: { x: 332, y: 852, r: 25, name: 'jobb felső piros négyzet' },
    piros3: { x: 332, y: 732, r: 25, name: 'jobb alsó piros négyzet' },
    fekete: { x: 212, y: 732, r: 25, name: 'nagy fekete négyzet (bal felső csoport)' },
    kpiros1: { x: 502, y: 446, r: 15, name: 'kis piros négyzet (bal)' },
    kpiros2: { x: 624, y: 332, r: 15, name: 'kis piros négyzet (lent középen)' },
    kpiros3: { x: 738, y: 332, r: 15, name: 'kis piros négyzet (lent jobbra)' },
    kfekete: { x: 624, y: 446, r: 15, name: 'kis fekete négyzet' },
    jpiros: { x: 942, y: 850, r: 15, name: 'jobb oldali oszlop felső piros négyzete' },
    jfekete: { x: 942, y: 554, r: 15, name: 'jobb oldali oszlop fekete négyzete' },
    sarga: { x: 312, y: 134, r: 25, name: 'sárga mező' },
  };

  // stars: 1 = könnyű, 2 = közepes, 3 = nehéz
  // route: a célok sorban. 'elore500' = 50 cm-rel a rajt előtt, 'haza' = vissza a rajtra.
  const TASKS = [
    { id: 'gy1', stars: 1, title: 'Egyenesen előre 50 cm', route: ['elore500'],
      text: 'Menj egyenesen előre úgy, hogy a robot eleje pontosan 50 cm-rel kerüljön előrébb!',
      tip: 'Ehhez egyetlen parancs kell. Pythonban milliméterben adod meg: robot.straight(500). Blokkal: move ↑ for 50 cm. A valódi pályán tegyetek egy cellux-csíkot a célhoz: 78 cm-re az alsó széltől (a robot eleje a rajtnál 28 cm-nél van).' },
    { id: 'gy2', stars: 1, title: 'Fordulj, aztán menj', route: ['piros3'],
      text: 'Állj meg a bal felső négyzetcsoport jobb alsó piros négyzetén!',
      tip: 'Két parancs: egy fordulás és egy egyenes. A célzás eszköz megmondja, mennyit fordulj és mennyit menj. Figyeld meg: a fordulás kicsi, alig 16 fok!' },
    { id: 'gy3', stars: 1, title: 'Kis célpont', route: ['kpiros1'],
      text: 'Állj meg a bal oldali kis piros négyzeten! Ez csak 2 cm-es, itt pontosnak kell lenni.',
      tip: 'Ugyanaz, mint az előző, csak nagyobb a fordulás és kisebb a cél. Ha a valódi robot mellémegy, nézd meg a tengelytávot a Robot méretei ablakban!' },
    { id: 'gy4', stars: 2, title: 'Piros, aztán fekete', route: ['piros3', 'fekete'],
      text: 'Először a jobb alsó piros négyzethez menj, onnan a mellette lévő nagy fekete négyzethez!',
      tip: 'A második szakaszt onnan kell számolni, ahol a robot az első után áll – nem a rajttól! Az útvonaltervező eszköz ezt megcsinálja helyetted: kattints sorban a két célra.' },
    { id: 'gy5', stars: 2, title: 'Három állomás', route: ['piros2', 'fekete', 'kpiros1'],
      text: 'A jobb felső piros négyzet, aztán a nagy fekete, végül a bal oldali kis piros négyzet.',
      tip: 'Három fordulás, három egyenes. Írd a programba megjegyzésként (#), melyik sor melyik állomáshoz visz!' },
    { id: 'gy6', stars: 2, title: 'Oda és tolatva vissza', route: ['fekete', 'haza'],
      text: 'Menj a nagy fekete négyzethez, aztán TOLATVA gyere vissza a rajtra, és állj ugyanúgy, ahogy indultál!',
      tip: 'Visszafelé ugyanazokat a parancsokat kell fordított sorrendben és ellenkező előjellel kiadni: ha oda turn(10), straight(400) volt, vissza straight(-400), turn(-10). A rajtnál 2 cm és 5° az engedett eltérés.' },
    { id: 'gy7', stars: 3, title: 'Kis négyzetek túrája', route: ['kpiros2', 'kpiros3', 'kfekete'],
      text: 'Járd végig a három kis négyzetet: lent középen a pirosat, aztán a jobbra lévő pirosat, végül a kis feketét!',
      tip: 'Kicsik a célok és közel vannak egymáshoz, ezért a fordulásokon múlik minden. Kapcsold be a Valóság módot, és nézd meg, hányszor sikerül 5 próbából!' },
    { id: 'gy8', stars: 3, title: 'Nagy kör hazáig', route: ['sarga', 'kpiros3', 'jfekete', 'jpiros', 'haza'],
      text: 'Sárga mező → lent jobbra a kis piros → a jobb oldali oszlop fekete négyzete → fölötte a piros → és haza a rajtra (előre is jöhetsz, de a végén felfelé nézz)!',
      tip: 'Hosszú út, sok fordulás: itt jönnek elő a kis hibák. A sárga mező nagyon közel van a rajthoz, ráadásul mögötted: gondold végig, merre kell fordulni!' },
  ];

  window.KodfejtoPractice = { SPOTS, TASKS };
})();
