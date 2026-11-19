/*
 * Kódfejtő Műhely – virtuális pálya, a pályaelemek világa
 *
 * Mozgatható és rögzített pályaelemek (kockák, ládák, sziklák, akadályok),
 * a robot karjai (tolólap, fogó, emelőkar az E porton) és az akciózónák
 * (olyan szerkezetek, amelyek egy mozdulatra működésbe lépnek: kar lecsap,
 * kapcsoló, adagoló).
 *
 * Felülnézeti 2D modell. A robot „kvázi-statikusan” tol: az elem pontosan
 * annyit mozdul, amennyit a robot belenyomja, tehetetlenség nincs (a valódi
 * pályán a súrlódás miatt a LEGO-elemek sem csúsznak tovább). Ha az elemet
 * nem lehet tovább tolni (fal, rögzített elem), a robot elakad.
 *
 * Egységek, koordináták: ugyanaz, mint a sim.js-ben. Egy elem szöge (a)
 * fokban, az óramutató járásával nő, mint a robot iránya.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KodfejtoWorld = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const rad = (d) => d * Math.PI / 180;
  const deg = (r) => r * 180 / Math.PI;

  // ---- geometria ---------------------------------------------------------
  // Helyi pont (lx jobbra, ly „előre”) → pálya, a heading-konvencióval.
  function toWorld(cx, cy, a, lx, ly) {
    const c = Math.cos(rad(a)), s = Math.sin(rad(a));
    return [cx + lx * c + ly * s, cy - lx * s + ly * c];
  }
  function rectPoly(cx, cy, w, h, a) {
    return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => toWorld(cx, cy, a, x, y));
  }
  function circlePoly(cx, cy, r) {
    const out = [];
    for (let i = 0; i < 12; i++) out.push([cx + r * Math.cos(i * Math.PI / 6), cy + r * Math.sin(i * Math.PI / 6)]);
    return out;
  }
  // robot-helyi téglalap (előre f0..f1, oldalra s0..s1; jobbra pozitív)
  function robotRect(pose, f0, f1, s0, s1) {
    const h = rad(pose.heading), fx = Math.sin(h), fy = Math.cos(h), sx = Math.cos(h), sy = -Math.sin(h);
    return [[f0, s0], [f1, s0], [f1, s1], [f0, s1]].map(([f, s]) => [pose.x + fx * f + sx * s, pose.y + fy * f + sy * s]);
  }
  function centroid(p) { let x = 0, y = 0; p.forEach((q) => { x += q[0]; y += q[1]; }); return [x / p.length, y / p.length]; }
  function pointInPoly(pt, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  // Elválasztó tengelyek tétele. null, ha nem érnek össze; különben a legkisebb
  // kitolás: n (egységvektor A-tól B felé) és depth (mm).
  function sat(A, B) {
    let best = null;
    for (const P of [A, B]) {
      for (let i = 0; i < P.length; i++) {
        const a = P[i], b = P[(i + 1) % P.length];
        let nx = b[1] - a[1], ny = a[0] - b[0];
        const L = Math.hypot(nx, ny); if (L < 1e-9) continue;
        nx /= L; ny /= L;
        let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
        for (const q of A) { const v = q[0] * nx + q[1] * ny; if (v < a0) a0 = v; if (v > a1) a1 = v; }
        for (const q of B) { const v = q[0] * nx + q[1] * ny; if (v < b0) b0 = v; if (v > b1) b1 = v; }
        const o = Math.min(a1, b1) - Math.max(a0, b0);
        if (o <= 0) return null;
        if (!best || o < best.depth) best = { nx, ny, depth: o };
      }
    }
    const ca = centroid(A), cb = centroid(B);
    if ((cb[0] - ca[0]) * best.nx + (cb[1] - ca[1]) * best.ny < 0) { best.nx = -best.nx; best.ny = -best.ny; }
    return best;
  }
  function bounds(p) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    p.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    return { x0, x1, y0, y1 };
  }
  // sugár (p kezdőpont, d egységirány) metszése egy sokszöggel: távolság vagy Infinity
  function rayPoly(p, d, poly) {
    let best = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const ex = b[0] - a[0], ey = b[1] - a[1];
      const den = d[0] * ey - d[1] * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den;
      const u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den;
      if (t >= 0 && u >= 0 && u <= 1) best = Math.min(best, t);
    }
    return best;
  }
  // zóna: {x0,x1,y0,y1} téglalap, {poly:[...]} vagy {cx,cy,r} kör
  function zonePoly(z) {
    if (z.poly) return z.poly;
    if (z.r != null) return circlePoly(z.cx, z.cy, z.r);
    return [[z.x0, z.y0], [z.x1, z.y0], [z.x1, z.y1], [z.x0, z.y1]];
  }

  // ---- a robot karjai ----------------------------------------------------
  // Minden kar az E porton lévő motorral mozog, 0 fokról indul.
  // A szög a motor fokában értendő Motor(Port.E) esetén (alapirány):
  // pozitív irányba forgatva a kar lecsap / zár / emel.
  // A méretek a robot elejétől (f = 0 a robot eleje) mm-ben, jobbra pozitív.
  const ATTACHMENTS = {
    none: { name: 'Nincs kar' },
    pusher: {
      name: 'Tolólap (lecsapható)',
      desc: 'A robot elején egy lap, ami 0 fokon fel van hajtva. 90 fokra lecsapva tolja az elemeket, és ami alá kerül, azt le is szorítja: így a robot vissza is húzhatja.',
      min: 0, max: 90, engageAt: 70,
      capture: { f0: 0, f1: 45, half: 55 }, capacity: 1, lifts: false,
      colliders: (ang) => (ang >= 70 ? [[45, 60, -70, 70]] : []),
    },
    gripper: {
      name: 'Fogó',
      desc: 'Két fogópofa a robot elején. 0 fokon nyitva, 90 fokon zárva: ami a pofák között van, azt a robot magával viszi. A nyitott pofák tolnak is.',
      min: 0, max: 90, engageAt: 75,
      capture: { f0: 0, f1: 60, half: 38 }, capacity: 1, lifts: false,
      colliders: (ang) => {
        const open = 52 - 22 * Math.min(1, ang / 90); // a pofák belső széle
        return [[0, 70, -open - 10, -open], [0, 70, open, open + 10]];
      },
    },
    lift: {
      name: 'Emelőkar (villa)',
      desc: 'Lent (0 fok) a villa a padlón csúszik, és becsúszik az elemek alá. Felemelve (90 fok) ami a villán van, a robottal megy, és átemelhető más elemek fölött.',
      min: 0, max: 90, engageAt: 60,
      capture: { f0: 0, f1: 70, half: 50 }, capacity: 2, lifts: true,
      // A lent lévő villa csak azokat tolja, amik alá nem tud becsúszni.
      colliders: (ang) => (ang < 60 ? [[0, 75, -55, 55, 'fork']] : []),
    },
  };

  // ---- a világ -----------------------------------------------------------
  class World {
    // def: { width, height, objects:[...], triggers:[...] }
    // elem: { id, label, color, shape:'rect'|'circle', w, h | r, x, y, a,
    //         fixed, grab (fogható / emelhető), group, protect }
    constructor(def) {
      this.width = def.width; this.height = def.height;
      this.objects = (def.objects || []).map((o) => Object.assign({ a: 0, fixed: false, grab: false, shape: 'rect' }, o, {
        x0: o.x, y0: o.y, a0: o.a || 0, carried: false, touched: null, maxShift: 0,
      }));
      this.byId = {}; this.objects.forEach((o) => { this.byId[o.id] = o; });
      this.triggers = (def.triggers || []).map((t) => Object.assign({}, t));
      this.flags = {};
      // def.attachment: a kar kulcsa (ATTACHMENTS); a sim-et a Simulation köti be
      this.att = def.attachment && def.attachment !== 'none' && ATTACHMENTS[def.attachment] ? ATTACHMENTS[def.attachment] : null;
      this.engaged = false; this.armAngle = 0;
      this.sim = null;
    }

    poly(o) { return o.shape === 'circle' ? circlePoly(o.x, o.y, o.r) : rectPoly(o.x, o.y, o.w, o.h, o.a); }
    rho2(o) { return o.shape === 'circle' ? o.r * o.r / 2 : (o.w * o.w + o.h * o.h) / 12; }

    // A robot ütköző részei egy adott helyzetben.
    robotColliders(pose) {
      const R = this.sim.robot, w = R.bodyWidth / 2;
      const out = [{ poly: robotRect(pose, -R.bodyRear, R.bodyFront, -w, w), kind: 'body' }];
      if (this.att) {
        this.att.colliders(this.armAngle).forEach(([f0, f1, s0, s1, kind]) =>
          out.push({ poly: robotRect(pose, R.bodyFront + f0, R.bodyFront + f1, s0, s1), kind: kind || 'arm' }));
      }
      return out;
    }
    captureZone(pose) {
      const R = this.sim.robot, c = this.att.capture;
      return robotRect(pose, R.bodyFront + c.f0, R.bodyFront + c.f1, -c.half, c.half);
    }

    // A vitt elemek a robottal együtt mozognak.
    placeCarried(pose) {
      this.objects.forEach((o) => {
        if (!o.carried) return;
        const [x, y] = toWorld(pose.x, pose.y, pose.heading, o.cs, o.cf);
        o.x = x; o.y = y; o.a = pose.heading + o.ca;
      });
    }

    // A kar szöge változott: fogás / elengedés.
    setArm(angle, pose) {
      this.armAngle = angle;
      if (!this.att) return;
      const on = angle >= this.att.engageAt;
      if (on && !this.engaged) {
        const zone = this.captureZone(pose);
        const cands = this.objects.filter((o) => !o.fixed && o.grab && !o.carried && pointInPoly([o.x, o.y], zone));
        const R = this.sim.robot;
        cands.slice(0, this.att.capacity).forEach((o) => {
          const h = rad(pose.heading), dx = o.x - pose.x, dy = o.y - pose.y;
          o.carried = true; o.lifted = !!this.att.lifts;
          o.cf = dx * Math.sin(h) + dy * Math.cos(h);
          o.cs = dx * Math.cos(h) - dy * Math.sin(h);
          o.ca = o.a - pose.heading;
          void R;
          this.sim.event('grab', { id: o.id });
        });
      } else if (!on && this.engaged) {
        this.objects.forEach((o) => {
          if (!o.carried) return;
          o.carried = false; o.lifted = false;
          this.keepInside(o);
          this.sim.event('release', { id: o.id });
        });
      }
      this.engaged = on;
    }

    // ráhelyezhető-e az egyik a másikra (pl. toronytető a talpra): ilyenkor nem ütköznek
    stacked(a, b) { return (a.stackOn && a.stackOn.includes(b.id)) || (b.stackOn && b.stackOn.includes(a.id)); }

    keepInside(o) {
      const b = bounds(this.poly(o));
      if (b.x0 < 0) o.x -= b.x0; if (b.x1 > this.width) o.x -= b.x1 - this.width;
      if (b.y0 < 0) o.y -= b.y0; if (b.y1 > this.height) o.y -= b.y1 - this.height;
    }

    save() { return this.objects.map((o) => [o.x, o.y, o.a, o.touched, o.maxShift]); }
    restore(s) { s.forEach((v, i) => { const o = this.objects[i]; [o.x, o.y, o.a, o.touched, o.maxShift] = v; }); }

    // Egy elem kitolása: m.n irányba m.depth mélységből, a c érintkezési pontnál.
    // Az elem a súrlódás miatt el is fordul, ha nem a közepénél toljuk.
    push(o, m, contact) {
      if (contact) {
        const rx = contact[0] - o.x, ry = contact[1] - o.y;
        const dx = m.nx * m.depth, dy = m.ny * m.depth;
        const w = (rx * dy - ry * dx) / (this.rho2(o) + rx * rx + ry * ry); // rad, óramutatóval ellentétes
        o.a -= deg(w) * 0.7;
      }
      o.x += m.nx * (m.depth + 0.01); o.y += m.ny * (m.depth + 0.01);
    }
    contactPoint(A, B) {
      const pts = A.filter((p) => pointInPoly(p, B)).concat(B.filter((p) => pointInPoly(p, A)));
      return pts.length ? centroid(pts) : null;
    }
    // Az elem környezete: fal, rögzített elemek, a többi szabad elem (lánc).
    resolve(o, depth) {
      if (depth > 4) return;
      this.keepInside(o);
      for (const q of this.objects) {
        if (q === o || q.carried || q.hidden) continue;
        if (o.lifted || q.lifted || this.stacked(o, q)) continue;
        const P = this.poly(o), Q = this.poly(q);
        const m = sat(P, Q);
        if (!m || m.depth < 0.05) continue;
        if (q.fixed) {
          this.push(o, { nx: -m.nx, ny: -m.ny, depth: m.depth }, null);
          this.keepInside(o);
        } else {
          this.push(q, m, this.contactPoint(P, Q));
          this.markMoved(q);
          this.resolve(q, depth + 1);
        }
      }
    }
    markMoved(o) {
      if (o.touched == null) o.touched = this.sim ? this.sim.t : 0;
      o.maxShift = Math.max(o.maxShift, Math.hypot(o.x - o.x0, o.y - o.y0));
    }

    // A robot az új helyzetbe lépne. Igaz, ha sikerült (az elemeket közben eltolja).
    moveRobot(pose) {
      const snap = this.save();
      this.placeCarried(pose);
      const cols = this.robotColliders(pose);
      // a vitt elemek is ütköznek (az emeltek csak a fallal és a rögzített elemekkel)
      this.objects.forEach((o) => { if (o.carried) cols.push({ poly: this.poly(o), kind: o.lifted ? 'lifted' : 'carried', obj: o }); });
      let ok = true;
      for (let it = 0; it < 3 && ok; it++) {
        for (const c of cols) {
          if (c.obj && !c.obj.lifted) { /* a vitt elem a fallal */
            const b = bounds(c.poly);
            if (b.x0 < -0.5 || b.y0 < -0.5 || b.x1 > this.width + 0.5 || b.y1 > this.height + 0.5) { ok = false; break; }
          }
          for (const o of this.objects) {
            if (o.carried || o.hidden) continue;
            if (c.kind === 'lifted' && !o.fixed) continue;
            if (c.kind === 'fork' && o.grab && !o.fixed) continue; // becsúszik alá
            if (c.obj && this.stacked(c.obj, o)) continue;          // a vitt tornytetőt rá lehet tenni a talpra
            const P = this.poly(o), m = sat(c.poly, P);
            if (!m || m.depth < 0.05) continue;
            if (o.fixed) { if (m.depth > 0.6) { ok = false; break; } continue; }
            this.push(o, m, this.contactPoint(c.poly, P));
            this.markMoved(o);
            this.resolve(o, 0);
          }
          if (!ok) break;
        }
      }
      // ha valami beszorult (az elemet a falhoz nyomná), a robot nem mehet tovább
      if (ok) {
        for (const c of cols) {
          for (const o of this.objects) {
            if (o.carried || o.hidden || (c.kind === 'lifted' && !o.fixed) || (c.kind === 'fork' && o.grab && !o.fixed) || (c.obj && this.stacked(c.obj, o))) continue;
            const m = sat(c.poly, this.poly(o));
            if (m && m.depth > 0.8) { ok = false; break; }
          }
          if (!ok) break;
        }
      }
      if (!ok) { this.restore(snap); return false; }
      return true;
    }

    // Akciózónák: a kar lecsap / a robot hozzáér a szerkezethez.
    // trigger: { id, name, zone, need: 'arm' (bekapcsolt kar a zónában) | 'touch' (bármely része hozzáér),
    //            heading: [min,max] (opcionális, a robot iránya), release: [elem-id], nudge: {id:[dx,dy]}, hide: [id] }
    checkTriggers(pose) {
      for (const t of this.triggers) {
        if (this.flags[t.id] != null) continue;
        const Z = zonePoly(t.zone);
        let hit = false;
        if (t.need === 'arm') {
          if (this.att && this.engaged) hit = pointInPoly(centroid(this.captureZone(pose)), Z);
        } else {
          hit = this.robotColliders(pose).some((c) => sat(c.poly, Z));
        }
        if (hit && t.heading) {
          const h = ((pose.heading % 360) + 360) % 360;
          const [a, b] = t.heading;
          hit = a <= b ? h >= a && h <= b : h >= a || h <= b;
        }
        if (!hit) continue;
        this.flags[t.id] = this.sim.t;
        (t.release || []).forEach((id) => { const o = this.byId[id]; if (o) o.fixed = false; });
        Object.entries(t.nudge || {}).forEach(([id, [dx, dy]]) => { const o = this.byId[id]; if (o) { o.x += dx; o.y += dy; this.resolve(o, 0); } });
        (t.hide || []).forEach((id) => { const o = this.byId[id]; if (o) { o.hidden = true; this.sim.event('hide', { id }); } });
        this.sim.event('trigger', { id: t.id, text: t.name || t.id });
      }
    }

    // Távolságérzékelő: a legközelebbi elem a sugár mentén (mm).
    raycast(p, d) {
      let best = Infinity;
      for (const o of this.objects) { if (o.carried || o.hidden) continue; best = Math.min(best, rayPoly(p, d, this.poly(o))); }
      return best;
    }

    snapshot() { return this.objects.map((o) => [Math.round(o.x * 10) / 10, Math.round(o.y * 10) / 10, Math.round(o.a * 10) / 10, o.carried ? (o.lifted ? 2 : 1) : 0]); }
    summary() {
      return {
        objects: this.objects.map((o) => ({ id: o.id, x: o.x, y: o.y, a: o.a, carried: o.carried, lifted: !!o.lifted, fixed: o.fixed, hidden: !!o.hidden, touched: o.touched, maxShift: o.maxShift, x0: o.x0, y0: o.y0, a0: o.a0 })),
        flags: Object.assign({}, this.flags),
      };
    }
  }

  return { World, ATTACHMENTS, sat, rectPoly, circlePoly, robotRect, pointInPoly, zonePoly, centroid, bounds, toWorld };
});
