-- =====================================================================
-- Kódfejtő Műhely – adatbázis (Supabase)
--
-- Telepítés: Supabase → SQL Editor → New query → ide másold az egészet → Run.
-- Többször is lefuttatható: ami már megvan, azt nem rontja el.
--
-- Biztonsági elv:
--   * A táblákhoz a böngészőből (anon) KÖZVETLENÜL nem lehet hozzáférni.
--   * A diákok csak az alábbi kf_… függvényeken keresztül olvasnak/írnak,
--     és minden függvény a belépőjegy (token) alapján csak a SAJÁT adatukat
--     éri el.
--   * A tanár Supabase-fiókkal lép be; a kf_teachers táblában lévő fiókok
--     mindent látnak és szerkeszthetnek.
--   * Valódi nevet nem tárolunk: csak kódnevet.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- táblák
create table if not exists public.kf_students (
  id           uuid primary key default gen_random_uuid(),
  codename     text not null unique check (char_length(codename) between 2 and 30),
  grp          text not null,
  pic_hash     text,
  avatar       jsonb not null default '{}'::jsonb,
  active       boolean not null default true,
  failed       int not null default 0,
  locked_until timestamptz,
  created_at   timestamptz not null default now(),
  last_seen    timestamptz
);

create table if not exists public.kf_sessions (
  token      uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.kf_students(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '60 days'
);

create table if not exists public.kf_progress (
  student_id uuid not null references public.kf_students(id) on delete cascade,
  mission    text not null,
  done_at    timestamptz not null default now(),
  primary key (student_id, mission)
);

-- A diák utolsó programja „helyenként” (slot = küldetés azonosítója vagy 'szabad'),
-- módonként (python / blocks) egy-egy.
create table if not exists public.kf_programs (
  student_id uuid not null references public.kf_students(id) on delete cascade,
  slot       text not null,
  mode       text not null check (mode in ('python', 'blocks')),
  code       text not null default '',
  blocks     jsonb,
  runs       int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, slot, mode)
);

-- Feloldások: scope = 'all' (mindenki), 'group' (target = csoport kódja),
-- 'student' (target = kódnév)
create table if not exists public.kf_unlocks (
  id         bigint generated always as identity primary key,
  mission    text not null,
  scope      text not null check (scope in ('all', 'group', 'student')),
  target     text not null default '',
  created_at timestamptz not null default now(),
  unique (mission, scope, target)
);

create table if not exists public.kf_teachers (
  user_id    uuid primary key,
  email      text,
  created_at timestamptz not null default now()
);

create index if not exists kf_sessions_student on public.kf_sessions(student_id);

-- ---------------------------------------------------------------- jogosultságok
alter table public.kf_students enable row level security;
alter table public.kf_sessions enable row level security;
alter table public.kf_progress enable row level security;
alter table public.kf_programs enable row level security;
alter table public.kf_unlocks  enable row level security;
alter table public.kf_teachers enable row level security;

revoke all on public.kf_students, public.kf_sessions, public.kf_progress,
              public.kf_programs, public.kf_unlocks, public.kf_teachers from anon;
grant select, insert, update, delete on public.kf_students, public.kf_progress,
              public.kf_programs, public.kf_unlocks to authenticated;
grant select on public.kf_teachers to authenticated;
revoke all on public.kf_sessions from authenticated;

-- Tanár-e a bejelentkezett fiók?
create or replace function public.kf_is_teacher()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.kf_teachers where user_id = auth.uid());
$$;

drop policy if exists kf_teacher_all on public.kf_students;
create policy kf_teacher_all on public.kf_students for all to authenticated
  using (public.kf_is_teacher()) with check (public.kf_is_teacher());
drop policy if exists kf_teacher_all on public.kf_progress;
create policy kf_teacher_all on public.kf_progress for all to authenticated
  using (public.kf_is_teacher()) with check (public.kf_is_teacher());
drop policy if exists kf_teacher_all on public.kf_programs;
create policy kf_teacher_all on public.kf_programs for all to authenticated
  using (public.kf_is_teacher()) with check (public.kf_is_teacher());
drop policy if exists kf_teacher_all on public.kf_unlocks;
create policy kf_teacher_all on public.kf_unlocks for all to authenticated
  using (public.kf_is_teacher()) with check (public.kf_is_teacher());
drop policy if exists kf_teacher_self on public.kf_teachers;
create policy kf_teacher_self on public.kf_teachers for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------- segéd: belépőjegy → diák
create or replace function public.kf_student_of(p_token uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select s.student_id into v_id
    from public.kf_sessions s join public.kf_students st on st.id = s.student_id
   where s.token = p_token and s.expires_at > now() and st.active;
  if v_id is not null then
    update public.kf_students set last_seen = now() where id = v_id;
  end if;
  return v_id;
end $$;

-- ---------------------------------------------------------------- diák-függvények
-- Névsor a belépéshez (csak kódnév, csoport, avatár)
create or replace function public.kf_roster()
returns table (codename text, grp text, avatar jsonb)
language sql stable security definer set search_path = public as $$
  select codename, grp, avatar from public.kf_students where active order by grp, codename;
$$;

-- Belépés kódnévvel és kép-kóddal. Hibás próbálkozásnál nem dob hibát
-- (különben a számláló sem mentődne), hanem {ok:false} jön vissza.
-- 5 hibás próbálkozás után 5 percre zárol.
create or replace function public.kf_login(p_codename text, p_pics text)
returns json language plpgsql security definer set search_path = public, extensions as $$
declare st public.kf_students; v_token uuid;
begin
  select * into st from public.kf_students where codename = p_codename and active;
  if not found then return json_build_object('ok', false, 'error', 'unknown'); end if;
  if st.locked_until is not null and st.locked_until > now() then
    return json_build_object('ok', false, 'error', 'locked',
      'wait', ceil(extract(epoch from st.locked_until - now())));
  end if;
  if st.pic_hash is null then return json_build_object('ok', false, 'error', 'nocode'); end if;
  if extensions.crypt(p_pics, st.pic_hash) <> st.pic_hash then
    if st.failed + 1 >= 5 then
      update public.kf_students set failed = 0, locked_until = now() + interval '5 minutes' where id = st.id;
      return json_build_object('ok', false, 'error', 'locked', 'wait', 300);
    end if;
    update public.kf_students set failed = failed + 1 where id = st.id;
    return json_build_object('ok', false, 'error', 'bad', 'left', 4 - st.failed);
  end if;
  update public.kf_students set failed = 0, locked_until = null, last_seen = now() where id = st.id;
  delete from public.kf_sessions where student_id = st.id and expires_at < now();
  insert into public.kf_sessions(student_id) values (st.id) returning token into v_token;
  return json_build_object('ok', true, 'token', v_token);
end $$;

create or replace function public.kf_logout(p_token uuid)
returns json language sql security definer set search_path = public as $$
  delete from public.kf_sessions where token = p_token;
  select json_build_object('ok', true);
$$;

-- Minden, ami a diák oldalainak kell: ki ő, mit teljesített, mi nyitott neki, a programjai.
create or replace function public.kf_state(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid; st public.kf_students;
begin
  v_id := public.kf_student_of(p_token);
  if v_id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  select * into st from public.kf_students where id = v_id;
  return json_build_object(
    'ok', true,
    'student', json_build_object('codename', st.codename, 'grp', st.grp, 'avatar', st.avatar),
    'progress', coalesce((select json_agg(json_build_object('mission', mission, 'done_at', done_at) order by done_at)
                            from public.kf_progress where student_id = v_id), '[]'::json),
    'unlocks', coalesce((select json_agg(distinct mission) from public.kf_unlocks
                          where scope = 'all'
                             or (scope = 'group' and target = st.grp)
                             or (scope = 'student' and target = st.codename)), '[]'::json),
    'programs', coalesce((select json_agg(json_build_object('slot', slot, 'mode', mode, 'code', code,
                             'blocks', blocks, 'updated_at', updated_at) order by updated_at)
                            from public.kf_programs where student_id = v_id), '[]'::json)
  );
end $$;

create or replace function public.kf_save_program(p_token uuid, p_slot text, p_mode text, p_code text, p_blocks jsonb default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  v_id := public.kf_student_of(p_token);
  if v_id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  if p_mode not in ('python', 'blocks') or char_length(p_slot) > 30 or char_length(p_code) > 100000
     or pg_column_size(p_blocks) > 500000 then
    return json_build_object('ok', false, 'error', 'size');
  end if;
  insert into public.kf_programs(student_id, slot, mode, code, blocks, runs, updated_at)
  values (v_id, p_slot, p_mode, coalesce(p_code, ''), p_blocks, 1, now())
  on conflict (student_id, slot, mode) do update
     set code = excluded.code, blocks = excluded.blocks,
         runs = public.kf_programs.runs + 1, updated_at = now();
  return json_build_object('ok', true);
end $$;

create or replace function public.kf_complete(p_token uuid, p_mission text)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  v_id := public.kf_student_of(p_token);
  if v_id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  if char_length(p_mission) > 20 then return json_build_object('ok', false, 'error', 'size'); end if;
  insert into public.kf_progress(student_id, mission) values (v_id, p_mission) on conflict do nothing;
  return json_build_object('ok', true);
end $$;

create or replace function public.kf_set_avatar(p_token uuid, p_avatar jsonb)
returns json language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  v_id := public.kf_student_of(p_token);
  if v_id is null then return json_build_object('ok', false, 'error', 'session'); end if;
  if pg_column_size(p_avatar) > 2000 then return json_build_object('ok', false, 'error', 'size'); end if;
  update public.kf_students set avatar = p_avatar - 'name' where id = v_id;
  return json_build_object('ok', true);
end $$;

-- A heti „ébresztő” ezt hívja: egy apró adatbázis-lekérdezés, hogy a Supabase
-- ingyenes projektje ne aludjon el a szünetekben.
create or replace function public.kf_ping()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('ok', true, 'students', (select count(*) from public.kf_students));
$$;

-- ---------------------------------------------------------------- tanári függvények
-- Új diák vagy új kép-kód: a kép-kódot csak titkosítva tároljuk.
create or replace function public.kf_teacher_create(p_codename text, p_grp text, p_pics text)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.kf_is_teacher() then raise exception 'csak tanár'; end if;
  insert into public.kf_students(codename, grp, pic_hash)
  values (trim(p_codename), p_grp, extensions.crypt(p_pics, extensions.gen_salt('bf')));
  return json_build_object('ok', true);
exception when unique_violation then
  return json_build_object('ok', false, 'error', 'exists');
end $$;

create or replace function public.kf_teacher_set_pics(p_id uuid, p_pics text)
returns json language plpgsql security definer set search_path = public, extensions as $$
begin
  if not public.kf_is_teacher() then raise exception 'csak tanár'; end if;
  update public.kf_students
     set pic_hash = extensions.crypt(p_pics, extensions.gen_salt('bf')), failed = 0, locked_until = null
   where id = p_id;
  delete from public.kf_sessions where student_id = p_id;
  return json_build_object('ok', true);
end $$;

-- ---------------------------------------------------------------- függvény-jogok
revoke execute on function public.kf_is_teacher(), public.kf_student_of(uuid), public.kf_roster(),
  public.kf_login(text, text), public.kf_logout(uuid), public.kf_state(uuid),
  public.kf_save_program(uuid, text, text, text, jsonb), public.kf_complete(uuid, text),
  public.kf_set_avatar(uuid, jsonb), public.kf_ping(), public.kf_teacher_create(text, text, text),
  public.kf_teacher_set_pics(uuid, text) from public, anon, authenticated;
grant execute on function public.kf_roster(), public.kf_login(text, text), public.kf_logout(uuid),
  public.kf_state(uuid), public.kf_save_program(uuid, text, text, text, jsonb),
  public.kf_complete(uuid, text), public.kf_set_avatar(uuid, jsonb), public.kf_ping()
  to anon, authenticated;
grant execute on function public.kf_is_teacher(), public.kf_teacher_create(text, text, text),
  public.kf_teacher_set_pics(uuid, text) to authenticated;

-- ---------------------------------------------------------------- kezdő feloldások
-- Az eddigi küldetések mindenkinek nyitottak. A tanári oldalon bármikor módosítható.
insert into public.kf_unlocks(mission, scope, target)
select m, 'all', '' from unnest(array['k1','k2','k3','k4','k5','k6','k7']) as m
on conflict do nothing;
