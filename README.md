# Kódfejtő Műhely

A Diákszempont robotika tehetséggondozó foglalkozásának weboldala.
Főoldal, küldetések és a **virtuális pálya** (`palya/`): böngészőben futó
SPIKE Prime szimulátor Pybricks Pythonhoz és SPIKE App blokkokhoz.

## Közzététel GitHub Pages-en

1. Hozz létre egy új, nyilvános tárhelyet a GitHub-fiókodban, például `kodfejto-muhely` néven.
2. Töltsd fel ennek a mappának a teljes tartalmát (Add file → Upload files).
3. Settings → Pages → Source: *Deploy from a branch*, Branch: `main`, mappa: `/ (root)` → Save.
4. Pár perc múlva az oldal elérhető: `https://<felhasználónév>.github.io/kodfejto-muhely/`

## Fájlok

| Fájl | Mi ez |
| --- | --- |
| `index.html` | főoldal: küldetés-térkép, jelvények, kabala |
| `kuldetesek.html` | a küldetések (órák) oldala |
| `szotar.html`, `assets/dictionary.js` | a Kódszótár (új parancs: a dictionary.js-be) |
| `jatekok.html`, `assets/games.js` | játékok: Légy te a robot!, Fok-tippelő, Hibavadász, Rakd sorba! |
| `wro.html` | a WRO bemutatása gyerekeknek, a házi WRO és az út a versenyig |
| `sugo.html`, `assets/sugo/` | részletes használati útmutató képekkel (otthoni gyakorláshoz) |
| `belepes.html` | diákbelépés: csapat → kódnév → 3 képes kép-kód (csak felhős módban) |
| `tanar.html` | tanári felület: ki hol tart, diákok, feloldások, mentés |
| `assets/config.js` | a Supabase címe és nyilvános kulcsa; üresen = helyi mód |
| `assets/cloud.js` | a Supabase-kapcsolat (diák és tanár) |
| `supabase/schema.sql`, `supabase/TELEPITES.md` | az adatbázis és a bekapcsolás lépései |
| `.github/workflows/ebreszto.yml` | napi „ébresztő”, hogy az ingyenes Supabase ne aludjon el |
| `assets/common.css`, `assets/common.js` | közös stílus, csapat, avatár, jelvények |
| `assets/lessons.js` | a küldetések szövege és programjai (ezt szerkeszd, ha új óra jön) |
| `assets/practice.js` | a gyakorló feladatok (Pálya1, 10,10-es rajt): célpontok és sorrend |
| `palya/index.html` | a szimulátor oldala |
| `palya/sim.js` | szimulációs mag: robotmodell, mozgás, falak, szenzorok |
| `palya/runtime.js` | a Python és a szimulátor összekötése, idővonal |
| `palya/pybricks_shim.py` | az ál-pybricks csomag (ezt szerkeszd) |
| `palya/pybricks_shim.js` | a fenti generált változata – módosítás után: `python3 palya/build_shim.py` |
| `palya/ui.js` | a felület: szerkesztő, pályarajz, lejátszó, hub, konzol, mérőeszközök |
| `palya/blocks.js` | a blokkos mód (SPIKE App szóblokkok) |
| `palya/judge.js` | a házi WRO bíró (Ébred a farm): felvesz/lerak, pontozólap |
| `palya/palya1.png`, `palya2.png`, `rajzlap.png` | a pályák képe, 1 képpont = 1 mm |

## A robot méretei

A `palya/sim.js` elején a `ROBOT_DEFAULT` tartalmazza. Az 1. verzióban ezek
BECSÜLT értékek; a valódi Driving Base 2 lemérése után itt kell átírni őket.

Portkiosztás (iskolai szabvány): A = bal motor, B = jobb motor,
C = színszenzor, D = távolságérzékelő, E–F = szabad.

## Tanári mód

A `palya/index.html?tanar` címmel megnyitva a mintalistában megjelennek a 🔑 TANÁRI minták (dobogó teljes megoldás, farm saját parancsokkal). A böngésző megjegyzi; kikapcsolás: `palya/index.html?tanar=0`.

A dobogó négyzetének oldala: `palya/ui.js`, `PODIUM_SIDE` (mm) – a mintakódokban a 150-et is át kell írni.
