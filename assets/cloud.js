/*
 * Kódfejtő Műhely – kapcsolat a Supabase-hez (diákok és tanár)
 *
 * Diák: kódnév + kép-kód → belépőjegy (token). Minden adatot a kf_… függvényeken
 * keresztül ér el, a táblákhoz közvetlenül nem fér hozzá.
 * Ha nincs net, a mentéseket sorba állítjuk, és később felküldjük.
 *
 * Tanár: Supabase-fiók (e-mail + jelszó), a táblákat a saját jogán olvassa.
 */
(function () {
  'use strict';
  const C = window.KODFEJTO_CONFIG || {};
  const BASE = (C.supabaseUrl || '').replace(/\/+$/, '');
  const enabled = !!(BASE && C.supabaseKey);

  const ls = {
    get(k, d) { try { const v = localStorage.getItem('kodfejto.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kodfejto.' + k, JSON.stringify(v)); } catch (e) { /* nincs tárolás */ } },
    del(k) { try { localStorage.removeItem('kodfejto.' + k); } catch (e) { /* nem baj */ } },
  };

  async function call(path, opts, bearer) {
    opts = opts || {};
    const headers = Object.assign({ apikey: C.supabaseKey, 'Content-Type': 'application/json' }, opts.headers || {});
    if (bearer) headers.Authorization = 'Bearer ' + bearer;
    const r = await fetch(BASE + path, Object.assign({}, opts, { headers }));
    const txt = await r.text();
    let data = null;
    try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
    if (!r.ok) {
      const err = new Error((data && (data.message || data.error_description || data.msg || data.error)) || ('HTTP ' + r.status));
      err.status = r.status; err.data = data;
      throw err;
    }
    return data;
  }
  const rpc = (fn, args, bearer) => call('/rest/v1/rpc/' + fn, { method: 'POST', body: JSON.stringify(args || {}) }, bearer);

  // ------------------------------------------------------------ diák
  function session() { return ls.get('session', null); }

  async function roster() { return rpc('kf_roster'); }

  async function login(codename, pics) {
    const res = await rpc('kf_login', { p_codename: codename, p_pics: pics });
    if (res && res.ok) {
      // másik gyerek adatai ne maradjanak a gépen
      clearStudentData();
      ls.set('session', { token: res.token, codename });
      await pull(true);
    }
    return res;
  }

  function clearStudentData() {
    ['session', 'badges', 'group', 'profile', 'unlocks', 'code', 'blocks', 'cloudQueue', 'slot', 'wro', 'wroOrder', 'lastCode', 'lastBlocks', 'cloudCode', 'cloudBlocks', 'practice', 'practiceDone'].forEach(ls.del);
  }

  async function logout() {
    const s = session();
    try { await flush(); } catch (e) { /* nem baj */ }
    if (s) { try { await rpc('kf_logout', { p_token: s.token }); } catch (e) { /* nem baj */ } }
    clearStudentData();
  }

  // Letölti a diák állapotát a helyi tárolóba. restore=true: a programjait is
  // visszatölti (belépéskor). Visszaad: true, ha valami változott.
  async function pull(restore) {
    const s = session();
    if (!s) return false;
    await flush().catch(() => {});
    const st = await rpc('kf_state', { p_token: s.token });
    if (!st || !st.ok) {
      if (st && st.error === 'session') { clearStudentData(); location.reload(); }
      return false;
    }
    const before = JSON.stringify([ls.get('badges', []), ls.get('group', ''), ls.get('profile', {}), ls.get('unlocks', [])]);
    const queued = ls.get('cloudQueue', []).filter((q) => q.fn === 'kf_complete').map((q) => q.args.p_mission);
    const badges = Array.from(new Set(st.progress.map((p) => p.mission).concat(queued)));
    ls.set('badges', badges);
    ls.set('group', st.student.grp);
    ls.set('profile', Object.assign({}, st.student.avatar || {}, { name: st.student.codename }));
    ls.set('unlocks', st.unlocks || []);
    if (st.programs && st.programs.length) {
      const last = (mode) => st.programs.filter((p) => p.mode === mode).pop();
      const py = last('python'), bl = last('blocks');
      // a legutóbb felhőbe mentett program: a pálya Minta menüjéből visszahozható
      if (py) ls.set('cloudCode', py.code);
      if (bl && bl.blocks) ls.set('cloudBlocks', bl.blocks);
      if (restore) {
        if (py) { ls.set('code', py.code); ls.set('slot', py.slot); }
        if (bl && bl.blocks) ls.set('blocks', bl.blocks);
      }
    }
    try { window.dispatchEvent(new Event('kodfejto-pulled')); } catch (e) { /* nem baj */ }
    const after = JSON.stringify([ls.get('badges', []), ls.get('group', ''), ls.get('profile', {}), ls.get('unlocks', [])]);
    return before !== after;
  }

  // ---- sorba állított mentések (ha épp nincs net)
  function enqueue(fn, args, key) {
    const q = ls.get('cloudQueue', []).filter((x) => !key || x.key !== key);
    q.push({ fn, args, key });
    ls.set('cloudQueue', q);
    flush().catch(() => {});
  }
  let flushing = null;
  function flush() {
    if (flushing) return flushing;
    flushing = (async () => {
      const s = session();
      if (!s) return;
      let q = ls.get('cloudQueue', []);
      while (q.length) {
        const item = q[0];
        const res = await rpc(item.fn, Object.assign({ p_token: s.token }, item.args));
        if (res && res.ok === false && res.error === 'session') { clearStudentData(); return; }
        q = ls.get('cloudQueue', []).slice(1);
        ls.set('cloudQueue', q);
      }
    })().finally(() => { flushing = null; });
    return flushing;
  }
  window.addEventListener('online', () => flush().catch(() => {}));

  function saveProgram(slot, mode, code, blocks) {
    if (!session()) return;
    if (mode === 'blocks') { if (blocks) ls.set('cloudBlocks', blocks); } else ls.set('cloudCode', code || '');
    enqueue('kf_save_program', { p_slot: slot || 'szabad', p_mode: mode, p_code: code || '', p_blocks: blocks || null }, 'prog:' + slot + ':' + mode);
  }
  function complete(mission) { if (session()) enqueue('kf_complete', { p_mission: mission }); }
  function setAvatar(p) {
    if (!session()) return;
    const a = Object.assign({}, p); delete a.name;
    enqueue('kf_set_avatar', { p_avatar: a }, 'avatar');
  }

  // ------------------------------------------------------------ tanár
  function teacherSession() { return ls.get('teacher', null); }
  async function teacherLogin(email, password) {
    const r = await call('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) });
    ls.set('teacher', { access: r.access_token, refresh: r.refresh_token, exp: Date.now() + (r.expires_in - 60) * 1000, email });
    return r;
  }
  async function teacherToken() {
    const t = teacherSession();
    if (!t) return null;
    if (Date.now() < t.exp) return t.access;
    try {
      const r = await call('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: t.refresh }) });
      ls.set('teacher', { access: r.access_token, refresh: r.refresh_token, exp: Date.now() + (r.expires_in - 60) * 1000, email: t.email });
      return r.access_token;
    } catch (e) { ls.del('teacher'); return null; }
  }
  async function teacherLogout() {
    const tok = await teacherToken();
    if (tok) { try { await call('/auth/v1/logout', { method: 'POST' }, tok); } catch (e) { /* nem baj */ } }
    ls.del('teacher');
  }
  // REST hívás a tanár nevében: t('GET', '/kf_students?select=*')
  async function t(method, path, body, extraHeaders) {
    const tok = await teacherToken();
    if (!tok) { const e = new Error('Lejárt a tanári belépés.'); e.status = 401; throw e; }
    if (path.startsWith('rpc:')) return rpc(path.slice(4), body, tok);
    return call('/rest/v1' + path, { method, body: body ? JSON.stringify(body) : undefined, headers: extraHeaders }, tok);
  }

  window.KodfejtoCloud = {
    enabled, session, roster, login, logout, pull, flush, saveProgram, complete, setAvatar,
    teacherSession, teacherLogin, teacherLogout, teacherToken, t,
    PICS: ['🚀', '🐸', '🍕', '⚽', '🌈', '🐱', '🎸', '🍦', '🌵', '🦊', '⭐', '🍎'],
    PIC_NAMES: ['rakéta', 'béka', 'pizza', 'labda', 'szivárvány', 'cica', 'gitár', 'fagyi', 'kaktusz', 'róka', 'csillag', 'alma'],
  };
})();
