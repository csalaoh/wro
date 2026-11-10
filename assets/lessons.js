/*
 * Kódfejtő Műhely – a küldetések (órák) tartalma
 * Forrás: Laci óratervei (1–2. foglalkozás, Blokk vs. Python, Giroszkópos mozgás); 5–7.: saját parancsok (def)
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
    {
      id: 'k5',
      title: 'A robot új szót tanul',
      story: 'Eddig minden lépést külön meg kellett mondanunk a robotnak. Ma megtanítunk neki egy új szót. Elég egyszer elmagyarázni, utána csak kimondjuk, és ő tudja, mit kell csinálnia.',
      learn: ['Mi a különbség a szó megtanítása (def) és a kimondása (hívás) között?', 'Hogyan készítünk saját parancsot?', 'Miért nem mozdul a robot, ha csak megtanítjuk neki a szót?'],
      warmup: {
        title: 'Óra eleji játék: a béka',
        intro: 'Gép nélkül, kb. 5 perc. Egy gyerek a robot, a tanár (vagy egy másik gyerek) a programozó. A programot a táblára írjuk.',
        board: 'def beka():\n    guggolj\n    ugorj\n    tapsolj\n\nlépj előre 2-t\nbeka()\nfordulj meg\nbeka()',
        steps: [
          'Felírjuk a táblára a felső részt: <code>def beka():</code> és alá beljebb a három mozdulatot. Megkérdezzük: <b>most mit csinál a robot?</b> Semmit! Csak megjegyezte, mi az a béka.',
          'Felírjuk alá a programot, és a „robot” végrehajtja. Ahányszor elhangzik a <code>beka()</code>, annyiszor guggol, ugrik és tapsol.',
          'Letöröljük az alsó részt, csak a <code>def</code> marad. A robot áll. <b>Miért nem mozdul?</b> Mert senki nem mondta ki a szót!',
          'Csavar a végére: a programozó azt írja, <code>beka</code>, zárójel nélkül. A robot nem ugrik, csak gondol a békára. A zárójel jelenti azt, hogy „csináld!”.',
        ],
      },
      rules: [
        { t: 'Megtanítani nem ugyanaz, mint megcsinálni', d: 'Ha a tornatanár elmagyaráz egy új mozdulatot, attól még senki nem ugrál. Csak akkor, amikor kimondja a nevét. A <code>def</code> a megtanítás, a <code>negyzet()</code> a kimondás. Ezt hívjuk <b>függvényhívásnak</b>.' },
        { t: 'Ami a szóhoz tartozik, beljebb kezdődik', d: 'A <code>def negyzet():</code> sor kettősponttal végződik, és ami a szó jelentéséhez tartozik, az 4 szóközzel beljebb kezdődik, pont mint a <code>for</code> ciklusnál. Ahol a behúzás véget ér, ott ér véget a szó magyarázata.' },
        { t: 'Előbb tanítsd, aztán mondd ki, zárójellel!', d: 'A robot fentről lefelé olvas, ezért a <code>def</code> a program elejére kerül, a kimondás alá. Kimondáskor ne felejtsd el a zárójelet: <code>negyzet()</code>. Zárójel nélkül a robot csak gondol a szóra, de nem csinálja meg.' },
      ],
      python: {
        code: "from pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# 1. MEGTANÍTJUK a robotnak, mi az a \"negyzet\".\n#    Figyeld meg: ettől még NEM mozdul!\ndef negyzet():\n    for i in range(4):\n        robot.straight(150)\n        robot.turn(90)\n\n# 2. KIMONDJUK a szót: most rajzolja meg!\nnegyzet()\n",
        explain: [
          ['bal, jobb, robot = …', 'A már ismert Szuper-sofőr a két motorral (2. küldetés).'],
          ['def negyzet():', 'Megtanítjuk a robotnak a „negyzet” szót. A def a „define”, vagyis „meghatározni” szó rövidítése. A név után a zárójel és a kettőspont kötelező.'],
          ['    for i in range(4): …', 'A szó jelentése: négyszer menj 15 centit (150 mm) és fordulj 90 fokot. Ezek a sorok beljebb kezdődnek, mert a szóhoz tartoznak. Amíg csak eddig ér a program, a robot NEM mozdul!'],
          ['negyzet()', 'Itt mondjuk ki a szót. A robot megkeresi, mit jelent a negyzet, és végrehajtja: megrajzolja a négyzetet. Ez a függvényhívás.'],
        ],
        challenge: '1. Töröld ki az utolsó sort (<code>negyzet()</code>), és futtasd! Mit csinál a robot, és miért?<br>2. Írd le kétszer egymás alá: <code>negyzet()</code>. Hány négyzetet látsz a rajzlapon? Miért?<br>3. A két <code>negyzet()</code> közé írd be: <code>robot.turn(-90)</code>. Mit rajzol most a robot?',
      },
      blocks: {
        code: [['events', 'when program starts'], ['movement', 'set movement motors to A+B'], ['movement', 'set 1 motor rotation to 17.5 cm'], ['myblocks', 'negyzet'], ['gap'], ['define', 'define negyzet'], ['control', 'repeat 4', 1], ['movement', 'move ↑ for 15 cm', 2], ['movement', 'move right: 100 for 180 degrees', 2]],
        explain: [
          ['define negyzet', 'Ez a kalap a megtanítás. A SPIKE Appban a Saját blokkok (My Blocks) között a „Make a Block” gombbal készül, a szimulátorban a Saját blokkok közül húzd ki a „define” kalapot, és írd át a nevét. Ami alá kerül, az a szó jelentése. Ettől még NEM fut semmi!'],
          ['repeat 4 → move, move right', 'A szó jelentése: négyszer menj 15 cm-t és fordulj. 180 kerékfok = 90 fokos robotfordulás, emlékszel a 3. küldetésre?'],
          ['negyzet', 'Ez a kimondás: a rózsaszín negyzet blokk a „when program starts” alatt. Ettől rajzol a robot. Ha kiveszed onnan, a robot csak áll.'],
        ],
        challenge: '1. Vedd ki a negyzet blokkot a „when program starts” alól, és futtasd! Mit csinál a robot, és miért?<br>2. Tegyél két negyzet blokkot egymás alá. Hány négyzetet látsz?<br>3. A két negyzet közé tegyél egy „move left: 100 for 180 degrees” blokkot. Mit rajzol most a robot?',
      },
    },
    {
      id: 'k6',
      title: 'A dobogó',
      story: 'Versenyt rendezünk, kell egy dobogó! A robot rajzolja meg: alul 3 négyzet, rajtuk középen 2, legfelül 1. A negyzet szót hatszor kell kimondani, közben pedig a robotnak mindig a jó helyre kell állnia.',
      learn: ['Ugyanazt a szót többször kimondani', 'Útvonaltervezés: hogyan jut el a robot a következő négyzet sarkába?', 'Ha egy mozdulatsor ismétlődik, abból is lehet új szó!'],
      rules: [
        { t: 'A négyzet mindig ugyanott ér véget', d: 'A <code>negyzet()</code> a bal alsó sarokból indul felfelé nézve, és ugyanoda ér vissza, ugyanúgy nézve. Ezért mielőtt kimondod, mindig a következő négyzet bal alsó sarkába kell állnod, felfelé nézve.' },
        { t: 'Fél négyzet = 7,5 cm', d: 'A felső sorok fél négyzettel beljebb kezdődnek. A négyzet oldala 15 cm (150 mm), a fele 7,5 cm (75 mm).' },
        { t: 'Ha valamit kétszer leírsz, nevezd el!', d: 'Ha azt veszed észre, hogy ugyanazokat a sorokat már másodszor írod le, abból is csinálj új szót! Hogy mi legyen a neve, azt te döntöd el.' },
      ],
      python: {
        code: "from pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\n\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# A szó, amit már ismersz\ndef negyzet():\n    for i in range(4):\n        robot.straight(150)\n        robot.turn(90)\n\n# 1. sor: alul három négyzet egymás mellett\nnegyzet()\n# ... innen folytasd: hogyan jutsz át a következő négyzet sarkába?\n\n# 2. sor: két négyzet, fél négyzettel (75 mm) beljebb\n\n# 3. sor: legfelül egy négyzet, középen\n",
        explain: [
          ['def negyzet(): …', 'A múltkori szó. Egyszer tanítjuk meg, aztán annyiszor mondjuk ki, ahányszor kell: a dobogóhoz összesen hatszor.'],
          ['negyzet()', 'Az első négyzet bal alul. A robot a végén visszaér a bal alsó sarokba, és megint felfelé néz.'],
          ['# ... innen folytasd', 'A te feladatod: a következő négyzet 15 cm-rel jobbra kezdődik. Hogyan jutsz oda úgy, hogy utána megint felfelé nézz? Fordulj, menj, fordulj vissza!'],
          ['# 2. sor, # 3. sor', 'A felső sorok egy négyzettel (150 mm) feljebb és fél négyzettel (75 mm) beljebb kezdődnek.'],
        ],
        challenge: 'Rajzold meg a teljes dobogót! A rajzlapon a halványkék dobogóra kell rárajzolnod, és ne legyen kilógó vonal.<br>⭐ Csillagos feladat: tanítsd meg a jobbra lépést is új szóként (például <code>def jobbra_lep():</code>). Hány sorral lett rövidebb a programod?',
      },
      blocks: {
        code: [['events', 'when program starts'], ['movement', 'set movement motors to A+B'], ['movement', 'set 1 motor rotation to 17.5 cm'], ['myblocks', 'negyzet'], ['gap'], ['define', 'define negyzet'], ['control', 'repeat 4', 1], ['movement', 'move ↑ for 15 cm', 2], ['movement', 'move right: 100 for 180 degrees', 2]],
        explain: [
          ['define negyzet', 'A múltkori saját blokk. Egyszer kell megcsinálni, aztán annyiszor használod, ahányszor kell: a dobogóhoz hatszor.'],
          ['negyzet', 'Az első négyzet bal alul. A robot a végén visszaér a bal alsó sarokba, és megint felfelé néz.'],
          ['ami ezután jön', 'A te feladatod: a következő négyzet 15 cm-rel jobbra kezdődik. Fordulj jobbra (180 kerékfok), menj 15 cm-t, fordulj vissza balra, és jöhet a következő negyzet. A felső sorok 15 cm-rel feljebb és 7,5 cm-rel beljebb kezdődnek.'],
        ],
        challenge: 'Rajzold meg a teljes dobogót! A rajzlapon a halványkék dobogóra kell rárajzolnod, és ne legyen kilógó vonal.<br>⭐ Csillagos feladat: csinálj saját blokkot a jobbra lépésből is! Hány blokkal lett rövidebb a programod?',
      },
    },
    {
      id: 'k7',
      title: 'Ébred a farm: felvesz és lerak',
      story: 'A házi WRO pályán a robot kosarakat, mérleget, ládákat és terményeket hord a helyükre. Amikor felvesz valamit, zölden világít, amikor lerak, kéken. Először kézzel írjuk meg, aztán észrevesszük, mit ismétlünk.',
      learn: ['Hogyan jelez a robot a bírónak?', 'Hogyan pontoz a bíró a szimulátorban?', 'Saját parancs a versenyen: felvesz() és lerak()'],
      rules: [
        { t: 'A bíró szeme', d: 'A robotnak még nincs fogókarja, ezért jelez: zöld fény és 1 mp állás = „felveszem”, kék fény és állás = „lerakom”. A bíró azt nézi, hol van ilyenkor a robot elején a piros mutató vége.' },
        { t: 'Egyszerre legfeljebb kettő', d: 'A robot egyszerre legfeljebb két dolgot vihet magával. Amit elsőnek vett fel, azt teszi le elsőnek.' },
        { t: 'Hányszor írtad le?', d: 'Számold meg, hányszor írtad le a zöld fény, csipogás, várakozás hármast! Ha többször, itt az ideje új szót tanítani a robotnak.' },
      ],
      python: {
        code: "from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction, Color\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# 1. Odamegyünk a jobb oldali kosárhoz (K2)\nrobot.turn(7.6)\nrobot.straight(258)\n\n# FELVESZEM! – jelzés a bírónak\nhub.light.on(Color.GREEN)\nhub.speaker.beep(800, 200)\nwait(1000)\n\n# 2. Elvisszük a bal felső parcellára, a madárijesztő mellett\nrobot.turn(17.3)\nrobot.straight(370)\n\n# LERAKOM! – jelzés a bírónak\nhub.light.on(Color.BLUE)\nhub.speaker.beep(400, 200)\nwait(1000)\n\n# 3. Most te jössz: hozd el a másik kosarat (K1) a középső parcellára!\n",
        explain: [
          ['robot.turn(7.6), robot.straight(258)', 'Odaállunk a jobb oldali kosárhoz (K2). A számokat a pálya Célzó eszközével mértük ki: mennyit kell fordulni, és mennyit menni.'],
          ['hub.light.on(Color.GREEN)', 'A hub középső gombja zöldre vált: „Felveszem!”'],
          ['hub.speaker.beep(800, 200)', 'Egy magas csipogás, hogy halljuk is.'],
          ['wait(1000)', 'A robot 1 másodpercig áll. A bíró csak akkor fogadja el, ha a robot közben nem mozdul.'],
          ['robot.turn(17.3), robot.straight(370)', 'Elvisszük a kosarat a bal felső parcellára, a madárijesztő mellett. Vigyázat: ha a robot hozzáér, elvész a bónusz!'],
          ['hub.light.on(Color.BLUE) …', 'Ugyanez kékkel: „Lerakom!” A kosár a mutató vége alá kerül, és a bíró pontozza.'],
        ],
        challenge: '1. Hozd el a másik kosarat (K1) is a középső parcellára! Ehhez újra le kell írnod a felvevő és a lerakó sorokat.<br>2. Számold meg, hányszor írtad le ugyanazt! Tanítsd meg a robotnak a <code>felvesz()</code> és a <code>lerak()</code> szót, és cseréld le velük az ismétlődő sorokat. Ugyanannyi pontot kell kapnod, mint előtte!',
      },
      blocks: {
        code: [['events', 'when program starts'], ['movement', 'set movement motors to A+B'], ['movement', 'set 1 motor rotation to 17.5 cm'], ['movement', 'move right: 100 for 15.2 degrees'], ['movement', 'move ↑ for 25.8 cm'], ['light', 'set Center Button light to green'], ['sound', 'play beep 72 for 0.2 seconds'], ['control', 'wait 1 seconds'], ['movement', 'move right: 100 for 34.6 degrees'], ['movement', 'move ↑ for 37 cm'], ['light', 'set Center Button light to blue'], ['sound', 'play beep 60 for 0.2 seconds'], ['control', 'wait 1 seconds']],
        explain: [
          ['move right … 15.2 degrees, move ↑ 25.8 cm', 'Odaállunk a jobb oldali kosárhoz (K2). A számokat a pálya Célzó eszközével mértük ki. A fordulásnál kerékfok van, ezért a robotfok kétszerese.'],
          ['set Center Button light to green', 'A középső gomb zöldre vált: „Felveszem!”'],
          ['wait 1 seconds', 'A robot 1 másodpercig áll. A bíró csak akkor fogadja el, ha a robot közben nem mozdul.'],
          ['move right … 34.6 degrees, move ↑ 37 cm', 'Elvisszük a kosarat a bal felső parcellára, a madárijesztő mellett.'],
          ['set Center Button light to blue', 'Ugyanez kékkel: „Lerakom!” A kosár a mutató vége alá kerül.'],
        ],
        challenge: '1. Hozd el a másik kosarat (K1) is a középső parcellára!<br>2. Számold meg, hányszor raktad le ugyanazt a három blokkot! Csinálj belőlük saját blokkot (felvesz és lerak), és cseréld le velük az ismétlődő blokkokat. Ugyanannyi pontot kell kapnod!',
      },
    },
    {
      id: 'k8',
      title: 'Tolass a falhoz!',
      story: 'A robotot sosem tesszük le tökéletesen egyenesen: pár fokot mindig tévedünk, és ez a pálya végére centikké nő. A versenypálya szélén viszont fal van, és ezt ki lehet használni! Ha a robot hátulja nekinyomódik a falnak, magától kiegyenesedik.',
      learn: ['Miért a barátunk a pálya fala?', 'Hogyan igazítjuk a robotot a falhoz?', 'Időre vezérelt mozgás: drive + wait + stop'],
      rules: [
        { t: 'A fal kiegyenesít', d: 'Ha a robot ferdén tolat a falnak, előbb az egyik sarka ér hozzá. Annak az oldalnak a kereke megáll, a másik tovább tolja, és a robot szépen a falhoz simul.' },
        { t: 'Lassan, és egy kicsit tovább', d: 'Lassan tolass, és egy kicsit tovább, mint amennyi a falig kell: a robotnak idő kell, hogy kiegyenesedjen. 1,5 másodperc általában elég.' },
        { t: 'Miért nem straight()?', d: 'A <code>robot.straight()</code> pontos távolságot akar megtenni. A falnál ez nem sikerül, a robot elakad. Itt a <code>drive()</code> + <code>wait()</code> + <code>stop()</code> hármas kell: „menj, amíg le nem állítalak”.' },
      ],
      python: {
        code: "from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\n# 1. Tolass a falhoz! A robot hátulja nekinyomódik a falnak,\n#    és közben kiegyenesedik.\nrobot.drive(-100, 0)     # lassan hátra\nwait(1500)               # 1,5 másodpercig tolja a falat\nrobot.stop()\n\n# 2. Most már pontosan egyenesen áll: indulhat előre\nrobot.straight(400)\n",
        explain: [
          ['robot.drive(-100, 0)', 'Lassan hátra indul (−100 mm/s), egyenesen (a 0 azt jelenti, hogy nem kanyarodik). Addig megy, amíg meg nem állítjuk.'],
          ['wait(1500)', 'Közben 1,5 másodpercig várunk. Ennyi idő alatt a robot a falhoz ér, és kiegyenesedik.'],
          ['robot.stop()', 'Megállunk. A robot most egyenesen, a falhoz simulva áll.'],
          ['robot.straight(400)', 'Innen már pontosan egyenesen indulunk 40 cm-t. A cél a piros sáv: a mutató 2 cm-rel az A vonal előtt álljon meg.'],
        ],
        challenge: '1. Töröld ki a három tolató sort, és futtasd így! Hova ér a robot? Mennyivel ment mellé?<br>2. Kapcsold be a Robot panelen a <b>Valóság módot</b>, és futtasd többször! Mindig eléri a célt?<br>3. Forgasd el a rajtot még jobban (írd át az irányt 20°-ra)! Még mindig kiegyenesedik?',
      },
      blocks: {
        code: [["events", "when program starts"], ["movement", "set movement motors to A+B"], ["movement", "set 1 motor rotation to 17.5 cm"], ["movement", "set movement speed to 30 %"], ["movement", "start moving ↓"], ["control", "wait 1.5 seconds"], ["movement", "stop moving"], ["movement", "move ↑ for 40 cm"]],
        explain: [
          ['set movement speed to 30 %', 'Lassabban megyünk, hogy a robot finoman érjen a falhoz.'],
          ['start moving ↓', 'Hátrafelé indul, és addig megy, amíg meg nem állítjuk.'],
          ['wait 1.5 seconds', '1,5 másodpercig toljuk a falat: közben a robot kiegyenesedik.'],
          ['stop moving', 'Megállunk. A robot most egyenesen áll.'],
          ['move ↑ for 40 cm', 'Innen már egyenesen megyünk 40 cm-t a piros sávig.'],
        ],
        challenge: '1. Vedd ki a három tolató blokkot, és futtasd így! Hova ér a robot?<br>2. Kapcsold be a Robot panelen a <b>Valóság módot</b>, és futtasd többször! Mindig eléri a célt?<br>3. Forgasd el a rajtot még jobban! Még mindig kiegyenesedik?',
      },
    },
    {
      id: 'k9',
      title: 'Menj a vonalig!',
      story: 'A falhoz igazodva az irány pontos lesz. De mennyit mentünk? A kerekek csúszhatnak, és minden centi hiba összeadódik. A pályán fekete vonalak vannak: ha a robot egy vonalnál áll meg, onnan pontosan tudja, hol van.',
      learn: ['Hogyan lát a színszenzor fekete vonalat?', '„Menj, amíg…” – a while ciklus', 'A távolság újrakalibrálása vonallal'],
      rules: [
        { t: 'Fényesség 0 és 100 között', d: 'A <code>reflection()</code> megmondja, mennyi fény verődik vissza: fehér felett nagy (kb. 100), fekete felett kicsi (kb. 0). Félúton, 50-nél húzzuk meg a határt.' },
        { t: 'Menj, amíg…', d: 'A <code>while</code> ciklus addig ismétel, amíg a feltétel igaz. Itt: amíg világosat lát, addig vár egy kicsit, és megy tovább.' },
        { t: 'A valódi pályán mérd meg!', d: 'A valódi szenzor fehér felett kb. 80–100-at, fekete felett 5–15-öt mér, és ez pályánként más. Írasd ki mindkettőt, és a kettő közepét használd határnak.' },
      ],
      python: {
        code: "from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem = ColorSensor(Port.C)\n\n# 1. Indulj el, és közben figyeld a színszenzort!\nrobot.drive(150, 0)\nwhile szem.reflection() > 50:    # amíg világosat (fehéret) lát...\n    wait(5)                      # ...addig megy tovább\nrobot.stop()                     # fekete vonal: megállunk\n\n# 2. Innen már pontosan tudjuk, hol vagyunk\nrobot.straight(100)\n",
        explain: [
          ['szem = ColorSensor(Port.C)', 'Elnevezzük a C kapuban lévő színszenzort: szem.'],
          ['robot.drive(150, 0)', 'Elindulunk előre, egyenesen, és megyünk, amíg meg nem állítjuk.'],
          ['while szem.reflection() > 50:', 'Amíg a szenzor világosat lát (50-nél többet), addig…'],
          ['    wait(5)', '…várunk 5 ezredmásodpercet, és újra megnézzük. A robot közben megy.'],
          ['robot.stop()', 'Ha feketét lát, kilépünk a ciklusból, és megállunk: a szenzor a vonal szélén van.'],
          ['robot.straight(100)', 'Innen pontosan tudjuk, hol vagyunk: még 10 cm, és a mutató a piros sávban áll.'],
        ],
        challenge: '1. Húzd a robotot közelebb vagy messzebb a vonaltól! Mindig sikerül a cél? Miért?<br>2. Írd át a sebességet 150-ről 400-ra! Mi történik a vonalnál?<br>3. A valódi pályán írasd ki fehér és fekete felett is: <code>print(szem.reflection())</code>. Mi legyen a határ?',
      },
      blocks: {
        code: [["events", "when program starts"], ["movement", "set movement motors to A+B"], ["movement", "set 1 motor rotation to 17.5 cm"], ["movement", "set movement speed to 30 %"], ["movement", "start moving ↑"], ["control", "wait until ‹C reflection < 50›"], ["movement", "stop moving"], ["movement", "move ↑ for 10 cm"]],
        explain: [
          ['start moving ↑', 'Elindulunk előre, és megyünk, amíg meg nem állítjuk.'],
          ['wait until C reflection < 50', 'Várunk, amíg a színszenzor sötétet lát (50-nél kevesebbet): ez a fekete vonal. Közben a robot megy.'],
          ['stop moving', 'Megállunk a vonalnál. Innen pontosan tudjuk, hol vagyunk.'],
          ['move ↑ for 10 cm', 'Még 10 cm, és a mutató a piros sávban áll.'],
        ],
        challenge: '1. Húzd a robotot közelebb vagy messzebb a vonaltól! Mindig sikerül a cél?<br>2. Állítsd a sebességet 30-ról 80-ra! Mi történik a vonalnál?<br>3. A valódi pályán nézd meg a SPIKE Appban, mennyit mér a szenzor fehér és fekete felett!',
      },
    },
    {
      id: 'k10',
      title: 'Igazodj a vonalhoz!',
      only: 'python',
      story: 'Falhoz csak a pálya szélén tudunk igazodni. A pálya közepén a vonalak segítenek: két színszenzorral a robot merőlegesre tudja állítani magát egy vonalra, menet közben, bárhol a pályán.',
      learn: ['Két szenzor, két kerék: mindegyik a saját oldalát figyeli', 'A motorok külön vezérlése: run() és stop()', 'Miért jobb kétszer igazodni?'],
      rules: [
        { t: 'Mindkét oldal a saját vonaláig', d: 'A bal kerék addig megy, amíg a bal szenzor feketét nem lát, a jobb kerék a jobb szenzorig. Amelyik előbb ér oda, az megvárja a másikat, és a robot ráfordul a vonalra.' },
        { t: 'Lassan!', d: 'A kerekek lassan menjenek (100 fok/s), különben a robot túlfut a vonalon, mire megáll.' },
        { t: 'Másodszorra pontosabb', d: 'Az első igazodás után a robot még pár fokot ferde, mert a szenzorok a kerekek előtt vannak. Kicsit vissza, és még egyszer: így már szinte tökéletes.' },
      ],
      python: {
        code: "from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem_b = ColorSensor(Port.C)     # bal oldali színszenzor\nszem_j = ColorSensor(Port.F)     # jobb oldali színszenzor\n\ndef igazodj():\n    # Mindkét kerék lassan a vonal felé megy. Amelyik oldal szenzora\n    # feketét lát, annak a kereke megáll, a másik tovább megy.\n    while True:\n        b_kesz = szem_b.reflection() < 50\n        j_kesz = szem_j.reflection() < 50\n        if b_kesz and j_kesz:\n            break\n        if b_kesz:\n            bal.stop()\n        else:\n            bal.run(100)\n        if j_kesz:\n            jobb.stop()\n        else:\n            jobb.run(100)\n        wait(5)\n    bal.stop()\n    jobb.stop()\n\nigazodj()              # 1. igazodás: már majdnem egyenes\nrobot.straight(-40)    # egy kicsit vissza a vonal elé\nigazodj()              # 2. igazodás: most már pontos\n\n# Most merőlegesen áll a vonalra: innen mérhetünk\nrobot.straight(150)\n",
        explain: [
          ['szem_b, szem_j', 'Két színszenzor: a bal a C, a jobb az F kapuban. (A Robot méretei ablakban be kell kapcsolni a második szenzort.)'],
          ['def igazodj():', 'Saját parancs az igazodáshoz, mert kétszer is használjuk.'],
          ['while True: … break', 'Örökké ismétel, amíg el nem érjük a célt: ha mindkét szenzor feketét lát, a break kilép a ciklusból.'],
          ['b_kesz = szem_b.reflection() < 50', 'Igaz, ha a bal szenzor már a fekete vonalon van.'],
          ['if b_kesz: bal.stop() else: bal.run(100)', 'Ha a bal oldal kész, a bal kerék áll. Ha nem, lassan forog előre. Ugyanígy a jobb oldal.'],
          ['robot.straight(-40), igazodj()', 'Egy kicsit vissza, és még egyszer igazodunk: másodszorra sokkal pontosabb.'],
          ['robot.straight(150)', 'Most merőlegesen állunk a vonalra: 15 cm, és a mutató a piros sávban áll.'],
        ],
        challenge: '1. Hívd meg az <code>igazodj()</code>-t csak egyszer! Hány fokot áll ferdén a végén? (A konzol kiírja.)<br>2. Hívd meg háromszor! Mennyivel lesz jobb?<br>3. Tedd a robotot nagyon ferdén (30°) a vonal elé! Működik még?',
      },
    },
    {
      id: 'k11',
      title: 'Kövesd a vonalat!',
      story: 'Sok WRO-pályán fekete vonal vezet a feladatokhoz. A robot a vonal szélét követi: ha feketét lát, kifelé kanyarodik, ha fehéret, befelé. Így cikázva halad a vonal mentén, a kanyarokban is.',
      learn: ['Vonalkövetés egy szenzorral', 'Döntés minden pillanatban: ha… különben…', 'Sebesség és kanyarodás egyensúlya'],
      rules: [
        { t: 'A vonal szélét követjük', d: 'Nem a vonal közepét, hanem a szélét: ott találkozik a fekete a fehérrel. A szenzor hol az egyiket, hol a másikat látja.' },
        { t: 'Cikázás', d: 'Minden pillanatban dönt: fekete → kifelé kanyarodik, fehér → befelé. Ettől cikázik, de a vonalon marad.' },
        { t: 'Ne túl gyorsan!', d: 'Ha túl gyors, a kanyarban kirepül, mielőtt észrevenné, hogy elhagyta a vonalat.' },
      ],
      python: {
        code: "from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem = ColorSensor(Port.C)\n\n# Kövesd a vonal szélét 20 másodpercig!\nfor i in range(2000):\n    if szem.reflection() < 50:   # feketén vagyok: kifelé kanyarodom\n        robot.drive(120, 40)\n    else:                        # fehéren vagyok: befelé kanyarodom\n        robot.drive(120, -40)\n    wait(10)\nrobot.stop()\n",
        explain: [
          ['for i in range(2000):', '2000-szer ismétlünk, mindegyik 10 ms: összesen 20 másodpercig követjük a vonalat.'],
          ['if szem.reflection() < 50:', 'Ha a szenzor feketét lát (a vonalon van)…'],
          ['    robot.drive(120, 40)', '…előre megy, és közben jobbra, kifelé kanyarodik (40 fok/s).'],
          ['else: robot.drive(120, -40)', 'Különben (fehéret lát) balra, befelé kanyarodik.'],
          ['wait(10)', '10 ms várakozás, aztán újra dönt.'],
        ],
        challenge: '1. Növeld a sebességet 120-ról 200-ra! Bent marad a robot a kanyarban?<br>2. Mi történik, ha a 40-et 80-ra írod? És ha 15-re?<br>⭐ Junioroknak: simább követés! Ne csak két irány legyen: kanyarodj annyival, amennyire messze vagy a határtól: <code>robot.drive(120, (50 - szem.reflection()) * 1.5)</code>. Ez az arányos (P) szabályozó.',
      },
      blocks: {
        code: [["events", "when program starts"], ["movement", "set movement motors to A+B"], ["movement", "set 1 motor rotation to 17.5 cm"], ["movement", "set movement speed to 25 %"], ["control", "repeat 400"], ["control", "if ‹C is color black?› then", 1], ["movement", "start moving right: 30", 2], ["control", "else", 1], ["movement", "start moving left: 30", 2], ["control", "wait 0.05 seconds", 1], ["movement", "stop moving"]],
        explain: [
          ['repeat 400', '400-szor ismétlünk, mindegyik 0,05 mp: 20 másodpercig követjük a vonalat.'],
          ['if C is color black? then', 'Ha a szenzor feketét lát (a vonalon van)…'],
          ['start moving right: 30', '…jobbra, kifelé kanyarodik.'],
          ['else → start moving left: 30', 'Különben (fehéret lát) balra, befelé kanyarodik.'],
          ['wait 0.05 seconds', 'Egy pici várakozás, aztán újra dönt.'],
        ],
        challenge: '1. Növeld a sebességet 25-ről 50-re! Bent marad a robot a kanyarban?<br>2. Mi történik, ha a 30-at 60-ra írod? És ha 10-re?',
      },
    },
    {
      id: 'k12',
      title: 'Hosszú út újrakalibrálással',
      only: 'python',
      story: 'A versenyen a robot sokat megy, és minden mozdulatnál tévedhet egy kicsit. Ha csak megyünk és fordulunk, a hibák összeadódnak. A jó versenyrobot menet közben újra és újra igazodik: falhoz, vonalhoz. Így a cél akkor is meglesz, ha a robot nem tökéletes.',
      learn: ['Útvonaltervezés igazodási pontokkal', 'Saját parancsok: tolass_a_falhoz(), menj_a_vonalig()', 'Tervezz a hibára: Valóság mód'],
      rules: [
        { t: 'Kapcsold be a Valóság módot!', d: 'A Robot panelen a Valóság mód minden futásnál kicsit elrontja a robotot (kerekek, tengelytáv, letevés), mint a valóságban. Ilyenkor derül ki, mennyire jó a terved.' },
        { t: 'Igazodási pontok', d: 'Tervezd úgy az utat, hogy minden hosszabb szakasz előtt legyen egy fal vagy egy vonal, amihez igazodhatsz. A fal az irányt, a vonal a távolságot javítja.' },
        { t: 'Egy futás nem futás', d: 'A versenyen a megbízhatóság a fontos. Futtasd 5-ször, és számold meg, hányszor sikerült!' },
      ],
      python: {
        code: "from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\n\nszem = ColorSensor(Port.C)\n\ndef tolass_a_falhoz():\n    robot.drive(-100, 0)\n    wait(1500)\n    robot.stop()\n\ndef menj_a_vonalig():\n    robot.drive(150, 0)\n    while szem.reflection() > 50:\n        wait(5)\n    robot.stop()\n\n# 1. Igazodás a falhoz: innen egyenesen állunk\ntolass_a_falhoz()\n# 2. Az A vonalig: innen tudjuk, milyen messze vagyunk a faltól\nmenj_a_vonalig()\nrobot.straight(-150)          # vissza a vonal alá\n# 3. Jobbra fordulunk, és a B vonalig megyünk\nrobot.turn(90)\nmenj_a_vonalig()\n# 4. Balra fordulunk, és felmegyünk a célhoz\nrobot.turn(-90)\nrobot.straight(300)\n",
        explain: [
          ['def tolass_a_falhoz(), def menj_a_vonalig()', 'A 8. és a 9. küldetés tudása, saját parancsként. Így a terv olvasható marad.'],
          ['tolass_a_falhoz()', '1. igazodás: a rajt után a fal kiegyenesíti a robotot.'],
          ['menj_a_vonalig(), robot.straight(-150)', '2. igazodás: az A vonalnál pontosan tudjuk, milyen messze vagyunk a faltól. Aztán kicsit vissza, hogy a szenzor ne a vonalon álljon.'],
          ['robot.turn(90), menj_a_vonalig()', '3. igazodás: jobbra fordulunk, és a B vonalig megyünk. Most már oldalirányban is tudjuk, hol vagyunk.'],
          ['robot.turn(-90), robot.straight(300)', 'Balra fordulunk, és felmegyünk a piros célhoz.'],
        ],
        challenge: '1. Kapcsold be a Valóság módot, és futtasd 5-ször! Hányszor találta el a célt?<br>2. Írj egy „buta” változatot igazodás nélkül (csak straight és turn), ami ugyanoda visz! Valóság módban hányszor talál?<br>3. Tedd a rajtot máshova a rajtmezőn belül! Az igazodó változat így is célba ér? És a buta?',
      },
    },
  ];

  window.KodfejtoMissions = MISSIONS;
})();
