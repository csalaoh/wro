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

  SAMPLES.wro = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction, Color\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# TANÁRI MINTA – ugyanaz a farm, saját parancsokkal\n\n# A bírónak szóló jelzések (házi WRO, 4.4 pont)\ndef felvesz():\n    hub.light.on(Color.GREEN)\n    hub.speaker.beep(800, 200)\n    wait(1000)\n\ndef lerak():\n    hub.light.on(Color.BLUE)\n    hub.speaker.beep(400, 200)\n    wait(1000)\n\n# K2 kosár a bal felső parcellára\nrobot.turn(7.6)\nrobot.straight(258)\nfelvesz()\nrobot.turn(17.3)\nrobot.straight(370)\nlerak()\n\n# Ha később fogókar kerül a robotra, CSAK a felvesz() és lerak()\n# belsejét kell átírni – a pálya kódja ugyanaz marad.\n';

  SAMPLES.k5 = 'from pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# 1. MEGTANÍTJUK a robotnak, mi az a "negyzet".\n#    Figyeld meg: ettől még NEM mozdul!\ndef negyzet():\n    for i in range(4):\n        robot.straight(150)\n        robot.turn(90)\n\n# 2. KIMONDJUK a szót: most rajzolja meg!\nnegyzet()\n';
  SAMPLES.k6 = 'from pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# A szó, amit már ismersz\ndef negyzet():\n    for i in range(4):\n        robot.straight(150)\n        robot.turn(90)\n\n# 1. sor: alul három négyzet egymás mellett\nnegyzet()\n# ... innen folytasd: hogyan jutsz át a következő négyzet sarkába?\n\n# 2. sor: két négyzet, fél négyzettel (75 mm) beljebb\n\n# 3. sor: legfelül egy négyzet, középen\n';
  SAMPLES.dobogo = 'from pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# TANÁRI MEGOLDÁS – a dobogó (oldal: 15 cm)\n\ndef negyzet():\n    for i in range(4):\n        robot.straight(150)\n        robot.turn(90)\n\n# A második szó, amire a gyerekeknek maguktól kell rájönniük:\n# "lépj át a szomszéd négyzet sarkába"\ndef jobbra_lep():\n    robot.turn(90)\n    robot.straight(150)\n    robot.turn(-90)\n\n# 1. sor: 3 négyzet\nnegyzet()\njobbra_lep()\nnegyzet()\njobbra_lep()\nnegyzet()\n\n# Átállás a 2. sor elejére: fel 15 cm, balra 22,5 cm\nrobot.straight(150)\nrobot.turn(-90)\nrobot.straight(225)\nrobot.turn(90)\n\n# 2. sor: 2 négyzet\nnegyzet()\njobbra_lep()\nnegyzet()\n\n# Átállás a 3. sorra: fel 15 cm, balra 7,5 cm\nrobot.straight(150)\nrobot.turn(-90)\nrobot.straight(75)\nrobot.turn(90)\n\n# 3. sor: 1 négyzet\nnegyzet()\n';
  SAMPLES.k7 = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction, Color\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# 1. Odamegyünk a jobb oldali kosárhoz (K2)\nrobot.turn(7.6)\nrobot.straight(258)\n\n# FELVESZEM! – jelzés a bírónak\nhub.light.on(Color.GREEN)\nhub.speaker.beep(800, 200)\nwait(1000)\n\n# 2. Elvisszük a bal felső parcellára, a madárijesztő mellett\nrobot.turn(17.3)\nrobot.straight(370)\n\n# LERAKOM! – jelzés a bírónak\nhub.light.on(Color.BLUE)\nhub.speaker.beep(400, 200)\nwait(1000)\n\n# 3. Most te jössz: hozd el a másik kosarat (K1) a középső parcellára!\n';

  SAMPLES.k8 = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# 1. Tolass a falhoz! A robot hátulja nekinyomódik a falnak,\n#    és közben kiegyenesedik.\nrobot.drive(-100, 0)     # lassan hátra\nwait(1500)               # 1,5 másodpercig tolja a falat\nrobot.stop()\n\n# 2. Most már pontosan egyenesen áll: indulhat előre\nrobot.straight(400)\n';
  SAMPLES.k9 = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem = ColorSensor(Port.C)\n\n# 1. Indulj el, és közben figyeld a színszenzort!\nrobot.drive(150, 0)\nwhile szem.reflection() > 50:    # amíg világosat (fehéret) lát...\n    wait(5)                      # ...addig megy tovább\nrobot.stop()                     # fekete vonal: megállunk\n\n# 2. Innen már pontosan tudjuk, hol vagyunk\nrobot.straight(100)\n';
  SAMPLES.k10 = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem_b = ColorSensor(Port.C)     # bal oldali színszenzor\nszem_j = ColorSensor(Port.F)     # jobb oldali színszenzor\n\ndef igazodj():\n    # Mindkét kerék lassan a vonal felé megy. Amelyik oldal szenzora\n    # feketét lát, annak a kereke megáll, a másik tovább megy.\n    while True:\n        b_kesz = szem_b.reflection() < 50\n        j_kesz = szem_j.reflection() < 50\n        if b_kesz and j_kesz:\n            break\n        if b_kesz:\n            bal.stop()\n        else:\n            bal.run(100)\n        if j_kesz:\n            jobb.stop()\n        else:\n            jobb.run(100)\n        wait(5)\n    bal.stop()\n    jobb.stop()\n\nigazodj()              # 1. igazodás: már majdnem egyenes\nrobot.straight(-40)    # egy kicsit vissza a vonal elé\nigazodj()              # 2. igazodás: most már pontos\n\n# Most merőlegesen áll a vonalra: innen mérhetünk\nrobot.straight(150)\n';
  SAMPLES.k11 = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem = ColorSensor(Port.C)\n\n# Kövesd a vonal szélét 20 másodpercig!\nfor i in range(2000):\n    if szem.reflection() < 50:   # feketén vagyok: kifelé kanyarodom\n        robot.drive(120, 40)\n    else:                        # fehéren vagyok: befelé kanyarodom\n        robot.drive(120, -40)\n    wait(10)\nrobot.stop()\n';
  SAMPLES.k12 = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem = ColorSensor(Port.C)\n\ndef tolass_a_falhoz():\n    robot.drive(-100, 0)\n    wait(1500)\n    robot.stop()\n\ndef menj_a_vonalig():\n    robot.drive(150, 0)\n    while szem.reflection() > 50:\n        wait(5)\n    robot.stop()\n\n# 1. Igazodás a falhoz: innen egyenesen állunk\ntolass_a_falhoz()\n# 2. Az A vonalig: innen tudjuk, milyen messze vagyunk a faltól\nmenj_a_vonalig()\nrobot.straight(-150)          # vissza a vonal alá\n# 3. Jobbra fordulunk, és a B vonalig megyünk\nrobot.turn(90)\nmenj_a_vonalig()\n# 4. Balra fordulunk, és felmegyünk a célhoz\nrobot.turn(-90)\nrobot.straight(300)\n';

  // A küldetések kiinduló programja (a Küldetések oldal „Kipróbálom a pályán” gombja: #k2-python)
  const MISSION_START = {
    k1: { python: 'beep', blocks: 'k1' },
    k2: { python: 'square', blocks: 'square', mat: 'palya2' },
    k3: { python: 'k3', blocks: 'turn' },
    k4: { python: 'gyro' },
    k5: { python: 'k5', blocks: 'k5', mat: 'rajzlap' },
    k6: { python: 'k6', blocks: 'k6', mat: 'rajzlap' },
    k7: { python: 'k7', blocks: 'k7', wro: true },
    // 8–12.: igazodás falhoz és vonalhoz az edzőpályán (WRO-méret)
    k8: { python: 'k8', blocks: 'k8', mat: 'edzo', start: { x: 400, y: 90, heading: 12 } },
    k9: { python: 'k9', blocks: 'k9', mat: 'edzo', start: { x: 1100, y: 150, heading: 0 } },
    k10: { python: 'k10', mat: 'edzo', start: { x: 600, y: 300, heading: 10 } },
    k11: { python: 'k11', blocks: 'k11', mat: 'edzo', start: { x: 1820, y: 200, heading: 90 } },
    k12: { python: 'k12', mat: 'edzo', start: { x: 150, y: 150, heading: 0 } },
  };
  // A küldetések célja az edzőpályán: hol álljon meg a mutató vége.
  //  band: egy vonal (y = …) adott tűréssel, opcionálisan egyenes irány;  point: egy pont adott sugárral
  const MISSION_TARGET = {
    k8: { type: 'band', y: 580, tol: 10, heading: 0, htol: 1.5, label: 'a mutató 2 cm-rel az A vonal előtt, egyenesen' },
    k9: { type: 'band', y: 730, tol: 10, label: 'a mutató 12 cm-rel az A vonal fölött' },
    k10: { type: 'band', y: 780, tol: 10, heading: 0, htol: 2.5, label: 'a mutató 17 cm-rel az A vonal fölött, merőlegesen' },
    k12: { type: 'point', x: 810, y: 780, r: 20, label: 'a piros cél közepe' },
  };

  // Alaprajt: a robot hátulja 10 cm-re a pálya alsó szélétől, a bal oldala 10 cm-re a bal széltől,
  // felfelé néz („10,10”). A robot közepét a beállított méretekből számoljuk.
  // A rajzlapon és a házi WRO-n saját rajt van (a WRO-n a rajtmezőben kell állni).
  const FIXED_START = {
    rajzlap: { x: 275, y: 180, heading: 0 },
    wro: { x: 119, y: 120, heading: 0 },
  };
  function defaultStart(key) {
    if (FIXED_START[key]) return Object.assign({}, FIXED_START[key]);
    const d = dims();
    return { x: 100 + d.width / 2, y: 100 + d.rear, heading: 0 };
  }

  // ------------------------------------------------------------ tárolás
  const store = {
    get(k, d) { try { const v = localStorage.getItem('kodfejto.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kodfejto.' + k, JSON.stringify(v)); } catch (e) { /* nincs tárolás */ } },
  };

  // ------------------------------------------------------------ a robot méretei
  // Amit a tanár/diák a „Robot méretei” ablakban megad (mm). Ebből számoljuk a
  // szimulátor robotját: a fizika, a rajz, az ütközés és a bíró is ezt használja.
  const DIM_DEFAULT = { wheel: 56, axle: 112, length: 160, width: 128, rear: 60, pointer: 20, sensFwd: 20, color2: true, sensGap: 60 };
  function dims() { return Object.assign({}, DIM_DEFAULT, store.get('robotDims', {})); }
  function ROBOT() {
    const d = dims(), front = d.length - d.rear;
    return Object.assign({}, Sim.ROBOT_DEFAULT, {
      wheelDiameter: d.wheel, axleTrack: d.axle, bodyFront: front, bodyRear: d.rear, bodyWidth: d.width,
      pointer: front + d.pointer,
      colorSensor: { forward: Math.max(0, front - d.sensFwd), side: d.color2 ? -d.sensGap / 2 : 0 },
      colorSensors: d.color2
        ? { C: { forward: Math.max(0, front - d.sensFwd), side: -d.sensGap / 2 }, F: { forward: Math.max(0, front - d.sensFwd), side: d.sensGap / 2 } }
        : { C: { forward: Math.max(0, front - d.sensFwd), side: 0 } },
      distanceSensor: { forward: Math.max(0, front - 5), side: 0 },
      ports: Object.assign({}, Sim.ROBOT_DEFAULT.ports, { F: d.color2 ? 'color' : null }),
    });
  }
  // Valóság mód: minden futásnál kicsit más a robot (kerekek, tengelytáv, letevés),
  // mint a valóságban. Ideiglenes értékek – az órai mérések után pontosítjuk.
  function noisyRobot(R) {
    const u = (a) => (Math.random() * 2 - 1) * a;
    const n = { wl: u(0.006), wr: u(0.006), ax: u(0.015), h: u(1.5), x: u(2), y: u(2) };
    return {
      robot: Object.assign({}, R, { wheelDiameterL: R.wheelDiameter * (1 + n.wl), wheelDiameterR: R.wheelDiameter * (1 + n.wr), axleTrackReal: R.axleTrack * (1 + n.ax) }),
      n,
    };
  }

  // Felhős mód: belépés nélkül a pálya nem használható (kivéve a tanárt).
  const Cloud = window.KodfejtoCloud;
  const cloudOn = !!(Cloud && Cloud.enabled);
  if (cloudOn && !Cloud.session() && !Cloud.teacherSession()) {
    location.replace('../belepes.html?vissza=' + encodeURIComponent('palya/index.html' + location.hash));
    return;
  }
  if (cloudOn) Cloud.flush().catch(() => {});

  // ------------------------------------------------------------ állapot
  const state = {
    mat: store.get('mat', 'palya1'),
    starts: store.get('starts', {}),
    pyodide: null, shim: null,
    images: {}, pixels: {},
    result: null, ghost: null,
    play: null, pose: null,
    tape: [], tapeFromRobot: false, ang: null, aim: null, route: [], practiceRes: null, dragging: false,
    audio: null,
    wro: null, // házi WRO küldetés állapota (ha be van kapcsolva)
    mode: store.get('mode', store.get('group', '') === 'blokk3' ? 'blocks' : 'python'), ws: null, lastBlock: null,
  };

  // Melyik rajthoz tartozunk: a házi WRO-nak saját rajtja van (a Pálya1-en, de a rajtmezőben).
  function startKey() { return state.wro ? 'wro' : state.mat; }
  function curStart() {
    const k = startKey();
    if (!state.starts[k]) state.starts[k] = defaultStart(k);
    return state.starts[k];
  }
  // Egyszeri átállás a 10,10-es alaprajtra (a régi, máshol álló rajtokat elfelejtjük).
  if (store.get('startVer', 0) < 2) {
    ['palya1', 'palya2', 'edzo'].forEach((k) => { delete state.starts[k]; });
    store.set('startVer', 2); store.set('starts', state.starts);
  }

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
  const PY_SAMPLE_LABELS = { beep: 'Első csipogás (1. küldetés)', square: 'Bűvös négyzet (2. küldetés)', k3: 'Fordulás 90 fokkal (3. küldetés)', gyro: 'Négyzet giroszkóppal (4. küldetés)', color: 'Mit lát a színszenzor?', k5: 'A robot új szót tanul: négyzet (5. küldetés)', k6: 'Dobogó – kezdés (6. küldetés)', k7: 'Ébred a farm – kézzel (7. küldetés)', k8: 'Tolass a falhoz! (8. küldetés)', k9: 'Menj a vonalig! (9. küldetés)', k10: 'Igazodj a vonalhoz két szenzorral (10. küldetés)', k11: 'Kövesd a vonalat! (11. küldetés)', k12: 'Hosszú út újrakalibrálással (12. küldetés)', dobogo: '🔑 TANÁRI: dobogó – teljes megoldás', wro: '🔑 TANÁRI: farm – felvesz() és lerak() paranccsal' };
  const TEACHER_SAMPLES = new Set(['dobogo', 'wro']);
  // Tanári mód: palya/index.html?tanar  (a böngésző megjegyzi; ?tanar=0 kikapcsolja)
  (function () {
    const m = /[?&]tanar(=([01]))?/.exec(location.search);
    if (m) store.set('teacher', m[2] !== '0');
  })();
  const isTeacher = () => store.get('teacher', false);
  function fillSamples() {
    const sel = $('sampleSel');
    const list = state.mode === 'blocks'
      ? Object.entries(window.KodfejtoBlocks.SAMPLES).filter(([, v]) => !v.teacher || isTeacher()).map(([k, v]) => [k, v.label])
      : Object.entries(PY_SAMPLE_LABELS).filter(([k]) => !TEACHER_SAMPLES.has(k) || isTeacher());
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
      theme: Blockly.Theme.defineTheme('kodfejto', { base: Blockly.Themes.Zelos, blockStyles: { procedure_blocks: { colourPrimary: '#FF6680', colourSecondary: '#FF8FA3', colourTertiary: '#D94B66' } }, fontStyle: { family: 'Nunito, sans-serif', weight: '700', size: 12 } }),
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
    updateRouteBox();
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
    const ne = /NameError: name '(\w+)' is not defined/.exec(err);
    if (ne && state.mode === 'python' && new RegExp('^\\s*def\\s+' + ne[1] + '\\s*\\(', 'm').test(ta.value)) {
      return 'A(z) ' + ne[1] + ' szót előbb meg kell tanítani a robotnak (def), és csak UTÁNA lehet kimondani. Tedd a def részt a program elejére, a hívás fölé!';
    }
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

  function drawPath(frames, uptoT, color, dashed, width) {
    if (!frames || frames.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width || 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
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
    const R = ROBOT(), s = scale();
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
    Object.values(R.colorSensors || { C: R.colorSensor }).forEach((c) => ctx.fillRect((c.side - 7) * s, -(c.forward + 7) * s, 14 * s, 14 * s));
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
    const p = state.pose || curStart();
    const P = ROBOT().pointer, h = p.heading * Math.PI / 180;
    return [p.x + Math.sin(h) * P, p.y + Math.cos(h) * P];
  }
  // Ha a robot elejétől mérünk, de a robot még nem a cél felé néz, figyelmeztetünk:
  // fordulás közben az eleje elmozdul, így a lemért távolság nem lesz jó.
  function tapeWarning() {
    if (!state.tapeFromRobot || state.tape.length < 2) return null;
    const p = state.pose || curStart();
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
    const s = scale(), P = ROBOT().pointer * s;
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
    drawRobot({ x: state.aim[0] - Math.sin(h) * ROBOT().pointer, y: state.aim[1] - Math.cos(h) * ROBOT().pointer, heading: d.b }, 0.35);
  }

  // Rajzlap: a cél-dobogó halvány képe a rajthelyzethez igazítva (a robot tengelyközepe a bal alsó sarok)
  const PODIUM_SIDE = 150; // a négyzet oldala mm-ben (15 cm) – itt lehet átírni
  function podiumSquares(a) {
    return [[0, 0], [a, 0], [2 * a, 0], [a / 2, a], [1.5 * a, a], [a, 2 * a]];
  }
  function drawTarget() {
    const st = state.starts.rajzlap, a = PODIUM_SIDE, s = scale();
    const [px, py] = toPx(st.x, st.y);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(st.heading * Math.PI / 180);
    ctx.fillStyle = 'rgba(47,111,237,0.07)';
    ctx.strokeStyle = 'rgba(47,111,237,0.45)'; ctx.lineWidth = 6; ctx.setLineDash([]);
    podiumSquares(a).forEach(([x, y]) => {
      ctx.fillRect(x * s, -(y + a) * s, a * s, a * s);
      ctx.strokeRect(x * s, -(y + a) * s, a * s, a * s);
    });
    ctx.restore();
  }

  // ------------------------------------------------------------ küldetés célja (edzőpálya)
  function missionTarget() {
    if (state.mat !== 'edzo') return null;
    return MISSION_TARGET[store.get('slot', '')] || null;
  }
  function drawMissionTarget() {
    const t = missionTarget(); if (!t) return;
    const s = scale();
    ctx.save();
    if (t.type === 'point') {
      const [px, py] = toPx(t.x, t.y);
      ctx.fillStyle = 'rgba(255,90,95,.18)'; ctx.strokeStyle = '#FF5A5F'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(px, py, t.r * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fillStyle = '#FF5A5F'; ctx.fill();
    } else {
      const [, y1] = toPx(0, t.y + t.tol), [, y2] = toPx(0, t.y - t.tol);
      ctx.fillStyle = 'rgba(255,90,95,.16)'; ctx.fillRect(0, y1, canvas.width, y2 - y1);
      ctx.strokeStyle = '#FF5A5F'; ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
      const [, yc] = toPx(0, t.y); ctx.beginPath(); ctx.moveTo(0, yc); ctx.lineTo(canvas.width, yc); ctx.stroke();
    }
    ctx.restore();
  }
  function checkMissionTarget(res) {
    const t = missionTarget(); if (!t || !res.final) return;
    const f = res.final, P = ROBOT().pointer, h = f.heading * Math.PI / 180;
    const tip = [f.x + Math.sin(h) * P, f.y + Math.cos(h) * P];
    let ok, txt;
    if (t.type === 'point') {
      const d = Math.hypot(tip[0] - t.x, tip[1] - t.y);
      ok = d <= t.r; txt = `a mutató ${fmt(d / 10, 1)} cm-re állt meg a cél közepétől`;
    } else {
      const d = tip[1] - t.y;
      ok = Math.abs(d) <= t.tol; txt = `a mutató ${fmt(Math.abs(d) / 10, 1)} cm-rel ${d > 0 ? 'túlment' : 'előtte állt meg'}`;
      if (t.heading != null) {
        let e = ((f.heading - t.heading) % 360 + 540) % 360 - 180;
        txt += `, és ${fmt(Math.abs(e), 1)}°-ot áll ferdén`;
        if (Math.abs(e) > t.htol) ok = false;
      }
    }
    log((ok ? '🎯 Cél teljesítve! ' : '🎯 Még nem sikerült: ') + txt + '. (Cél: ' + t.label + '.)', ok ? 'c-ok' : 'c-hint');
  }

  // ------------------------------------------------------------ gyakorló feladatok (Pálya1)
  // A célokat sorban kell elérni. Egy cél akkor teljesül, ha a robot eleje (a mutató)
  // a célon belül ÁLL MEG: közben a robot alig mozog és alig fordul. Az átsuhanás nem számít.
  const PR = window.KodfejtoPractice || { SPOTS: {}, TASKS: [] };
  function practice() {
    if (state.mat !== 'palya1' || state.wro) return null;
    const id = store.get('practice', '');
    return PR.TASKS.find((t) => t.id === id) || null;
  }
  function practiceTargets(task) {
    const st = curStart(), P = ROBOT().pointer, h = st.heading * Math.PI / 180;
    return task.route.map((k) => {
      if (k === 'haza') return { home: true, name: 'vissza a rajtra' };
      if (k === 'elore500') return { x: st.x + Math.sin(h) * (P + 500), y: st.y + Math.cos(h) * (P + 500), r: 20, name: '50 cm-rel a rajt előtt' };
      return Object.assign({}, PR.SPOTS[k]);
    });
  }
  function drawPractice() {
    const task = practice(); if (!task) return;
    const s = scale(), T = practiceTargets(task), res = state.practiceRes;
    ctx.save();
    T.forEach((t, i) => {
      const col = res && res.task === task.id ? (res.ok[i] ? '#2BB673' : '#C9393E') : '#8A5CF6';
      let px, py;
      if (t.home) {
        const c = rearLeft(curStart()); [px, py] = toPx(c[0] - 18, c[1] - 18);
      } else {
        [px, py] = toPx(t.x, t.y);
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([]);
        ctx.beginPath(); ctx.arc(px, py, t.r * s, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        px += t.r * s + 12; py -= t.r * s + 4;
      }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '800 13px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(t.home ? '⌂' : String(i + 1), px, py + 1);
    });
    ctx.restore();
  }
  function stillFrames(frames) {
    // azok a pillanatok, amikor a robot (majdnem) áll: < 40 mm/s és < 40 °/s
    const out = [];
    for (let i = 1; i < frames.length; i++) {
      const a = frames[i - 1], b = frames[i], dt = Math.max(1, b.t - a.t) / 1000;
      const v = Math.hypot(b.x - a.x, b.y - a.y) / dt, w = Math.abs(norm180(b.h - a.h)) / dt;
      if (v < 40 && w < 40) out.push(i);
    }
    if (frames.length) out.push(frames.length - 1);
    return out;
  }
  function checkPractice(res) {
    const task = practice(); if (!task || !res.frames || !res.frames.length) return;
    const T = practiceTargets(task), P = ROBOT().pointer, fr = res.frames, still = stillFrames(fr);
    const tip = (f) => { const h = f.h * Math.PI / 180; return [f.x + Math.sin(h) * P, f.y + Math.cos(h) * P]; };
    let from = 0; const ok = [], parts = [];
    T.forEach((t, i) => {
      if (t.home) {
        const f = fr[fr.length - 1], st = curStart(), c0 = rearLeft(st), c1 = rearLeft({ x: f.x, y: f.y, heading: f.h });
        const d = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]), e = Math.abs(norm180(f.h - st.heading));
        const good = d <= 20 && e <= 5 && ok.every(Boolean);
        ok.push(good);
        parts.push(`${good ? '✔' : '✘'} ${i + 1}. haza: ${fmt(d / 10, 1)} cm-re és ${fmt(e, 1)}°-kal állt meg a rajttól` + (good ? '' : ' (2 cm és 5° fér bele)'));
        return;
      }
      let hit = -1, best = Infinity;
      for (const k of still) {
        if (k < from) continue;
        const q = tip(fr[k]), d = Math.hypot(q[0] - t.x, q[1] - t.y);
        if (d <= t.r) { hit = k; best = d; break; }
        if (d < best) best = d;
      }
      ok.push(hit >= 0);
      if (hit >= 0) { from = hit; parts.push(`✔ ${i + 1}. ${t.name}: a mutató ${fmt(best / 10, 1)} cm-re állt meg a közepétől`); }
      else parts.push(`✘ ${i + 1}. ${t.name}: ` + (isFinite(best) ? `a legközelebb ${fmt(best / 10, 1)} cm-re álltál meg tőle (legfeljebb ${fmt(t.r / 10, 1)} cm lehet)` : 'ide már nem jutottál el'));
    });
    state.practiceRes = { task: task.id, ok };
    const all = ok.every(Boolean);
    log('🎯 ' + task.title + ':\n   ' + parts.join('\n   '), all ? 'c-ok' : 'c-hint');
    if (all) {
      const done = store.get('practiceDone', []);
      if (!done.includes(task.id)) { done.push(task.id); store.set('practiceDone', done); fillPracticeSel(); }
      log('🏅 Megvan! ' + ($('optReal').checked ? 'Valóság módban is!' : 'Most kapcsold be a Valóság módot, és próbáld meg úgy is!'), 'c-ok');
    }
  }
  function fillPracticeSel() {
    const sel = $('practiceSel'); if (!sel) return;
    const done = store.get('practiceDone', []), cur = store.get('practice', '');
    sel.innerHTML = '<option value="">– nincs kiválasztva –</option>' + PR.TASKS.map((t) =>
      `<option value="${t.id}"${t.id === cur ? ' selected' : ''}>${done.includes(t.id) ? '✔ ' : ''}${t.title} ${'★'.repeat(t.stars)}</option>`).join('');
    showPracticeText();
  }
  function showPracticeText() {
    const task = PR.TASKS.find((t) => t.id === store.get('practice', ''));
    $('practiceText').innerHTML = task ? task.text + (state.mat !== 'palya1' || state.wro ? ' <b>(Ez a Pálya1-en van.)</b>' : '') : 'Válassz egy feladatot! A célok a pályán megszámozva látszanak, a futás után pedig megmondjuk, melyiket érted el.';
    $('practiceTip').hidden = !task;
    $('practiceTipTxt').textContent = task ? task.tip : '';
  }
  function selectPractice(id) {
    store.set('practice', id);
    state.practiceRes = null;
    if (id) {
      store.set('slot', id);  // a program ehhez a feladathoz mentődik
      if (state.mat !== 'palya1' || state.wro) {
        setWro(false); state.mat = 'palya1'; store.set('mat', state.mat); $('matSel').value = 'palya1'; updateMatUi(); fitCanvas();
      }
      stopPlayback(false);
      state.starts.palya1 = defaultStart('palya1'); store.set('starts', state.starts);
      state.pose = null; state.result = null; state.ghost = null;
      const t = PR.TASKS.find((q) => q.id === id);
      log('🎯 Gyakorló feladat: ' + t.title + '. A robot a 10,10-es rajton áll.', 'c-hint');
    }
    fillPracticeSel(); render();
  }
  if ($('practiceSel')) $('practiceSel').addEventListener('change', (e) => selectPractice(e.target.value));

  // ------------------------------------------------------------ útvonaltervező
  // Kattints sorban a célokra: a tervező MINDIG a rajttól számol, szakaszról szakaszra,
  // onnan, ahol a robot az előző szakasz végén áll. A számokat úgy kerekítjük, ahogy
  // a programba kerülnek, és a következő szakaszt már a kerekített értékből számoljuk.
  function routePlan() {
    const st = curStart(), R = ROBOT(), P = R.pointer, blocks = state.mode === 'blocks';
    const qTurn = (t) => blocks ? Math.round(t * R.axleTrack / R.wheelDiameter) * R.wheelDiameter / R.axleTrack : Math.round(t * 10) / 10;
    const qLen = (d) => blocks ? Math.round(d) : Math.round(d);   // mm (blokknál 1 tizedes cm = 1 mm)
    let c = [st.x, st.y], hd = st.heading;
    const legs = [];
    const go = (turn, len, extra) => {
      hd += turn; const h = hd * Math.PI / 180;
      c = [c[0] + Math.sin(h) * len, c[1] + Math.cos(h) * len];
      legs.push(Object.assign({ turn, len, c: c.slice(), heading: hd, tip: [c[0] + Math.sin(h) * P, c[1] + Math.cos(h) * P] }, extra));
    };
    state.route.forEach((pt, i) => {
      if (pt.home) {
        const d = Math.hypot(st.x - c[0], st.y - c[1]);
        if (d >= 1) {
          let b = bearing(c, [st.x, st.y]);
          if (pt.back) b += 180;
          const turn = qTurn(norm180(b - hd)), h = (hd + turn) * Math.PI / 180;
          const along = (st.x - c[0]) * Math.sin(h) + (st.y - c[1]) * Math.cos(h);
          go(turn, qLen(along), { home: 1, n: i + 1 });
        }
        go(qTurn(norm180(st.heading - hd)), 0, { home: 2, n: i + 1 });
        return;
      }
      const turn = qTurn(norm180(bearing(c, pt) - hd)), h = (hd + turn) * Math.PI / 180;
      const along = (pt[0] - c[0]) * Math.sin(h) + (pt[1] - c[1]) * Math.cos(h);
      go(turn, qLen(along - P), { target: pt, n: i + 1 });
    });
    return legs;
  }
  function legText(l, blocks) {
    const R = ROBOT(), out = [];
    if (Math.abs(l.turn) >= 0.05) {
      out.push(blocks
        ? `fordulj ${l.turn > 0 ? 'jobbra' : 'balra'} ${Math.round(Math.abs(l.turn) * R.axleTrack / R.wheelDiameter)} kerékfokot (${fmt(Math.abs(l.turn), 1)}°)`
        : `fordulj ${fmt(Math.abs(l.turn), 1)}°-ot ${l.turn > 0 ? 'jobbra' : 'balra'}`);
    }
    if (l.len) out.push(l.len > 0 ? `menj előre ${fmt(l.len / 10, 1)} cm-t` : `tolass ${fmt(-l.len / 10, 1)} cm-t`);
    return out.join(', ') || 'nem kell mozdulni';
  }
  function updateRouteBox() {
    const box = $('routeBox'); if (!box) return;
    const on = $('toolSel').value === 'route';
    box.hidden = !on;
    if (!on) return;
    const legs = routePlan(), blocks = state.mode === 'blocks';
    const hasHome = state.route.some((p) => p.home);
    box.querySelector('ol').innerHTML = legs.length
      ? legs.map((l) => `<li><b>${l.home === 2 ? 'Beállás felfelé' : l.home ? 'Haza' : l.n + '. cél'}:</b> ${legText(l, blocks)}</li>`).join('')
      : '<li class="empty">Még nincs cél. Kattints a pályán!</li>';
    $('routeUndo').disabled = !state.route.length;
    $('routeClear').disabled = !state.route.length;
    $('routeHome').disabled = hasHome || !state.route.length;
    $('routeInsert').disabled = !legs.length;
  }
  function routeCode(legs) {
    const d = dims(), R = ROBOT(), g = startGeometry();
    const where = g.axis >= 0 ? `a hátulja ${fmt(g.rear[1] / 10, 1)} cm-re a(z) ${g.rear[0]}, a bal oldala ${fmt(g.left[1] / 10, 1)} cm-re a(z) ${g.left[0]} széltől` : 'ferde rajt';
    if (state.mode === 'blocks') {
      const B = (type, fields, inputs) => Object.assign({ type }, fields ? { fields } : {}, inputs ? { inputs } : {});
      const n = (x) => ({ shadow: { type: 'math_number', fields: { NUM: x } } });
      const list = [
        B('spike_set_pair', { PAIR: 'A,B' }),
        B('spike_set_rotation', { UNIT: 'cm' }, { N: n(Math.round(Math.PI * d.wheel) / 10) }),
        B('spike_set_speed', null, { N: n(50) }),
      ];
      legs.forEach((l) => {
        const wd = Math.round(Math.abs(l.turn) * R.axleTrack / R.wheelDiameter);
        if (wd) list.push(B('spike_steer_for', { SIDE: l.turn > 0 ? 'right' : 'left', UNIT: 'degrees' }, { S: n(100), N: n(wd) }));
        if (l.len) list.push(B('spike_move_for', { DIR: l.len > 0 ? 'fwd' : 'back', UNIT: 'cm' }, { N: n(Math.abs(l.len) / 10) }));
      });
      for (let i = list.length - 2; i >= 0; i--) list[i].next = { block: list[i + 1] };
      const start = B('spike_start', null, null); start.x = 30; start.y = 30; start.next = { block: list[0] };
      return { blocks: { languageVersion: 0, blocks: [start] } };
    }
    let py = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\n'
      + 'hub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\n'
      + `robot = DriveBase(bal, jobb, wheel_diameter=${d.wheel}, axle_track=${d.axle})\n\n`
      + `# Útvonal a tervezőből. Rajt: ${where}, irány ${Math.round(curStart().heading)}°.\n`;
    legs.forEach((l) => {
      py += `\n# ${l.home === 2 ? 'beállás a rajtirányba' : l.home ? 'vissza a rajtra' : l.n + '. cél'}\n`;
      if (Math.abs(l.turn) >= 0.05) py += `robot.turn(${String(Math.round(l.turn * 10) / 10)})\n`;
      if (l.len) py += `robot.straight(${l.len})\n`;
    });
    return py;
  }
  function insertRoute() {
    const legs = routePlan(); if (!legs.length) return;
    const code = routeCode(legs);
    if (state.mode === 'blocks') {
      const count = state.ws.getAllBlocks(false).length;
      if (count > 1 && !window.confirm('Lecseréljem a mostani blokkokat az útvonalra?')) return;
      state.ws.clear();
      Blockly.serialization.workspaces.load(code, state.ws);
    } else {
      if (/robot\.\w+\(/.test(ta.value) && !window.confirm('Lecseréljem a mostani programot az útvonalra?')) return;
      ta.value = code; errLine = 0; refreshEditor(); store.set('code', ta.value);
    }
    log('🧭 Beírtam az útvonalat a programba (' + legs.length + ' szakasz). Nyomd meg az Indulj! gombot!', 'c-hint');
  }
  function drawRoute() {
    if ($('toolSel').value !== 'route' || !state.route.length) return;
    const legs = routePlan(), st = curStart(), s = scale();
    ctx.save();
    ctx.strokeStyle = '#0E9F6E'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
    ctx.beginPath(); let [x0, y0] = toPx(st.x, st.y); ctx.moveTo(x0, y0);
    legs.forEach((l) => { const [x, y] = toPx(l.c[0], l.c[1]); ctx.lineTo(x, y); });
    ctx.stroke(); ctx.setLineDash([]);
    legs.forEach((l, i) => {
      if (l.home === 1) return;
      const last = i === legs.length - 1 || legs[i + 1].home === 2 && i + 1 === legs.length - 1;
      drawRobot({ x: l.c[0], y: l.c[1], heading: l.heading }, last ? 0.45 : 0.2);
    });
    ctx.lineWidth = 2.5;
    state.route.forEach((pt, i) => {
      if (pt.home) return;
      const [px, py] = toPx(pt[0], pt[1]);
      ctx.strokeStyle = '#0E9F6E'; ctx.beginPath(); ctx.moveTo(px - 9, py); ctx.lineTo(px + 9, py); ctx.moveTo(px, py - 9); ctx.lineTo(px, py + 9); ctx.stroke();
      ctx.fillStyle = '#0E9F6E'; ctx.beginPath(); ctx.arc(px + 14, py - 14, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '800 12px Nunito, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), px + 14, py - 13);
    });
    ctx.restore();
  }
  (function routeButtons() {
    if (!$('routeBox')) return;
    $('routeUndo').addEventListener('click', () => { state.route.pop(); updateRouteBox(); render(); });
    $('routeClear').addEventListener('click', () => { state.route = []; updateRouteBox(); render(); });
    $('routeHome').addEventListener('click', () => { state.route.push({ home: true, back: $('routeBack').checked }); updateRouteBox(); render(); });
    $('routeBack').addEventListener('change', () => { state.route.forEach((p) => { if (p.home) p.back = $('routeBack').checked; }); updateRouteBox(); render(); });
    $('routeInsert').addEventListener('click', insertRoute);
  })();

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
    if (state.mat === 'rajzlap' && $('optTarget').checked) drawTarget();
    drawMissionTarget();
    drawPractice();
    if ($('optTrail').checked && state.result && state.result.mat === state.mat) {
      if (state.mat === 'rajzlap') drawPath(state.result.frames, playT, '#1D2B44', false, 4); // toll
      else drawPath(state.result.frames, playT, '#2F6FED', false);
    }
    const pose = state.pose || curStart();
    drawWro(pose);
    drawRobot(pose, 1);
    if ($('optStart').checked) drawStart();
    drawTape();
    drawProtractor();
    drawAim();
    drawRoute();
    updateTele(pose, state.play ? state.play.t : null);
    updateStartInfo();
  }

  function fmt(v, d) { return v.toFixed(d).replace('.', ','); }

  // ------------------------------------------------------------ rajtvonal
  // A rajthelyzet a pályára rajzolva: a robot körvonala, a hátulja mögötti rajtvonal
  // és a bal oldala melletti vonal, a pálya szélétől mért távolságokkal.
  const EDGE = ['alsó', 'bal', 'felső', 'jobb'];
  function startGeometry() {
    const st = curStart(), R = ROBOT(), M = matInfo();
    const q = ((Math.round(st.heading) % 360) + 360) % 360;
    const axis = q % 90 === 0 ? q / 90 : -1;
    const c = rearLeft(st);
    const W = R.bodyWidth, B = R.bodyRear;
    let rear = null, left = null;
    if (axis === 0) { rear = [EDGE[0], st.y - B]; left = [EDGE[1], st.x - W / 2]; }
    if (axis === 1) { rear = [EDGE[1], st.x - B]; left = [EDGE[2], M.height - (st.y + W / 2)]; }
    if (axis === 2) { rear = [EDGE[2], M.height - (st.y + B)]; left = [EDGE[3], M.width - (st.x + W / 2)]; }
    if (axis === 3) { rear = [EDGE[3], M.width - (st.x + B)]; left = [EDGE[0], st.y - W / 2]; }
    return { st, R, axis, corner: c, rear, left, q };
  }
  function drawStart() {
    const g = startGeometry(), { st, R } = g, s = scale();
    const [px, py] = toPx(st.x, st.y);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(st.heading * Math.PI / 180);
    const W = R.bodyWidth * s, F = R.bodyFront * s, B = R.bodyRear * s;
    ctx.strokeStyle = '#F08C00'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
    ctx.strokeRect(-W / 2, -F, W, F + B);
    ctx.setLineDash([]); ctx.lineWidth = 5; ctx.lineCap = 'round';
    // rajtvonal a robot hátuljánál, kicsit túllógva
    ctx.beginPath(); ctx.moveTo(-W / 2 - 25 * s, B); ctx.lineTo(W / 2 + 25 * s, B); ctx.stroke();
    // oldalvonal a bal oldalán (L alak)
    ctx.beginPath(); ctx.moveTo(-W / 2, B + 25 * s); ctx.lineTo(-W / 2, B - 70 * s); ctx.stroke();
    ctx.restore();
    // méretvonalak a pálya széléig (csak egyenes állásnál)
    if (g.axis < 0) return;
    const M = matInfo(), c = g.corner;
    ctx.save();
    ctx.strokeStyle = '#F08C00'; ctx.fillStyle = '#B45309'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.font = '800 ' + Math.max(11, Math.round(13 * s * 2.2)) + 'px Nunito, sans-serif';
    const line = (x1, y1, x2, y2, label, lx, ly) => {
      const [a, b] = toPx(x1, y1), [c2, d] = toPx(x2, y2);
      ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c2, d); ctx.stroke();
      let [tx, ty] = toPx(lx, ly);
      ctx.save(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(255,255,255,.9)';
      const w = ctx.measureText(label).width + 8;
      // a felirat mindig férjen el a pályán
      tx = Math.min(Math.max(tx, w / 2 + 2), canvas.width - w / 2 - 2);
      ty = Math.min(Math.max(ty, 12), canvas.height - 12);
      ctx.fillRect(tx - w / 2, ty - 10, w, 20); ctx.fillStyle = '#B45309'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, tx, ty); ctx.restore();
    };
    const cm = (v) => fmt(v / 10, 1) + ' cm';
    // a hátsó vonal és a bal oldal távolsága a megfelelő pályaszéltől, a bal hátsó saroktól indítva
    const ends = {
      alsó: [c[0], c[1], c[0], 0], bal: [c[0], c[1], 0, c[1]],
      felső: [c[0], c[1], c[0], M.height], jobb: [c[0], c[1], M.width, c[1]],
    };
    [g.rear, g.left].forEach(([edge, dist], k) => {
      const e = ends[edge];
      // a feliratot kicsit elhúzzuk a vonaltól, hogy a két felirat ne takarja egymást
      const vert = e[0] === e[2], off = 28;
      const lx = (e[0] + e[2]) / 2 + (vert ? off : 0), ly = (e[1] + e[3]) / 2 + (vert ? 0 : off);
      line(e[0], e[1], e[2], e[3], cm(dist), lx, ly);
    });
    ctx.restore();
  }
  // A rajthelyzet kiírása – a számok átírhatók (billentyűzetről is be lehet állítani a rajtot).
  const LOOK = ['felfelé', 'jobbra', 'lefelé', 'balra'];
  function buildStartForm() {
    const el = $('startInfo');
    el.innerHTML = `<b>Így tedd le a valódi robotot</b> <span class="sd-tip">(a számokat át is írhatod)</span>
      <label class="sd-row"><span id="sdL1">A hátulja</span><input id="sdA" type="text" inputmode="decimal"><span id="sdT1">cm</span></label>
      <label class="sd-row"><span id="sdL2">A bal oldala</span><input id="sdB" type="text" inputmode="decimal"><span id="sdT2">cm</span></label>
      <label class="sd-row"><span>Irány</span><input id="sdH" type="text" inputmode="numeric"><span id="sdT3">fok</span></label>
      <div class="sd-msg" id="sdMsg"></div>`;
    ['sdA', 'sdB', 'sdH'].forEach((id) => {
      const inp = $(id);
      inp.addEventListener('change', applyStartForm);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyStartForm(); inp.select(); } });
      inp.addEventListener('focus', () => inp.select());
    });
  }
  const num = (v) => parseFloat(String(v).replace(',', '.').replace(/[^\d.\-]/g, ''));
  function applyStartForm() {
    if (state.play) return;
    const st = curStart(), R = ROBOT(), M = matInfo(), msg = $('sdMsg');
    let h = num($('sdH').value);
    if (!isFinite(h)) { msg.textContent = 'Az irányhoz egy számot írj (0 = felfelé, 90 = jobbra, 180 = lefelé, 270 = balra).'; return; }
    h = ((Math.round(h) % 360) + 360) % 360;
    const a = num($('sdA').value) * 10, b = num($('sdB').value) * 10;   // cm → mm
    if (!isFinite(a) || !isFinite(b)) { msg.textContent = 'Írj be egy számot centiben (pl. 6 vagy 6,5).'; return; }
    const W = R.bodyWidth, B = R.bodyRear, prevAxis = startGeometry().axis;
    const n = { heading: h, x: st.x, y: st.y };
    const axis = h % 90 === 0 ? h / 90 : -1;
    if (axis >= 0 && prevAxis >= 0 && h !== st.heading && h !== Math.round(st.heading)) {
      // csak az irány változott: a távolságokat az új iránynál újraszámoljuk, a robot helyben fordul
      n.x = st.x; n.y = st.y;
    } else if (axis === 0) { n.y = a + B; n.x = b + W / 2; }
    else if (axis === 1) { n.x = a + B; n.y = M.height - b - W / 2; }
    else if (axis === 2) { n.y = M.height - a - B; n.x = M.width - b - W / 2; }
    else if (axis === 3) { n.x = M.width - a - B; n.y = b + W / 2; }
    else {
      // ferde rajt: a bal hátsó sarok koordinátái
      const hr = h * Math.PI / 180, f = [Math.sin(hr), Math.cos(hr)], r = [Math.cos(hr), -Math.sin(hr)];
      if (h !== Math.round(st.heading)) { n.x = st.x; n.y = st.y; }
      else { n.x = a + r[0] * W / 2 + f[0] * B; n.y = b + r[1] * W / 2 + f[1] * B; }
    }
    // a robot teste legyen a pályán belül
    const probe = Object.assign({}, n);
    const hr = probe.heading * Math.PI / 180, f = [Math.sin(hr), Math.cos(hr)], r = [Math.cos(hr), -Math.sin(hr)];
    const pts = [[-W / 2, -B], [W / 2, -B], [W / 2, R.bodyFront], [-W / 2, R.bodyFront]].map(([u, v]) => [probe.x + r[0] * u + f[0] * v, probe.y + r[1] * u + f[1] * v]);
    if (pts.some(([x, y]) => x < -0.5 || y < -0.5 || x > M.width + 0.5 || y > M.height + 0.5)) {
      msg.textContent = 'Így a robot lelógna a pályáról. Adj meg kisebb vagy nagyobb távolságot!';
      return;
    }
    msg.textContent = '';
    st.x = Math.round(n.x * 10) / 10; st.y = Math.round(n.y * 10) / 10; st.heading = n.heading;
    state.pose = null; state.result = null;
    store.set('starts', state.starts);
    render();
  }
  function updateStartInfo() {
    const el = $('startInfo'); if (!el) return;
    if (!$('sdA')) buildStartForm();
    const g = startGeometry(), act = document.activeElement;
    const put = (id, v) => { if (act !== $(id)) $(id).value = v; };
    const c1 = (v) => fmt(v / 10, 1);
    if (g.axis >= 0) {
      $('sdL1').textContent = 'A hátulja'; $('sdT1').textContent = `cm-re a pálya ${g.rear[0]} szélétől`;
      $('sdL2').textContent = 'A bal oldala'; $('sdT2').textContent = `cm-re a ${g.left[0]} szélétől`;
      put('sdA', c1(g.rear[1])); put('sdB', c1(g.left[1]));
    } else {
      $('sdL1').textContent = 'Bal hátsó sarok x'; $('sdT1').textContent = 'cm (a bal széltől)';
      $('sdL2').textContent = 'Bal hátsó sarok y'; $('sdT2').textContent = 'cm (az alsó széltől)';
      put('sdA', c1(g.corner[0])); put('sdB', c1(g.corner[1]));
    }
    put('sdH', String(Math.round(g.st.heading)));
    $('sdT3').textContent = g.axis >= 0 ? `fok (az orra ${LOOK[g.axis]} néz)` : 'fok (ferde: nehéz pontosan kimérni)';
  }
  function updateRobotSummary() {
    const d = dims(), el = $('robotSummary'); if (!el) return;
    const changed = JSON.stringify(d) !== JSON.stringify(DIM_DEFAULT);
    el.innerHTML = `Kerék ${fmt(d.wheel, d.wheel % 1 ? 1 : 0)} mm · tengelytáv ${fmt(d.axle, d.axle % 1 ? 1 : 0)} mm · ${d.length} × ${d.width} mm · ${d.color2 ? '2 színszenzor (C, F)' : '1 színszenzor (C)'}${changed ? ' <b style="color:#B45309">(saját)</b>' : ' (iskolai alap)'}`;
  }
  function updateTele(p, t) {
    // a műszerfal a robot ELEJÉNEK (a mutató végének) helyét mutatja
    const P = ROBOT().pointer, hr = p.heading * Math.PI / 180;
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
    if (tool === 'route') {
      if (state.route.some((p) => p.home)) { log('🧭 Az útvonal már hazaér. Töröld az utolsó lépést, ha tovább mennél.', 'c-hint'); return; }
      state.route.push([x, y]);
      updateRouteBox();
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
    const st = curStart();
    if (Math.hypot(x - st.x, y - st.y) < 110) {
      state.dragging = { dx: st.x - x, dy: st.y - y };
      state.pose = null; state.result = null;
      canvas.setPointerCapture(e.pointerId);
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!state.dragging) return;
    const [x, y] = eventMm(e);
    const st = curStart();
    st.x = x + state.dragging.dx; st.y = y + state.dragging.dy;
    render();
  });
  canvas.addEventListener('pointerup', () => {
    if (!state.dragging) return;
    state.dragging = false;
    const st = curStart();
    snapStart(st);
    store.set('starts', state.starts);
    render();
  });
  // A robot bal hátsó sarkát 5 mm-es rácsra igazítjuk, hogy a valódi pályán könnyű legyen kimérni.
  function rearLeft(st) {
    const R = ROBOT(), h = st.heading * Math.PI / 180;
    const f = [Math.sin(h), Math.cos(h)], r = [Math.cos(h), -Math.sin(h)];
    return [st.x - r[0] * R.bodyWidth / 2 - f[0] * R.bodyRear, st.y - r[1] * R.bodyWidth / 2 - f[1] * R.bodyRear];
  }
  function fromRearLeft(c, heading) {
    const R = ROBOT(), h = heading * Math.PI / 180;
    const f = [Math.sin(h), Math.cos(h)], r = [Math.cos(h), -Math.sin(h)];
    return { x: c[0] + r[0] * R.bodyWidth / 2 + f[0] * R.bodyRear, y: c[1] + r[1] * R.bodyWidth / 2 + f[1] * R.bodyRear, heading };
  }
  function snapStart(st) {
    const c = rearLeft(st), sx = Math.round(c[0] / 5) * 5 - c[0], sy = Math.round(c[1] / 5) * 5 - c[1];
    st.x = Math.round((st.x + sx) * 10) / 10; st.y = Math.round((st.y + sy) * 10) / 10;
  }
  document.querySelectorAll('[data-rot]').forEach((b) => b.addEventListener('click', () => {
    if (state.play) return;
    const st = curStart();
    st.heading = (((st.heading + Number(b.dataset.rot)) % 360) + 360) % 360;
    snapStart(st);
    state.pose = null; state.result = null;
    store.set('starts', state.starts);
    render();
  }));
  ['optTrail', 'optGhost', 'optTarget', 'optStart', 'optReal'].forEach((id) => $(id).addEventListener('change', render));
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
    } else if (tool === 'route') {
      h.style.color = '';
      h.textContent = 'Kattints sorban a célokra a pályán! A tervező a rajttól indul, és minden szakaszt onnan számol, ahol a robot az előző végén áll. Ha kész, írd be a programba.';
    } else h.textContent = '';
  }
  // Célzás: a robot mostani helyzetéből mennyit forduljon, és mennyit menjen,
  // hogy a cél felé nézzen, majd odaérjen (a tengely közepével vagy a mutatóval).
  // A robot a két kereke közti pont (a tengely közepe) körül fordul, ezért a
  // fordulás szöge onnan számít. A távolságot viszont a robot ELEJÉTŐL (a mutató
  // végétől, a piros jeltől) mérjük, mert az eleje viszi a karokat, fogókat.
  function aimData() {
    if (!state.aim) return null;
    const p = state.pose || curStart();
    const P = ROBOT().pointer;
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
  $('toolSel').addEventListener('change', () => { state.tape = []; state.tapeFromRobot = false; state.ang = null; state.aim = null; updateToolHint(); updateRouteBox(); render(); });
  // Szögmérő a robotra: a csúcs a tengely közepe, az első szár a rajtirány,
  // a második a robot mostani iránya. Így látszik, mennyit fordult.
  $('robotAngleBtn').addEventListener('click', () => {
    const st = curStart();
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
    updateMatUi(); fitCanvas(); render();
  });
  function updateMatUi() {
    $('targetRow').hidden = state.mat !== 'rajzlap';
    $('homeStartBtn').textContent = state.mat === 'rajzlap' || state.wro ? '⌂ Alaprajt' : '⌂ Alaprajt (10,10)';
    state.practiceRes = null; showPracticeText();
  }
  $('homeStartBtn').addEventListener('click', () => {
    if (state.play) return;
    const k = startKey();
    state.starts[k] = defaultStart(k); store.set('starts', state.starts);
    state.pose = null; state.result = null;
    render();
    log(state.mat === 'rajzlap' || state.wro ? '⌂ A robot az alaprajton áll.' : '⌂ A robot a 10,10-es rajton áll: a hátulja 10 cm-re az alsó, a bal oldala 10 cm-re a bal széltől.', 'c-hint');
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
    const tip = (() => { const h = pose.heading * Math.PI / 180, P = ROBOT().pointer; return [pose.x + Math.sin(h) * P, pose.y + Math.cos(h) * P]; })();
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
    const start = Object.assign({}, curStart());
    let robotRun = ROBOT();
    if ($('optReal') && $('optReal').checked) {
      const nr = noisyRobot(robotRun), n = nr.n, pc = (v) => (Math.abs(v) < 0.0005 ? '±' : v >= 0 ? '+' : '−') + fmt(Math.abs(v * 100), 1) + '%';
      robotRun = nr.robot;
      start.heading += n.h; start.x += n.x; start.y += n.y;
      log(`🎲 Valóság mód: bal kerék ${pc(n.wl)}, jobb kerék ${pc(n.wr)}, tengelytáv ${pc(n.ax)}, letevés ${n.h >= 0 ? '+' : '−'}${fmt(Math.abs(n.h), 1)}°`, 'c-muted');
    }
    let code = ta.value;
    state.lastBlock = null;
    if (state.mode === 'blocks') {
      state.ws.getAllBlocks(false).forEach((b) => b.setWarningText(null));
      const out = window.KodfejtoBlocks.toPython(state.ws);
      out.warnings.forEach((w) => log('💡 ' + w, 'c-hint'));
      code = out.code;
    }
    // felhős mód: a program mentése a tanárnak (küldetésenként az utolsó)
    if (cloudOn && Cloud.session()) {
      const slot = store.get('slot', 'szabad');
      if (state.mode === 'blocks') Cloud.saveProgram(slot, 'blocks', code, Blockly.serialization.workspaces.save(state.ws));
      else Cloud.saveProgram(slot, 'python', ta.value, null);
    }
    let res;
    try {
      res = await RT.runProgram(state.pyodide, state.shim, code, { mat: state.mat, start, robot: robotRun }, sampler);
    } catch (e) {
      log('A szimulátor hibába futott: ' + e, 'c-err');
      $('runBtn').disabled = false;
      return;
    }
    res.mat = state.mat;
    state.result = res;
    dimsHint(code);
    if (state.mode === 'python' && res.lint) res.lint.forEach(([, msg]) => log('💡 ' + msg, 'c-hint'));
    if (state.wro) {
      resetWroCards();
      state.wro.judge = J.evaluate(res, state.wro.order, ROBOT());
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
    if (!r.error && !r.timeout) checkMissionTarget(r);
    if (!r.error) checkPractice(r);
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
        state.wro.judge = J.evaluate(cut, state.wro.order, ROBOT());
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
  Object.values(state.starts).forEach(snapStart);
  updateMatUi();
  fitCanvas();
  resetHub();
  setMode(state.mode === 'blocks' ? 'blocks' : 'python');
  // Küldetés megnyitása a címből: #k2-python vagy #k2-blocks
  (function openMission() {
    // a Kódszótár „Kipróbálom” gombja: #proba
    if (location.hash === '#proba') {
      const code = store.get('tryCode', null), blocks = store.get('tryBlocks', null);
      try { localStorage.removeItem('kodfejto.tryCode'); localStorage.removeItem('kodfejto.tryBlocks'); } catch (e) { /* nem baj */ }
      try { history.replaceState(null, '', location.pathname); } catch (e) { /* nem baj */ }
      if (blocks) {
        setMode('blocks');
        state.ws.clear();
        Blockly.serialization.workspaces.load(blocks, state.ws);
        log('📖 Betöltöttem a blokkos programot. Nyomd meg az Indulj! gombot!', 'c-hint');
        return;
      }
      if (!code) return;
      store.set('slot', 'szabad');
      setMode('python');
      if (state.wro || state.mat === 'rajzlap') {
        setWro(false); state.mat = 'palya1'; store.set('mat', state.mat); $('matSel').value = state.mat;
        state.pose = null; state.result = null; state.ghost = null; updateMatUi(); fitCanvas();
      }
      ta.value = code; errLine = 0; refreshEditor(); store.set('code', ta.value);
      log('📖 Betöltöttem a szótár példáját. Nyomd meg az Indulj! gombot!', 'c-hint');
      return;
    }
    // gyakorló feladat: #gy3 (vagy #gy3-blocks)
    const g = /^#(gy\d+)(?:-(python|blocks))?$/.exec(location.hash);
    if (g && PR.TASKS.some((t) => t.id === g[1])) {
      if (g[2]) setMode(g[2]);
      selectPractice(g[1]);
      try { history.replaceState(null, '', location.pathname); } catch (e) { /* nem baj */ }
      return;
    }
    const m = /^#(k\d+)-(python|blocks)$/.exec(location.hash);
    if (!m || !MISSION_START[m[1]]) return;
    const ms = MISSION_START[m[1]], mode = ms[m[2]] ? m[2] : 'python';
    store.set('slot', m[1]); // a mentés ehhez a küldetéshez tartozik
    store.set('practice', ''); state.practiceRes = null;
    setMode(mode);
    if (ms.wro) {
      state.mat = 'palya1'; store.set('mat', state.mat); $('matSel').value = 'wro1'; setWro(true);
      state.pose = null; state.result = null; state.ghost = null; updateMatUi(); fitCanvas();
    } else if (ms.mat && (ms.mat !== state.mat || state.wro)) {
      setWro(false);
      state.mat = ms.mat; store.set('mat', state.mat); $('matSel').value = state.mat;
      state.pose = null; state.result = null; state.ghost = null; updateMatUi(); fitCanvas();
    } else if (!ms.mat && (state.mat === 'rajzlap' || state.mat === 'edzo')) {
      state.mat = 'palya1'; store.set('mat', state.mat); $('matSel').value = state.mat; updateMatUi(); fitCanvas();
    }
    if (ms.start || ms.wro) {
      const k = ms.wro ? 'wro' : ms.mat;
      state.starts[k] = ms.start ? Object.assign({}, ms.start) : defaultStart(k); store.set('starts', state.starts);
      state.pose = null; state.result = null; state.ghost = null;
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
  fillPracticeSel();
  updateToolHint();
  log('Írd meg a programot, aztán nyomd meg az Indulj! gombot.', 'c-muted');

  Promise.all([loadImage('palya1'), loadImage('palya2'), loadImage('rajzlap'), loadImage('edzo')]).then(render).catch(() => log('A pályakép nem töltődött be.', 'c-err'));
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

  // ------------------------------------------------------------ robot méretei ablak
  (function robotDialog() {
    const dlg = $('robotDlg'); if (!dlg) return;
    const F = { wheel: 'rdWheel', axle: 'rdAxle', length: 'rdLength', width: 'rdWidth', rear: 'rdRear', pointer: 'rdPointer', sensFwd: 'rdSensFwd', sensGap: 'rdSensGap' };
    const fill = (d) => { Object.entries(F).forEach(([k, id]) => { $(id).value = d[k]; }); $('rdColor2').checked = !!d.color2; };
    $('robotBtn').addEventListener('click', () => { fill(dims()); $('rdMsg').textContent = ''; dlg.showModal(); });
    $('robotClose').addEventListener('click', () => dlg.close());
    $('robotReset').addEventListener('click', () => { fill(DIM_DEFAULT); $('rdMsg').textContent = 'Visszaállítottam az iskolai alapértékeket. Nyomd meg a Mentést!'; });
    $('robotSave').addEventListener('click', () => {
      const d = {};
      for (const [k, id] of Object.entries(F)) {
        const v = parseFloat(String($(id).value).replace(',', '.'));
        if (!isFinite(v)) { $('rdMsg').textContent = 'Minden mezőbe írj egy számot!'; return; }
        d[k] = v;
      }
      d.color2 = $('rdColor2').checked;
      const err = d.sensFwd < 0 || d.sensFwd > d.length ? 'A színszenzor a roboton belül legyen (G).'
        : d.color2 && (d.sensGap < 10 || d.sensGap > d.width) ? 'A két színszenzor távolsága 10 mm és a robot szélessége között legyen (H).'
        : d.wheel < 20 || d.wheel > 150 ? 'A kerék átmérője 20 és 150 mm között legyen.'
        : d.axle < 40 || d.axle > 300 ? 'A tengelytáv 40 és 300 mm között legyen.'
        : d.length < 60 || d.length > 400 ? 'A hossz 60 és 400 mm között legyen.'
        : d.width < 60 || d.width > 400 ? 'A szélesség 60 és 400 mm között legyen.'
        : d.rear < 0 || d.rear > d.length ? 'A kerekek közepe a roboton belül legyen (0 és a hossz között).'
        : d.pointer < 0 || d.pointer > 200 ? 'A mutató 0 és 200 mm között nyúljon ki.'
        : d.axle > d.width ? 'A tengelytáv nem lehet nagyobb, mint a robot szélessége.' : '';
      if (err) { $('rdMsg').textContent = err; return; }
      // a rajtok bal hátsó sarka (amit a valódi pályán kimérünk) maradjon a helyén
      const corners = {};
      Object.entries(state.starts).forEach(([k, st]) => { corners[k] = rearLeft(st); });
      store.set('robotDims', d);
      Object.entries(state.starts).forEach(([k, st]) => { if (k !== 'rajzlap') { Object.assign(st, fromRearLeft(corners[k], st.heading)); snapStart(st); } });
      dlg.close();
      state.pose = null; state.result = null; state.ghost = null;
      snapStart(curStart()); store.set('starts', state.starts);
      updateRobotSummary(); render();
      log('⚙ Elmentettem a robot méreteit.' + (Math.max(d.length, d.width) > 250 ? ' Figyelem: a WRO-n a robot legfeljebb 25 × 25 × 25 cm lehet a rajtnál!' : ''), 'c-hint');
    });
    updateRobotSummary();
  })();

  // Ha a program más kerékméretet vagy tengelytávot ír, mint a beállított robot, szólunk.
  function dimsHint(code) {
    const d = dims(), out = [];
    if (state.mode === 'python') {
      const w = /wheel_diameter\s*=\s*([\d.]+)/.exec(code), a = /axle_track\s*=\s*([\d.]+)/.exec(code);
      if (w && Math.abs(parseFloat(w[1]) - d.wheel) > 0.5) out.push(`a programodban wheel_diameter=${w[1]}, de a robot kereke ${fmt(d.wheel, 1)} mm`);
      if (a && Math.abs(parseFloat(a[1]) - d.axle) > 0.5) out.push(`a programodban axle_track=${a[1]}, de a robot tengelytávja ${fmt(d.axle, 1)} mm`);
    } else {
      const r = /set_rotation\(([\d.]+),\s*"cm"\)/.exec(code), circ = Math.PI * d.wheel / 10;
      if (r && Math.abs(parseFloat(r[1]) - circ) / circ > 0.02) out.push(`a programban 1 kerékfordulat = ${r[1]} cm, de ennél a keréknél ${fmt(circ, 1)} cm`);
    }
    if (out.length) log('💡 Eltérés: ' + out.join('; ') + '. A szimulátor a beállított robottal mozog, ezért a robot rosszul fog mérni, pont mint a valóságban. Ha a robotod tényleg ilyen, írd át a programot!', 'c-hint');
  }
})();
