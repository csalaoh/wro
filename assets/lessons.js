/*
 * Kódfejtő Műhely – a küldetések (órák) tartalma
 * Forrás: Laci óratervei (1–2. foglalkozás, Blokk vs. Python, Giroszkópos mozgás)
 * és a Titkos Kódfejtő Füzet.
 *
 * Minden küldetés két változatban: "python" (Pybricks) és "blocks" (SPIKE App).
 * A blokkokat itt egyszerű, színes "blokk-csíkokként" írjuk le: [kategória, szöveg, beljebb?]
 */
(function () {
  'use strict';

  const MISSIONS = [
    {
      id: 'k1',
      title: 'Az első csipogás',
      story: 'Ma életre keltjük a robot agyát! Megszólaltatjuk, írunk a kijelzőjére, és megforgatunk egy motort.',
      learn: ['Mi az a hub, és hol vannak rajta a kapuk (portok)?', 'Hogyan írunk a kijelzőre és hogyan csipog a robot?', 'Hogyan forgatunk meg egy motort pontosan egy kört?'],
      rules: [
        { t: 'A robot egy pontos, de kukacoskodó szolga', d: 'Pontosan azt csinálja, amit mondasz neki. De ha egyetlen betűt elrontasz, megáll, és széttárja a kezét: „Nem értem!”' },
        { t: 'A telefonhívás szabály (a pont)', d: '<code>hub.speaker.beep()</code>: felhívjuk a hubot (<code>hub</code>), elkérjük a hangszóróját (<code>.speaker</code>), és megmondjuk, mit csináljon (<code>.beep()</code>).' },
        { t: 'A postás csomagja (a zárójel)', d: 'A zárójelbe tesszük a részleteket. <code>wait(1000)</code>: várj 1000 ezredmásodpercet, vagyis 1 másodpercet.' },
      ],
      python: {
        code: 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nmotor = Motor(Port.A)\n\nhub.display.text("3")\nwait(1000)\nhub.speaker.beep(frequency=600, duration=200)\n\nmotor.run_angle(500, 360)',
        explain: [
          ['from … import …', 'Kinyitjuk a szerszámosládát, és elővesszük, ami ma kell: az Agyat (PrimeHub), a Motort, a Kapukat (Port) és az Órát (wait).'],
          ['hub = PrimeHub()', 'Névadás: „Te nagy sárga tégla, mától a neved hub!”'],
          ['motor = Motor(Port.A)', '„Te motor, aki az A kapuba vagy bedugva, mától a neved motor!”'],
          ['hub.display.text("3")', 'Telefonhívás: Agy → kijelző → írj ki egy 3-ast!'],
          ['wait(1000)', 'Várj 1 másodpercet. A robot ezredmásodpercben számol: 1 mp = 1000.'],
          ['hub.speaker.beep(frequency=600, duration=200)', 'Csipogj 600-as magasságon, 200 ezredmásodpercig.'],
          ['motor.run_angle(500, 360)', 'Motor, fordulj 500-as sebességgel 360 fokot, vagyis egy teljes kört!'],
        ],
        challenge: 'A robot számoljon vissza 3-2-1-ig, minden szám után csipogjon, és a végén a motor forduljon két teljes kört!',
      },
      blocks: {
        code: [['events', 'when program starts'], ['light', 'write 3'], ['control', 'wait 1 seconds'], ['sound', 'play beep 72 for 0.2 seconds'], ['motors', 'A run ↻ for 1 rotations']],
        explain: [
          ['when program starts', 'Ez alá tesszük a blokkokat. Amikor elindítod a programot, a robot innen kezdi.'],
          ['write 3', 'A hub kijelzőjére egy 3-as kerül.'],
          ['wait 1 seconds', 'Várj 1 másodpercet. (A Python-csapat itt 1000-et ír, mert ott ezredmásodpercben kell!)'],
          ['play beep 72 for 0.2 seconds', 'Csipogás. A 72 a hang magassága: minél nagyobb, annál magasabb.'],
          ['A run ↻ for 1 rotations', 'Az A kapuban lévő motor egyszer körbefordul. Figyeld meg: most csak az egyik kerék forog!'],
        ],
        challenge: 'A robot számoljon vissza 3-2-1-ig, minden szám után csipogjon, és a végén a motor forduljon két teljes kört!',
      },
    },
    {
      id: 'k2',
      title: 'Két barát háttal – a bűvös négyzet',
      story: 'A robotnak két kereke van, mint két lába. Ma megtanítjuk egyenesen menni és pontosan fordulni, és bejárunk vele egy négyzetet.',
      learn: ['Miért kell a két motort együtt vezérelni?', 'Miért kell az egyik motort „megfordítani”?', 'Hogyan megy a robot pontosan 20 cm-t, és hogyan fordul pontosan 90 fokot?'],
      rules: [
        { t: 'A két barát háttal', d: 'A bal és a jobb motor egymással szemben ül a robotban. Ha mindkettőnek azt mondjuk: „Forogj előre!”, a robot helyben pörög, mint egy mérges búgócsiga. Ezért az egyik motornak meg kell mondani, hogy neki a fordított forgás az előre.' },
        { t: 'A Szuper-sofőr', d: 'A két kereket egyszerre kell vezényelni, különben a robot kanyarog. Ezt csinálja a Szuper-sofőr: egyszerre fogja mindkét motor kezét.' },
        { t: 'A robot cipőmérete', d: 'Egy kis kerekű roller egy fordulattal keveset lép, egy traktor nagyot. A robotnak tudnia kell, mekkora a kereke, különben nem tud pontosan centit mérni.' },
      ],
      python: {
        code: 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal_motor = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb_motor = Motor(Port.B)\nauto = DriveBase(bal_motor, jobb_motor, wheel_diameter=56, axle_track=112)\n\nfor i in range(4):\n    auto.straight(200)\n    wait(200)\n    auto.turn(90)\n    wait(200)',
        explain: [
          ['Motor(Port.A, Direction.COUNTERCLOCKWISE)', 'A bal motor titkos cetlije: „Neked a fordított forgás lesz az ELŐRE!” Ettől nem lesz búgócsiga a robotból.'],
          ['DriveBase(bal_motor, jobb_motor, …)', 'A Szuper-sofőr, aki egyszerre vezényli a két kereket.'],
          ['wheel_diameter=56, axle_track=112', 'A robot „személyi igazolványa”: a kerék 56 mm átmérőjű, a két kerék 112 mm-re van egymástól.'],
          ['for i in range(4):', 'Ismételd 4-szer! A behúzott (beljebb kezdődő) sorokat ismétli.'],
          ['auto.straight(200)', 'Menj egyenesen 200 millimétert, vagyis 20 centit.'],
          ['auto.turn(90)', 'Fordulj 90 fokot jobbra. Negatív számmal (-90) balra fordul.'],
        ],
        challenge: 'Járd be a négyzetet balra fordulva! Utána próbáld ki: mi történik, ha kitörlöd a Direction.COUNTERCLOCKWISE-t?',
      },
      blocks: {
        code: [['events', 'when program starts'], ['movement', 'set movement motors to A+B'], ['movement', 'set 1 motor rotation to 17.5 cm'], ['movement', 'set movement speed to 50 %'], ['control', 'repeat 4'], ['movement', 'move ↑ for 20 cm', 1], ['movement', 'move right: 100 for 180 degrees', 1]],
        explain: [
          ['set movement motors to A+B', 'Ezen a két kapun vannak a kerekek motorjai. A SPIKE App magától tudja, hogy az egyiket fordítva kell forgatni.'],
          ['set 1 motor rotation to 17.5 cm', 'A robot cipőmérete: ennyit gurul, amíg a kerék egyszer körbefordul.'],
          ['set movement speed to 50 %', 'Félgyors tempó. Lassabban pontosabban áll meg.'],
          ['repeat 4', 'Ismételd 4-szer a benne lévő blokkokat.'],
          ['move ↑ for 20 cm', 'Menj előre 20 centit.'],
          ['move right: 100 for 180 degrees', 'Fordulj jobbra helyben. Hogy miért 180 és nem 90? Ez lesz a következő küldetés titka!'],
        ],
        challenge: 'Járd be a négyzetet balra fordulva! Mit kell átállítani a fordulásnál?',
      },
    },
    {
      id: 'k3',
      title: 'A nagy felfedezés: kerékfok vagy robotfok?',
      story: 'Két csapat, ugyanaz a feladat: forduljon a robot 90 fokot. Mindkét csapat 90-et ír be… és a két robot másképp fordul. Miért?',
      learn: ['Előre és hátra menni egy szám átírásával', 'Mi a különbség a kerék fordulása és a robot fordulása között?', 'Útvonal tervezése A pontból B pontba'],
      rules: [
        { t: 'A titok egy mondatban', d: 'A blokk a KERÉKNEK mondja meg, mennyit forduljon, a Python a ROBOTNAK.' },
        { t: 'Miért kétszer annyi?', d: 'A kerék kicsi, a robot nagy. Amikor a robot helyben megfordul, a kerekei egy nagy kört járnak be. Ha a robot egyszer körbefordul, a kerekei kétszer fordulnak körbe. Ezért negyed robotforduláshoz fél kerékfordulat, vagyis 180 kerékfok kell.' },
        { t: 'Lépj kettőt! vagy Fordulj az ablak felé!', d: 'Ha azt mondom: „lépj kettőt!”, akkor kettőt lépsz, akárhová jutsz. Ez a blokk. Ha azt mondom: „fordulj az ablak felé!”, addig lépsz, amíg az ablak felé nem nézel. Ez a Python.' },
      ],
      python: {
        code: 'from pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\nrobot.settings(straight_speed=240)\n\nrobot.straight(200)\nrobot.turn(90)',
        explain: [
          ['robot.settings(straight_speed=240)', 'A sebesség milliméter/másodpercben. A 240 nagyjából annyi, mint a blokkos 50%.'],
          ['robot.straight(200)', 'Előre 200 mm. Hátra: robot.straight(-200) – a mínusz jel jelenti a hátrafelé irányt.'],
          ['robot.turn(90)', 'A robot 90 fokot fordul. Ő maga számolja ki a kerékátmérőből és a tengelytávból, hogy ehhez a keréknek 180 fokot kell fordulnia.'],
        ],
        challenge: 'Fordulj balra 90 fokot! Ha a fordulás nem pontosan derékszög, hangold az axle_track számot: ha keveset fordul, növeld (112 → 116), ha sokat, csökkentsd.',
      },
      blocks: {
        code: [['events', 'when program starts'], ['movement', 'set movement motors to A+B'], ['movement', 'set 1 motor rotation to 17.5 cm'], ['movement', 'set movement speed to 50 %'], ['movement', 'move ↑ for 20 cm'], ['movement', 'move right: 100 for 90 degrees']],
        explain: [
          ['move ↑ for 20 cm', 'Előre 20 cm. Hátra: a nyilat kell lefelé (↓) állítani.'],
          ['move right: 100 for 90 degrees', 'A kerekek fordulnak 90 fokot, nem a robot! Próbáld ki: mennyit fordul a robot? Utána írj be 120-at, 150-et, 180-at, 200-at, és figyeld meg, melyiknél lesz derékszög.'],
        ],
        challenge: 'Keresd meg, hány kerékfok kell a pontos 90 fokos robotforduláshoz! Ha megvan: hány kell egy teljes hátraarc (180°) robotforduláshoz?',
      },
    },
    {
      id: 'k4',
      title: 'Egyenesen, giroszkóppal',
      only: 'python',
      story: 'Ugyanaz a program néha máshová viszi a robotot. A robot azt hiszi, pontosan fordult, közben a kereke megcsúszott. Ma bekapcsoljuk a giroszkópot, és megmérjük, mennyit javít.',
      learn: ['Miért halmozódik a hiba, ha a robot csak a kerekeit figyeli?', 'Mit mér a giroszkóp, és miért kell induláskor mozdulatlanul állni?', 'use_gyro(True), hub.imu.heading(), robot.angle()'],
      rules: [
        { t: 'Csukott szemmel lépegetni', d: 'Ha csukott szemmel számolod a lépéseidet, azt hiszed, tudod, hol vagy. De ha közben megcsúsztál, a lábad mozgott, te mégsem jutottál előrébb. A robot giroszkóp nélkül pont így tájékozódik.' },
        { t: 'A giroszkóp az iránytűnk', d: 'A hubban lévő giroszkóp a robot valódi elfordulását méri, nem a kerekekét. Ezért a fordulás akkor is pontos marad, ha a kerék megcsúszik. A megtett távolság hibáját viszont nem javítja.' },
      ],
      python: {
        code: 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\nrobot.settings(straight_speed=240)\nrobot.use_gyro(True)\n\nwhile not hub.imu.ready():\n    wait(10)\n\nfor i in range(4):\n    robot.straight(300)\n    robot.turn(90)\n\nprint("A robot szerint:", robot.angle())\nprint("A giroszkóp szerint:", hub.imu.heading())',
        explain: [
          ['robot.use_gyro(True)', 'Bekapcsoljuk a giroszkópot: mostantól a fordulást a giroszkóp méri, nem a kerekek.'],
          ['while not hub.imu.ready(): wait(10)', 'Várunk, amíg a giroszkóp bekalibrálja magát. Ehhez a robotnak mozdulatlanul kell állnia!'],
          ['robot.angle()', 'Mennyit fordult a robot a saját véleménye szerint.'],
          ['hub.imu.heading()', 'Mennyit fordult a robot a giroszkóp szerint.'],
        ],
        challenge: 'Futtasd le a négyzetet giroszkóp nélkül is (töröld a use_gyro sort)! A pályán mérd meg a mérőszalaggal, mennyire tér el a végpont a rajttól a két esetben.',
      },
    },
  ];

  window.KodfejtoMissions = MISSIONS;
})();
