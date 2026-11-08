/*
 * Kódfejtő Műhely – közös szkript
 * Tárolás, csoport, avatár, jelvények, fejléc.
 * Valódi nevet nem kérünk és nem tárolunk: a gyerek kódnévvel szerepel.
 *
 * Két mód:
 *  - helyi mód (assets/config.js üres): minden a gyerek böngészőjében marad;
 *  - felhős mód (Supabase beállítva): belépés kódnévvel és kép-kóddal, a haladás
 *    a tanár adatbázisába mentődik, a küldetéseket a tanár oldja fel.
 */
(function () {
  'use strict';

  const store = {
    get(k, d) { try { const v = localStorage.getItem('kodfejto.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kodfejto.' + k, JSON.stringify(v)); } catch (e) { /* nincs tárolás */ } },
  };

  const GROUPS = {
    blokk3: { name: 'Blokkos csapat', sub: '3. osztály · SPIKE App blokkok', mode: 'blocks' },
    python3: { name: 'Python-csapat', sub: '3. osztály · Pybricks Python', mode: 'python' },
    python7: { name: 'Python haladó', sub: '7. osztály és WRO-csapat', mode: 'python' },
  };

  const DEFAULT_PROFILE = { head: 'round', eye: 'dots', acc: 'antenna', color: '#FFC93C', name: 'Csavar' };
  const COLORS = [['#FFC93C', 'sárga'], ['#FF5A5F', 'piros'], ['#2F6FED', 'kék'], ['#2BB673', 'zöld'], ['#8A5CF6', 'lila']];
  const NAMES = ['Csavar', 'Fogaskerék', 'Szikra', 'Bitfaragó', 'Vakond', 'Villám', 'Kódbagoly', 'Turbó', 'Mágnes', 'Radar', 'Szenzor', 'Lánctalp'];

  function profile() { return Object.assign({}, DEFAULT_PROFILE, store.get('profile', {})); }

  // Az avatár SVG-je a választott részekből
  function avatarSVG(p, size) {
    const c = p.color, ink = '#1D2B44';
    let head = '';
    if (p.head === 'square') head = `<rect x="74" y="66" width="152" height="146" rx="26" fill="#fff" stroke="${ink}" stroke-width="6"/>`;
    else if (p.head === 'dome') head = `<path d="M72 200 L72 140 A78 78 0 0 1 228 140 L228 200 Z" fill="#fff" stroke="${ink}" stroke-width="6"/>`;
    else head = `<circle cx="150" cy="140" r="78" fill="#fff" stroke="${ink}" stroke-width="6"/>`;
    let eyes = '';
    if (p.eye === 'big') eyes = `<circle cx="122" cy="140" r="20" fill="#fff" stroke="${ink}" stroke-width="5"/><circle cx="178" cy="140" r="20" fill="#fff" stroke="${ink}" stroke-width="5"/><circle cx="125" cy="143" r="9" fill="${ink}"/><circle cx="175" cy="143" r="9" fill="${ink}"/>`;
    else if (p.eye === 'shades') eyes = `<rect x="98" y="126" width="46" height="28" rx="8" fill="${ink}"/><rect x="156" y="126" width="46" height="28" rx="8" fill="${ink}"/><line x1="144" y1="136" x2="156" y2="136" stroke="${ink}" stroke-width="5"/>`;
    else eyes = `<circle cx="124" cy="142" r="11" fill="${ink}"/><circle cx="176" cy="142" r="11" fill="${ink}"/>`;
    let acc = '';
    if (p.acc === 'antenna') acc = `<line x1="150" y1="62" x2="150" y2="30" stroke="${ink}" stroke-width="6"/><circle cx="150" cy="26" r="10" fill="${c}" stroke="${ink}" stroke-width="4"/>`;
    else if (p.acc === 'hat') acc = `<rect x="70" y="62" width="160" height="14" rx="7" fill="#5B4636" stroke="${ink}" stroke-width="4"/><path d="M98 66 L106 26 L194 26 L202 66 Z" fill="#5B4636" stroke="${ink}" stroke-width="4"/>`;
    else if (p.acc === 'phones') acc = `<path d="M70 140 A80 80 0 0 1 230 140" fill="none" stroke="${ink}" stroke-width="8"/><rect x="56" y="122" width="22" height="44" rx="10" fill="${c}" stroke="${ink}" stroke-width="4"/><rect x="222" y="122" width="22" height="44" rx="10" fill="${c}" stroke="${ink}" stroke-width="4"/>`;
    return `<svg width="${size}" height="${size}" viewBox="0 0 300 300" role="img" aria-label="${p.name} ügynök avatárja">
      <rect x="95" y="210" width="110" height="70" rx="18" fill="${c}" stroke="${ink}" stroke-width="5"/>
      ${head}<rect x="104" y="104" width="92" height="20" rx="10" fill="${c}" opacity="0.25"/>${eyes}
      <path d="M130 178 Q150 192 170 178" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>${acc}</svg>`;
  }

  // ------------------------------------------------------------ jelvények
  const BADGES = {
    k1: { name: 'Első csipogás', desc: 'Megszólaltattad a robotot és megforgattad a motort.' },
    k2: { name: 'Nem búgócsiga', desc: 'A robotod egyenesen megy és pontosan fordul.' },
    k3: { name: 'Fokvadász', desc: 'Rájöttél, mi a különbség a kerékfok és a robotfok között.' },
    k4: { name: 'Iránytű', desc: 'Megmérted, mennyit javít a giroszkóp.' },
    k5: { name: 'Szótanító', desc: 'Megtanítottál a robotnak egy új szót.' },
    k6: { name: 'Dobogós', desc: 'A robotod megrajzolta a dobogót.' },
    k7: { name: 'Farmer', desc: 'Felvesz és lerak saját paranccsal.' },
  };
  const RANKS = [[0, 'Kódfejtő újonc'], [1, 'Kódfejtő tanonc'], [3, 'Kódfejtő segéd'], [6, 'Kódfejtő mester']];
  function badges() { return store.get('badges', []); }
  function earn(id) {
    const b = badges(); if (!b.includes(id)) { b.push(id); store.set('badges', b); }
    if (cloud()) window.KodfejtoCloud.complete(id);
  }

  // ------------------------------------------------------------ felhős mód
  const cloud = () => !!(window.KodfejtoCloud && window.KodfejtoCloud.enabled);
  // Nyitott-e a küldetés? Helyi módban minden nyitott; felhős módban a tanár
  // oldja fel (vagy a diák már teljesítette).
  function unlocked(id) { return !cloud() || store.get('unlocks', []).includes(id) || badges().includes(id); }
  const syncCbs = [];
  function onSync(cb) { syncCbs.push(cb); }
  function rank() { const n = badges().length; let r = RANKS[0][1]; RANKS.forEach(([k, name]) => { if (n >= k) r = name; }); return r; }

  // ------------------------------------------------------------ fejléc, lábléc
  function header(active, base) {
    base = base || '';
    if (cloud() && !window.KodfejtoCloud.session()) {
      location.replace(base + 'belepes.html?vissza=' + encodeURIComponent(location.pathname.split('/').slice(-2).join('/') + location.hash));
      return;
    }
    if (cloud()) {
      window.KodfejtoCloud.pull(false).then((changed) => {
        if (!changed) return;
        header(active, base);
        syncCbs.forEach((cb) => cb());
      }).catch(() => { /* nincs net: a helyi másolattal dolgozunk */ });
    }
    const p = profile(), g = GROUPS[store.get('group', '')];
    const nav = [
      ['home', 'Főoldal', base + 'index.html'],
      ['missions', 'Küldetések', base + 'kuldetesek.html'],
      ['track', 'Pálya', base + 'palya/index.html'],
      ['dict', 'Szótár', base + 'szotar.html'],
      ['games', 'Játékok', base + 'jatekok.html'],
    ];
    const el = document.getElementById('siteHeader');
    el.className = 'site-header';
    el.innerHTML = `
      <a class="logo" href="${base}index.html">
        <span class="logo-mark" aria-hidden="true"><span style="background:#FF5A5F"></span><span style="background:#FFC93C"></span><span style="background:#2F6FED"></span><span style="background:#2BB673"></span></span>
        <span><span class="logo-name">Kódfejtő Műhely</span><br><span class="logo-sub">Diákszempont · robotika tehetséggondozás</span></span>
      </a>
      <nav class="site-nav" aria-label="Fő menü">${nav.map(([k, t, h]) => `<a href="${h}" class="${k === active ? 'on' : ''}">${t}</a>`).join('')}</nav>
      <button class="me" type="button" id="meBtn" aria-label="Avatár és csapat beállítása">
        ${avatarSVG(p, 46)}
        <span><span class="me-name">${p.name} ügynök</span><br><span class="me-group">${g ? g.name : 'Válassz csapatot!'}</span></span>
      </button>`;
    document.getElementById('meBtn').addEventListener('click', () => openSetup());
    const f = document.getElementById('siteFooter');
    if (f) {
      f.className = 'site-footer';
      f.innerHTML = '<div class="foot-rule"><span>A Kódfejtő Műhely a Diákszempont robotika tehetséggondozó foglalkozása.</span><span>'
        + (cloud() ? 'A haladásod kódnévvel mentődik, a tanárod látja. Valódi nevet nem tárolunk.' : 'Az oldal nem gyűjt adatot: minden a saját böngésződben marad.') + '</span></div>';
    }
  }

  // ------------------------------------------------------------ beállító ablak (csapat + avatár)
  function openSetup(onDone) {
    let dlg = document.getElementById('setupDlg');
    if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'setupDlg'; document.body.appendChild(dlg); }
    const p = profile();
    let group = store.get('group', '');
    const isCloud = cloud();
    const chip = (key, val, label) => `<button type="button" class="chip ${p[key] === val ? 'on' : ''}" data-k="${key}" data-v="${val}">${label}</button>`;
    function render() {
      dlg.innerHTML = `<div class="dlg">
        <div class="dlg-head"><h2>Ki vagy, ügynök?</h2><button class="dlg-close" type="button" aria-label="Bezárás">×</button></div>
        ${isCloud ? `<div style="font-weight:700">Csapatod: <strong>${GROUPS[group] ? GROUPS[group].name : group}</strong>. A kódnevedet és a csapatodat a tanárod adta.</div>` : `<div><div class="opt-title">1. Melyik csapatban vagy?</div>
          <div class="groups">${Object.entries(GROUPS).map(([k, g]) => `<button type="button" class="group-card ${group === k ? 'on' : ''}" data-g="${k}"><strong>${g.name}</strong>${g.sub}</button>`).join('')}</div></div>`}
        <div class="opt-title">${isCloud ? 'Építsd meg az avatárodat!' : '2. Építsd meg az avatárodat!'}</div>
        <div class="avatar-builder">
          <div class="avatar-preview"><div class="avatar-stage">${avatarSVG(p, 250)}</div><div style="font-family:'Baloo 2',sans-serif;font-weight:800;font-size:26px">${p.name} ügynök</div></div>
          <div class="avatar-options">
            <div><div class="opt-title">Fej</div><div class="chips">${chip('head', 'round', 'Kerek')}${chip('head', 'square', 'Kocka')}${chip('head', 'dome', 'Kupola')}</div></div>
            <div><div class="opt-title">Szem</div><div class="chips">${chip('eye', 'dots', 'Pötty')}${chip('eye', 'big', 'Nagy szem')}${chip('eye', 'shades', 'Napszemüveg')}</div></div>
            <div><div class="opt-title">Kiegészítő</div><div class="chips">${chip('acc', 'antenna', 'Antenna')}${chip('acc', 'hat', 'Nyomozókalap')}${chip('acc', 'phones', 'Fejhallgató')}${chip('acc', 'none', 'Semmi')}</div></div>
            <div><div class="opt-title">Szín</div><div class="chips">${COLORS.map(([c, n]) => `<button type="button" class="swatch ${p.color === c ? 'on' : ''}" data-k="color" data-v="${c}" aria-label="${n}" style="background:${c}"></button>`).join('')}</div></div>
            ${isCloud ? '' : `<div><div class="opt-title">Kódnév</div><div class="chips">${NAMES.map((n) => chip('name', n, n)).join('')}</div></div>`}
          </div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center"><button type="button" class="btn btn-green" id="setupOk">Kész, ez vagyok én!</button>
          ${isCloud ? '<button type="button" class="btn btn-plain" id="logoutBtn">Kilépek</button>' : ''}
          <span id="setupMsg" style="font-weight:700;color:#C9393E"></span></div>
      </div>`;
      dlg.querySelector('.dlg-close').onclick = () => dlg.close();
      const lo = dlg.querySelector('#logoutBtn');
      if (lo) lo.onclick = async () => { lo.disabled = true; await window.KodfejtoCloud.logout(); location.href = (location.pathname.includes('/palya/') ? '../' : '') + 'belepes.html'; };
      dlg.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { p[b.dataset.k] = b.dataset.v; render(); });
      dlg.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { group = b.dataset.g; render(); });
      dlg.querySelector('#setupOk').onclick = () => {
        if (!group) { dlg.querySelector('#setupMsg').textContent = 'Előbb válaszd ki a csapatodat!'; return; }
        store.set('profile', p); store.set('group', group);
        if (isCloud) window.KodfejtoCloud.setAvatar(p);
        dlg.close();
        if (onDone) onDone(); else location.reload();
      };
    }
    render();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  window.Kodfejto = { store, GROUPS, profile, avatarSVG, BADGES, badges, earn, rank, header, openSetup, unlocked, onSync, cloud };
})();
