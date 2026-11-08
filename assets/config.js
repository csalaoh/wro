/*
 * Kódfejtő Műhely – beállítások
 *
 * Ha a két mező üres, az oldal „helyi módban” fut: nincs belépés, minden a
 * gyerek böngészőjében marad (mint eddig).
 *
 * A Supabase-projekt adatai: Supabase → a projekt → Connect gomb
 * (vagy Project Settings → API Keys).
 *  - supabaseUrl: a projekt címe, pl. https://abcdefgh.supabase.co
 *  - supabaseKey: a NYILVÁNOS kulcs (Publishable key, sb_publishable_…,
 *    vagy régebbi projekteknél az „anon public” kulcs).
 * A nyilvános kulcs szándékosan látható a böngészőben, ez így biztonságos.
 * A TITKOS kulcsot (secret / service_role) SOHA ne írd ide!
 */
window.KODFEJTO_CONFIG = {
  supabaseUrl: 'https://jwfjsqadboegxrxgkupv.supabase.co',
  supabaseKey: 'sb_publishable_jl6Y1TbTMsJcSFxJfxRzPA_r3N9zgyA',
};
