# IBS Diary Mobile — produktový a technický návrh

**Verzia:** 0.1 (návrh) · **Dátum:** 2026-09-19
**Predloha:** webová aplikácia IBS Diary (Next.js + Supabase) v tomto repozitári
**Rozhodnutia:** IBS/trávenie ako hlavná téma · React Native + Expo · AdMob (banner + rewarded) + IAP na odstránenie reklám

---

## 1. Produktová vízia

> **Bezplatný denník jedla a tráviacich ťažkostí, ktorý ti sám povie, ktoré potraviny ti robia problém.**

Webová verzia už zbiera presne tie dáta, ktoré na to treba — reakciu organizmu po každom jedle, WC záznamy, lieky, aktivitu — ale **nikdy ich nevyhodnocuje**. To je jadro mobilnej verzie a zároveň jediný dôvod, prečo si ju niekto stiahne namiesto MyFitnessPal.

**Odlíšenie oproti konkurencii:**

| Konkurent | Čo robí | Kde je medzera |
|---|---|---|
| MyFitnessPal, Yazio, Lifesum | kalórie a makrá, obrovské databázy | tráviace symptómy neriešia vôbec |
| Monash FODMAP | referenčná FODMAP databáza | platená (~8 €), je to príručka, nie denník |
| Cara Care, mySymptoms | denník symptómov | mySymptoms je platená, obe slabé v nutričnej časti |

**Naša pozícia:** plnohodnotný nutričný denník **plus** symptómy **plus** automatická korelácia, zadarmo s reklamou.

### Realistické očakávanie od reklamy

Nika = málo používateľov. Aby mala reklama zmysel, potrebujeme objem, a ten na slovenskom trhu nie je. **Preto je viacjazyčnosť od prvého dňa súčasť biznis modelu, nie „nice to have".**

Jazyky: **sk, en, cs, de, es** — tá istá pätorka ako v PetActa. Nie je to náhodný výber: právne texty (podmienky používania, zásady ochrany súkromia) v nich už existujú v `PetNest/_bmad-output/implementation-artifacts/1-5-podklady/` a dajú sa z veľkej časti prevziať. Poradie nasadzovania podľa pomeru úsilie/prínos: EN → DE → ES → CS → SK. Nemecký a britský trh majú v zdravotnej kategórii výrazne vyššie eCPM než stredná Európa.

Orientačne: pri 10 000 aktívnych používateľoch, ~4 otvoreniach denne a striedmom umiestnení reklamy hovoríme o jednotkách stoviek eur mesačne. Príjem z jednorazového nákupu „bez reklám" bude pravdepodobne porovnateľný s reklamou samotnou — preto obe vetvy, nie len jedna.

---

## 2. Rozsah v1

### Prenášame z webu (feature parita)

- Prihlásenie e-mailom + profil s avatarom
- Navigácia po dňoch + kalendár
- Denný súhrn: kalórie a 6 nutrientov voči cieľom z profilu, farebné kódovanie
- Zápis jedla: vlastný katalóg, množstvo, typ jedla, čas, **reakcia organizmu**
- Vlastný katalóg potravín (CRUD, fotky, emoji, obľúbené, denný limit, poznámka)
- Import z Open Food Facts
- Pitný režim, aktivity, lieky, WC záznamy
- Cvičenie / chôdza / váha / reštaurácia
- Štatistiky: váha, kalórie, voda, analýza jedálnička (týždeň / mesiac / 3 mesiace / rok)
- Nutričné ciele min/cieľ/max, export zálohy

### Pridávame (toto je dôvod existencie mobilnej verzie)

| Funkcia | Prečo |
|---|---|
| **Korelácia potravina → symptóm** | jadro produktu, viď kapitola 4 |
| **Skenovanie čiarových kódov** | jediná najžiadanejšia funkcia v recenziách food trackerov; OFF má endpoint na kód, treba len kameru |
| **FODMAP klasifikácia potravín** | vlastná/otvorená klasifikácia, nie Monash (chránené autorským právom) |
| **Bristolská škála stolice (1–7)** pri WC zázname | štandard, bez nej sa symptómy nedajú kvantifikovať |
| **Notifikácie a pripomienky** | najsilnejší retenčný nástroj = priamo viac zobrazení reklamy |
| **Offline režim** | jedlo sa zapisuje v reštaurácii a v obchode, kde signál býva slabý |
| **PDF report pre lekára** | najlepšia odmena za rewarded reklamu, reálna hodnota pre používateľa |
| **Viacjazyčnosť** | podmienka zmysluplného príjmu z reklamy |
| **Onboarding** | bez neho sa nenastavia ciele a appka pôsobí prázdno |

### Vedome vynechávame z v1

- Poznámky (na webe aj tak len placeholder)
- Import zálohy (export áno, import je zriedkavý a zložitý)
- Zdieľanie / sociálne funkcie
- Recepty a vlastné kombinácie jedál (v2)

---

## 3. Informačná architektúra

Spodná navigácia, 5 záložiek:

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│   Dnes   │  Denník  │    +     │  Analýza │  Profil  │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**1 · Dnes** — hlavná obrazovka
- prepínač dňa (swipe doľava/doprava + kalendár)
- kruh kalórií a 6 nutrientov voči cieľom
- pitný režim s rýchlymi tlačidlami (+250 / +330 / +500 ml)
- dlaždice Aktivity / Lieky / WC / Káva s počítadlami
- prepínače cvičenie, chôdza, váha, reštaurácia
- zoznam zjedeného, zoskupený podľa jedla, s vypočítanými hodnotami
- **ak sa dnes zapísala zlá reakcia:** kartička „Čo to mohlo spôsobiť?" s tromi najpodozrivejšími potravinami z posledných 48 h

**2 · Denník** — mesačný kalendár
- každý deň ako farebná bodka podľa najhoršej reakcie dňa (zelená → červená)
- pod kalendárom časová os vybraného dňa: jedlá, symptómy, lieky, WC v jednej osi
- **toto je obrazovka, ktorú používateľ ukáže lekárovi**

**3 · +** — zápis, otvára sa ako bottom sheet
- záložky: Nedávne · Obľúbené · Hľadať · **Skener**
- po výbere: množstvo (rýchle voľby podľa jednotky), typ jedla, čas, reakcia
- „Nenašiel som" → vytvoriť potravinu (foto, hodnoty, FODMAP tag)
- cieľ: **zápis jedla do 5 sekúnd a do 3 ťuknutí**; sem nepatrí žiadna reklama

**4 · Analýza**
- Podozrivé potraviny (rebríček rizikového skóre)
- Grafy: váha, kalórie, voda, rozloženie nutrientov
- Prehľad symptómov v čase
- Rozsahy týždeň / mesiac / 3 mesiace / rok
- PDF report pre lekára (za rewarded reklamu alebo v platenej verzii)

**5 · Profil**
- osobné údaje, nutričné ciele, pripomienky, jazyk, téma
- Odstrániť reklamy (IAP)
- export dát, zmena hesla, ochrana súkromia, zmazanie účtu

---

## 4. Korelačná analýza — algoritmus

Toto je hlavná funkcia, preto ju definujem presne.

### Vstupy

- **Expozícia:** potravina `f` skonzumovaná v čase `t`
- **Symptóm v okne:** reakcia organizmu pri ktoromkoľvek zázname v intervale `t` až `t + 48 h`, WC záznamy s Bristol 1–2 alebo 6–7, a počet WC záznamov nad osobný priemer

### Skóre

Pre každú potravinu s **minimálne 5 výskytmi** v histórii:

```
p_s  = podiel expozícií, po ktorých nasledoval symptóm
p_n  = podiel dní bez tejto potraviny, v ktorých sa symptóm vyskytol
lift = p_s / p_n
```

Zobrazujeme len potraviny, kde `lift > 1.5` **a** dolná hranica 90 % Wilsonovho intervalu pre `p_s` je nad `p_n`. Tým sa odfiltrujú náhody pri malých počtoch.

### Zobrazenie

Trojstupňovo, bez čísel, ktoré nikto nevie interpretovať:

- 🔴 **Pravdepodobný spúšťač** — silná a opakovaná súvislosť
- 🟡 **Sleduj** — náznak, málo dát
- 🟢 **Zrejme v poriadku** — dosť dát, žiadna súvislosť

Ku každej potravine: „po 7 z 9 konzumácií nasledovali ťažkosti do 24 hodín", odkaz na konkrétne dni a FODMAP tag, ak ho potravina má.

### Nevyhnutné upozornenie

Pri každom výsledku fixný text v zmysle: **korelácia nie je príčina; toto nie je diagnóza; pred zmenou jedálnička sa poraď s lekárom.** Bez toho hrozí zamietnutie v App Store (pravidlo 1.4.1 pre zdravotné appky) a je to aj vecne správne.

### Technicky

Počíta sa **v Postgres ako RPC funkcia**, nie v klientovi — je to agregácia nad celou históriou a na mobile by to znamenalo sťahovať všetko. Výsledok sa cachuje na 24 h a prepočítava sa nočným cron jobom (pg_cron) alebo pri prvom otvorení Analýzy v daný deň.

---

## 5. Zmeny v dátovom modeli

Schéma z webu sa prenáša, s týmito úpravami:

```sql
-- 1. Reakcia bez straty informácie (web mapuje 4 stupne na 3 hodnoty)
CREATE TYPE reaction_level AS ENUM ('none','mild','moderate','severe');
ALTER TABLE consumed_foods ADD COLUMN reaction_level reaction_level;

-- 2. Čiarový kód a FODMAP
ALTER TABLE foods ADD COLUMN barcode text;
ALTER TABLE foods ADD COLUMN fodmap_level text;      -- low | moderate | high | unknown
ALTER TABLE foods ADD COLUMN fodmap_groups text[];   -- fruktóza, laktóza, polyoly, fruktány, GOS
CREATE INDEX ON foods (barcode);

-- 3. Bristolská škála a intenzita
ALTER TABLE wc_entries ADD COLUMN bristol_scale smallint CHECK (bristol_scale BETWEEN 1 AND 7);
ALTER TABLE wc_entries ADD COLUMN urgency smallint CHECK (urgency BETWEEN 0 AND 3);
ALTER TABLE wc_entries ADD COLUMN blood boolean DEFAULT false;

-- 4. Samostatný záznam symptómu (nafukovanie, bolesť, kŕče... bez väzby na jedlo)
CREATE TABLE symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL, time time NOT NULL,
  type text NOT NULL,                -- bloating | pain | cramps | nausea | reflux | fatigue
  severity smallint NOT NULL CHECK (severity BETWEEN 1 AND 5),
  note text,
  created_at timestamptz DEFAULT now()
);

-- 5. Zrušiť day_number ako uložený stĺpec - počíta sa zle a draho, viď kapitola 8
-- 6. Synchronizácia: každá tabuľka dostane updated_at + deleted_at (soft delete)
```

Tabuľka `food_entries` z prvej migrácie je mŕtva — do novej schémy neprenášať.

---

## 6. Technická architektúra

```
┌─────────────────────────────────────────────┐
│  React Native (Expo SDK, expo-router)       │
│  ├─ UI: vlastné komponenty + Reanimated     │
│  ├─ Grafy: victory-native XL (Skia)         │
│  ├─ Stav: TanStack Query + Zustand          │
│  └─ i18n: i18next + expo-localization       │
├─────────────────────────────────────────────┤
│  Lokálna vrstva (offline-first)             │
│  ├─ expo-sqlite — zrkadlo dát               │
│  ├─ fronta zmien (outbox)                   │
│  └─ sync pri návrate online                 │
├─────────────────────────────────────────────┤
│  Supabase — rovnaký projekt ako web         │
│  ├─ Auth, Postgres + RLS, Storage           │
│  └─ RPC: streaky, denné súhrny, korelácie   │
├─────────────────────────────────────────────┤
│  Google AdMob + Google UMP SDK (súhlas)     │
└─────────────────────────────────────────────┘
```

**Kľúčové balíky:** `expo-camera` (skener), `expo-notifications` (pripomienky), `expo-image-picker` + `expo-image-manipulator` (fotky potravín, kompresia pred uploadom), `expo-tracking-transparency` (ATT na iOS), `react-native-google-mobile-ads` (reklama), `react-native-purchases` alebo `expo-in-app-purchases` (IAP), `expo-print` (PDF report).

**Dôležité:** AdMob vyžaduje natívny kód → **Expo Dev Build, nie Expo Go.** Naplánovať EAS Build hneď na začiatku, nie až pred vydaním.

**Prečo sa web a mobil dajú zdieľať:** celá logika v `src/services/` je čistý TypeScript nad `supabase-js`. Po oprave chýb z kapitoly 8 sa dá vytiahnuť do zdieľaného balíka a použiť v oboch aplikáciách bez zmeny.

**Konvencia pomenovania:** doménové identifikátory po slovensky (`Potravina`, `Zaznam`, `vyhodnotRizko`), rámcové a knižničné API anglické — rovnako ako v PetActa. Existujúci web má anglické identifikátory a neprepisuje sa; pri vyťahovaní zdieľaného balíka sa hranica rieši až vtedy, keď k tomu naozaj dôjde.

---

## 7. Reklamná stratégia

### Zásada

Denník žije z toho, že ho používateľ otvorí päťkrát denne. **Každá reklama, ktorá spomalí zápis jedla, zabíja produkt.** Preto zápis jedla je úplne bez reklamy — vždy.

### Umiestnenia

| Formát | Kde | Pravidlá |
|---|---|---|
| **Adaptívny banner** | spodok obrazoviek Denník a Analýza | nikdy nad obsahom, nikdy na obrazovke zápisu |
| **Rewarded video** | odomknutie PDF reportu pre lekára; rozšírenie korelačnej analýzy z 30 dní na celú históriu; export CSV | vždy dobrovoľné, vždy s jasnou protihodnotou |
| **App open** | studený štart appky | max. 1× za 4 hodiny, nikdy po prvom spustení a nikdy počas onboardingu |
| **Interstitial** | max. 1× za reláciu, pri odchode z obrazovky Analýza | frekvenčný strop, nikdy medzi výberom potraviny a uložením |
| ~~Natívna reklama v zozname jedál~~ | — | **nepoužívať**, vyzerá to ako podvrhnutá potravina |

### Odhad zaťaženia

Pri 4 otvoreniach denne: ~1 app open + 1–2 bannerové zobrazenia + prípadne 1 rewarded. To je znesiteľné a v hodnoteniach sa to neobjaví ako sťažnosť.

### IAP

**„IBS Diary Plus"** — jednorazový nákup, orientačne 6,99 €:
- bez reklám
- PDF report a export bez pozerania videa
- neobmedzená história analýz
- cloudová záloha

Jednorazový nákup, nie predplatné: pri niche appke bez priebežného obsahu je predplatné ťažko obhájiteľné a generuje negatívne hodnotenia.

### Právne — toto nepodceniť

1. **Zdravotné dáta sa nesmú použiť na cielenie reklamy.** Platí to pre Apple (pravidlo 5.1.3) aj pre pravidlá AdMob o citlivých kategóriách. Prakticky: AdMob nesmie dostať žiadny signál o diagnóze, symptómoch ani jedálničku. Žiadne vlastné publiká, žiadne konverzné udalosti odvodené od zdravotných dát.
2. **GDPR súhlas** cez Google UMP SDK ešte pred prvým načítaním reklamy; pri odmietnutí sa zobrazujú nepersonalizované reklamy.
3. **ATT na iOS** — `expo-tracking-transparency`, zobraziť až po onboardingu, nie hneď na prvej obrazovke.
4. **Play Console → Data safety** a **App Privacy na App Store** deklarovať zdravotné údaje pravdivo.
5. Nepoužívať slová „diagnóza", „liečba", „vyliečiť" — appka je denník, nie zdravotnícka pomôcka. Inak sa dostávame do regulácie MDR.
6. **Podmienky používania a zásady ochrany súkromia v piatich jazykoch.** Východiskom sú texty z PetActa, ale **nedajú sa prevziať doslova** — tam sa nespracúvajú zdravotné údaje o človeku a nie je tam reklama. Doplniť treba minimálne: osobitnú kategóriu údajov podľa čl. 9 GDPR, právny základ (výslovný súhlas), reklamných partnerov a dobu uchovávania. Každá zmena v jednom jazyku je päť zmien.

---

## 8. Výkonové chyby z webu, ktoré sa nesmú preniesť

### N+1 dotazy pri načítaní dňa

`consumedFoodService.getDailyConsumedFoods()` spustí pre každú položku samostatný dotaz na posledné jedenie a potom `getConsecutiveDaysForFood()`, ktorý ide **deň po dni dozadu, až 365 sekvenčných requestov na jednu potravinu**. Deň s ôsmimi jedlami môže znamenať stovky až tisíce round-tripov. Na LTE je to neprípustné.

Riešenie — jedna funkcia, jeden request:

```sql
CREATE FUNCTION get_day(p_date date)
RETURNS jsonb LANGUAGE sql STABLE AS $$
  -- séria dní cez window funkciu:
  --   date - row_number() OVER (PARTITION BY food_id ORDER BY date) = konštanta pre súvislý blok
  -- posledné jedenie cez LAG/MAX v jednom prechode
  -- denné súčty agregované v tom istom dotaze
$$;
```

### Ďalšie

| Chyba na webe | Oprava |
|---|---|
| `evaluateNutritionGoals` má natvrdo 25–30 / 30–50 / 50–60 g | čítať min/max z profilu |
| `nutritionAnalysisService` má natvrdo 2000 kcal, 80 g bielkovín… | to isté |
| 4 stupne reakcie sa ukladajú ako 3 hodnoty | nový enum `reaction_level` |
| `day_number` uložený v tabuľke a zároveň prepočítavaný pri čítaní | nedržať v tabuľke, počítať v SQL |
| import zálohy riadok po riadku v cykle | dávkový `upsert` v transakcii |
| fotky sa nahrávajú v pôvodnej veľkosti | `expo-image-manipulator`, max 1200 px, WebP |
| slovenčina zadrátovaná v komponentoch | i18next od prvého riadku |

---

## 9. Postup prác

| Míľnik | Obsah | Odhad |
|---|---|---|
| **M0 — Základ** | Expo projekt, EAS Build, navigácia, prihlásenie, Supabase klient, i18n kostra | 1 týždeň |
| **M1 — Zápis** | katalóg potravín, zápis jedla, skener kódov, OFF, obrazovka Dnes | 2–3 týždne |
| **M2 — Symptómy** | WC + Bristol, symptómy, lieky, aktivity, voda, váha | 1–2 týždne |
| **M3 — Analýza** | RPC pre korelácie, obrazovka Analýza, grafy, kalendár | 2–3 týždne |
| **M4 — Offline** | SQLite zrkadlo, outbox, sync, notifikácie | 2 týždne |
| **M5 — Monetizácia** | AdMob, UMP súhlas, ATT, IAP, PDF report | 1–2 týždne |
| **M6 — Vydanie** | onboarding, preklady, store listing, screenshoty, zásady ochrany súkromia, beta | 2 týždne |

Reálne **3 až 4 mesiace** pri práci popri inom. Poradie je zvolené tak, aby po M3 existovala použiteľná appka, ktorú sa dá dať otestovať skutočným ľuďom ešte pred riešením reklamy.

---

## 10. Riziká

| Riziko | Dopad | Ako ho zmierniť |
|---|---|---|
| Málo používateľov → zanedbateľný príjem z reklamy | vysoký | viacjazyčnosť od začiatku, ASO na „IBS diary", „FODMAP tracker", spolupráca s pacientskymi komunitami |
| Korelačná analýza ukáže nezmysly pri málo dátach | vysoký | prísne minimum výskytov, Wilsonov interval, radšej nepovedať nič než povedať hlúposť |
| Zamietnutie v App Store (zdravotné tvrdenia) | stredný | žiadne diagnostické formulácie, upozornenia pri každom výsledku, súkromie deklarované presne |
| Reklama odradí používateľov | stredný | zápis jedla úplne bez reklamy, frekvenčné stropy, lacný jednorazový nákup |
| Open Food Facts má slabé pokrytie stredoeurópskych produktov | stredný | rýchle vytvorenie vlastnej potraviny, zdieľaná komunitná databáza vlastných potravín (v2) |
| Údržba dvoch aplikácií (web + mobil) | nízky | zdieľaný TypeScript balík so servisnou logikou |

---

## 11. Otvorené otázky

1. **Zostáva web v prevádzke?** Ak áno, zdieľajú spoločnú Supabase databázu (odporúčam — používateľ zapisuje na mobile, analyzuje na veľkej obrazovke).
2. **Zdroj FODMAP dát** — Monash je chránený. Treba postaviť vlastnú tabuľku zo zverejnených odborných zdrojov, cca 300 najbežnejších potravín stačí na začiatok.
3. **Migrácia existujúcich používateľov webu** — ak ide o rovnakú databázu, netreba riešiť nič.
4. **Názov a značka v obchodoch** — „IBS Diary" je popisné a ťažko sa chráni; zvážiť vlastný názov s podtitulom „IBS & FODMAP diary".
