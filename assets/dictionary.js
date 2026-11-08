/*
 * Kódfejtő Műhely – Kódszótár
 * Minden parancs egy kártyán: blokk és Python egymás mellett.
 *
 *  py     – a Python (Pybricks) alak
 *  blk    – a SPIKE App szóblokk(ok): [kategória, szöveg, behúzás]; null, ha blokkban nincs ilyen
 *  blkNote– megjegyzés, ha blokkban nincs vagy nem kell
 *  what   – mit csinál (3.-osoknak)
 *  warn   – „Vigyázz!” – a tipikus tévesztés
 *  ex     – Python példa (opcionális)
 *  tryPy  – ezt tölti be a pályára a „Kipróbálom” gomb (a közös eleje elé kerül)
 *  mission– melyik küldetésben tanuljuk
 */
(function () {
  'use strict';

  const CATS = [
    ['alap', 'Indulás, beállítás', '#FFBF00'],
    ['mozgas', 'Mozgás', '#E0459B'],
    ['motor', 'Egy motor', '#2F6FED'],
    ['hub', 'Kijelző, hang, fény', '#8A5CF6'],
    ['vezerles', 'Várakozás, ismétlés', '#E3A008'],
    ['dontes', 'Döntés', '#E3A008'],
    ['szo', 'Saját parancs', '#FF6680'],
    ['erzekelo', 'Érzékelők', '#18A3B8'],
  ];

  // A „Kipróbálom” gomb ezt teszi minden példa elé
  const PRELUDE = 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor, ColorSensor, UltrasonicSensor\nfrom pybricks.parameters import Port, Direction, Color, Icon\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait\n\nhub = PrimeHub()\nbal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)\nrobot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)\nszem = ColorSensor(Port.C)\ntav = UltrasonicSensor(Port.D)\n\n# ---- Itt próbáld ki! ----\n';

  const WORDS = [
    // ---------------------------------------------------------------- alap
    {
      id: 'import', cat: 'alap', name: 'A szerszámosláda kinyitása',
      py: 'from pybricks.hubs import PrimeHub\nfrom pybricks.pupdevices import Motor\nfrom pybricks.parameters import Port, Direction\nfrom pybricks.robotics import DriveBase\nfrom pybricks.tools import wait',
      blk: null, blkNote: 'Blokkoknál nem kell: a SPIKE App magától elővesz mindent.',
      what: 'A program elején elővesszük, amit használni fogunk: az Agyat (PrimeHub), a motort, a kapukat (Port), a Szuper-sofőrt (DriveBase) és az órát (wait). Amit nem veszel elő, azt a robot nem ismeri.',
      warn: 'Ha valami hiányzik innen, NameError hibát kapsz. A nagy- és kisbetű számít: PrimeHub, és nem primehub.',
      mission: 'k1',
    },
    {
      id: 'hub', cat: 'alap', name: 'Az Agy elnevezése',
      py: 'hub = PrimeHub()',
      blk: null, blkNote: 'Blokkoknál nem kell.',
      what: 'Elnevezzük a nagy sárga téglát: mostantól hub a neve. Ezután így szólunk hozzá: hub.display…, hub.speaker…, hub.light…',
      warn: 'A zárójel kell a végére: PrimeHub().',
      mission: 'k1',
    },
    {
      id: 'motors', cat: 'alap', name: 'Motorok a kapukon',
      py: 'bal = Motor(Port.A, Direction.COUNTERCLOCKWISE)\njobb = Motor(Port.B)',
      blk: [['movement', 'set movement motors to A+B']],
      what: 'Megmondjuk, melyik kapuban (porton) van a két kerék motorja. Az iskolai robotnál: A = bal kerék, B = jobb kerék.',
      warn: 'Pythonban a bal motornak kell a Direction.COUNTERCLOCKWISE, különben a robot helyben pörög, mint egy búgócsiga. A blokkoknál ezt a SPIKE App magától tudja.',
      tryPy: 'robot.straight(200)',
      mission: 'k2',
    },
    {
      id: 'drivebase', cat: 'alap', name: 'A Szuper-sofőr',
      py: 'robot = DriveBase(bal, jobb, wheel_diameter=56, axle_track=112)',
      blk: [['movement', 'set 1 motor rotation to 17.5 cm']],
      what: 'A két kereket egyszerre vezénylő sofőr. Megadjuk neki a kerék méretét, így centire pontosan tud menni és fokra pontosan fordulni.',
      warn: 'Pythonban a kerék átmérője (56 mm) és a két kerék távolsága (112 mm) kell. Blokkban az, hogy egy kerékfordulattal hány centit gurul (17,5 cm). Ha ezek rosszak, a robot rosszul mér és rosszul fordul.',
      tryPy: 'robot.turn(90)',
      mission: 'k2',
    },
    {
      id: 'settings', cat: 'alap', name: 'Sebesség beállítása',
      py: 'robot.settings(straight_speed=240)',
      blk: [['movement', 'set movement speed to 50 %']],
      what: 'Megmondjuk, milyen gyorsan menjen a robot. Lassabban pontosabban áll meg.',
      warn: 'Pythonban milliméter/másodperc (240 = 24 cm másodpercenként), blokkban százalék.',
      tryPy: 'robot.settings(straight_speed=100)\nrobot.straight(200)\nrobot.settings(straight_speed=400)\nrobot.straight(200)',
      mission: 'k3',
    },
    // ---------------------------------------------------------------- mozgás
    {
      id: 'straight', cat: 'mozgas', name: 'Menj egyenesen!',
      py: 'robot.straight(200)',
      blk: [['movement', 'move ↑ for 20 cm']],
      what: 'A robot egyenesen előre megy, aztán megáll. Hátrafelé Pythonban mínusz számmal megy, blokkban a lefelé mutató nyíllal (↓).',
      ex: 'robot.straight(-100)   # hátra 10 cm',
      warn: 'Python: MILLIméter (200 = 20 cm). Blokk: CENTIméter (20 = 20 cm).',
      tryPy: 'robot.straight(200)\nrobot.straight(-100)',
      mission: 'k2',
    },
    {
      id: 'turn', cat: 'mozgas', name: 'Fordulj helyben!',
      py: 'robot.turn(90)',
      blk: [['movement', 'move right: 100 for 180 degrees']],
      what: 'A robot helyben fordul. Pythonban a pozitív szám jobbra, a negatív balra fordítja.',
      ex: 'robot.turn(-90)   # balra',
      warn: 'Pythonban a ROBOT fordul 90 fokot. Blokkban a KERÉK fordul annyi fokot, ezért a robot 90 fokos fordulásához 180 kerékfok kell!',
      tryPy: 'robot.turn(90)\nrobot.turn(-180)',
      mission: 'k3',
    },
    {
      id: 'drive', cat: 'mozgas', name: 'Indulj el, és menj, amíg meg nem állítalak!',
      py: 'robot.drive(200, 0)',
      blk: [['movement', 'start moving ↑']],
      what: 'A robot elindul, és addig megy, amíg egy másik parancs meg nem állítja. Közben a program már a következő soron dolgozik, például várakozik vagy figyeli az érzékelőt.',
      ex: 'robot.drive(200, 0)\nwait(2000)\nrobot.stop()',
      warn: 'Pythonban az első szám a sebesség (mm/másodperc), a második a kanyarodás (0 = egyenesen). Ha nem állítod meg, a robot nekimegy a falnak!',
      tryPy: 'robot.drive(200, 0)\nwait(2000)\nrobot.stop()',
    },
    {
      id: 'stop', cat: 'mozgas', name: 'Állj meg!',
      py: 'robot.stop()',
      blk: [['movement', 'stop moving']],
      what: 'Megállítja az elindított robotot.',
      tryPy: 'robot.drive(150, 0)\nwait(1000)\nrobot.stop()',
    },
    {
      id: 'gyro', cat: 'mozgas', name: 'Giroszkóp bekapcsolása',
      py: 'robot.use_gyro(True)',
      blk: null, blkNote: 'Ezt csak Pythonban (Pybricks) használjuk.',
      what: 'A fordulást ezután a hubban lévő giroszkóp méri, nem a kerekek. Így a robot akkor is pontosan fordul, ha a kereke megcsúszik.',
      warn: 'Indulás előtt a robot álljon mozdulatlanul, amíg a giroszkóp el nem készül (lásd: „Várj, amíg…”).',
      tryPy: 'robot.use_gyro(True)\nwhile not hub.imu.ready():\n    wait(10)\nrobot.turn(90)',
      mission: 'k4',
    },
    {
      id: 'odo', cat: 'mozgas', name: 'Mennyit mentem? Mennyit fordultam?',
      py: 'robot.distance()\nrobot.angle()',
      blk: null, blkNote: 'Ezt csak Pythonban használjuk.',
      what: 'A robot megmondja, hogy szerinte hány millimétert ment és hány fokot fordult az indulás óta.',
      ex: 'print("Ennyit mentem:", robot.distance())',
      tryPy: 'robot.straight(300)\nrobot.turn(45)\nprint("Ennyit mentem:", robot.distance())\nprint("Ennyit fordultam:", robot.angle())',
      mission: 'k4',
    },
    // ---------------------------------------------------------------- egy motor
    {
      id: 'run_angle', cat: 'motor', name: 'Forgasd a motort!',
      py: 'motor.run_angle(500, 360)',
      blk: [['motors', 'A run ↻ for 1 rotations']],
      what: 'Egyetlen motor fordul: 500-as sebességgel 360 fokot, vagyis egy teljes kört. Később ezzel mozgatjuk a fogókart.',
      warn: 'Pythonban fokban adjuk meg (360 = 1 kör). Blokkban választhatsz fordulatot (rotations), fokot (degrees) vagy másodpercet (seconds). Előtte el kell nevezni a motort: motor = Motor(Port.A).',
      tryPy: 'bal.run_angle(500, 360)',
      mission: 'k1',
    },
    {
      id: 'run', cat: 'motor', name: 'Motor indítása és leállítása',
      py: 'motor.run(500)\nmotor.stop()',
      blk: [['motors', 'A start motor ↻'], ['motors', 'A stop motor']],
      what: 'A motor forogni kezd, és addig forog, amíg le nem állítod.',
      ex: 'motor.run(500)\nwait(1000)\nmotor.stop()',
      tryPy: 'jobb.run(500)\nwait(1000)\njobb.stop()',
    },
    // ---------------------------------------------------------------- hub
    {
      id: 'text', cat: 'hub', name: 'Írj a kijelzőre!',
      py: 'hub.display.text("3")',
      blk: [['light', 'write 3']],
      what: 'Betűket és számokat írsz ki a hub 5×5-ös kijelzőjére. A hosszabb szöveg végigfut rajta.',
      warn: 'Pythonban a szöveg idézőjelek közé kerül: "Szia".',
      tryPy: 'hub.display.text("3")\nwait(500)\nhub.display.text("Szia")',
      mission: 'k1',
    },
    {
      id: 'icon', cat: 'hub', name: 'Mutass egy képet!',
      py: 'hub.display.icon(Icon.HEART)',
      blk: [['light', 'turn on heart ♥']],
      what: 'Egy kész kép (szív, mosoly, nyíl…) jelenik meg a kijelzőn.',
      warn: 'Pythonban az Icon-t is elő kell venni: from pybricks.parameters import Icon',
      tryPy: 'hub.display.icon(Icon.HEART)\nwait(1000)\nhub.display.icon(Icon.HAPPY)\nwait(1000)',
    },
    {
      id: 'off', cat: 'hub', name: 'Kijelző kikapcsolása',
      py: 'hub.display.off()',
      blk: [['light', 'turn off pixels']],
      what: 'Letörli a kijelzőt, minden pötty kialszik.',
      tryPy: 'hub.display.text("A")\nwait(1000)\nhub.display.off()',
    },
    {
      id: 'beep', cat: 'hub', name: 'Csipogj!',
      py: 'hub.speaker.beep(600, 200)',
      blk: [['sound', 'play beep 72 for 0.2 seconds']],
      what: 'A robot sípol. Az első szám a hang magassága, a második az, hogy meddig szóljon.',
      warn: 'Python: magasság hertzben (600), hossz ezredmásodpercben (200 = 0,2 mp). Blokk: a hangjegy száma (72), hossz másodpercben (0.2).',
      tryPy: 'hub.speaker.beep(400, 200)\nhub.speaker.beep(600, 200)\nhub.speaker.beep(800, 400)',
      mission: 'k1',
    },
    {
      id: 'light', cat: 'hub', name: 'Világíts színesen!',
      py: 'hub.light.on(Color.GREEN)',
      blk: [['light', 'set Center Button light to green']],
      what: 'A hub középső gombja színesen világít. A házi WRO-n ezzel jelez a robot a bírónak: zöld = felveszem, kék = lerakom.',
      warn: 'Pythonban a Color-t is elő kell venni: from pybricks.parameters import Color',
      tryPy: 'hub.light.on(Color.GREEN)\nwait(1000)\nhub.light.on(Color.BLUE)\nwait(1000)',
      mission: 'k7',
    },
    // ---------------------------------------------------------------- vezérlés
    {
      id: 'wait', cat: 'vezerles', name: 'Várj!',
      py: 'wait(1000)',
      blk: [['control', 'wait 1 seconds']],
      what: 'A robot vár, és közben nem csinál semmit.',
      warn: 'Python: ezredmásodperc (1000 = 1 mp). Blokk: másodperc (1 = 1 mp). Ez a leggyakoribb tévesztés!',
      tryPy: 'hub.display.text("1")\nwait(1000)\nhub.display.text("2")\nwait(1000)',
      mission: 'k1',
    },
    {
      id: 'for', cat: 'vezerles', name: 'Ismételd N-szer!',
      py: 'for i in range(4):\n    robot.straight(200)\n    robot.turn(90)',
      blk: [['control', 'repeat 4'], ['movement', 'move ↑ for 20 cm', 1], ['movement', 'move right: 100 for 180 degrees', 1]],
      what: 'A benne lévő parancsokat annyiszor csinálja meg, ahányszor mondod. Itt négyszer: ebből lesz a négyzet.',
      warn: 'Pythonban a sor végén kettőspont kell, és az ismétlendő sorok 4 szóközzel beljebb kezdődnek.',
      tryPy: 'for i in range(4):\n    robot.straight(200)\n    robot.turn(90)',
      mission: 'k2',
    },
    {
      id: 'forever', cat: 'vezerles', name: 'Ismételd örökké!',
      py: 'while True:\n    …',
      blk: [['control', 'forever']],
      what: 'A benne lévő parancsokat a program végéig újra és újra megcsinálja.',
      ex: 'while True:\n    hub.light.on(Color.RED)\n    wait(500)\n    hub.light.on(Color.BLUE)\n    wait(500)',
      warn: 'Ha a ciklusban nincs se mozgás, se wait(), a szimulátor leállítja: „túl sokáig fut”. A szimulátor egy futást legfeljebb 3 percig enged.',
      tryPy: 'while True:\n    hub.light.on(Color.RED)\n    wait(500)\n    hub.light.on(Color.BLUE)\n    wait(500)',
    },
    {
      id: 'until', cat: 'vezerles', name: 'Várj, amíg…',
      py: 'while not hub.imu.ready():\n    wait(10)',
      blk: [['control', 'wait until ‹feltétel›']],
      what: 'A robot addig vár, amíg a feltétel igaz nem lesz. Például amíg a giroszkóp el nem készül, vagy amíg az érzékelő akadályt nem lát.',
      warn: 'Pythonban ez egy „amíg NEM igaz, várj egy kicsit” ciklus. A wait(10) kell bele!',
      tryPy: 'robot.drive(150, 0)\nwhile not tav.distance() < 150:\n    wait(10)\nrobot.stop()\nhub.speaker.beep(800, 200)',
      mission: 'k4',
    },
    // ---------------------------------------------------------------- döntés
    {
      id: 'if', cat: 'dontes', name: 'Ha… akkor…, különben…',
      py: 'if szem.color() == Color.RED:\n    hub.speaker.beep(800, 200)\nelse:\n    hub.speaker.beep(300, 200)',
      blk: [['control', 'if ‹C is color red?› then'], ['sound', 'play beep 80 for 0.2 seconds', 1], ['control', 'else'], ['sound', 'play beep 60 for 0.2 seconds', 1]],
      what: 'A robot megnéz valamit, és attól függően mást csinál. Ha a feltétel igaz, az első részt csinálja, ha nem, a másodikat.',
      warn: 'Pythonban az összehasonlítás két egyenlőségjel: ==. Egy egyenlőségjel (=) névadás!',
      tryPy: 'print("Ezt látom:", szem.color())\nif szem.color() == Color.RED:\n    hub.speaker.beep(800, 200)\nelse:\n    hub.speaker.beep(300, 200)',
    },
    // ---------------------------------------------------------------- saját parancs
    {
      id: 'def', cat: 'szo', name: 'Új szó tanítása (def)',
      py: 'def negyzet():\n    for i in range(4):\n        robot.straight(150)\n        robot.turn(90)',
      blk: [['define', 'define negyzet'], ['control', 'repeat 4', 1], ['movement', 'move ↑ for 15 cm', 2], ['movement', 'move right: 100 for 180 degrees', 2]],
      what: 'Megtanítjuk a robotnak, mit jelent egy új szó. Ettől még NEM csinál semmit, csak megjegyzi! Akkor csinálja meg, amikor kimondjuk.',
      warn: 'A def a program elejére kerül, a kimondás alá. A névben ne legyen szóköz és ékezet (negyzet, jobbra_lep), mert a valódi robot nem érti.',
      tryPy: 'def negyzet():\n    for i in range(4):\n        robot.straight(150)\n        robot.turn(90)\n\nnegyzet()',
      mission: 'k5',
    },
    {
      id: 'call', cat: 'szo', name: 'A szó kimondása (hívás)',
      py: 'negyzet()',
      blk: [['myblocks', 'negyzet']],
      what: 'Kimondjuk a szót: a robot megkeresi, mit jelent, és megcsinálja. Annyiszor csinálja meg, ahányszor kimondod.',
      warn: 'Zárójel nélkül (negyzet) a robot csak gondol a szóra, de nem csinálja meg!',
      tryPy: 'def csipog():\n    hub.speaker.beep(800, 100)\n    wait(200)\n\ncsipog()\ncsipog()\ncsipog()',
      mission: 'k5',
    },
    // ---------------------------------------------------------------- érzékelők
    {
      id: 'color', cat: 'erzekelo', name: 'Milyen színt látsz?',
      py: 'szem = ColorSensor(Port.C)\nszem.color()',
      blk: [['sensors', 'C is color red ?']],
      what: 'A robot alján lévő színszenzor megmondja, milyen színt lát maga alatt (piros, kék, zöld, sárga, fekete, fehér…).',
      ex: 'print(szem.color())',
      warn: 'Pythonban a ColorSensor-t elő kell venni, és meg kell mondani, melyik kapuban van. Az iskolai robotnál: C.',
      tryPy: 'for i in range(6):\n    print(szem.color())\n    robot.straight(50)',
    },
    {
      id: 'reflection', cat: 'erzekelo', name: 'Mennyire világos?',
      py: 'szem.reflection()',
      blk: [['sensors', 'C reflection']],
      what: 'Egy 0 és 100 közötti szám: fekete felett kicsi, fehér felett nagy. Ezzel lehet majd vonalat követni.',
      tryPy: 'for i in range(6):\n    print(szem.reflection())\n    robot.straight(50)',
    },
    {
      id: 'distance', cat: 'erzekelo', name: 'Milyen messze van az akadály?',
      py: 'tav = UltrasonicSensor(Port.D)\ntav.distance()',
      blk: [['sensors', 'D distance in cm']],
      what: 'A távolságérzékelő (a robot két „szeme” elöl) megméri, milyen messze van előtte valami.',
      ex: 'if tav.distance() < 100:\n    robot.stop()',
      warn: 'Python: milliméterben ad értéket. Blokk: centiméterben. Az iskolai robotnál a D kapuban van.',
      tryPy: 'print("Ennyire van a fal:", tav.distance(), "mm")',
    },
    {
      id: 'closer', cat: 'erzekelo', name: 'Közelebb van, mint…?',
      py: 'tav.distance() < 100',
      blk: [['sensors', 'D is closer than 10 cm ?']],
      what: 'Igen/nem kérdés: közelebb van-e az akadály a megadott távolságnál. A „Ha…” és a „Várj, amíg…” blokkba tesszük.',
      warn: 'Python: 100 mm = 10 cm.',
      tryPy: 'robot.drive(150, 0)\nwhile not tav.distance() < 100:\n    wait(10)\nrobot.stop()',
    },
    {
      id: 'heading', cat: 'erzekelo', name: 'Merre nézek? (giroszkóp)',
      py: 'hub.imu.heading()',
      blk: null, blkNote: 'Ezt csak Pythonban használjuk.',
      what: 'A giroszkóp szerint hány fokot fordult a robot indulás óta.',
      tryPy: 'robot.use_gyro(True)\nwhile not hub.imu.ready():\n    wait(10)\nrobot.turn(90)\nprint("Giroszkóp:", hub.imu.heading())',
      mission: 'k4',
    },
  ];

  window.KodfejtoDictionary = { CATS, WORDS, PRELUDE };
})();
