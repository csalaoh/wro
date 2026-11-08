# Kódfejtő Műhely

A Diákszempont robotika tehetséggondozó foglalkozásának weboldala.
Ebben a verzióban: a **virtuális pálya** (`palya/`), egy böngészőben futó
SPIKE Prime szimulátor Pybricks Pythonhoz.

## Közzététel GitHub Pages-en

1. Hozz létre egy új, nyilvános tárhelyet a GitHub-fiókodban, például `kodfejto-muhely` néven.
2. Töltsd fel ennek a mappának a teljes tartalmát (Add file → Upload files).
3. Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, mappa: `/ (root)` → Save.
4. Pár perc múlva az oldal elérhető: `https://<felhasználónév>.github.io/kodfejto-muhely/`

## Fájlok

| Fájl | Mi ez |
| --- | --- |
| `palya/index.html` | a szimulátor oldala |
| `palya/sim.js` | szimulációs mag: robotmodell, mozgás, falak, szenzorok |
| `palya/runtime.js` | a Python és a szimulátor összekötése, idővonal |
| `palya/pybricks_shim.py` | az ál-pybricks csomag (ezt szerkeszd) |
| `palya/pybricks_shim.js` | a fenti generált változata – módosítás után: `python3 palya/build_shim.py` |
| `palya/ui.js` | a felület: szerkesztő, pályarajz, lejátszó, hub, konzol |
| `palya/palya1.png`, `palya2.png` | a pályák képe, 1 képpont = 1 mm |

## A robot méretei

A `palya/sim.js` elején a `ROBOT_DEFAULT` tartalmazza. Az 1. verzióban ezek
BECSÜLT értékek; a valódi Driving Base 2 lemérése után itt kell átírni őket.

Portkiosztás (iskolai szabvány): A = bal motor, B = jobb motor,
C = színszenzor, D = távolságérzékelő, E–F = szabad.
