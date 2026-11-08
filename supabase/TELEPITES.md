# Kódfejtő Műhely – belépés és tanári felület bekapcsolása (Supabase)

Kb. 20 perc, egyszer kell megcsinálni. A Supabase felülete angol nyelvű, a gombok nevét
ezért angolul írom. Ha valami máshol van vagy másképp hívják, az a Supabase
felületének változása. A keresés (Ctrl+K) ilyenkor általában megtalálja.

---

## 1. Fiók és projekt

1. Nyisd meg: <https://supabase.com> → **Start your project**. Regisztrálj (e-maillel vagy GitHub-fiókkal).
2. **New project**:
   - **Name:** `kodfejto`
   - **Database Password:** generáltass egyet, és **mentsd el** (jelszókezelőbe). A napi használathoz nem kell, de vészhelyzetben igen.
   - **Region:** **Central EU (Frankfurt)**. Fontos, hogy az adatok EU-ban legyenek.
   - **Plan:** Free.
3. **Create new project**. 1–2 perc, amíg elkészül.

## 2. Az adatbázis létrehozása

1. Bal oldalt: **SQL Editor** → **New query**.
2. Nyisd meg a repóban a `supabase/schema.sql` fájlt (Jegyzettömbbel), jelöld ki az egészet, másold be.
3. **Run**. Azt kell írnia: *Success. No rows returned*.

A fájlt később is nyugodtan újra lefuttathatod (pl. ha frissítést küldök hozzá): a meglévő adatokat nem bántja.

## 3. Senki más ne tudjon regisztrálni

**Authentication** → **Sign In / Providers** (régebben: Settings) → kapcsold **ki**:
**Allow new users to sign up**. → **Save**.

Így csak az a tanári fiók létezik, amit te hozol létre. A gyerekek nem Supabase-fiókkal lépnek be, rájuk ez nem vonatkozik.

## 4. A te tanári fiókod

1. **Authentication** → **Users** → **Add user** → **Create new user**.
2. Add meg az e-mail-címedet és egy erős jelszót, pipáld be: **Auto Confirm User**. → **Create user**.
3. **SQL Editor** → **New query**, írd be (a saját e-mail-címeddel), majd **Run**:

```sql
insert into public.kf_teachers(user_id, email)
select id, email from auth.users where email = 'IDE.A.TE@EMAIL.CIMED';
```

Ha később kolléga is kell, ugyanezt csináld meg az ő e-mail-címével.

## 5. A weboldal összekötése a projekttel

1. A projekt tetején: **Connect** gomb (vagy **Project Settings** → **API Keys**).
2. Két dolgot másolj ki:
   - **Project URL**: így néz ki: `https://abcdefghijk.supabase.co`
   - **Publishable key**: `sb_publishable_…` kezdetű. (Régebbi projekteknél: **anon public** kulcs, `eyJ…` kezdetű. Az is jó.)
3. A repóban nyisd meg az `assets/config.js` fájlt, és írd be őket az aposztrófok közé:

```js
window.KODFEJTO_CONFIG = {
  supabaseUrl: 'https://abcdefghijk.supabase.co',
  supabaseKey: 'sb_publishable_…',
};
```

> ⚠️ A **secret** / **service_role** kulcsot SOHA ne írd ide! A publishable kulcs szándékosan nyilvános, a táblákhoz azzal közvetlenül nem lehet hozzáférni.

4. GitHub Desktop: **Commit to main** → **Push origin**.

## 6. Első belépés tanárként

1. Nyisd meg: `https://<a-te-oldalad>/tanar.html` (a diákoldalakról nincs rá link, ezt a címet csak te ismered).
2. Lépj be a 4. pontban megadott e-mail-címmel és jelszóval.
3. **Diákok** fül → válassz csapatot → írd be a kódneveket (soronként egyet, valódi név nélkül) → **Felvétel és belépőkártyák**.
4. **Nyomtatás**: a kártyákon ott a gyerek titkos kép-kódja (3 kép, sorrendben). Ezt csak most látod, mert az adatbázisban titkosítva van. Ha elveszik, a **🔑 Új kép-kód** gombbal adhatsz újat.
5. **Feloldások** fül: itt állítod be, melyik küldetés kinek nyitott (mindenki / csapat / egy diák). Kezdetben az eddigi 7 küldetés mindenkinek nyitott.

Hogy melyik kódnév melyik gyerek, azt ne az oldalon, hanem a saját papírodon vagy gépeden tartsd!

## 7. A napi „ébresztő” ellenőrzése

Az ingyenes Supabase-projekt egy hét alacsony forgalom után elalszik (pl. őszi, téli, tavaszi, nyári szünet). Ezt a repóban lévő `.github/workflows/ebreszto.yml` akadályozza meg: naponta küld egy apró kérést.

1. GitHub, a repó oldala → **Actions** fül. Ha kéri, engedélyezd a workflow-kat.
2. Bal oldalt **Supabase ébresztő** → **Run workflow**. Pár másodperc múlva zöld pipát kell kapnod.

Két dolog, amire figyelj:
- A GitHub egy nyilvános repóban **60 nap repó-aktivitás (commit) nélkül kikapcsolja** az időzített workflow-kat. A nyári szünet ennél hosszabb. Ilyenkor a GitHub e-mailt küld; az **Actions** fülön egy kattintással visszakapcsolható. Elég, ha nyáron egyszer commitolsz valamit.
- Ha a projekt mégis elalszik, a Supabase előtte figyelmeztető e-mailt küld. Ha megnyitod a projektet a Supabase-ben, ébren marad. Ha már elaludt: **Resume project**, az adatok megmaradnak (1 évig visszaállítható).

## 8. Biztonsági mentés

Az ingyenes csomagban nincs automatikus mentés. A tanári felületen: **Mentés** fül → **Teljes mentés (JSON)**. Félévente és nagyobb változtatás előtt töltsd le, és tedd el a saját gépedre (ne a GitHub-repóba!).

## Ha valami nem megy

| Tünet | Ok és megoldás |
|---|---|
| A gyerekoldal „Nem érem el a tárhelyet” | Rossz a cím vagy a kulcs a `config.js`-ben, vagy elaludt a projekt (lásd 7.). |
| Tanári belépés után: „Ez a fiók még nem tanár” | A 4/3. lépés kimaradt. Az oldal kiírja a pontos SQL-t. |
| „Túl sok rossz próbálkozás” | 5 rossz kép-kód után 5 percre zárol. Vagy várni kell, vagy adj új kép-kódot. |
| Vissza akarok térni a régi, belépés nélküli módhoz | Töröld ki a két értéket a `config.js`-ből (maradjon `''`). |
