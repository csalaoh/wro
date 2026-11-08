# Kódfejtő Műhely – virtuális pálya
# Ál-pybricks csomag: ugyanazok a nevek és paraméterek, mint a valódi
# Pybricks-ben, de a parancsokat a szimulátor (_sim) hajtja végre.
#
# Csak azt valósítjuk meg, amit a foglalkozásokon használunk. Ami még nincs
# kész, az érthető magyar hibaüzenetet ad, nem csendben rossz eredményt.

import sys
import types
import _sim

_pkg = types.ModuleType("pybricks")
_pkg.__path__ = []
sys.modules["pybricks"] = _pkg


def _module(name):
    m = types.ModuleType("pybricks." + name)
    sys.modules["pybricks." + name] = m
    setattr(_pkg, name, m)
    return m


def _not_yet(what):
    raise NotImplementedError(
        what + " a virtuális pályán még nem működik (a valódi robotban igen)."
    )


# ---------------------------------------------------------------- parameters
parameters = _module("parameters")


class _Const:
    def __init__(self, group, name):
        self._group = group
        self.name = name

    def __repr__(self):
        return self._group + "." + self.name


class Port:
    pass


for _p in "ABCDEF":
    setattr(Port, _p, _Const("Port", _p))


class Direction:
    CLOCKWISE = _Const("Direction", "CLOCKWISE")
    COUNTERCLOCKWISE = _Const("Direction", "COUNTERCLOCKWISE")


class Stop:
    COAST = _Const("Stop", "COAST")
    COAST_SMART = _Const("Stop", "COAST_SMART")
    BRAKE = _Const("Stop", "BRAKE")
    HOLD = _Const("Stop", "HOLD")
    NONE = _Const("Stop", "NONE")


class _Color:
    def __init__(self, name, h, s, v):
        self.name, self.h, self.s, self.v = name, h, s, v

    def __repr__(self):
        return "Color." + self.name

    def __eq__(self, other):
        return isinstance(other, _Color) and self.name == other.name

    def __hash__(self):
        return hash(self.name)


class Color:
    NONE = _Color("NONE", 0, 0, 0)
    BLACK = _Color("BLACK", 0, 0, 10)
    GRAY = _Color("GRAY", 0, 0, 50)
    WHITE = _Color("WHITE", 0, 0, 100)
    RED = _Color("RED", 0, 100, 100)
    ORANGE = _Color("ORANGE", 30, 100, 100)
    BROWN = _Color("BROWN", 30, 100, 50)
    YELLOW = _Color("YELLOW", 60, 100, 100)
    GREEN = _Color("GREEN", 120, 100, 100)
    CYAN = _Color("CYAN", 180, 100, 100)
    BLUE = _Color("BLUE", 240, 100, 100)
    VIOLET = _Color("VIOLET", 270, 100, 100)
    MAGENTA = _Color("MAGENTA", 300, 100, 100)


class Button:
    LEFT = _Const("Button", "LEFT")
    RIGHT = _Const("Button", "RIGHT")
    CENTER = _Const("Button", "CENTER")
    BLUETOOTH = _Const("Button", "BLUETOOTH")


class Side:
    TOP = _Const("Side", "TOP")
    BOTTOM = _Const("Side", "BOTTOM")
    FRONT = _Const("Side", "FRONT")
    BACK = _Const("Side", "BACK")
    LEFT = _Const("Side", "LEFT")
    RIGHT = _Const("Side", "RIGHT")


def _img(*rows):
    # 5×5-ös kép soronként, "#" = világít (100), "." = sötét
    return tuple(tuple(100 if ch == "#" else 0 for ch in row) for row in rows)


_UP = _img("..#..", ".###.", "#.#.#", "..#..", "..#..")
_RIGHT = _img("..#..", "...#.", "#####", "...#.", "..#..")


class Icon:
    HAPPY = _img(".....", ".#.#.", ".....", "#...#", ".###.")
    SAD = _img(".....", ".#.#.", ".....", ".###.", "#...#")
    HEART = _img(".#.#.", "#####", "#####", ".###.", "..#..")
    UP = _UP
    DOWN = tuple(reversed(_UP))
    RIGHT = _RIGHT
    LEFT = tuple(tuple(reversed(r)) for r in _RIGHT)
    FULL = _img("#####", "#####", "#####", "#####", "#####")
    EMPTY = _img(".....", ".....", ".....", ".....", ".....")
    ARROW_UP = UP
    ARROW_DOWN = DOWN
    ARROW_LEFT = LEFT
    ARROW_RIGHT = RIGHT


for _n in ("Port", "Direction", "Stop", "Color", "Button", "Side", "Icon"):
    setattr(parameters, _n, globals()[_n])


# --------------------------------------------------------------------- tools
tools = _module("tools")


def wait(time):
    if time is None or time < 0:
        time = 0
    _sim.wait(float(time))


class StopWatch:
    def __init__(self):
        self._start = _sim.now()
        self._paused_at = None
        self._offset = 0

    def time(self):
        now = self._paused_at if self._paused_at is not None else _sim.now()
        return int(now - self._start - self._offset)

    def pause(self):
        if self._paused_at is None:
            self._paused_at = _sim.now()

    def resume(self):
        if self._paused_at is not None:
            self._offset += _sim.now() - self._paused_at
            self._paused_at = None

    def reset(self):
        self._start = _sim.now()
        self._offset = 0
        if self._paused_at is not None:
            self._paused_at = self._start


tools.wait = wait
tools.StopWatch = StopWatch


# ---------------------------------------------------------------------- hubs
hubs = _module("hubs")


class _Display:
    def text(self, text, on=500, off=50):
        _sim.display_text(str(text), float(on), float(off))

    def char(self, char):
        _sim.display_char(str(char)[:1])

    def number(self, number):
        _sim.display_number(str(number))

    def icon(self, icon):
        _sim.display_icon([list(row) for row in icon])

    def pixel(self, row, column, brightness=100):
        _sim.display_pixel(int(row), int(column), float(brightness))

    def off(self):
        _sim.display_off()

    def orientation(self, up):
        pass


class _Light:
    def on(self, color):
        name = color.name if isinstance(color, _Color) else "WHITE"
        _sim.light(name)

    def off(self):
        _sim.light("NONE")

    def blink(self, color, durations):
        self.on(color)


class _Speaker:
    def beep(self, frequency=500, duration=100):
        _sim.beep(float(frequency), float(duration))

    def volume(self, volume=None):
        return 100

    def play_notes(self, notes, tempo=120):
        _not_yet("A speaker.play_notes")


class _IMU:
    def ready(self):
        return bool(_sim.imu_ready())

    def heading(self):
        return float(_sim.imu_heading())

    def reset_heading(self, angle=0):
        _sim.imu_reset_heading(float(angle))

    def angular_velocity(self, axis=None):
        w = float(_sim.imu_turn_rate())
        if axis is None:
            return (0.0, 0.0, -w)
        return -w

    def tilt(self):
        return (0, 0)

    def stationary(self):
        return abs(_sim.imu_turn_rate()) < 1


class _Buttons:
    def pressed(self):
        return set()


class _Battery:
    def voltage(self):
        return 8200

    def current(self):
        return 150


class PrimeHub:
    def __init__(self, top_side=None, front_side=None):
        self.display = _Display()
        self.light = _Light()
        self.speaker = _Speaker()
        self.imu = _IMU()
        self.buttons = _Buttons()
        self.battery = _Battery()


hubs.PrimeHub = PrimeHub
hubs.InventorHub = PrimeHub


# ---------------------------------------------------------------- pupdevices
pupdevices = _module("pupdevices")


def _check_port(port, kind, cls):
    if not isinstance(port, _Const) or port._group != "Port":
        raise TypeError(cls + "() első adata egy port legyen, például Port.A")
    found = _sim.device(port.name)
    if found != kind:
        raise OSError(19, "ENODEV: a " + repr(port) + " porton nincs " + cls)
    return port.name


def _dir(positive_direction):
    if positive_direction is Direction.COUNTERCLOCKWISE:
        return -1
    if positive_direction is Direction.CLOCKWISE:
        return 1
    raise TypeError("A forgásirány Direction.CLOCKWISE vagy Direction.COUNTERCLOCKWISE lehet")


class Motor:
    def __init__(self, port, positive_direction=Direction.CLOCKWISE, gears=None, reset_angle=True, profile=None):
        self._port = _check_port(port, "motor", "motor")
        self._dir = _dir(positive_direction)
        self._zero = 0.0
        if reset_angle:
            self._zero = _sim.motor_angle(self._port, self._dir)

    def angle(self):
        return int(round(_sim.motor_angle(self._port, self._dir) - self._zero))

    def reset_angle(self, angle=None):
        if angle is None:
            angle = 0
        self._zero = _sim.motor_angle(self._port, self._dir) - angle

    def speed(self):
        return int(round(_sim.motor_speed(self._port, self._dir)))

    def run(self, speed):
        _sim.motor_run(self._port, self._dir, float(speed))

    def dc(self, duty):
        _sim.motor_run(self._port, self._dir, float(duty) * 10)

    def stop(self):
        _sim.motor_run(self._port, self._dir, 0.0)

    brake = stop
    hold = stop

    def run_angle(self, speed, rotation_angle, then=Stop.HOLD, wait=True):
        _sim.motor_run_angle(self._port, self._dir, float(speed), float(rotation_angle))

    def run_target(self, speed, target_angle, then=Stop.HOLD, wait=True):
        self.run_angle(abs(speed), target_angle - self.angle(), then, wait)

    def run_time(self, speed, time, then=Stop.HOLD, wait=True):
        _sim.motor_run(self._port, self._dir, float(speed))
        _sim.wait(float(time))
        _sim.motor_run(self._port, self._dir, 0.0)

    def run_until_stalled(self, speed, then=Stop.COAST, duty_limit=None):
        _not_yet("A run_until_stalled")

    def done(self):
        return True

    def stalled(self):
        return bool(_sim.stalled())


class ColorSensor:
    def __init__(self, port):
        self._port = _check_port(port, "color", "színszenzor")
        self.lights = _Light()

    def reflection(self):
        return int(_sim.color_reflection())

    def ambient(self):
        return int(_sim.color_reflection() * 0.3)

    def color(self, surface=True):
        return getattr(Color, _sim.color_name())

    def hsv(self, surface=True):
        h, s, v = _sim.color_hsv()
        return _Color("HSV", int(h), int(s), int(v))

    def detectable_colors(self, colors=None):
        pass


class UltrasonicSensor:
    def __init__(self, port):
        self._port = _check_port(port, "ultrasonic", "távolságérzékelő")
        self.lights = types.SimpleNamespace(on=lambda *a: None, off=lambda: None)

    def distance(self):
        return int(_sim.distance())

    def presence(self):
        return False


class ForceSensor:
    def __init__(self, port):
        _check_port(port, "force", "erőmérő")


pupdevices.Motor = Motor
pupdevices.ColorSensor = ColorSensor
pupdevices.UltrasonicSensor = UltrasonicSensor
pupdevices.ForceSensor = ForceSensor


# ------------------------------------------------------------------ robotics
robotics = _module("robotics")


class DriveBase:
    def __init__(self, left_motor, right_motor, wheel_diameter, axle_track):
        if not isinstance(left_motor, Motor) or not isinstance(right_motor, Motor):
            raise TypeError("A DriveBase két motort vár: DriveBase(bal, jobb, kerékátmérő, tengelytáv)")
        if wheel_diameter <= 0 or axle_track <= 0:
            raise ValueError("A kerékátmérő és a tengelytáv pozitív szám legyen (mm)")
        self._l = left_motor
        self._r = right_motor
        self._wd = float(wheel_diameter)
        self._at = float(axle_track)
        self._gyro = False
        self._base = _sim.drivebase_new(
            left_motor._port, left_motor._dir, right_motor._port, right_motor._dir, self._wd, self._at
        )
        speed, acc, rate, racc = _sim.drivebase_defaults(self._base)
        self._s = [float(speed), float(acc), float(rate), float(racc)]
        self.reset()

    # beállítások
    def settings(self, straight_speed=None, straight_acceleration=None, turn_rate=None, turn_acceleration=None):
        if straight_speed is None and straight_acceleration is None and turn_rate is None and turn_acceleration is None:
            return tuple(int(v) for v in self._s)
        for i, v in enumerate((straight_speed, straight_acceleration, turn_rate, turn_acceleration)):
            if v is not None:
                self._s[i] = abs(float(v))

    def use_gyro(self, use_gyro):
        self._gyro = bool(use_gyro)
        _sim.drivebase_gyro(self._base, self._gyro)
        self.stop()

    # mozgás
    def straight(self, distance, then=Stop.HOLD, wait=True):
        _sim.drivebase_move(self._base, "straight", float(distance), self._s[0], self._s[1])

    def turn(self, angle, then=Stop.HOLD, wait=True):
        _sim.drivebase_move(self._base, "turn", float(angle), self._s[2], self._s[3])

    def drive(self, speed, turn_rate):
        _sim.drivebase_drive(self._base, float(speed), float(turn_rate))

    def stop(self):
        _sim.drivebase_drive(self._base, 0.0, 0.0)

    brake = stop

    def curve(self, radius, angle, then=Stop.HOLD, wait=True):
        _not_yet("A curve")

    def arc(self, radius, angle=None, distance=None, then=Stop.HOLD, wait=True):
        _not_yet("Az arc")

    # mért értékek
    def distance(self):
        return int(round(_sim.drivebase_distance(self._base)))

    def angle(self):
        return int(round(_sim.drivebase_angle(self._base)))

    def state(self):
        return (self.distance(), 0, self.angle(), 0)

    def reset(self, distance=0, angle=0):
        _sim.drivebase_reset(self._base, float(distance), float(angle))

    def done(self):
        return True

    def stalled(self):
        return bool(_sim.stalled())


robotics.DriveBase = DriveBase
robotics.GyroDriveBase = DriveBase


# ---------------------------------------------------------------- a futtató

def _lint_user_program(source):
    """Gyerekbarát figyelmeztetések a saját parancsokhoz (def).

    - megírt, de sehol ki nem mondott (nem hívott) parancs
    - zárójel nélküli "hívás": negyzet  helyett  negyzet()
    Visszaad: [[sor, üzenet], ...]
    """
    import ast
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []
    defs = {}
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            defs.setdefault(node.name, node.lineno)
    if not defs:
        return []
    called = set()
    bare = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            called.add(node.func.id)
        if (isinstance(node, ast.Expr) and isinstance(node.value, ast.Name)
                and node.value.id in defs):
            bare.append([node.lineno, node.value.id])
    out = []
    for line, name in bare:
        out.append([line, "%d. sor: kimaradt a zárójel! Így a robot csak gondol a(z) %s szóra, "
                          "de nem csinálja meg. Helyesen: %s()" % (line, name, name)])
    for name, line in defs.items():
        if name not in called and not any(b[1] == name for b in bare):
            out.append([line, "Megtanítottad a robotnak a(z) %s szót (%d. sor), de sehol nem mondtad ki, "
                              "ezért nem csinálja meg. Írd le valahol a def rész ALATT: %s()" % (name, line, name)])
    return out

def _run_user_program(source, line_limit):
    import traceback

    counter = [0]

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "main.py":
            return None

        def local(frame, event, arg):
            if event == "line":
                counter[0] += 1
                if counter[0] > line_limit:
                    raise RuntimeError(
                        "A program túl sokáig fut várakozás nélkül. "
                        "Van egy ciklus, amiben nincs wait() vagy mozgás?"
                    )
            return local

        return local

    glb = {"__name__": "__main__"}
    try:
        code = compile(source, "main.py", "exec")
    except SyntaxError as e:
        line = e.lineno or 0
        return "Traceback (most recent call last):\n  File \"main.py\", line %d\n%s: %s" % (
            line, type(e).__name__, e.msg), line
    sys.settrace(tracer)
    try:
        exec(code, glb)
    except BaseException as e:  # noqa: B902 – minden hibát a konzolra írunk
        sys.settrace(None)
        if type(e).__name__ == "JsException" and "SIM_TIMEOUT" in str(e):
            return "TIMEOUT", 0
        frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == "main.py"]
        lines = ["Traceback (most recent call last):"]
        for f in frames:
            lines.append('  File "main.py", line %d, in %s' % (f.lineno, f.name))
        msg = str(e)
        lines.append(type(e).__name__ + (": " + msg if msg else ""))
        return "\n".join(lines), (frames[-1].lineno if frames else 0)
    finally:
        sys.settrace(None)
    return None, 0


# ------------------------------------------------- SPIKE App szóblokkok
# A blokkos programból a felület Python-kódot készít, ami ezeket a
# függvényeket hívja. A viselkedés a SPIKE App 3 (LEGO firmware) szerinti:
# például a "move ... for 90 degrees" a KERÉK elfordulását jelenti.
_spike = types.ModuleType("_spike_blocks")
sys.modules["_spike_blocks"] = _spike

_S = {"pair": ("A", "B"), "speed": 50.0, "rot_mm": 175.0, "mspeed": {}}
_MAX = 1000.0  # 100% = a motor legnagyobb sebessége (fok/s), kalibrálandó


def _sb_check_motor(port):
    if _sim.device(port) != "motor":
        raise OSError(19, "ENODEV: a " + port + " porton nincs motor")


def _sb_block(bid):
    _sim.block(bid)


def _sb_set_pair(left, right):
    _S["pair"] = (left, right)


def _sb_set_speed(p):
    _S["speed"] = max(-100.0, min(100.0, float(p)))


def _sb_set_rotation(value, unit):
    v = float(value) * (25.4 if unit == "in" else 10.0)
    if v <= 0:
        raise ValueError("Az 1 motorfordulat hossza pozitív szám legyen")
    _S["rot_mm"] = v


def _sb_wheel_deg(amount, unit):
    a = float(amount)
    if unit == "cm":
        return a * 10.0 / _S["rot_mm"] * 360.0
    if unit == "in":
        return a * 25.4 / _S["rot_mm"] * 360.0
    if unit == "rotations":
        return a * 360.0
    return a  # degrees


def _sb_wheels(steer):
    # A kormányzás (steer) -100..100: 0 = egyenesen, 50 = a belső kerék áll,
    # 100 = a kerekek ellentétesen forognak (helyben fordulás).
    s = max(-100.0, min(100.0, float(steer)))
    inner = 1.0 - 2.0 * abs(s) / 100.0
    if s >= 0:
        return 1.0, inner   # jobbra: a bal kerék a külső
    return inner, 1.0


def _sb_move(steer, direction, amount, unit):
    left, right = _S["pair"]
    _sb_check_motor(left)
    _sb_check_motor(right)
    fl, fr = _sb_wheels(steer)
    sign = -1.0 if direction == "back" else 1.0
    v = _S["speed"] / 100.0 * _MAX * sign
    if unit == "seconds":
        _sim.tank_time(left, right, v * fl, v * fr, float(amount) * 1000.0)
        return
    deg = _sb_wheel_deg(amount, unit) * sign
    if float(amount) < 0:
        v = -v
    _sim.tank_move(left, right, deg * fl, deg * fr, abs(v))


def _sb_move_for(direction, amount, unit):
    _sb_move(0, direction, amount, unit)


def _sb_steer_for(side, steer, amount, unit):
    s = float(steer) if side == "right" else -float(steer)
    _sb_move(s, "fwd", amount, unit)


def _sb_start_moving(direction):
    _sb_start_steer("right", 0, direction)


def _sb_start_steer(side, steer, direction="fwd"):
    left, right = _S["pair"]
    _sb_check_motor(left)
    _sb_check_motor(right)
    s = float(steer) if side == "right" else -float(steer)
    fl, fr = _sb_wheels(s)
    v = _S["speed"] / 100.0 * _MAX * (-1.0 if direction == "back" else 1.0)
    _sim.tank_run(left, right, v * fl, v * fr)


def _sb_stop_moving():
    left, right = _S["pair"]
    _sim.tank_run(left, right, 0.0, 0.0)


def _sb_motor_set_speed(port, p):
    _S["mspeed"][port] = max(-100.0, min(100.0, float(p)))


def _sb_motor_run_for(port, direction, amount, unit):
    _sb_check_motor(port)
    sp = _S["mspeed"].get(port, 75.0) / 100.0 * _MAX
    d = 1 if direction == "cw" else -1
    if unit == "seconds":
        _sim.motor_run(port, d, sp)
        _sim.wait(float(amount) * 1000.0)
        _sim.motor_run(port, d, 0.0)
        return
    deg = float(amount) * (360.0 if unit == "rotations" else 1.0)
    _sim.motor_run_angle(port, d, sp, deg)


def _sb_motor_start(port, direction):
    _sb_check_motor(port)
    sp = _S["mspeed"].get(port, 75.0) / 100.0 * _MAX
    _sim.motor_run(port, 1 if direction == "cw" else -1, sp)


def _sb_motor_stop(port):
    _sb_check_motor(port)
    _sim.motor_run(port, 1, 0.0)


def _sb_write(text):
    _sim.display_text(str(text), 500.0, 50.0)


def _sb_image(name, secs):
    _sim.display_icon([list(r) for r in getattr(Icon, name)])
    if secs is not None:
        _sim.wait(float(secs) * 1000.0)
        _sim.display_off()


def _sb_pixels_off():
    _sim.display_off()


def _sb_center_light(color):
    _sim.light(color)


def _sb_beep(note, secs):
    freq = 440.0 * 2 ** ((float(note) - 69.0) / 12.0)
    _sim.beep(freq, float(secs) * 1000.0)


def _sb_wait(secs):
    _sim.wait(max(0.0, float(secs)) * 1000.0)


def _sb_wait_until(cond):
    # cond: paraméter nélküli függvény; 10 ms-onként ellenőrizzük
    while not cond():
        _sim.wait(10.0)


def _sb_color_is(port, color):
    if _sim.device(port) != "color":
        raise OSError(19, "ENODEV: a " + port + " porton nincs színszenzor")
    return _sim.color_name() == color


def _sb_reflection(port):
    if _sim.device(port) != "color":
        raise OSError(19, "ENODEV: a " + port + " porton nincs színszenzor")
    return int(_sim.color_reflection())


def _sb_distance_cm(port):
    if _sim.device(port) != "ultrasonic":
        raise OSError(19, "ENODEV: a " + port + " porton nincs távolságérzékelő")
    d = int(_sim.distance())
    return 200 if d >= 2000 else round(d / 10.0, 1)


def _sb_closer_than(port, cm):
    return _sb_distance_cm(port) < float(cm)


for _n, _f in list(globals().items()):
    if _n.startswith("_sb_"):
        setattr(_spike, _n[4:], _f)
