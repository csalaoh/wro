/*
 * Kódfejtő Műhely – virtuális pálya, blokkos mód
 *
 * A SPIKE App 3 szóblokkjainak megfelelő blokkok Blocklyben. A blokkos
 * programból Python-kód lesz, ami a pybricks_shim.py "_spike_blocks"
 * függvényeit hívja, így a futtatás ugyanazon a szimulátoron megy, mint a
 * Python-mód. A blokkok viselkedése a SPIKE App (LEGO firmware) szerinti.
 */
(function (root) {
  'use strict';
  const Blockly = root.Blockly;
  const gen = root.python.pythonGenerator;
  const Order = root.python.Order;

  const C = {
    events: '#FFBF00', movement: '#E0459B', motors: '#2F6FED', light: '#8A5CF6',
    sound: '#C94FCB', control: '#E3A008', sensors: '#18A3B8', operators: '#2BB673',
  };
  const PORTS = ['A', 'B', 'C', 'D', 'E', 'F'].map((p) => [p, p]);
  const UNITS = [['cm', 'cm'], ['in', 'in'], ['rotations', 'rotations'], ['degrees', 'degrees'], ['seconds', 'seconds']];
  const MUNITS = [['rotations', 'rotations'], ['degrees', 'degrees'], ['seconds', 'seconds']];
  const COLORS = [['red', 'RED'], ['green', 'GREEN'], ['blue', 'BLUE'], ['yellow', 'YELLOW'], ['black', 'BLACK'], ['white', 'WHITE'], ['orange', 'ORANGE'], ['violet', 'VIOLET'], ['no color', 'NONE']];
  const LIGHTS = [['green', 'GREEN'], ['blue', 'BLUE'], ['red', 'RED'], ['yellow', 'YELLOW'], ['white', 'WHITE'], ['orange', 'ORANGE'], ['violet', 'VIOLET'], ['off', 'NONE']];
  const IMAGES = [['heart ♥', 'HEART'], ['happy ☺', 'HAPPY'], ['sad ☹', 'SAD'], ['arrow ↑', 'UP'], ['arrow ↓', 'DOWN'], ['arrow →', 'RIGHT'], ['arrow ←', 'LEFT'], ['full ■', 'FULL']];

  const num = (name) => ({ type: 'input_value', name, check: 'Number' });

  Blockly.defineBlocksWithJsonArray([
    // események
    { type: 'spike_start', message0: 'when program starts', nextStatement: null, colour: C.events,
      tooltip: 'Amikor a program elindul – a program az ez alá tett blokkokkal kezdődik.', hat: 'cap' },

    // mozgás
    { type: 'spike_set_pair', message0: 'set movement motors to %1',
      args0: [{ type: 'field_dropdown', name: 'PAIR', options: [['A+B', 'A,B'], ['B+A', 'B,A'], ['C+D', 'C,D'], ['E+F', 'E,F'], ['A+E', 'A,E']] }],
      previousStatement: null, nextStatement: null, colour: C.movement,
      tooltip: 'Melyik két motor hajtja a kerekeket (először a bal, aztán a jobb). Az iskolai robotnál: A+B.' },
    { type: 'spike_set_speed', message0: 'set movement speed to %1 %%', args0: [num('N')],
      previousStatement: null, nextStatement: null, colour: C.movement, inputsInline: true,
      tooltip: 'Milyen gyorsan menjen a robot (0–100%). Lassabban pontosabban áll meg.' },
    { type: 'spike_set_rotation', message0: 'set 1 motor rotation to %1 %2',
      args0: [num('N'), { type: 'field_dropdown', name: 'UNIT', options: [['cm', 'cm'], ['in', 'in']] }],
      previousStatement: null, nextStatement: null, colour: C.movement, inputsInline: true,
      tooltip: 'Ennyit gurul a robot, amíg a kerék egyszer körbefordul. 5,6 cm-es keréknél 17,5 cm.' },
    { type: 'spike_move_for', message0: 'move %1 for %2 %3',
      args0: [{ type: 'field_dropdown', name: 'DIR', options: [['↑', 'fwd'], ['↓', 'back']] }, num('N'),
        { type: 'field_dropdown', name: 'UNIT', options: UNITS }],
      previousStatement: null, nextStatement: null, colour: C.movement, inputsInline: true,
      tooltip: 'Menj előre (↑) vagy hátra (↓) ennyit. Figyelem: a „degrees” a KERÉK fordulását jelenti, nem a robotét!' },
    { type: 'spike_steer_for', message0: 'move %1 %2 for %3 %4',
      args0: [{ type: 'field_dropdown', name: 'SIDE', options: [['right:', 'right'], ['left:', 'left']] }, num('S'), num('N'),
        { type: 'field_dropdown', name: 'UNIT', options: UNITS }],
      previousStatement: null, nextStatement: null, colour: C.movement, inputsInline: true,
      tooltip: 'Kanyarodj! 100 = helyben fordul, 50 = a belső kerék áll. A „degrees” a KERÉK fordulása: 90 kerékfok kb. 45° robotfordulás.' },
    { type: 'spike_start_moving', message0: 'start moving %1',
      args0: [{ type: 'field_dropdown', name: 'DIR', options: [['↑', 'fwd'], ['↓', 'back']] }],
      previousStatement: null, nextStatement: null, colour: C.movement,
      tooltip: 'Indulj el, és menj, amíg egy „stop moving” blokk meg nem állít.' },
    { type: 'spike_start_steer', message0: 'start moving %1 %2',
      args0: [{ type: 'field_dropdown', name: 'SIDE', options: [['right:', 'right'], ['left:', 'left']] }, num('S')],
      previousStatement: null, nextStatement: null, colour: C.movement, inputsInline: true,
      tooltip: 'Indulj el kanyarodva, és menj, amíg meg nem állítják.' },
    { type: 'spike_stop_moving', message0: 'stop moving', previousStatement: null, nextStatement: null, colour: C.movement,
      tooltip: 'Állj meg!' },

    // motorok
    { type: 'spike_motor_run_for', message0: '%1 run %2 for %3 %4',
      args0: [{ type: 'field_dropdown', name: 'PORT', options: PORTS }, { type: 'field_dropdown', name: 'DIR', options: [['↻', 'cw'], ['↺', 'ccw']] }, num('N'),
        { type: 'field_dropdown', name: 'UNIT', options: MUNITS }],
      previousStatement: null, nextStatement: null, colour: C.motors, inputsInline: true,
      tooltip: 'Egyetlen motor forgatása (például később a kar vagy a fogó).' },
    { type: 'spike_motor_start', message0: '%1 start motor %2',
      args0: [{ type: 'field_dropdown', name: 'PORT', options: PORTS }, { type: 'field_dropdown', name: 'DIR', options: [['↻', 'cw'], ['↺', 'ccw']] }],
      previousStatement: null, nextStatement: null, colour: C.motors, tooltip: 'A motor elindul, és forog, amíg meg nem állítják.' },
    { type: 'spike_motor_stop', message0: '%1 stop motor', args0: [{ type: 'field_dropdown', name: 'PORT', options: PORTS }],
      previousStatement: null, nextStatement: null, colour: C.motors, tooltip: 'A motor megáll.' },
    { type: 'spike_motor_speed', message0: '%1 set speed to %2 %%', args0: [{ type: 'field_dropdown', name: 'PORT', options: PORTS }, num('N')],
      previousStatement: null, nextStatement: null, colour: C.motors, inputsInline: true, tooltip: 'Ennek a motornak a sebessége (0–100%).' },

    // fény
    { type: 'spike_write', message0: 'write %1', args0: [{ type: 'input_value', name: 'T' }],
      previousStatement: null, nextStatement: null, colour: C.light, inputsInline: true, tooltip: 'Írd ki a hub kijelzőjére, betűnként.' },
    { type: 'spike_image_for', message0: 'turn on %1 for %2 seconds', args0: [{ type: 'field_dropdown', name: 'IMG', options: IMAGES }, num('N')],
      previousStatement: null, nextStatement: null, colour: C.light, inputsInline: true, tooltip: 'Mutass egy képet a kijelzőn ennyi másodpercig.' },
    { type: 'spike_image', message0: 'turn on %1', args0: [{ type: 'field_dropdown', name: 'IMG', options: IMAGES }],
      previousStatement: null, nextStatement: null, colour: C.light, tooltip: 'Mutass egy képet a kijelzőn.' },
    { type: 'spike_pixels_off', message0: 'turn off pixels', previousStatement: null, nextStatement: null, colour: C.light, tooltip: 'Kapcsold ki a kijelzőt.' },
    { type: 'spike_center_light', message0: 'set Center Button light to %1', args0: [{ type: 'field_dropdown', name: 'COLOR', options: LIGHTS }],
      previousStatement: null, nextStatement: null, colour: C.light, tooltip: 'A hub középső gombjának színe. A házi WRO-ban: zöld = felvesz, kék = lerak.' },

    // hang
    { type: 'spike_beep', message0: 'play beep %1 for %2 seconds', args0: [num('NOTE'), num('N')],
      previousStatement: null, nextStatement: null, colour: C.sound, inputsInline: true, tooltip: 'Sípolj! Az első szám a hang magassága (60 = közepes dó, 72 = egy oktávval feljebb).' },

    // vezérlés
    { type: 'spike_wait', message0: 'wait %1 seconds', args0: [num('N')],
      previousStatement: null, nextStatement: null, colour: C.control, inputsInline: true, tooltip: 'Várj ennyi másodpercig. (Pythonban ezredmásodpercben kell megadni!)' },
    { type: 'spike_repeat', message0: 'repeat %1', args0: [num('N')], message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null, nextStatement: null, colour: C.control, inputsInline: true, tooltip: 'Ismételd ennyiszer a belsejében lévő blokkokat.' },
    { type: 'spike_forever', message0: 'forever', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null, colour: C.control, tooltip: 'Ismételd örökké (a szimulátor 3 perc után megállítja).' },
    { type: 'spike_wait_until', message0: 'wait until %1', args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      previousStatement: null, nextStatement: null, colour: C.control, inputsInline: true, tooltip: 'Várj, amíg a feltétel igaz nem lesz.' },
    { type: 'spike_if', message0: 'if %1 then', args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
      previousStatement: null, nextStatement: null, colour: C.control, tooltip: 'Ha a feltétel igaz, csináld meg a belsejét.' },
    { type: 'spike_if_else', message0: 'if %1 then', args0: [{ type: 'input_value', name: 'COND', check: 'Boolean' }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], message2: 'else %1', args2: [{ type: 'input_statement', name: 'ELSE' }],
      previousStatement: null, nextStatement: null, colour: C.control, tooltip: 'Ha a feltétel igaz, az elsőt csináld, különben a másodikat.' },

    // érzékelők
    { type: 'spike_color_is', message0: '%1 is color %2 ?', args0: [{ type: 'field_dropdown', name: 'PORT', options: [['C', 'C'], ...PORTS.filter((p) => p[0] !== 'C')] }, { type: 'field_dropdown', name: 'COLOR', options: COLORS }],
      output: 'Boolean', colour: C.sensors, tooltip: 'Igaz, ha a színszenzor ezt a színt látja.' },
    { type: 'spike_reflection', message0: '%1 reflection', args0: [{ type: 'field_dropdown', name: 'PORT', options: [['C', 'C'], ...PORTS.filter((p) => p[0] !== 'C')] }],
      output: 'Number', colour: C.sensors, tooltip: 'Mennyi fény verődik vissza (0 = fekete, 100 = fehér).' },
    { type: 'spike_distance', message0: '%1 distance in cm', args0: [{ type: 'field_dropdown', name: 'PORT', options: [['D', 'D'], ...PORTS.filter((p) => p[0] !== 'D')] }],
      output: 'Number', colour: C.sensors, tooltip: 'Milyen messze van a legközelebbi tárgy vagy fal (cm).' },
    { type: 'spike_closer', message0: '%1 is closer than %2 cm ?', args0: [{ type: 'field_dropdown', name: 'PORT', options: [['D', 'D'], ...PORTS.filter((p) => p[0] !== 'D')] }, num('N')],
      output: 'Boolean', colour: C.sensors, inputsInline: true, tooltip: 'Igaz, ha valami ennél közelebb van.' },
  ]);

  // ------------------------------------------------------------ kódgenerálás
  gen.STATEMENT_PREFIX = 'block(%1)\n';
  const v = (b, name, d) => gen.valueToCode(b, name, Order.NONE) || d;
  const q = (s) => JSON.stringify(s);
  const body = (b, name) => gen.statementToCode(b, name) || gen.INDENT + 'pass\n';
  const F = gen.forBlock;
  F.spike_start = () => '';
  F.spike_set_pair = (b) => { const [l, r] = b.getFieldValue('PAIR').split(','); return `set_pair(${q(l)}, ${q(r)})\n`; };
  F.spike_set_speed = (b) => `set_speed(${v(b, 'N', '50')})\n`;
  F.spike_set_rotation = (b) => `set_rotation(${v(b, 'N', '17.5')}, ${q(b.getFieldValue('UNIT'))})\n`;
  F.spike_move_for = (b) => `move_for(${q(b.getFieldValue('DIR'))}, ${v(b, 'N', '0')}, ${q(b.getFieldValue('UNIT'))})\n`;
  F.spike_steer_for = (b) => `steer_for(${q(b.getFieldValue('SIDE'))}, ${v(b, 'S', '0')}, ${v(b, 'N', '0')}, ${q(b.getFieldValue('UNIT'))})\n`;
  F.spike_start_moving = (b) => `start_moving(${q(b.getFieldValue('DIR'))})\n`;
  F.spike_start_steer = (b) => `start_steer(${q(b.getFieldValue('SIDE'))}, ${v(b, 'S', '0')})\n`;
  F.spike_stop_moving = () => 'stop_moving()\n';
  F.spike_motor_run_for = (b) => `motor_run_for(${q(b.getFieldValue('PORT'))}, ${q(b.getFieldValue('DIR'))}, ${v(b, 'N', '0')}, ${q(b.getFieldValue('UNIT'))})\n`;
  F.spike_motor_start = (b) => `motor_start(${q(b.getFieldValue('PORT'))}, ${q(b.getFieldValue('DIR'))})\n`;
  F.spike_motor_stop = (b) => `motor_stop(${q(b.getFieldValue('PORT'))})\n`;
  F.spike_motor_speed = (b) => `motor_set_speed(${q(b.getFieldValue('PORT'))}, ${v(b, 'N', '75')})\n`;
  F.spike_write = (b) => `write(${v(b, 'T', '""')})\n`;
  F.spike_image_for = (b) => `image(${q(b.getFieldValue('IMG'))}, ${v(b, 'N', '2')})\n`;
  F.spike_image = (b) => `image(${q(b.getFieldValue('IMG'))}, None)\n`;
  F.spike_pixels_off = () => 'pixels_off()\n';
  F.spike_center_light = (b) => `center_light(${q(b.getFieldValue('COLOR'))})\n`;
  F.spike_beep = (b) => `beep(${v(b, 'NOTE', '60')}, ${v(b, 'N', '0.2')})\n`;
  F.spike_wait = (b) => `wait(${v(b, 'N', '1')})\n`;
  F.spike_repeat = (b) => `for _ in range(int(${v(b, 'N', '10')})):\n${body(b, 'DO')}`;
  F.spike_forever = (b) => `while True:\n${body(b, 'DO')}`;
  F.spike_wait_until = (b) => `wait_until(lambda: ${v(b, 'COND', 'False')})\n`;
  F.spike_if = (b) => `if ${v(b, 'COND', 'False')}:\n${body(b, 'DO')}`;
  F.spike_if_else = (b) => `if ${v(b, 'COND', 'False')}:\n${body(b, 'DO')}else:\n${body(b, 'ELSE')}`;
  F.spike_color_is = (b) => [`color_is(${q(b.getFieldValue('PORT'))}, ${q(b.getFieldValue('COLOR'))})`, Order.FUNCTION_CALL];
  F.spike_reflection = (b) => [`reflection(${q(b.getFieldValue('PORT'))})`, Order.FUNCTION_CALL];
  F.spike_distance = (b) => [`distance_cm(${q(b.getFieldValue('PORT'))})`, Order.FUNCTION_CALL];
  F.spike_closer = (b) => [`closer_than(${q(b.getFieldValue('PORT'))}, ${v(b, 'N', '10')})`, Order.FUNCTION_CALL];

  // A program: csak a „when program starts” alatti blokkok futnak (mint a SPIKE Appban).
  // Visszaad: { code, warnings }
  function toPython(ws) {
    const warnings = [];
    gen.init(ws);
    const tops = ws.getTopBlocks(true);
    const starts = tops.filter((b) => b.type === 'spike_start' && b.isEnabled());
    if (starts.length === 0) warnings.push('Nincs „when program starts” blokk, ezért nem fut semmi. Húzd ki az Események közül, és tedd alá a blokkokat!');
    if (starts.length > 1) warnings.push('Több „when program starts” blokk van. A SPIKE App ezeket egyszerre futtatja, a szimulátor most csak az elsőt.');
    // a saját blokkok (My Blocks) definíciói
    tops.filter((b) => b.type === 'procedures_defnoreturn').forEach((b) => gen.blockToCode(b));
    let main = '';
    if (starts[0]) {
      const next = starts[0].getNextBlock();
      main = next ? gen.blockToCode(next) : '';
    }
    // megírt, de sehol nem használt saját blokk (a „kimondás” hiányzik)
    const used = new Set();
    const live = [];
    if (starts[0]) live.push(...starts[0].getDescendants(false));
    tops.filter((b) => b.type === 'procedures_defnoreturn').forEach((d) => live.push(...d.getDescendants(false)));
    live.filter((b) => b.type === 'procedures_callnoreturn' && b.isEnabled()).forEach((b) => used.add(b.getFieldValue('NAME')));
    tops.filter((b) => b.type === 'procedures_defnoreturn').forEach((d) => {
      const nm = d.getFieldValue('NAME');
      if (!used.has(nm)) warnings.push('Megcsináltad a(z) „' + nm + '” saját blokkot, de sehol nem használod, ezért nem fut le. Húzd ki a Saját blokkok közül a(z) „' + nm + '” blokkot, és tedd a „when program starts” alá!');
    });
    let code = gen.finish(main);
    code = 'from _spike_blocks import *\n' + code;
    return { code, warnings };
  }

  // ------------------------------------------------------------ eszköztár
  const sh = (n) => ({ shadow: { type: 'math_number', fields: { NUM: n } } });
  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      { kind: 'category', name: 'Események', colour: C.events, contents: [{ kind: 'block', type: 'spike_start' }] },
      { kind: 'category', name: 'Mozgás', colour: C.movement, contents: [
        { kind: 'block', type: 'spike_move_for', inputs: { N: sh(10) } },
        { kind: 'block', type: 'spike_steer_for', inputs: { S: sh(100), N: sh(90) }, fields: { UNIT: 'degrees' } },
        { kind: 'block', type: 'spike_start_moving' },
        { kind: 'block', type: 'spike_start_steer', inputs: { S: sh(30) } },
        { kind: 'block', type: 'spike_stop_moving' },
        { kind: 'block', type: 'spike_set_speed', inputs: { N: sh(50) } },
        { kind: 'block', type: 'spike_set_pair' },
        { kind: 'block', type: 'spike_set_rotation', inputs: { N: sh(17.5) } },
      ] },
      { kind: 'category', name: 'Motorok', colour: C.motors, contents: [
        { kind: 'block', type: 'spike_motor_run_for', inputs: { N: sh(1) }, fields: { PORT: 'E' } },
        { kind: 'block', type: 'spike_motor_start', fields: { PORT: 'E' } },
        { kind: 'block', type: 'spike_motor_stop', fields: { PORT: 'E' } },
        { kind: 'block', type: 'spike_motor_speed', inputs: { N: sh(75) }, fields: { PORT: 'E' } },
      ] },
      { kind: 'category', name: 'Fény', colour: C.light, contents: [
        { kind: 'block', type: 'spike_image_for', inputs: { N: sh(2) } },
        { kind: 'block', type: 'spike_image' },
        { kind: 'block', type: 'spike_write', inputs: { T: { shadow: { type: 'text', fields: { TEXT: 'Hello' } } } } },
        { kind: 'block', type: 'spike_pixels_off' },
        { kind: 'block', type: 'spike_center_light' },
      ] },
      { kind: 'category', name: 'Hang', colour: C.sound, contents: [
        { kind: 'block', type: 'spike_beep', inputs: { NOTE: sh(60), N: sh(0.2) } },
      ] },
      { kind: 'category', name: 'Vezérlés', colour: C.control, contents: [
        { kind: 'block', type: 'spike_wait', inputs: { N: sh(1) } },
        { kind: 'block', type: 'spike_repeat', inputs: { N: sh(10) } },
        { kind: 'block', type: 'spike_forever' },
        { kind: 'block', type: 'spike_if' },
        { kind: 'block', type: 'spike_if_else' },
        { kind: 'block', type: 'spike_wait_until' },
      ] },
      { kind: 'category', name: 'Érzékelők', colour: C.sensors, contents: [
        { kind: 'block', type: 'spike_color_is' },
        { kind: 'block', type: 'spike_reflection' },
        { kind: 'block', type: 'spike_distance' },
        { kind: 'block', type: 'spike_closer', inputs: { N: sh(15) } },
      ] },
      { kind: 'category', name: 'Műveletek', colour: C.operators, contents: [
        { kind: 'block', type: 'math_arithmetic', inputs: { A: sh(1), B: sh(1) } },
        { kind: 'block', type: 'logic_compare', inputs: { A: sh(0), B: sh(50) } },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negation' },
        { kind: 'block', type: 'math_number' },
      ] },
      { kind: 'category', name: 'Változók', colour: '#FF8C1A', custom: 'VARIABLE' },
      { kind: 'category', name: 'Saját blokkok', colour: '#FF6680', custom: 'PROCEDURE' },
    ],
  };

  // ------------------------------------------------------------ minták
  // Egyszerű segéd a blokksorozatok leírásához
  function B(type, fields, inputs, extra) { return Object.assign({ type }, fields ? { fields } : {}, inputs ? { inputs } : {}, extra || {}); }
  const n = (x) => ({ shadow: { type: 'math_number', fields: { NUM: x } } });
  function chain(list) {
    for (let i = list.length - 2; i >= 0; i--) list[i].next = { block: list[i + 1] };
    return list[0];
  }
  const setup = () => [
    B('spike_set_pair', { PAIR: 'A,B' }),
    B('spike_set_rotation', { UNIT: 'cm' }, { N: n(17.5) }),
    B('spike_set_speed', null, { N: n(50) }),
  ];
  function program(steps, extraTop) {
    const start = B('spike_start', null, null, { x: 30, y: 30 });
    start.next = { block: chain([...setup(), ...steps]) };
    return { blocks: { languageVersion: 0, blocks: [start, ...(extraTop || [])] } };
  }
  const define = (name, steps, x, y) => B('procedures_defnoreturn', { NAME: name }, null, { x, y, inputs: { STACK: { block: chain(steps) } } });
  const call = (name) => B('procedures_callnoreturn', null, null, { extraState: { name } });

  const fwd = (cm) => B('spike_move_for', { DIR: 'fwd', UNIT: 'cm' }, { N: n(cm) });
  const steer = (side, deg) => B('spike_steer_for', { SIDE: side, UNIT: 'degrees' }, { S: n(100), N: n(deg) });
  // 15 cm-es négyzet: 180 kerékfok = 90 fokos robotfordulás
  const negyzetDef = (x, y) => define('negyzet', [B('spike_repeat', null, { N: n(4), DO: { block: chain([fwd(15), steer('right', 180)]) } })], x, y);

  const SAMPLES = {
    k1: { label: 'Az első csipogás (1. küldetés)', ws: { blocks: { languageVersion: 0, blocks: [Object.assign(B('spike_start', null, null, { x: 30, y: 30 }), { next: { block: chain([
      B('spike_write', null, { T: { shadow: { type: 'text', fields: { TEXT: '3' } } } }),
      B('spike_wait', null, { N: n(1) }),
      B('spike_beep', null, { NOTE: n(72), N: n(0.2) }),
      B('spike_motor_run_for', { PORT: 'A', DIR: 'cw', UNIT: 'rotations' }, { N: n(1) }),
    ]) } })] } } },
    fwd: { label: 'Előre 20 cm (1. feladat)', ws: program([B('spike_move_for', { DIR: 'fwd', UNIT: 'cm' }, { N: n(20) })]) },
    turn: { label: 'Fordulás 90 fokkal – a nagy felfedezés', ws: program([B('spike_steer_for', { SIDE: 'right', UNIT: 'degrees' }, { S: n(100), N: n(90) })]) },
    square: { label: 'Bűvös négyzet blokkal', ws: program([
      B('spike_repeat', null, { N: n(4), DO: { block: chain([
        B('spike_move_for', { DIR: 'fwd', UNIT: 'cm' }, { N: n(20) }),
        B('spike_steer_for', { SIDE: 'right', UNIT: 'degrees' }, { S: n(100), N: n(180) }),
      ]) } }),
    ]) },
    k5: { label: 'A robot új szót tanul: négyzet (5. küldetés)', ws: program([call('negyzet')], [negyzetDef(420, 30)]) },
    k6: { label: 'Dobogó – kezdés (6. küldetés)', ws: program([call('negyzet')], [negyzetDef(420, 30)]) },
    k7: { label: 'Ébred a farm – kézzel (7. küldetés)', ws: program([
      steer('right', 15.2), fwd(25.8),
      B('spike_center_light', { COLOR: 'GREEN' }), B('spike_beep', null, { NOTE: n(72), N: n(0.2) }), B('spike_wait', null, { N: n(1) }),
      steer('right', 34.6), fwd(37),
      B('spike_center_light', { COLOR: 'BLUE' }), B('spike_beep', null, { NOTE: n(60), N: n(0.2) }), B('spike_wait', null, { N: n(1) }),
    ]) },
    dobogo: { label: '🔑 TANÁRI: dobogó – teljes megoldás', teacher: true, ws: program([
      call('negyzet'), call('jobbra_lep'), call('negyzet'), call('jobbra_lep'), call('negyzet'),
      fwd(15), steer('left', 180), fwd(22.5), steer('right', 180),
      call('negyzet'), call('jobbra_lep'), call('negyzet'),
      fwd(15), steer('left', 180), fwd(7.5), steer('right', 180),
      call('negyzet'),
    ], [negyzetDef(420, 30), define('jobbra_lep', [steer('right', 180), fwd(15), steer('left', 180)], 420, 260)]) },
    wro: { label: '🔑 TANÁRI: farm – felvesz és lerak saját blokkal', teacher: true, ws: program([
      steer('right', 15.2), fwd(25.8), call('felvesz'),
      steer('right', 34.6), fwd(37), call('lerak'),
    ], [
      define('felvesz', [B('spike_center_light', { COLOR: 'GREEN' }), B('spike_beep', null, { NOTE: n(72), N: n(0.2) }), B('spike_wait', null, { N: n(1) })], 420, 30),
      define('lerak', [B('spike_center_light', { COLOR: 'BLUE' }), B('spike_beep', null, { NOTE: n(60), N: n(0.2) }), B('spike_wait', null, { N: n(1) })], 420, 230),
    ]) },
  };

  root.KodfejtoBlocks = { toolbox, toPython, SAMPLES };
})(typeof self !== 'undefined' ? self : this);
