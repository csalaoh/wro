# A pybricks_shim.py-ból pybricks_shim.js-t készít (a weboldal így tölti be).
# Futtasd minden módosítás után:  python3 build_shim.py
import json, pathlib
here = pathlib.Path(__file__).parent
src = (here / "pybricks_shim.py").read_text(encoding="utf-8")
(here / "pybricks_shim.js").write_text(
    "// GENERÁLT FÁJL – ne szerkeszd! Forrás: pybricks_shim.py (build_shim.py)\nwindow.PYBRICKS_SHIM = " + json.dumps(src, ensure_ascii=False) + ";\n",
    encoding="utf-8")
print("pybricks_shim.js kész")
